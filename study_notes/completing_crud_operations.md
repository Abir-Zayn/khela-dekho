# FastAPI & SQLAlchemy: Completing CRUD Operations (CRUD অপারেশন সম্পন্ন করা)

ওয়েব অ্যাপ্লিকেশন তৈরির মূল ভিত্তি হলো **CRUD (Create, Read, Update, Delete)** অপারেশন। ডেটাবেসে ডেটা সংরক্ষণ, প্রদর্শন, পরিবর্তন এবং মুছে ফেলার প্রক্রিয়াকে CRUD বলা হয়। 

FastAPI এবং SQLAlchemy ব্যবহার করে কীভাবে আমরা এই অপারেশনগুলো সম্পন্ন করতে পারি, তা এই গাইডে বাংলা ভাষায় বিস্তারিত আলোচনা করা হয়েছে।

---

## ১. CRUD অপারেশন কি?

CRUD এর পূর্ণরূপ হলো:
*   **C**reate (তৈরি করা): ডেটাবেসে নতুন রেকর্ড যুক্ত করা (HTTP Method: `POST`)
*   **R**ead (পড়া/দেখা): ডেটাবেস থেকে রেকর্ড পড়া বা কুয়েরি করা (HTTP Method: `GET`)
*   **U**pdate (আপডেট করা): বিদ্যমান কোনো রেকর্ড পরিবর্তন করা (HTTP Method: `PUT` / `PATCH`)
*   **D**elete (মুছে ফেলা): ডেটাবেস থেকে কোনো রেকর্ড মুছে ফেলা (HTTP Method: `DELETE`)

---

## ২. FastAPI-তে ডেটাবেস সেশন হ্যান্ডলিং (Database Session)

FastAPI-তে প্রতিটি রিকোয়েস্টের জন্য ডেটাবেস সেশন তৈরি এবং বন্ধ করার কাজ ডিপেন্ডেন্সি ইনজেকশন (Dependency Injection) বা `Depends` দিয়ে করা হয়।

```python
def get_db():
    with SessionLocal() as db:
        yield db
```
আমাদের এপিআই অ্যান্ডপয়েন্টে এটি এভাবে ইনজেক্ট করা হয়:
```python
db: Annotated[Session, Depends(get_db)]
```
রিকোয়েস্ট শুরু হলে সেশনটি তৈরি হয়, অপারেশন শেষে সেশন স্বয়ংক্রিয়ভাবে বন্ধ (`close`) হয়ে যায়।

---

## ৩. CRUD অপারেশনসমূহের কোডসহ বিস্তারিত ব্যাখ্যা

আমরা `Post` মডেলের ওপর ভিত্তি করে এই অপারেশনগুলো নিচে ব্যাখ্যা করছি:

### ৩.১. Create (পোস্ট তৈরি করা)

নতুন পোস্ট তৈরির সময় আমাদের লক্ষ্য রাখতে হবে:
1.  অনুরোধে পাঠানো `user_id` (লেখক) আসলেই আমাদের ডেটাবেসে বিদ্যমান কিনা।
2.  বিদ্যমান থাকলে নতুন একটি `Post` অবজেক্ট তৈরি করে ডেটাবেসে সেভ করা।

**কোড উদাহরণ:**
```python
@app.post('/api/posts', response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(post: PostCreate, db: Annotated[Session, Depends(get_db)]):
    # ১. লেখক (User) ডেটাবেসে আছে কিনা চেক করা
    user = db.execute(
        select(models.User).where(models.User.id == post.user_id)
    ).scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User (author) not found"
        )
    
    # ২. নতুন পোস্ট অবজেক্ট তৈরি
    new_post = models.Post(
        title=post.title,
        content=post.content,
        user_id=post.user_id
    )
    
    # ৩. ডেটাবেসে অ্যাড ও কমিট করা
    db.add(new_post)
    db.commit()
    db.refresh(new_post) # নতুন জেনারেট হওয়া ID ও ডেটা রিফ্রেশ করা
    return new_post
```

### ৩.২. Read (সব পোস্ট এবং নির্দিষ্ট পোস্ট রিড করা)

#### সব পোস্ট রিড করা (Read All):
ডেটাবেস থেকে সকল পোস্টের তালিকা নিয়ে আসে।

**কোড উদাহরণ:**
```python
@app.get('/api/posts', response_model=list[PostResponse])
def get_posts(db: Annotated[Session, Depends(get_db)]):
    results = db.execute(select(models.Post))
    return results.scalars().all()
```

#### নির্দিষ্ট সিঙ্গেল পোস্ট রিড করা (Read Single):
নির্দিষ্ট `post_id` অনুযায়ী ডেটাবেস থেকে একটি পোস্ট কুয়েরি করে। পোস্ট না পাওয়া গেলে `404 Not Found` রিটার্ন করে।

**কোড উদাহরণ:**
```python
@app.get('/api/posts/{post_id}', response_model=PostResponse)
def get_posts_by_id(post_id: int, db: Annotated[Session, Depends(get_db)]):
    post = db.execute(
        select(models.Post).where(models.Post.id == post_id)
    ).scalars().first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Post not found"
        )
    return post
```

### ৩.৩. Update (পোস্ট আপডেট করা)

কোনো পোস্টের কন্টেন্ট আপডেট করার জন্য এই অপারেশন ব্যবহৃত হয়। এখানে আমরা আংশিক আপডেট সমর্থন করতে `PostUpdate` স্কিমা ব্যবহার করেছি যেখানে ফিল্ডগুলো ঐচ্ছিক (Optional)।

**কোড উদাহরণ:**
```python
@app.put('/api/posts/{post_id}', response_model=PostResponse)
def update_post(post_id: int, post_data: PostUpdate, db: Annotated[Session, Depends(get_db)]):
    # ১. আপডেট করার আগে পোস্টটি খুঁজে বের করা
    post = db.execute(
        select(models.Post).where(models.Post.id == post_id)
    ).scalars().first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # ২. যে ফিল্ডগুলো পাঠানো হয়েছে শুধু সেগুলো আপডেট করা
    if post_data.title is not None:
        post.title = post_data.title
    if post_data.content is not None:
        post.content = post_data.content
        
    # ৩. পরিবর্তন ডেটাবেসে সেভ করা
    db.commit()
    db.refresh(post)
    return post
```

### ৩.৪. Delete (পোস্ট মুছে ফেলা)

ডেটাবেস থেকে কোনো নির্দিষ্ট পোস্ট চিরতরে মুছে ফেলার জন্য এটি কাজ করে। মুছে ফেলার পর সাধারণত `204 No Content` স্ট্যাটাস কোড রিটার্ন করা হয়।

**কোড উদাহরণ:**
```python
@app.delete('/api/posts/{post_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Annotated[Session, Depends(get_db)]):
    # ১. মুছে ফেলার জন্য আগে পোস্টটি খুঁজে বের করা
    post = db.execute(
        select(models.Post).where(models.Post.id == post_id)
    ).scalars().first()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # ২. ডিলিট এবং কমিট করা
    db.delete(post)
    db.commit()
    return None
```

---

## ৪. গুরুত্বপূর্ণ SQLAlchemy মেথডস সমূহ

*   `db.add(object)`: মেমরিতে একটি নতুন অবজেক্ট বা রেকর্ড ডেটাবেস ট্রানজেকশনে যোগ করে।
*   `db.commit()`: ট্রানজেকশনের সমস্ত পরিবর্তন স্থায়ীভাবে ডেটাবেসে সেভ (Write) করে।
*   `db.refresh(object)`: ডেটাবেস থেকে অবজেক্টটির সাম্প্রতিক অবস্থা মেমরিতে রিলোড করে (যেমন: নতুন অটো-জেনারেটেড আইডি বা ডিফল্ট মান পেতে)।
*   `db.delete(object)`: নির্দিষ্ট রেকর্ডটি মুছে ফেলার জন্য চিহ্নিত করে, যা `db.commit()` করার পর কার্যকর হয়।
