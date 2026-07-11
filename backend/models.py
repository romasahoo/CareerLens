from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    company = Column(String, index=True, nullable=False)
    location = Column(String, index=True)
    job_type = Column(String)  # Full-time, Remote, etc.
    remote = Column(Boolean, default=False)
    url = Column(String, unique=True, index=True, nullable=False)  # Unique to prevent duplicates
    source = Column(String, nullable=False)  # Remotive, Arbeitnow, etc.
    posted_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
