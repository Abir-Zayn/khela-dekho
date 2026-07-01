This is my first project on Fast API . Khela dekho is a sports blog website . 

High Level Project Structure 

khela-dekho-blog/
├── frontend/                 # Next.js Application (React, Tailwind, TS)
│   ├── app/                  # Next.js App Router (pages, layouts, API routes)
│   ├── components/           # Reusable UI components (buttons, cards, forms)
│   ├── hooks/                # Custom React hooks (e.g., useAuth)
│   ├── lib/                  # Client utilities (API fetcher, helper functions)
│   ├── public/               # Static frontend assets (images, icons)
│   ├── package.json          # Node dependencies
│   └── next.config.js        # Next.js configuration
│
├── backend/                  # FastAPI Application (Python)
│   ├── app/                  # Main source directory
│   │   ├── api/              # API router and endpoints split by domain
│   │   ├── core/             # Configuration, security/auth, DB connections
│   │   ├── models/           # Database models (SQLAlchemy, SQLModel, etc.)
│   │   ├── schemas/          # Pydantic schemas (request/response validation)
│   │   ├── services/         # Business logic layer
│   │   └── main.py           # FastAPI entrypoint (app definition & middleware)
│   ├── tests/                # Pytest test suite
│   ├── pyproject.toml        # Python project configuration (uv / poetry / pip)
│   └── .venv/                # Python virtual environment
│
├── docker-compose.yml        # Optional: Runs frontend, backend, and DB locally
└── README.md                 # Project-wide documentation



for the frontend feature  you need to create the folders in this 
manner 
src >> app>> components,configs, hooks,features 
on the features it will have 
for eg developing feature name user activity log screen 
activity log >>
  actions/          --- server actions
  components/       --- components related to this feature
  types/            --- typescript types for this feature
  utils/            --- utility functions for this feature
  index.ts          --- export all the components and functions
  root.tsx          --- main component for this feature
  page.tsx          --- page component for this feature
