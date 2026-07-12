import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from models import Job, Base
from dotenv import load_dotenv

async def main():
    load_dotenv()
    
    # 1. Connect to local SQLite
    sqlite_url = "sqlite+aiosqlite:///./careerlens.db"
    sqlite_engine = create_async_engine(sqlite_url, echo=False)
    SqliteSession = async_sessionmaker(sqlite_engine, expire_on_commit=False)

    # 2. Connect to remote Postgres
    pg_url = os.environ.get("REMOTE_DATABASE_URL")
    if not pg_url:
        print("Please set REMOTE_DATABASE_URL in .env (or export it) pointing to your new Postgres database.")
        print("Example: postgres://user:password@ep-cool-db-1234.eu-central-1.aws.neon.tech/neondb")
        return
        
    if pg_url.startswith("postgres://"):
        pg_url = pg_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif pg_url.startswith("postgresql://"):
        pg_url = pg_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # asyncpg expects 'ssl=require' instead of 'sslmode=require'
    pg_url = pg_url.replace("sslmode=require", "ssl=require")
    # asyncpg doesn't support 'channel_binding'
    pg_url = pg_url.replace("&channel_binding=require", "")
    pg_url = pg_url.replace("?channel_binding=require&", "?")
    pg_url = pg_url.replace("?channel_binding=require", "")

    pg_engine = create_async_engine(pg_url, echo=False)
    PgSession = async_sessionmaker(pg_engine, expire_on_commit=False)

    # 3. Create tables in Postgres if they don't exist
    print("Ensuring tables exist in PostgreSQL...")
    async with pg_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 4. Read from SQLite
    print("Reading jobs from SQLite...")
    async with SqliteSession() as session:
        result = await session.execute(select(Job))
        sqlite_jobs = result.scalars().all()
        print(f"Found {len(sqlite_jobs)} jobs in local database.")

    if not sqlite_jobs:
        print("No jobs to migrate.")
        return

    # 5. Insert into Postgres
    print("Migrating to Postgres...")
    inserted_count = 0
    async with PgSession() as session:
        for job in sqlite_jobs:
            stmt = select(Job).where(Job.url == job.url)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                new_job = Job(
                    title=job.title,
                    company=job.company,
                    location=job.location,
                    job_type=job.job_type,
                    remote=job.remote,
                    url=job.url,
                    source=job.source,
                    posted_date=job.posted_date
                )
                session.add(new_job)
                inserted_count += 1
        
        await session.commit()
    
    print(f"Migration complete! Inserted {inserted_count} new jobs into Postgres.")

if __name__ == "__main__":
    asyncio.run(main())
