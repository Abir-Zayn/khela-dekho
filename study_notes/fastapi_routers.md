# FastAPI APIRouter: রাউটিং এবং মডুলার কোড স্ট্রাকচার

FastAPI-তে অ্যাপ্লিকেশন বড় হওয়ার সাথে সাথে সব রুট (route) বা এন্ডপয়েন্টকে একটিমাত্র ফাইলে (`main.py`) রাখা কঠিন হয়ে পড়ে। কোডকে আরও পরিচ্ছন্ন, সংগঠিত ও রক্ষণাবেক্ষণযোগ্য (maintainable) করার জন্য FastAPI **APIRouter** প্রদান করে। 

এই গাইডে আমরা আলোচনা করব **APIRouter** কী, এটি কীভাবে কাজ করে, এবং কীভাবে আমাদের স্পোর্টস ব্লগ অ্যাপ্লিকেশনে আমরা রুটগুলোকে আলাদা করেছি।

---

## ১. APIRouter কী?

`APIRouter` হলো FastAPI-এর একটি ক্লাস যা বড় অ্যাপ্লিকেশনের বিভিন্ন অংশকে ছোট ছোট মডিউলে ভাগ করতে সাহায্য করে। এটিকে আপনি একটি "মিনি FastAPI" অ্যাপ্লিকেশন হিসেবে চিন্তা করতে পারেন। 

প্রতিটি রাউটারে নিজস্ব রুট, মিডলওয়্যার, ডিপেন্ডেন্সি এবং ট্যাগ থাকতে পারে, যা পরবর্তীতে মূল `FastAPI` অ্যাপের সাথে যুক্ত করা হয়।

---

## ২. কেন আমরা APIRouter ব্যবহার করব?

* **মডুলারিটি (Modularity):** কোডকে বিভিন্ন লজিক্যাল গ্রুপে (যেমন: ইউজার, পোস্ট, কমেন্ট) ভাগ করা যায়।
* **কোড অর্গানাইজেশন (Code Organization):** `main.py` ফাইলটি পরিচ্ছন্ন থাকে এবং প্রতিটি ফিচার আলাদা ফাইলে থাকে।
* **পাথ প্রিফিক্সিং (Path Prefixing):** প্রতিটি রুটের শুরুতে বারবার একই পাথ টাইপ করতে হয় না।
* **ট্যাগিং (Tagging):** সোয়াগার ডকুমেন্টেশনে (Swagger UI /docs) রুটগুলোকে সুন্দরভাবে ক্যাটাগরি অনুযায়ী সাজানো যায়।
* **রুট-স্পেসিফিক ডিপেন্ডেন্সি (Dependencies):** একটি নির্দিষ্ট রাউটারের সকল রুটের জন্য একবারে ডিপেন্ডেন্সি (যেমন: অথেনটিকেশন) ডিফাইন করা যায়।

---

## ৩. রাউটার তৈরি ও ডিফাইন করা (How to Define Routers)

আমাদের অ্যাপ্লিকেশনে আমরা দুটি প্রধান রাউটার তৈরি করেছি: `users` এবং `posts`।

### ক. ইউজার রাউটার (`app/routers/users.py`)
এখানে আমরা ইউজার সম্পর্কিত সব API এন্ডপয়েন্ট রেখেছি। 

```python
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.database import get_db
from app.schemas import UserCreate, UserResponse

# APIRouter ইনস্ট্যান্স তৈরি করা
router = APIRouter(
    prefix="/api/users", # এই রাউটারের সব পাথের শুরুতে স্বয়ংক্রিয়ভাবে /api/users যুক্ত হবে
    tags=["Users"]       # API ডকুমেন্টেশনে এটি 'Users' সেকশনে দেখাবে
)

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    # কোড লজিক এখানে...
    pass

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    # কোড লজিক এখানে...
    pass
```

### খ. পোস্ট রাউটার (`app/routers/posts.py`)
পোস্ট সম্পর্কিত সকল লজিক এবং রুট এই ফাইলে রাখা হয়েছে:

```python
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app import models
from app.database import get_db
from app.schemas import PostCreate, PostResponse, PostUpdate

router = APIRouter(
    prefix="/api/posts", # এই রাউটারের সব পাথের শুরুতে /api/posts যুক্ত হবে
    tags=["Posts"]       # API ডকুমেন্টেশনে এটি 'Posts' সেকশনে দেখাবে
)

@router.get("", response_model=list[PostResponse])
async def get_posts(db: Annotated[AsyncSession, Depends(get_db)]):
    # কোড লজিক এখানে...
    pass

# অন্যান্য পোস্ট রাউট সমূহ...
```

---

## ৪. রাউটার রেজিস্টার বা ইনক্লুড করা (Registering/Including Routers)

রাউটার ফাইলগুলো তৈরি করার পর, FastAPI-কে জানাতে হবে যে এই রুটগুলো এক্সিস্ট করে। এর জন্য আমরা মূল `app/main.py` ফাইলে রাউটারগুলোকে ইনক্লুড করি।

`app/main.py`-তে যেভাবে যুক্ত করা হয়েছে:

```python
from fastapi import FastAPI
from app.routers import posts, users # রাউটার মডিউলগুলো ইম্পোর্ট করা

app = FastAPI()

# রাউটারগুলোকে মূল অ্যাপে রেজিস্টার করা
app.include_router(users.router)
app.include_router(posts.router)
```

---

## ৫. ডিরেক্টরি স্ট্রাকচার (Directory Structure)

কোড সেপারেশনের পর আমাদের প্রজেক্ট ডিরেক্টরি নিচের মতো দেখাবে:

```text
backend/
│
├── app/
│   ├── __init__.py          # প্যাকেজ ইনিশিয়ালাইজার
│   ├── main.py              # মূল FastAPI অ্যাপ এবং মিডলওয়্যার কনফিগারেশন
│   ├── database.py          # ডাটাবেজ কানেকশন ও সেশন তৈরি
│   ├── models.py            # SQLAlchemy ডাটাবেজ মডেল
│   ├── schemas.py           # Pydantic স্কিমা (ইনপুট/আউটপুট ভ্যালিডেশন)
│   │
│   └── routers/             # রাউটার ডিরেক্টরি
│       ├── __init__.py      # রাউটার প্যাকেজ ইনিশিয়ালাইজার
│       ├── users.py         # ইউজার সংক্রান্ত এন্ডপয়েন্ট সমূহ
│       └── posts.py         # পোস্ট সংক্রান্ত এন্ডপয়েন্ট সমূহ
```

---

## ৬. সেরা অভ্যাস সমূহ (Best Practices)

1. **পাথ প্রিফিক্স সাবধানে ব্যবহার করা:** রাউটার ডিফাইন করার সময় `prefix` ব্যবহার করলে ফাংশন ডেকোরেটরে অতিরিক্ত পাথ লেখার প্রয়োজন হয় না। যেমন: `@router.get("")` রুটটি আসলে `/api/posts` পাথকে রিপ্রেজেন্ট করে।
2. **__init__.py নিশ্চিত করা:** প্রতিটি মডিউল বা প্যাকেজ ডিরেক্টরিতে (যেমন `app/` এবং `app/routers/`) একটি `__init__.py` ফাইল থাকা আবশ্যক, যাতে পাইথন সেগুলোকে প্যাকেজ হিসেবে ইম্পোর্ট করতে পারে।
3. **লজিক্যাল সেপারেশন:** রাউটারগুলোতে শুধুমাত্র রুট ডিফাইন ও কন্ট্রোলারের কাজ করা উচিত। ডেটাবেজ কুয়েরি বেশি বড় হলে তা আলাদা সার্ভিস লেয়ারে সরিয়ে নেওয়া ভালো।
