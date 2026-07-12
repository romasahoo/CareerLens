# CareerLens

CareerLens is a full-stack web application designed to help users aggregate, filter, and track job postings from various sources. The platform provides a modern user interface and a robust backend API to seamlessly serve job data.

## 🚀 Live Demo
- **Frontend (Web App):** [https://career-lens-jade-six.vercel.app](https://career-lens-jade-six.vercel.app)
- **Backend (API):** [https://careerlens-imal.onrender.com](https://careerlens-imal.onrender.com)

## 🛠️ Tech Stack

### Frontend
The frontend is built with performance and developer experience in mind.
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** TypeScript
- **Deployment:** Vercel

### Backend
The backend serves as a high-performance REST API handling job aggregation and database interactions.
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11)
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) (Async)
- **Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
- **Server:** Uvicorn
- **Deployment:** Render (via Docker)

### Database
- **Engine:** PostgreSQL
- **Hosting:** [Neon](https://neon.tech/)
- **Driver:** `asyncpg`

## 📁 Project Structure

```text
CareerLens/
├── backend/            # FastAPI Python backend
│   ├── alembic/        # Database migration scripts
│   ├── app.py          # Main FastAPI application & routes
│   ├── database.py     # Database connection and session setup
│   ├── models.py       # SQLAlchemy database models
│   ├── schemas.py      # Pydantic models for API validation
│   ├── scraper.py      # Job scraping logic
│   └── Dockerfile      # Docker configuration for Render deployment
└── frontend/           # Next.js React frontend
    ├── src/
    │   └── app/        # Next.js App Router pages and components
    └── package.json    # Frontend dependencies
```

## ⚙️ Local Development Setup

### Backend Setup
1. Navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file with your environment variables (`DATABASE_URL`, `RAPIDAPI_KEY`, `JSEARCH_KEY`, etc.).
6. Run database migrations: `alembic upgrade head`
7. Start the development server: `uvicorn app:app --reload`

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Create a `.env.local` file with the backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment Overview

- **Frontend:** Automatically deployed on push via Vercel. Requires `NEXT_PUBLIC_API_URL` environment variable.
- **Backend:** Deployed as a Web Service on Render using the included `Dockerfile`. Requires `DATABASE_URL` and `NEXT_PUBLIC_FRONTEND_URL` environment variables.
