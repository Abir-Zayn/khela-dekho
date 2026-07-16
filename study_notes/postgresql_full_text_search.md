# PostgreSQL Full-Text Search (FTS) এবং সার্চ অপ্টিমাইজেশন গাইড

এই গাইডে PostgreSQL-এর Full-Text Search (FTS) এর কার্যপদ্ধতি, কেন এটি সাধারণ `LIKE` কুয়েরি থেকে আলাদা ও দ্রুততর, এবং SQLAlchemy-তে কীভাবে এটি দক্ষতার সাথে ইমপ্লিমেন্ট ও অপ্টিমাইজ করা যায় তা বিস্তারিত আলোচনা করা হয়েছে।

---

## ১. Full-Text Search (FTS) কী এবং কেন ব্যবহার করবেন?

সাধারণত ডাটাবেজে কোনো টেক্সট খুঁজতে আমরা `LIKE` বা `ILIKE` ব্যবহার করি। যেমন:
```sql
SELECT * FROM posts WHERE content ILIKE '%injury%';
```
### সমস্যা:
* **Linear Search (O(N)):** `LIKE '%word%'` কোনো ইনডেক্স ব্যবহার করতে পারে না। ফলে ডাটাবেজ টেবিলের প্রতিটি রোর টেক্সট প্রথম থেকে শেষ পর্যন্ত স্ক্যান করে (Sequential Scan)। বড় টেবিলে এটি অত্যন্ত ধীরগতির।
* **Word Normalization নেই:** এটি শব্দের বিভিন্ন রূপ (যেমন: `injuries`, `injured`, `injuring`) সনাক্ত করতে পারে না। শুধুমাত্র হুবহু `injury` মিললেই ডাটা রিটার্ন করে।

### সমাধান (FTS):
PostgreSQL FTS দুটি মূল উপাদানের ওপর ভিত্তি করে কাজ করে:
1. **`tsvector` (Text Search Vector):** এটি একটি বিশেষ ডাটা টাইপ যা টেক্সটকে ছোট ছোট **lexemes** (শব্দের মূল বা রুট রূপ, lowercase এবং স্টপ-ওয়ার্ড যেমন: "a", "the", "and" ইত্যাদি বাদ দিয়ে) এ রূপান্তর করে এবং তাদের অবস্থান সংরক্ষণ করে।
   * উদাহরণ: `'english', 'The quick brown foxes jumped'` -> `'brown':3 'fox':4 'jump':5 'quick':2`
2. **`tsquery` (Text Search Query):** এটি সার্চের জন্য ইনপুট করা কি-ওয়ার্ডকে লজিক্যাল অপারেটর (`&` (AND), `|` (OR), `!` (NOT)) দিয়ে রেডি করে।
   * উদাহরণ: `'fox & jump'`

---

## ২. GIN (Generalized Inverted Index) কী এবং এটি কীভাবে কাজ করে?

GIN ইনডেক্স হচ্ছে সার্চ ইঞ্জিনের বুক ইনডেক্সের মতো।
* ডাটাবেজের প্রতিটি রো উপর থেকে নিচে খোঁজার পরিবর্তে GIN ইনডেক্স একটি ডিকশনারি তৈরি করে:
  `lexeme (শব্দ)` $\rightarrow$ `রো আইডি বা লোকেশনগুলোর লিস্ট`
* যখন কোনো ইউজার `"injury"` লিখে সার্চ করে, ডাটাবেজ সরাসরি ইনডেক্স থেকে ওই শব্দের সাথে যুক্ত রো-গুলোর লিস্ট তুলে আনে। একে **Inverted Index** বলা হয়।
* এর টাইম কমপ্লেক্সিটি **O(log N)** বা তার চেয়েও কম, যা কোটি কোটি ডাটার মধ্যেও মিলি-সেকেন্ডে সার্চ রেজাল্ট এনে দেয়।

---

## ৩. SQLAlchemy-তে FTS ইমপ্লিমেন্টেশন

আমরা `app/models.py`-এ `search_vector` ফিল্ড এবং `GIN` ইনডেক্স যুক্ত করেছি। নিচে এর ব্যাখ্যা দেওয়া হলো:

```python
from sqlalchemy import Computed, Index
from sqlalchemy.dialects.postgresql import TSVECTOR

class Post(Base):
    __tablename__ = "posts"
    # ... অন্যান্য কলাম ...

    # ১. Generated/Computed Column তৈরি করা
    # এটি স্বয়ংক্রিয়ভাবে টাইটেল এবং কন্টেন্টকে একত্র করে tsvector-এ রূপান্তর করবে
    search_vector: Mapped[str] = mapped_column(
        TSVECTOR,
        Computed("to_tsvector('english', title || ' ' || content)", persisted=True),
        nullable=False,
    )

    # ২. GIN Index তৈরি করা
    __table_args__ = (
        Index("ix_post_search_vector", search_vector, postgresql_using="gin"),
    )
```

### গুরুত্বপূর্ণ বিষয়:
* **`Computed(..., persisted=True)`:** এর মানে হলো যখনই কোনো পোস্ট তৈরি বা আপডেট হবে, PostgreSQL ডাটাবেজ লেভেলে স্বয়ংক্রিয়ভাবে `search_vector`-এর মান ক্যালকুলেট করে ডিস্কে সেভ করবে। পাইথন কোড থেকে এটি বারবার জেনারেট করার প্রয়োজন নেই।
* **`postgresql_using="gin"`:** এটি স্পেসিফাই করে যে ইনডেক্সটি GIN টাইপের হবে।

---

## ৪. সার্চ কুয়েরি লেখার পদ্ধতি (FastAPI / SQLAlchemy)

সার্চ কুয়েরি করার জন্য PostgreSQL-এর `@@` অপারেটর ব্যবহার করা হয়। SQLAlchemy-তে আমরা এটি `op('@@')` বা `match()` দিয়ে করতে পারি।

### ক. বেসিক সার্চ কুয়েরি (Plaintext Search)

ইউজারের ইনপুট করা সার্চ কি-ওয়ার্ডকে কুয়েরি করার জন্য `plainto_tsquery` বা `websearch_to_tsquery` ব্যবহার করা সবচেয়ে নিরাপদ।

```python
from sqlalchemy import select
from app.models import Post

# plainto_tsquery ইউজার ইনপুটকে স্বয়ংক্রিয়ভাবে AND (&) রিলেশনে সাজায়
# যেমন: "sports news" -> "sport" & "news"
query = select(Post).where(
    Post.search_vector.op("@@")(func.plainto_tsquery("english", search_query))
)
```

### খ. অ্যাডভান্সড সার্চ কুয়েরি (Websearch syntax)

`websearch_to_tsquery` গুগল সার্চের মতো সিনট্যাক্স সাপোর্ট করে (যেমন: ডাবল কোটেশন `""` দিয়ে ফ্রেজ সার্চ, `-` দিয়ে শব্দ বাদ দেওয়া)।

```python
from sqlalchemy import select, func

async def search_posts(db: AsyncSession, user_input: str):
    stmt = (
        select(Post)
        .where(Post.search_vector.op("@@")(func.websearch_to_tsquery("english", user_input)))
    )
    result = await db.execute(stmt)
    return result.scalars().all()
```

---

## ৫. অপ্টিমাইজেশন এবং রেংকিং (Ranking & Relevance)

খালি ম্যাচিং রো পাওয়াই যথেষ্ট নয়, সবচেয়ে প্রাসঙ্গিক (relevant) পোস্টগুলো সার্চে সবার আগে আসা উচিত। এর জন্য `ts_rank` ব্যবহার করা যায়।

### প্রাসঙ্গিকতার ভিত্তিতে সাজানো (Ranking by relevance):

```python
from sqlalchemy import select, func

async def search_posts_ordered_by_rank(db: AsyncSession, search_text: str):
    # tsquery তৈরি করা
    tsquery = func.websearch_to_tsquery("english", search_text)
    
    # ts_rank ফাংশন ব্যবহার করে রেঙ্ক নির্ধারণ
    rank = func.ts_rank(Post.search_vector, tsquery)
    
    stmt = (
        select(Post, rank.label("search_rank"))
        .where(Post.search_vector.op("@@")(tsquery))
        .order_by(rank.desc()) # সবচেয়ে বেশি রেঙ্ক পাওয়া পোস্টগুলো আগে আসবে
    )
    
    result = await db.execute(stmt)
    # রিটার্ন করার সময় আমরা (Post, rank) টিউপল পাবো
    return result.all()
```

### ওয়েট অ্যাসাইন করা (Weights / Priority):
আপনি চাইলে টাইটেলকে কন্টেন্টের চেয়ে বেশি গুরুত্ব (weight) দিতে পারেন। 
* `setweight` ব্যবহার করে টাইটেলকে `A` এবং কন্টেন্টকে `B` লেভেল দেওয়া যায়।
* উদাহরণ:
  ```sql
  setweight(to_tsvector('english', coalesce(title,'')), 'A') || 
  setweight(to_tsvector('english', coalesce(content,'')), 'B')
  ```
  SQLAlchemy-তে মডেল লেভেলে `Computed` করার সময় এটি এভাবে ডিফাইন করতে পারেন:
  ```python
  Computed(
      "setweight(to_tsvector('english', coalesce(title, '')), 'A') || "
      "setweight(to_tsvector('english', coalesce(content, '')), 'B')",
      persisted=True
  )
  ```

---

## ৬. প্রোডাকশন টিপস (Production Best Practices)

1. **coalesce ব্যবহার করা:** কলামে যদি `NULL` থাকার সম্ভাবনা থাকে, তাহলে FTS এর কনক্যাটেনেশনে `||` অপারেটর কাজ নাও করতে পারে (`NULL` এর সাথে কনক্যাট করলে পুরো স্ট্রিং `NULL` হয়ে যায়)। তাই `coalesce(column, '')` ব্যবহার করা নিরাপদ।
2. **বাংলা সার্চ লিমিটেশন:** ডিফল্ট `'english'` কনফিগারেশন ইংরেজি শব্দের স্টেমার (Stemmer) ব্যবহার করে। যদি আপনার ব্লগে বাংলা কন্টেন্টও থাকে, তবে বাংলা ল্যাঙ্গুয়েজ পার্সার বা ডিকশনারি কনফিগার করতে হবে। অন্যথায় সাধারণ লজিক ব্যবহারের জন্য `'simple'` কনফিগারেশন ব্যবহার করতে পারেন (যা রুট ওয়ার্ড বের না করে হুবহু লোয়ারকেস করে সার্চ করে)।
   * উদাহরণ: `to_tsvector('simple', title)`
3. **Partial matching:** `tsquery` দিয়ে শুরু হওয়া শব্দের আংশিক ম্যাচ চাইলে শব্দের শেষে `:*` ব্যবহার করতে পারেন।
   * উদাহরণ: `func.to_tsquery('english', 'injur:*')` (এটি `injury`, `injuries`, `injured` সব ম্যাচ করবে)।
