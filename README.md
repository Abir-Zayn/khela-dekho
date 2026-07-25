# ⚽ Khela Dekho (খেলা দেখো) — Sports Blog & Real-Time Match Hub

**Khela Dekho** (meaning *"Watch the Game"* in Bengali) is a modern, feature-packed full-stack sports platform. It combines rich community blog publishing with a real-time, multi-sport live scores center for sports fans, journalists, and enthusiasts.

---

## 💡 What is Khela Dekho? (In Layman's Terms)

Imagine combining a modern medium-style blogging website with a live sports scoreboard: **that's Khela Dekho!**

* **For Sports Fans:** You can stay updated with real-time match scores, live statuses, and league table standings across **Football (Soccer)**, **Cricket**, and **Baseball (MLB)** — all in one single app without jumping between sports apps.
* **For Writers & Creators:** You can write, edit, and publish rich sports articles with images and video links, organize them with categories and tags, and save drafts whenever you need to refine your ideas.
* **For Readers & Community:** You can discover trending sports news, perform lightning-fast searches for specific articles, view author profiles, and express your opinions on posts using interactive reactions like **Like** 👍, **Love** ❤️, or **Laugh** 😂.

---

## ✨ Key Features

### ⚽ 1. Multi-Sport Live Engine
* **Football (Soccer):** Real-time match scores, live status (In-Play, Half-Time, Finished), and updated standings for top leagues (Premier League, Champions League, La Liga, Serie A, Bundesliga).
* **Cricket Hub:** Live, upcoming, and recent scorecards filtered by formats (T20, ODI, Test matches).
* **Baseball (MLB):** Live game trackers and score updates for Major League Baseball.
* **Smart Caching:** Fast response times using automated server-side TTL caching for external sports feeds.

### 📝 2. Rich Content Creation & Publishing
* **Lexical Rich Text Editor:** WYSIWYG article creation with formatting controls.
* **Draft & Publish Lifecycle:** Save drafts as you work and publish when ready.
* **Direct AWS S3 Image Uploads:** Instant media uploads powered by secure AWS S3 pre-signed URLs.
* **Embedded Media:** Attach header images, video links, and external reference URLs.
* **Categories & Tags:** Organize content under structured categories (e.g., Football, Cricket, Analytics) and custom tags.

### 🔍 3. Lightning-Fast Full-Text Search
* Integrated PostgreSQL `TSVector` search index for fast keyword searches across post titles and contents.

### ❤️ 4. Interactive Community Reactions
* **Multi-Reaction System:** React to posts with Like, Love, or Laugh.
* Dynamic reaction counting and toggle states per logged-in user.

### 👤 5. User Profiles & Authentication
* **Secure Auth:** JWT-based access & refresh token authentication with hashed passwords.
* **Customizable Profiles:** Update bio, profile photos, location, social links (Twitter/X, Instagram), and sports/reading interests.
* **Password Recovery:** Email-based tokenized password reset workflows (powered by Resend).

### 🎨 6. Premium Modern UI/UX
* Dark-themed glassmorphism aesthetic built with Next.js 16, React 19, and Tailwind CSS v4.
* Responsive layouts, smooth micro-interactions, and skeleton loading screens for optimized perceived performance.

---

## 🏗️ Project Architecture

```text
sports_blog/
├── frontend/                   # Next.js 16 Application (React 19, Tailwind v4, TypeScript)
│   ├── src/
│   │   ├── app/                # App Router (pages, layouts, API configurations)
│   │   │   ├── create-post/   # Rich article editor feature
│   │   │   ├── login/          # User login page
│   │   │   ├── register/       # User registration page
│   │   │   ├── posts/[id]/     # Article details & reactions
│   │   │   └── features/       # Modular features (home, auth, components)
│   │   ├── components/         # Reusable UI components & Skeleton grids
│   │   └── lib/                # API client & helper utilities
│   └── package.json            # Frontend dependencies
│
├── backend/                    # FastAPI Application (Python 3.11+)
│   ├── app/
│   │   ├── routers/            # Domain API routers (posts, auth, livescores, cricket, baseball)
│   │   ├── services/           # External sports services & cache managers
│   │   ├── models.py           # SQLAlchemy 2.0 async database models (UUIDv7, TSVector)
│   │   ├── schemas.py          # Pydantic v2 request/response validation schemas
│   │   ├── security.py         # JWT tokens & password hashing utilities
│   │   ├── s3.py               # AWS S3 presigned upload generation
│   │   ├── database.py         # Async SQLAlchemy engine & session setup
│   │   └── main.py             # FastAPI entry point & CORS configuration
│   ├── tests/                  # Pytest test suite
│   └── pyproject.toml          # Python project dependencies
│
└── docker-compose.yml          # Container orchestration (Frontend, Backend, PostgreSQL)
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) | High-performance Python async web framework |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) + [SQLAlchemy 2.0](https://www.sqlalchemy.org/) | Async ORM with UUIDv7 primary keys & TSVector full-text search |
| **Data Validation** | [Pydantic v2](https://docs.pydantic.dev/) | Strict data parsing and API schema enforcement |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) | Server & client rendered UI |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) | Utility-first styling with modern dark theme |
| **State & Data Fetching**| [TanStack React Query](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs/) | Asynchronous state management & client caching |
| **Rich Text Editor** | [Lexical](https://lexical.dev/) | Extensible JavaScript web text editor framework |
| **Storage & Email** | [AWS S3](https://aws.amazon.com/s3/) + [Resend](https://resend.com/) | Cloud file uploads & transactional email services |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+)
* **Python** (v3.11+)
* **PostgreSQL** database instance (or Docker)

---

### 1️⃣ Setting up the Backend

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt  # or pip install .
   ```

4. **Create a `.env` file in the `backend/` directory:**
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/khela_dekho
   SECRET_KEY=your_super_secret_jwt_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7

   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your_s3_bucket

   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   FRONTEND_URL=http://localhost:3000

   FOOTBALL_DATA_API_KEY=your_football_data_key
   CRICKET_DATA_API_KEY=your_cricket_data_key
   ```

5. **Start the FastAPI dev server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 2️⃣ Setting up the Frontend

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env.local` file in `frontend/`:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
   * Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 🔌 Main API Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/auth/register` | `POST` | Register a new user account |
| **Auth** | `/auth/login` | `POST` | User login & JWT token pair retrieval |
| **Posts** | `/posts/` | `GET` | Paginated post listing with search & category filters |
| **Posts** | `/posts/` | `POST` | Create a new draft or published post |
| **Posts** | `/posts/{id}/reactions` | `POST` | Toggle Like / Love / Laugh reactions |
| **S3 Upload** | `/posts/upload-url` | `POST` | Get AWS S3 presigned URL for image upload |
| **Live Football**| `/api/v1/livescores/matches` | `GET` | Live & scheduled football match fixtures |
| **Live Football**| `/api/v1/livescores/standings/{league}` | `GET` | Football league standings (PL, CL, PD, etc.) |
| **Live Cricket** | `/api/v1/cricket/matches` | `GET` | Live & upcoming international/domestic cricket matches |
| **Live Baseball**| `/api/v1/baseball/matches` | `GET` | Real-time MLB match score updates |
| **Users** | `/users/me` | `GET` / `PUT` | Fetch & update current user profile |

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
