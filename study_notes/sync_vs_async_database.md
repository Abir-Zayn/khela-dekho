# Sync vs Async: অ্যাপলিকেশনকে Asynchronous-এ রূপান্তর এবং DB ফ্লো (Sync vs Async - Converting Your App to Asynchronous)

ওয়েব অ্যাপ্লিকেশন ডেভেলপমেন্টে পারফরম্যান্স, স্কেলেবিলিটি এবং রেসপন্স টাইম অপটিমাইজ করার জন্য **Synchronous (Sync)** এবং **Asynchronous (Async)** ধারণার পরিষ্কার জ্ঞান থাকা অত্যন্ত জরুরি। 

বিশেষ করে FastAPI এবং SQLAlchemy-এর মতো আধুনিক ফ্রেমওয়ার্কে ডাটাবেস আই/ও (I/O) অপারেশনের ক্ষেত্রে কীভাবে Sync থেকে Async-এ মাইগ্রেট করতে হয় এবং কেন করতে হয়—এই গাইডে তা বিস্তারিত আলোচনা করা হয়েছে।

---

## ১. মূল ধারণা: Sync vs Async (Core Concepts)

### Synchronous Execution (ব্লকিং ফ্লো)
Synchronous বা Sync ফ্লোতে একটি কাজ শেষ না হওয়া পর্যন্ত পরবর্তী কাজের জন্য অপেক্ষা (Wait) করতে হয়। এটিকে **Blocking Execution** বলা হয়।
* **ফ্লো:** কোড ওপর থেকে নিচে একটার পর একটা লাইন লাইনে এক্সিকিউট হয়।
* **উদাহরণ:** আপনি একটি ডাটাবেস কুয়েরি পাঠালেন। ডাটাবেস রিপ্লাই দেওয়ার আগ পর্যন্ত আপনার পুরো প্রোগ্রাম বা থ্রেড থমকে (Block হয়ে) বসে থাকবে।

### Asynchronous Execution (নন-ব্লকিং ফ্লো)
Asynchronous বা Async ফ্লোতে কোনো ধীরগতির কাজ (যেমন: ডাটাবেস কুয়েরি, ফাইল রিড, নেটওয়ার্ক রিকোয়েস্ট) চলাকালীন প্রোগ্রাম থমকে থাকে না।
* **ফ্লো:** প্রোগ্রাম একটি কাজ শুরু করার আদেশ দিয়ে পরবর্তী কাজে চলে যায়। ধীরগতির কাজ শেষ হলে **Event Loop** নোটিফিকেশন পেয়ে সেই কাজের ফলাফল প্রসেস করে।
* **নন-ব্লকিং (Non-Blocking):** সিপিইউ অপেক্ষা না করে অন্য রিকোয়েস্ট হ্যান্ডেল করতে পারে।

> 💡 **বাস্তব জীবনের উদাহরণ:**
> * **Sync:** রেস্তোরাঁর একজন ওয়েটার কাস্টমারের থেকে অর্ডার নিয়ে রান্নাঘরে গেলেন এবং খাবার রান্না শেষ হওয়া পর্যন্ত রান্নাঘরের সামনে দাঁড়িয়ে রইলেন। রান্নার শেষ না হওয়া পর্যন্ত তিনি অন্য কোনো কাস্টমারের অর্ডার নিতে পারবেন না।
> * **Async:** ওয়েটার রান্নাঘরে অর্ডার জমা দিয়েই চলে আসলেন এবং অন্যান্য কাস্টমারদের অর্ডার নিতে থাকলেন। যখনই রান্না শেষ হবে (Event), তিনি খাবার এনে সেই কাস্টমারকে পরিবেশন করবেন।

---

## ২. কেন ডাটাবেস ও অ্যাপ্লিকেশন ফ্লোতে Async প্রয়োজন?

ওয়েব অ্যাপ্লিকেশনের বেশিরভাগ সময়ই কাটে **I/O Bound Tasks** (Input/Output)-এ। যেমন:
১. ডাটাবেস থেকে ডাটা রিড/রাইট করা (`aiosqlite`, `asyncpg`)
২. থার্ড পার্টি এপিআই (Third-party API) কল করা (`httpx`, `aiohttp`)
৩. ফাইলে ডেটা সেভ করা বা পড়া

### ১. High Concurrency (একসাথে বহু ইউজার হ্যান্ডেল করা)
Sync মডেলে প্রতি রিকোয়েস্টের জন্য একটি করে থ্রেড প্রসেস ব্লক থাকে। ১০০০ জন ইউজার একসাথে রিকোয়েস্ট পাঠালে সিস্টেমের রিসোর্স দ্রুত শেষ হয়ে যায়। Async মডেলে একটি মাত্র মূল থ্রেড (Single Thread Event Loop) ব্যবহার করেই হাজার হাজার কনকারেন্ট (Concurrent) রিকোয়েস্ট সহজে প্রসেস করা সম্ভব।

### ২. রিসোর্সের অপচয় রোধ (Resource Efficiency)
ডাটাবেস কুয়েরি চলাকালীন CPU আইডিয়াল (অলস) বসে থাকে। Async ব্যবহারের ফলে CPU অলস বসে না থেকে অন্যান্য ইউজারের ইনকামিং রিকোয়েস্ট প্রসেস করতে পারে।

---

## ৩. FastAPI-তে Sync এবং Async কীভাবে কাজ করে?

FastAPI নিজেই একটি **ASGI (Asynchronous Server Gateway Interface)** ফ্রেমওয়ার্ক। তবে এতে Sync এবং Async দুটি স্টাইলেই রুট লেখা যায়:

### ১. `def route_name()` (Synchronous Route)
* FastAPI এই ফাংশনগুলোকে একটি পৃথক **Threadpool**-এ পাঠিয়ে দেয়।
* ফলে মূল Event Loop ব্লক হয় না, কিন্তু প্রতিটি রিকোয়েস্টের জন্য অতিরিক্ত থ্রেড প্রয়োজন হয়।

### ২. `async def route_name()` (Asynchronous Route)
* FastAPI এটি সরাসরি প্রধান **Event Loop**-এ এক্সিকিউট করে।
* **🚨 মারাত্মক ভুল/ফাঁদ (The Big Pitfall):** 
  আপনি যদি `async def` ব্লকে কোনো **Synchronous (Blocking)** কোড চালান (যেমন: সাধারণ `requests.get()` বা SQLAlchemy Sync Session-এর `db.execute()`), তবে FastAPI-এর মূল Event Loop-টি ব্লক হয়ে যাবে! এর ফলে পুরো অ্যাপ্লিকেশন থমকে যাবে এবং অন্য কোনো ইউজারের রিকোয়েস্টও প্রসেস হবে না।
* **নিয়ম:** `async def` ব্যবহার করলে অবশ্যই তার ভেতরের সব ধীরগতির কাজকে Asynchronous (`await`) করতে হবে।

---

## ৪. প্যাকেজ ও লাইব্রেরির পরিবর্তন (Sync to Async)

SQLAlchemy এবং SQLite ব্যবহার করে কীভাবে Sync থেকে Async-এ শিফট হতে হয়, তার প্যাকেজ তুলনামূলক তালিকা:

| বৈশিষ্ট্য / কাজ | Synchronous (Sync) | Asynchronous (Async) |
| :--- | :--- | :--- |
| **Database Driver** | `sqlite3` (Built-in) | `aiosqlite` (`pip install aiosqlite`) |
| **Database Connection URL** | `sqlite:///./blog.db` | `sqlite+aiosqlite:///./blog.db` |
| **Engine Creation** | `create_engine(...)` | `create_async_engine(...)` |
| **Session Class** | `Session` / `sessionmaker` | `AsyncSession` / `async_sessionmaker` |
| **Query Execution** | `db.execute(select(...))` | `await db.execute(select(...))` |
| **Commit Operation** | `db.commit()` | `await db.commit()` |
| **Refresh Operation** | `db.refresh(obj)` | `await db.refresh(obj)` |
| **Relationship Loading** | Lazy Loading (Auto) | Explicit (`selectinload` / `joinedload`) |

---

## ৫. প্র্যাকটিক্যাল ইউসকেস ও কোড মাইগ্রেশন উদাহরণ

আসুন আমরা একটি সম্পূর্ণ উদাহরণ দিয়ে দেখি কীভাবে **Sync** কোডকে **Async** কোডে পরিবর্তন করা হয়।

### ৫.১. ডাটাবেস সেশন কনফিগারেশন (`database.py`)

#### 🔴 আগে: Synchronous Setup (`database.py`)
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./blog.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 🟢 পরে: Asynchronous Setup (`database.py`)
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# ১. ড্রাইভার হিসেবে aiosqlite ব্যবহার করতে হবে
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./blog.db"

# ২. create_async_engine ব্যবহার
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True, # ডেভেলপমেন্টে SQL কুয়েরি দেখার জন্য
)

# ৩. async_sessionmaker এবং AsyncSession ব্যবহার
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False # Async-এ এক্সপায়ার হওয়া ঠেকায়
)

class Base(DeclarativeBase):
    pass

# ৪. async generator দিয়ে get_db তৈরি
async def get_db():
    async with AsyncSessionLocal() as db:
        yield db
```

---

### ৫.২. অ্যাপলিকেশন লাইফসাইকেল ও টেবিল ক্রিয়েশন (`main.py`)

#### 🔴 আগে: Sync Table Creation
```python
# এটি ব্লকিং কোড
Base.metadata.create_all(bind=engine)
```

#### 🟢 পরে: Async Lifespan Manager (`main.py`)
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # অ্যাপ চালুর সময় আসিনক্রোনাসভাবে টেবিল তৈরি
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # অ্যাপ বন্ধের সময় ইঞ্জিন রিলিজ
    await engine.dispose()

app = FastAPI(lifespan=lifespan)
```

---

### ৫.৩. এপিআই অ্যান্ডপয়েন্ট এবং CRUD প্রসেস (`main.py`)

#### 🔴 আগে: Synchronous CRUD Operations

```python
from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app import models, schemas
from app.database import get_db

@app.post("/api/posts", response_model=schemas.PostResponse)
def create_post(post: schemas.PostCreate, db: Annotated[Session, Depends(get_db)]):
    # ১. Sync query
    user = db.execute(
        select(models.User).where(models.User.id == post.user_id)
    ).scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_post = models.Post(**post.model_dump())
    db.add(new_post)
    db.commit() # Blocking commit
    db.refresh(new_post) # Blocking refresh
    return new_post

@app.get("/api/posts/{post_id}", response_model=schemas.PostResponse)
def get_post(post_id: int, db: Annotated[Session, Depends(get_db)]):
    post = db.execute(
        select(models.Post).where(models.Post.id == post_id)
    ).scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
```

#### 🟢 পরে: Asynchronous CRUD Operations

```python
from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app import models, schemas
from app.database import get_db

@app.post("/api/posts", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(post: schemas.PostCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    # ১. await ব্যবহার করে ইউজার সার্চ
    result = await db.execute(
        select(models.User).where(models.User.id == post.user_id)
    )
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    new_post = models.Post(**post.model_dump())
    db.add(new_post)
    
    # ২. await দিয়ে commit এবং refresh
    await db.commit()
    await db.refresh(new_post)
    return new_post

@app.get("/api/posts/{post_id}", response_model=schemas.PostResponse)
async def get_post(post_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    # ৩. Relationship Data আনার জন্য explicit selectinload ব্যবহার করতে হয়
    result = await db.execute(
        select(models.Post)
        .options(selectinload(models.Post.author))
        .where(models.Post.id == post_id)
    )
    post = result.scalars().first()
    
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post
```

---

## ৬. Async SQLAlchemy ব্যবহারের গুরুত্বপূর্ণ বিষয়সমূহ (Key Gotchas)

### ১. Relational Data & Lazy Loading
Sync SQLAlchemy তে সম্পর্কের অবজেক্ট (যেমন: `post.author`) এক্সেস করলে SQLAlchemy স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ডে অতিরিক্ত কুয়েরি চালায় (Lazy Loading)। 
* **Async-এ সমস্যা:** Async-এ অন-দ্য-ফ্লাই (On-the-fly) ইমপ্লিসিট I/O সম্ভব নয়। রিলেশনশিপ অ্যাক্সেস করতে গেলে `MissingGreenlet` এরর হবে।
* **সমাধান:** কুয়েরি করার সময়ই `selectinload(models.Post.author)` অথবা `joinedload(models.Post.author)` ব্যবহার করে ডাটা সাথে নিয়ে আসতে হবে।

### ২. `expire_on_commit = False`
Async সেশনে `commit()` করার পর অবজেক্টের ফিল্ডগুলো স্বয়ংক্রিয়ভাবে এক্সপায়ার হয় না যদি `expire_on_commit=False` সেট করা থাকে। এটি Async অ্যাপ্লিকেশনে অপ্রয়োজনীয় DB Access কমায়।

---

## ৭. রূপান্তরের চেকলিস্ট (Conversion Checklist)

1. [ ] **প্যাকেজ ইনস্টল:** `pip install aiosqlite` (SQLite-এর জন্য) অথবা `pip install asyncpg` (PostgreSQL-এর জন্য)।
2. [ ] **DB Connection String:** `sqlite+aiosqlite:///...` বা `postgresql+asyncpg://...` ব্যবহার করুন।
3. [ ] **Database Engine:** `create_async_engine` দিয়ে ইঞ্জিন তৈরি করুন।
4. [ ] **Session Maker:** `async_sessionmaker` দিয়ে `AsyncSession` ডিফাইন করুন।
5. [ ] **Route Handler:** এন্ডপয়েন্টগুলোকে `async def` করুন।
6. [ ] **DB Query & Calls:** সমস্ত ডাটাবেস অপারেশনে `await` যুক্ত করুন (`await db.execute()`, `await db.commit()`, `await db.refresh()`)।
7. [ ] **Relationships:** `selectinload` / `joinedload` ইগার লোডিং ব্যবহার করুন।

---

## ৮. সারসংক্ষেপ (Summary)

* **Sync** কোড সহজ কিন্তু হাই-ট্রাফিক আই/ও বাউন্ড সিস্টেমে থ্রেড ব্লকিংয়ের কারণে ধীরগতির হতে পারে।
* **Async** কোড কম রিসোর্সে বিপুল পরিমাণ রিকোয়েস্ট সমান্তরালে (Concurrently) প্রসেস করতে সাহায্য করে।
* FastAPI + SQLAlchemy 2.0 + `aiosqlite` একটি আধুনিক, রেসপন্সিভ এবং অত্যন্ত দ্রুতগতির ওয়েব অ্যাপ্লিকেশন গড়ে তুলতে সাহায্য করে।
