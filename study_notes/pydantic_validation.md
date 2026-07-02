# FastAPI শেখা: Pydantic Schemas, Request এবং Response Validation

FastAPI-তে আপনাকে স্বাগতম! FastAPI-এর অন্যতম শক্তিশালী একটি ফিচার হলো ডেটা ভ্যালিডেশন (validation) এবং সিরিয়ালাইজেশন (serialization)-এর জন্য **Pydantic**-এর সাথে এর ইন্টিগ্রেশন।

এই গাইডে আমরা আলোচনা করব **Pydantic Schemas** কী, কিভাবে **Request Validation** এবং **Response Validation** কাজ করে, এবং আমাদের Sports Blog অ্যাপ্লিকেশনে কেন আমরা আমাদের স্কিমাগুলোকে এভাবে স্ট্রাকচার করেছি।

---

## ১. Pydantic Schema কী?

FastAPI-তে একটি **schema** হলো মূলত একটি Pydantic model (একটি ক্লাস যা `BaseModel` থেকে ইনহেরিট করে)। এটি আমাদের রিসিভ করা ডেটা (Requests) অথবা ফেরত পাঠানো ডেটা (Responses)-এর স্ট্রাকচার, ডেটা টাইপ এবং ভ্যালিডেশন রুলস নির্ধারণ করে।

Pydantic স্কিমাগুলোকে আপনার API এবং ক্লায়েন্ট (যেমন: ফ্রন্টএন্ড বা মোবাইল অ্যাপ)-এর মধ্যকার একটি **চুক্তি (contract)** হিসেবে বিবেচনা করতে পারেন।

---

## ২. Request Validation: ইনপুট গেটকিপার

যখন কোনো ক্লায়েন্ট আপনার API-তে ডেটা পাঠায় (যেমন: `POST` বা `PUT` রিকোয়েস্টের মাধ্যমে), তখন আপনার পাইথন কোড এক্সিকিউট হওয়ার **পূর্বেই** আগত ডেটা আপনার প্রত্যাশা অনুযায়ী সঠিক আছে কিনা তা নিশ্চিত করতে FastAPI মূলত Pydantic ব্যবহার করে।

### আমাদের কোডে এটি যেভাবে কাজ করে:

[app/schemas.py](file:///c:/office-work/khela-dekho-blog/sports_blog/backend/app/schemas.py) ফাইলের ভেতরের স্কিমাটি দেখুন:

```python
from pydantic import BaseModel, Field

class PostBase(BaseModel):
    title: str = Field(min_length=10, max_length=100)
    content: str = Field(min_length=65)
    author: str = Field(min_length=2, max_length=50)

class PostCreate(PostBase):
    pass
```

এবং এটি [app/main.py](file:///c:/office-work/khela-dekho-blog/sports_blog/backend/app/main.py) ফাইলে যেভাবে ব্যবহৃত হয়েছে:

```python
@app.post('/api/posts', response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(post: PostCreate):
    ...
```

### Request Validation-এর ম্যাজিক:
১. **Type Checking (টাইপ পরীক্ষা)**: যদি ক্লায়েন্ট `title`-এর জন্য স্ট্রিং-এর পরিবর্তে ইন্টিজার (integer) পাঠায়, তবে Pydantic এটিকে স্ট্রিং-এ রূপান্তর করার চেষ্টা করবে। যদি তা না পারে, তাহলে ভ্যালিডেশন ফেইল বা ব্যর্থ হবে।
২. **Constraints Validation (সীমাবদ্ধতা পরীক্ষা)**:
   * `title` অবশ্যই `10` থেকে `100` ক্যারেক্টারের মধ্যে হতে হবে।
   * `content` অবশ্যই কমপক্ষে `65` ক্যারেক্টার হতে হবে।
   * `author` অবশ্যই `2` থেকে `50` ক্যারেক্টারের মধ্যে হতে হবে।
৩. **Automatic 422 Unprocessable Entity (স্বয়ংক্রিয় 422 এরর)**: যদি কোনো রুল বা কন্সট্রেইন্ট ভঙ্গ করা হয়, FastAPI স্বয়ংক্রিয়ভাবে কোড রান করা বন্ধ করে দেয় এবং একটি বিস্তারিত `422` এরর রেসপন্স ফেরত পাঠায়, যেখানে স্পষ্টভাবে বলা থাকে কোন কোন ফিল্ড ভ্যালিডেশনে ব্যর্থ হয়েছে এবং কেন। **এই লেন্থ বা দৈর্ঘ্য পরীক্ষা করার জন্য আপনাকে একটিও `if` স্টেটমেন্ট লিখতে হবে না!**

---

## ৩. Response Validation এবং Serialization: আউটপুট ফিল্টার

যখন আপনার API ফাংশন কোনো মান ফেরত পাঠায় (যেমন: একটি ডিকশনারি, একটি ডাটাবেজ মডেল, অথবা একটি লিস্ট), তখন চলে যাওয়ার আগের ডেটাকে ক্লিন, ফরম্যাট এবং ফিল্টার করতে FastAPI মূলত Pydantic ব্যবহার করে।

### আমাদের কোডে এটি যেভাবে কাজ করে:

```python
class PostResponse(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int 
    date_posted: str 
```

এটি [app/main.py](file:///c:/office-work/khela-dekho-blog/sports_blog/backend/app/main.py) ফাইলে যেভাবে ব্যবহৃত হয়েছে:

```python
@app.get('/api/posts', response_model=list[PostResponse])
def get_posts():
    return posts
```

### Response Validation এবং Serialization-এর ম্যাজিক:
১. **Field Selection/Filtering (ফিল্ড সিলেকশন/ফিল্টারিং)**: `main.py` ফাইলে আমাদের মকআপ বা ডামি `posts`-এর এমন কিছু অভ্যন্তরীণ তথ্য থাকতে পারে যা আমরা বাইরে প্রকাশ করতে চাই না। `response_model` নিশ্চিত করে যে **কেবলমাত্র** `PostResponse`-এ ডিফাইন করা ফিল্ডগুলোই ক্লায়েন্টের কাছে ফেরত পাঠানো হবে। অতিরিক্ত যেকোনো ফিল্ড স্বয়ংক্রিয়ভাবে ফিল্টার হয়ে বাদ পড়ে যাবে।
২. **Formatting (ফরম্যাটিং)**: এটি পাইথনের বিভিন্ন ডেটা টাইপকে (যেমন: integers, floats, dates, বা datetimes) স্ট্যান্ডার্ড JSON ফরম্যাটে রূপান্তর করে।
৩. **Data Guarantee (ডেটার নিশ্চয়তা)**: এটি ফ্রন্টএন্ড ক্লায়েন্টকে এই নিশ্চয়তা দেয় যে লিস্টের প্রতিটি আইটেমে অবশ্যই সঠিক টাইপের `id`, `date_posted`, `title`, `content`, এবং `author` থাকবে।

### `model_config = ConfigDict(from_attributes=True)` কী?
ডিফল্টভাবে, Pydantic ইনপুট ডেটা ডিকশনারি আকৃতির হবে এমনটাই আশা করে (যেমন: `data["title"]`)।
তবে, আপনি যখন কোনো ORM (যেমন: SQLAlchemy) ব্যবহার করে ডাটাবেজ যুক্ত করেন, তখন ডাটাবেজ রেকর্ডগুলো পাইথন অবজেক্ট আকারে থাকে যার নির্দিষ্ট অ্যাট্রিবিউট থাকে (যেমন: `post.title`)।

`from_attributes=True` সেট করার মাধ্যমে Pydantic-কে বলা হয়:
> *"তুমি যদি কোনো ডিকশনারির পরিবর্তে ডাটাবেজ অবজেক্ট পাও, তবে ডিকশনারি কি (`data['title']`)-এর বদলে অ্যাট্রিবিউট (`data.title`) ব্যবহার করে ফিল্ডগুলো রিড করার চেষ্টা করো।"*

এটি আপনাকে আপনার পাথ বা রাউট ফাংশনগুলো থেকে সরাসরি ডাটাবেজ মডেল অবজেক্ট ফেরত পাঠানোর সুবিধা দেয়, এবং Pydantic স্বয়ংক্রিয়ভাবে সেগুলো রিড করে সিরিয়ালাইজ করে ফেলে।

---

## ৪. কেন `PostBase` থেকে ইনহেরিট করা হয়?

আমরা আমাদের কোডকে **DRY (Don't Repeat Yourself - নিজেকে পুনরাবৃত্তি না করা)** রাখতে ইনহেরিট্যান্স ব্যবহার করে স্কিমাগুলো স্ট্রাকচার করি:

```
            ┌──────────────┐
            │   PostBase   │  <-- শেয়ার্ড কোর ফিল্ডগুলো ডিফাইন করে (title, content, author)
            └──────┬───────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
  ┌──────────────┐    ┌──────────────┐
  │  PostCreate  │    │ PostResponse │  <-- PostBase ইনহেরিট করে, id এবং date_posted যোগ করে
  └──────────────┘    └──────────────┘
  (ইনপুটের জন্য ব্যবহৃত; (আউটপুটের জন্য ব্যবহৃত;
   এখনও কোনো ID নেই)  ID তৈরি হয়ে গেছে)
```

১. `PostBase`: এটি সেই স্ট্যান্ডার্ড ফিল্ডগুলো ধারণ করে যা পোস্ট তৈরির সময় (request) এবং রিড করার সময় (response) উভয় ক্ষেত্রেই প্রয়োজন হয়।
২. `PostCreate`: এটি `PostBase` থেকে ইনহেরিট করে। নতুন পোস্ট তৈরির সময় ক্লায়েন্ট কোনো `id` বা `date_posted` পাঠায় না (যেহেতু এগুলো সার্ভার জেনারেট করে)। তাই `PostCreate`-এ শুধুমাত্র বেস ফিল্ডগুলো থাকে।
৩. `PostResponse`: এটি `PostBase` থেকে ইনহেরিট করে এবং সার্ভার-জেনারেটেড ফিল্ড (`id` এবং `date_posted`) যুক্ত করে। এর ফলে ক্লায়েন্ট সমস্ত প্রয়োজনীয় ডেটা ফেরত পায়।
