# Khela Dekho

**Khela Dekho** is a modern, full-stack sports blog platform. This project represents my first deep dive into the **FastAPI** framework, focusing on building a robust, high-performance backend integrated with a sleek **Next.js** frontend.

---

## 🏗️ Project Architecture

The project follows a clean, modular architecture designed for maintainability and scalability.

```text
khela-dekho-blog/
├── frontend/                # Next.js Application (React, Tailwind, TS)
│   ├── app/                 # Next.js App Router (pages, layouts)
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Client utilities & API fetchers
│   └── package.json         # Node dependencies
│
├── backend/                 # FastAPI Application (Python)
│   ├── app/                 # Main source directory
│   │   ├── api/             # Domain-specific API routers
│   │   ├── core/            # Config, Security, Auth, DB
│   │   ├── models/          # Database models (SQLAlchemy/SQLModel)
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── services/        # Business logic layer
│   │   └── main.py          # FastAPI entrypoint
│   ├── tests/               # Pytest suite
│   └── pyproject.toml       # Python configuration
│
└── docker-compose.yml       # Orchestrates frontend, backend, and DB


-----
```



## 🛠️ Tech Stack

### Backend
Framework: FastAPI

Validation: Pydantic

Database: (Insert your DB here, e.g., PostgreSQL/SQLite)

Testing: Pytest

### Frontend
Framework: Next.js

Language: TypeScript

Styling: Tailwind CSS
