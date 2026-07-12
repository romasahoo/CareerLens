import asyncio
import requests
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from models import Job, UserFilter, Notification
from database import AsyncSessionLocal
from dotenv import load_dotenv

load_dotenv()

# Python ecosystem keywords — must have at least one
PYTHON_KEYWORDS = ["python", "fastapi", "django", "flask", "sqlalchemy", "celery", "pydantic"]

# Backend role keywords — must have at least one (broadened to catch LinkedIn titles)
BACKEND_ROLE_KEYWORDS = [
    "backend", "back-end", "back end",
    "python developer", "python engineer", "python programmer",
    "software engineer", "software developer",
    "api developer", "api engineer",
    "platform engineer", "platform developer",
    "server-side", "server side",
    "full stack", "fullstack", "full-stack",
    "web developer", "web engineer",
    "cloud engineer", "cloud developer",
    "data engineer",  # often use Python heavily
]

# Roles to exclude
EXCLUDE_KEYWORDS = ["intern", "praktikum", "student", "werkstudent", "junior", "trainee", "entry", "associate", "frontend", "front-end", "mobile", "android", "ios", "devops", "machine learning", "data scientist"]

# Common German words in job titles — if title contains these it's a German-language posting
GERMAN_TITLE_WORDS = [
    "entwickler", "ingenieur", "stellenangebot", "vollzeit", "teilzeit",
    "festanstellung", "mitarbeiter", "leiter", "sachbearbeiter", "fachkraft",
    "berater", "gestalter", "(m/w/d)", "(w/m/d)", "(m/w)", "für", "mit"
]

# Common non-English words that indicate a non-English job posting
NON_ENGLISH_WORDS = [
    # French
    "développeur", "ingénieur", "concepteur",
    # Spanish
    "desarrollador", "ingeniero",
    # Italian
    "sviluppatore", "ingegnere",
    # Dutch
    "ontwikkelaar",
    # Portuguese
    "desenvolvedor",
]

def is_english_job(title: str, description: str = "") -> bool:
    """Return True if the job title/description appears to be in English."""
    lower_title = title.lower()
    # Reject if German title words found
    for word in GERMAN_TITLE_WORDS:
        if word in lower_title:
            return False
    # Reject if other non-English words found in title
    for word in NON_ENGLISH_WORDS:
        if word in lower_title:
            return False
    return True

async def create_notifications_for_job(session: AsyncSession, job: Job):
    stmt = select(UserFilter)
    result = await session.execute(stmt)
    filters = result.scalars().all()
    
    for f in filters:
        # Match query
        if f.query and f.query.lower() not in job.title.lower() and f.query.lower() not in job.company.lower():
            continue
            
        # Match location
        if f.locations:
            loc = (job.location or "").lower()
            loc_match = False
            for l in f.locations:
                if l == "Remote" and job.remote: loc_match = True
                elif l == "Munich" and ("munich" in loc or "münchen" in loc): loc_match = True
                elif l == "Berlin" and "berlin" in loc: loc_match = True
                elif l == "Hybrid" and "hybrid" in loc: loc_match = True
                elif l.lower() in loc: loc_match = True
            if not loc_match:
                continue
                
        notif = Notification(
            user_id=f.user_id,
            job_id=job.id,
            message=f"New match: {job.title} at {job.company}"
        )
        session.add(notif)


# ── Arbeitnow ─────────────────────────────────────────────────────────────────

def get_arbeitnow_jobs():
    url = "https://www.arbeitnow.com/api/job-board-api"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json().get("data", [])
    except Exception as e:
        print(f"Arbeitnow fetch error: {e}")
    return []

async def fetch_jobs(session: AsyncSession):
    jobs = get_arbeitnow_jobs()
    
    for job in jobs:
        location = job.get("location", "")
        title = job.get("title", "")
        lower_title = title.lower()
        job_type = job.get("job_type", "").lower()
        tags = [t.lower() for t in job.get("tags", [])]
        description = job.get("description", "").lower()
        combined = lower_title + " " + description + " " + " ".join(tags)
        
        # Only Munich / München
        if not ("munich" in location.lower() or "münchen" in location.lower()):
            continue
        
        # Must be full-time
        if job_type and "full" not in job_type:
            continue
        
        # Must match a backend role keyword in the title
        if not any(k in lower_title for k in BACKEND_ROLE_KEYWORDS):
            continue
        
        # Must have at least one Python ecosystem keyword (title, tags, or description)
        if not any(k in combined for k in PYTHON_KEYWORDS):
            continue
        
        # Exclude intern / junior / non-backend roles
        if any(k in lower_title for k in EXCLUDE_KEYWORDS):
            continue

        # Skip German-language job titles
        if not is_english_job(title):
            continue
        
        stmt = select(Job).where(Job.url == job.get("url"))
        result = await session.execute(stmt)
        if not result.scalar_one_or_none():
            new_job = Job(
                title=title,
                company=job.get("company_name", ""),
                location=location,
                job_type="Full-time",
                remote=job.get("remote", False),
                url=job.get("url", ""),
                source="Arbeitnow",
                posted_date=datetime.utcnow()
            )
            session.add(new_job)
            await session.flush()
            await create_notifications_for_job(session, new_job)
    await session.commit()


# ── Active Jobs DB (RapidAPI) ─────────────────────────────────────────────────

async def fetch_rapidapi_jobs(session: AsyncSession):
    import os
    rapidapi_key = os.environ.get("RAPIDAPI_KEY")
    rapidapi_host = os.environ.get("RAPIDAPI_HOST", "active-jobs-db.p.rapidapi.com")
    
    if not rapidapi_key:
        return
        
    url = f"https://{rapidapi_host}/active-ats"
    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": rapidapi_host
    }
    querystring = {
        "time_frame": "7d",
        "limit": "50",
        "title": "Python Backend Engineer OR Python Backend Developer OR Python Developer Backend OR FastAPI Developer OR Django Developer",
        "location": "Munich OR Germany"
    }
    
    try:
        response = requests.get(url, headers=headers, params=querystring, timeout=15)
        if response.status_code == 200:
            data = response.json()
            jobs = data if isinstance(data, list) else data.get("data", []) or data.get("jobs", []) or data.get("results", [])
            for job in jobs:
                location_raw = job.get("locations", "") or job.get("locations_alt", "")
                location = "Munich"
                if isinstance(location_raw, list) and len(location_raw) > 0:
                    loc_item = location_raw[0]
                    if isinstance(loc_item, dict) and "address" in loc_item:
                        location = loc_item["address"].get("addressLocality", "Munich")
                    elif isinstance(loc_item, str):
                        location = loc_item
                elif isinstance(location_raw, str) and location_raw:
                    location = location_raw
                    
                title = job.get("title", "")
                url_link = job.get("url", "")
                company = job.get("organization", "") or job.get("company", "")
                
                if not url_link or not title:
                    continue

                # Skip German-language postings
                if not is_english_job(title):
                    continue
                    
                job_type_raw = job.get("employment_type", "Full-time")
                job_type = job_type_raw[0] if isinstance(job_type_raw, list) and len(job_type_raw) > 0 else job_type_raw
                if not isinstance(job_type, str):
                    job_type = "Full-time"

                lower_title = title.lower()
                lower_type = str(job_type).lower()
                description = str(job.get("description", "")).lower()
                combined = lower_title + " " + description

                # Must be full-time
                if lower_type and "full" not in lower_type and "part" in lower_type:
                    continue

                # Must match a backend role keyword in the title
                if not any(k in lower_title for k in BACKEND_ROLE_KEYWORDS):
                    continue

                # Must have at least one Python ecosystem keyword
                if not any(k in combined for k in PYTHON_KEYWORDS):
                    continue

                # Exclude intern / junior / non-backend roles
                if any(k in lower_title for k in EXCLUDE_KEYWORDS):
                    continue

                stmt = select(Job).where(Job.url == url_link)
                result = await session.execute(stmt)
                if not result.scalar_one_or_none():
                    new_job = Job(
                        title=title,
                        company=company,
                        location=location,
                        job_type="Full-time",
                        remote="remote" in str(job.get("location_type", "")).lower(),
                        url=url_link,
                        source="RapidAPI (Active Jobs DB)",
                        posted_date=datetime.utcnow()
                    )
                    session.add(new_job)
                    await session.flush()
                    await create_notifications_for_job(session, new_job)
            await session.commit()
    except Exception as e:
        print(f"Error fetching from RapidAPI Active Jobs DB: {e}")


# ── JSearch (LinkedIn / Indeed / Glassdoor via RapidAPI) ─────────────────────

async def fetch_jsearch_jobs(session: AsyncSession):
    """
    JSearch API aggregates jobs from LinkedIn, Indeed, Glassdoor and other boards.
    Subscribe at: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
    Uses the same RAPIDAPI_KEY — just needs the JSearch host added to .env:
        JSEARCH_HOST=jsearch.p.rapidapi.com
    """
    import os
    rapidapi_key = os.environ.get("JSEARCH_KEY") or os.environ.get("RAPIDAPI_KEY")
    jsearch_host = os.environ.get("JSEARCH_HOST", "jsearch.p.rapidapi.com")

    if not rapidapi_key:
        print("JSearch: No JSEARCH_KEY or RAPIDAPI_KEY set, skipping.")
        return

    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": jsearch_host,
    }

    # Run multiple targeted searches (broad enough to capture LinkedIn postings)
    queries = [
        "Python Backend Engineer Germany",
        "FastAPI Developer Germany",
        "Python Developer Germany",
        "Django Backend Developer Germany",
        "Python Software Engineer Germany",
        "Python API Developer Germany",
        "Python Platform Engineer Germany",
    ]

    for query in queries:
        params = {
            "query": query,
            "page": "1",
            "num_pages": "1",
            "country": "de",
        }

        try:
            response = requests.get(
                f"https://{jsearch_host}/search-v2",
                headers=headers,
                params=params,
                timeout=15,
            )
            if response.status_code != 200:
                print(f"JSearch error {response.status_code}: {response.text[:200]}")
                continue

            data = response.json()
            # JSearch v2 returns data: {"jobs": [...], "cursor": ...}
            jobs = data.get("data", {}).get("jobs", [])
            print(f"JSearch '{query}': {len(jobs)} results")

            for job in jobs:
                title = job.get("job_title", "")
                company = job.get("employer_name", "")
                url_link = job.get("job_apply_link", "") or job.get("job_url", "")
                city = job.get("job_city", "") or ""
                country = job.get("job_country", "") or ""
                location = f"{city}, {country}".strip(", ") or "Germany"
                is_remote = job.get("job_is_remote", False)
                job_type_raw = job.get("job_employment_type", "FULLTIME")
                description = str(job.get("job_description", "")).lower()

                if not title or not url_link:
                    continue

                # English only
                if not is_english_job(title, description):
                    continue

                lower_title = title.lower()

                # Must match Python / backend keyword
                combined = lower_title + " " + description
                if not any(k in combined for k in PYTHON_KEYWORDS):
                    continue

                if not any(k in lower_title for k in BACKEND_ROLE_KEYWORDS):
                    continue

                if any(k in lower_title for k in EXCLUDE_KEYWORDS):
                    continue

                # Determine source (LinkedIn, Indeed, Glassdoor, etc.)
                publisher = job.get("job_publisher", "JSearch")
                source_label = f"LinkedIn" if "linkedin" in publisher.lower() else \
                               f"Indeed" if "indeed" in publisher.lower() else \
                               f"Glassdoor" if "glassdoor" in publisher.lower() else \
                               publisher

                # Map employment type
                type_map = {
                    "FULLTIME": "Full-time", "PARTTIME": "Part-time",
                    "CONTRACTOR": "Contract", "INTERN": "Internship",
                }
                job_type = type_map.get(job_type_raw, "Full-time")

                stmt = select(Job).where(Job.url == url_link)
                result = await session.execute(stmt)
                if not result.scalar_one_or_none():
                    new_job = Job(
                        title=title,
                        company=company,
                        location=location,
                        job_type=job_type,
                        remote=is_remote,
                        url=url_link,
                        source=source_label,
                        posted_date=datetime.utcnow(),
                    )
                    session.add(new_job)
                    await session.flush()
                    await create_notifications_for_job(session, new_job)

            await session.commit()

        except Exception as e:
            print(f"JSearch error for '{query}': {e}")


# ── LinkedIn Direct Scraper ───────────────────────────────────────────────────

async def fetch_linkedin_direct_jobs(session: AsyncSession):
    url = "https://www.linkedin.com/jobs/search?keywords=Python%20Backend&location=Germany&geoId=101282230&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"LinkedIn Direct Scraper error: {response.status_code}")
            return
            
        soup = BeautifulSoup(response.text, "html.parser")
        job_cards = soup.find_all("div", class_="base-card")
        
        print(f"LinkedIn Direct: Found {len(job_cards)} job cards")
        
        for card in job_cards:
            link_tag = card.find("a", class_="base-card__full-link")
            if not link_tag:
                continue
            url_link = link_tag.get("href", "").split("?")[0]
            
            title_tag = card.find("h3", class_="base-search-card__title")
            title = title_tag.text.strip() if title_tag else ""
            
            company_tag = card.find("h4", class_="base-search-card__subtitle")
            company = company_tag.text.strip() if company_tag else ""
            
            location_tag = card.find("span", class_="job-search-card__location")
            location = location_tag.text.strip() if location_tag else "Germany"
            
            # Simple keyword matching on the title
            lower_title = title.lower()
            if not any(k in lower_title for k in BACKEND_ROLE_KEYWORDS) and not any(k in lower_title for k in PYTHON_KEYWORDS):
                continue
                
            if any(k in lower_title for k in EXCLUDE_KEYWORDS):
                continue
                
            if not is_english_job(title):
                continue

            stmt = select(Job).where(Job.url == url_link)
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                new_job = Job(
                    title=title,
                    company=company,
                    location=location,
                    job_type="Full-time",
                    remote="remote" in location.lower(),
                    url=url_link,
                    source="LinkedIn",
                    posted_date=datetime.utcnow()
                )
                session.add(new_job)
                await session.flush()
                await create_notifications_for_job(session, new_job)
                
        await session.commit()
    except Exception as e:
        print(f"LinkedIn Direct Scraper error: {e}")

# ── Remotive API ─────────────────────────────────────────────────────────────

async def fetch_remotive_jobs(session: AsyncSession):
    url = "https://remotive.com/api/remote-jobs?search=python"
    try:
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            print(f"Remotive API error: {response.status_code}")
            return
            
        jobs = response.json().get("jobs", [])
        print(f"Remotive: Found {len(jobs)} jobs")
        
        for job in jobs:
            title = job.get("title", "")
            company = job.get("company_name", "")
            url_link = job.get("url", "")
            location = job.get("candidate_required_location", "Remote")
            description = str(job.get("description", "")).lower()
            job_type = str(job.get("job_type", "Full-time")).capitalize().replace("_", "-")
            if not job_type:
                job_type = "Full-time"
            
            if not title or not url_link:
                continue

            lower_title = title.lower()
            combined = lower_title + " " + description

            if not is_english_job(title):
                continue
                
            # Require Python keyword (since it's a Python board)
            if not any(k in combined for k in PYTHON_KEYWORDS):
                continue
                
            # If not explicitly a backend role, at least ensure it's not a frontend/unrelated role
            # (Handled by EXCLUDE_KEYWORDS below)
                
            if any(k in lower_title for k in EXCLUDE_KEYWORDS):
                continue

            stmt = select(Job).where(Job.url == url_link)
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                new_job = Job(
                    title=title,
                    company=company,
                    location=location,
                    job_type=job_type,
                    remote=True,
                    url=url_link,
                    source="Remotive",
                    posted_date=datetime.utcnow()
                )
                session.add(new_job)
                await session.flush()
                await create_notifications_for_job(session, new_job)
                
        await session.commit()
    except Exception as e:
        print(f"Remotive error: {e}")

# ── RemoteOK API ─────────────────────────────────────────────────────────────

async def fetch_remoteok_jobs(session: AsyncSession):
    url = "https://remoteok.com/api?tag=python"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"RemoteOK API error: {response.status_code}")
            return
            
        data = response.json()
        jobs = [j for j in data if isinstance(j, dict) and "id" in j and "slug" in j]
        print(f"RemoteOK: Found {len(jobs)} jobs")
        
        for job in jobs:
            title = job.get("position", "")
            company = job.get("company", "")
            url_link = job.get("url", "")
            location = job.get("location", "Remote")
            description = str(job.get("description", "")).lower()
            job_type = "Full-time"
            
            if not title or not url_link:
                continue

            lower_title = title.lower()
            combined = lower_title + " " + description

            if not is_english_job(title):
                continue
                
            # Require Python keyword (since it's a Python board)
            if not any(k in combined for k in PYTHON_KEYWORDS):
                continue
                
            # If not explicitly a backend role, at least ensure it's not a frontend/unrelated role
            # (Handled by EXCLUDE_KEYWORDS below)
                
            if any(k in lower_title for k in EXCLUDE_KEYWORDS):
                continue

            stmt = select(Job).where(Job.url == url_link)
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                new_job = Job(
                    title=title,
                    company=company,
                    location=location,
                    job_type=job_type,
                    remote=True,
                    url=url_link,
                    source="RemoteOK",
                    posted_date=datetime.utcnow()
                )
                session.add(new_job)
                await session.flush()
                await create_notifications_for_job(session, new_job)
                
        await session.commit()
    except Exception as e:
        print(f"RemoteOK error: {e}")

# ── Entry point ────────────────────────────────────────────────────────────────

async def run_scrapers():
    async with AsyncSessionLocal() as session:
        print("Fetching from Arbeitnow...")
        await fetch_jobs(session)
        # print("Fetching from RapidAPI Active Jobs DB...")
        # await fetch_rapidapi_jobs(session)
        print("Fetching from LinkedIn Direct...")
        await fetch_linkedin_direct_jobs(session)
        # print("Fetching from JSearch (LinkedIn/Indeed/Glassdoor)...")
        # await fetch_jsearch_jobs(session)
        print("Fetching from Remotive...")
        await fetch_remotive_jobs(session)
        print("Fetching from RemoteOK...")
        await fetch_remoteok_jobs(session)
        print("All scrapers done.")

if __name__ == "__main__":
    asyncio.run(run_scrapers())
