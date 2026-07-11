import asyncio
from database import AsyncSessionLocal
from models import Job
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        stmt = select(Job).where(Job.source == 'LinkedIn')
        result = await session.execute(stmt)
        jobs = result.scalars().all()
        print('LinkedIn jobs count:', len(jobs))

asyncio.run(main())
