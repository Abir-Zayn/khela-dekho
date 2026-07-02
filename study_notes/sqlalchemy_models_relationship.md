# SQLAlchemy Models and Relationships (SQLAlchemy মডেল এবং রিলেশনশিপ)

SQLAlchemy হলো পাইথনের একটি অত্যন্ত জনপ্রিয় **ORM (Object Relational Mapper)** লাইব্রেরি। এটি আমাদেরকে SQL কোড না লিখে সরাসরি পাইথন অবজেক্ট এবং ক্লাসের মাধ্যমে ডেটাবেসের সাথে যোগাযোগ করতে সাহায্য করে।

এই গাইডে আমরা SQLAlchemy ২.০ (SQLAlchemy 2.0) স্টাইলে কীভাবে মডেল ডিফাইন করতে হয় এবং টেবিলগুলোর মধ্যে রিলেশনশিপ (যেমন: One-to-Many) তৈরি করতে হয় তা বাংলা ভাষায় সহজভাবে আলোচনা করব।

---

## ১. SQLAlchemy মডেল (Models) কি?

ডেটাবেসের একটি টেবিলকে পাইথনের যে ক্লাস দিয়ে রিপ্রেজেন্ট বা প্রকাশ করা হয়, তাকে **SQLAlchemy Model** বলা হয়। প্রতিটি মডেল ক্লাস SQLAlchemy-র `DeclarativeBase` থেকে ইনহেরিট (inherit) করে।

### Declarative Base
আমাদের ডেটাবেস সংযোগে একটি `Base` ক্লাস তৈরি করা থাকে:
```python
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
```
সব মডেল এই `Base` ক্লাসটি থেকে ইনহেরিট করবে। এর ফলে SQLAlchemy বুঝতে পারে যে এই ক্লাসগুলো ডেটাবেস টেবিলের ম্যাপড ক্লাস।

---

## ২. Mapped এবং mapped_column (SQLAlchemy 2.0 Style)

SQLAlchemy ২.০ তে টাইপ হিন্টিং (Type Hinting) আরও সহজ করতে `Mapped` জেনেরিক টাইপ এবং `mapped_column` ফাংশন ব্যবহার করা হয়।

*   `Mapped[Type]`: এটি দিয়ে কলামটির পাইথন টাইপ (যেমন: `int`, `str`, `datetime`) নির্দিষ্ট করা হয়।
*   `mapped_column(...)`: এটি দিয়ে কলামটির ডেটাবেস কনফিগারেশন (যেমন: Primary Key, Unique, Nullable, ForeignKey ইত্যাদি) ডিফাইন করা হয়।

### উদাহরণ:
```python
name: Mapped[str] = mapped_column(String(50), nullable=False)
```
এখানে:
*   `Mapped[str]` নির্দেশ করে যে পাইথনে এই অ্যাট্রিবিউটটি একটি স্ট্র্রিং (`str`) টাইপের হবে।
*   `mapped_column(String(50), nullable=False)` নির্দেশ করে যে ডেটাবেসে এটি `VARCHAR(50)` হবে এবং এটি খালি বা `NULL` হতে পারবে না।

---

## ৩. টেবিলগুলোর মধ্যে রিলেশনশিপ (Relationships)

একটি রিলেশনাল ডেটাবেসে একাধিক টেবিল একে অপরের সাথে সম্পর্কিত (Related) থাকে। যেমন:
*   একজন **User** একাধিক **Post** তৈরি করতে পারেন (One-to-Many)।
*   একটি **Post** শুধুমাত্র একজন নির্দিষ্ট **User** এর হতে পারে (Many-to-One)।

SQLAlchemy তে এই সম্পর্কটি তৈরি করতে দুটি জিনিস ব্যবহার করা হয়:
1.  **ForeignKey (ফরেন কি)**: এটি সরাসরি ডেটাবেস টেবিলে একটি কলাম তৈরি করে যা অন্য টেবিলের Primary Key-কে নির্দেশ করে।
2.  **relationship()**: এটি ডেটাবেস টেবিলের সরাসরি কোনো কলাম নয়, বরং এটি পাইথন কোডে আমাদের সুবিধার্থে অবজেক্ট স্তরে কাজ করে (যেমন: `user.posts` লিখলে সরাসরি ইউজারের সব পোস্টের লিস্ট পাওয়া যাবে)।

### One-to-Many রিলেশনশিপের সহজ উদাহরণ:

ধরি আমাদের `User` এবং `Post` মডেল দুটি রয়েছে।

```python
from __future__ import annotations
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # ১. রিলেশনশিপ ডিফাইন করা
    posts: Mapped[list[Post]] = relationship(back_populates="author", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # ২. ForeignKey ডিফাইন করা (ডেটাবেস লেভেলে লিঙ্ক)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    # ৩. বিপরীতমুখী রিলেশনশিপ ডিফাইন করা (পাইথন অবজেক্ট লেভেলে লিঙ্ক)
    author: Mapped[User] = relationship(back_populates="posts")
```

---

## ৪. গুরুত্বপূর্ণ কি-ওয়ার্ড সমূহের ব্যাখ্যা

### ১. `back_populates`
এটি দিয়ে আমরা দ্বিমুখী (Bidirectional) সম্পর্ক তৈরি করি।
*   `User.posts` রিলেশনশিপের `back_populates` মান হলো `"author"`। এর মানে যখনই আমরা কোনো ইউজারের সাথে লিঙ্কড পোস্টগুলো দেখব, সেটি `Post.author` কে ট্রিগার করবে।
*   একইভাবে, `Post.author` রিলেশনশিপের `back_populates` মান হলো `"posts"`।
*   এর ফলে যখনই আপনি পাইথনে `post.author = current_user` সেট করবেন, SQLAlchemy স্বয়ংক্রিয়ভাবে `current_user.posts` এর ভেতরেও এই পোস্টটিকে যুক্ত করে নেবে।

### ২. `cascade="all, delete-orphan"`
এটি প্যারেন্ট এবং চাইল্ড অবজেক্টের মধ্যকার লাইফসাইকেল কন্ট্রোল করে।
*   `cascade="all, delete-orphan"` সেট করার অর্থ হলো, যদি কোনো **User** কে ডেটাবেস থেকে ডিলিট (Delete) করা হয়, তবে তার অধীনে থাকা সমস্ত **Post**-ও ডেটাবেস থেকে স্বয়ংক্রিয়ভাবে ডিলিট হয়ে যাবে।
*   এছাড়াও, যদি কোনো পোস্টকে ইউজারের `posts` লিস্ট থেকে রিমুভ (যেমন: `user.posts.remove(post)`) করা হয়, তবে ডেটাবেসে সেই পোস্টটি অনাথ (orphan) হয়ে যায়। `delete-orphan` থাকার কারণে SQLAlchemy সেই অনাথ পোস্টটিকেও ডেটাবেস থেকে ডিলিট করে দেবে।

### ৩. `ForeignKey("users.id")`
*   এটি নির্দেশ করে যে `posts` টেবিলের `user_id` কলামটি মূলত `users` টেবিলের `id` কলামটির সাথে লিঙ্কড।
*   ডেটাবেস লেভেলে এটি কনস্ট্যান্ট (Constraint) হিসেবে কাজ করে যাতে কোনো ইনভ্যালিড `user_id` দিয়ে পোস্ট সেভ করা না যায়।

---

## ৫. কীভাবে পাইথন কোডে রিলেশনশিপ ব্যবহার করবেন?

রিলেশনশিপ ব্যবহারের ফলে আপনার কোড অনেক বেশি রিডেবল হয়ে যাবে। উদাহরণস্বরূপ:

### নতুন পোস্ট অ্যাড করা:
```python
# একজন ইউজার অবজেক্ট রিট্রিভ করি
user = db.query(User).filter(User.username == "zayn").first()

# নতুন পোস্ট তৈরির সময় সরাসরি 'author' অ্যাসাইন করে দেওয়া
new_post = Post(
    title="SQLAlchemy Tutorial in Bangla",
    content="This tutorial explains modern SQLAlchemy 2.0 relationships...",
    author=user # user_id দেওয়ার বদলে সরাসরি ইউজার অবজেক্ট অ্যাসাইন করা যায়
)
db.add(new_post)
db.commit()
```

### ইউজারের সমস্ত পোস্ট রিট্রিভ করা:
```python
# কোনো অতিরিক্ত জয়েন কুয়েরি না লিখেও ইউজারের সব পোস্টের তালিকা পাওয়া সম্ভব
user_posts = user.posts # এটি আপনাকে [Post1, Post2, ...] অবজেক্টের একটি লিস্ট দেবে

for post in user_posts:
    print(post.title)
```

### পোস্টের রাইটার এর তথ্য পাওয়া:
```python
post = db.query(Post).filter(Post.id == 1).first()
print(post.author.username) # পোস্টের লেখকের ইউজারনেম প্রিন্ট হবে
print(post.author.email)    # লেখকের ইমেইল অ্যাড্রেস প্রিন্ট হবে
```
