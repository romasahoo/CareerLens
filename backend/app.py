import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db, engine, Base
from models import Job
from schemas import JobResponse
from scraper import run_scrapers

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Trigger initial scrape on startup
    try:
        await run_scrapers()
    except Exception as e:
        print(f"Startup scraper error: {e}")

    yield

app = FastAPI(lifespan=lifespan)

# Allow Next.js frontend to access API
frontend_url = os.environ.get("NEXT_PUBLIC_FRONTEND_URL")
origins = ["*"] if not frontend_url else [frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/jobs", response_model=list[JobResponse])
async def get_jobs(
    q: str = None,
    location: str = "",
    remote_only: bool = False,
    source: str = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Job)
    
    if q:
        stmt = stmt.where(Job.title.ilike(f"%{q}%") | Job.company.ilike(f"%{q}%"))
    if location:
        stmt = stmt.where(Job.location.ilike(f"%{location}%"))
    if remote_only:
        stmt = stmt.where(Job.remote == True)
    if source:
        stmt = stmt.where(Job.source.ilike(f"%{source}%"))
        
    stmt = stmt.order_by(Job.posted_date.desc())
    
    result = await db.execute(stmt)
    jobs = result.scalars().all()
    return jobs

@app.post("/api/scrape")
async def trigger_scrape():
    """Manually trigger a fresh scrape from all sources."""
    try:
        await run_scrapers()
        return {"status": "ok", "message": "Scrape completed successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
