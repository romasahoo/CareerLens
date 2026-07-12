from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
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

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    avatar = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    filters = relationship("UserFilter", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class UserFilter(Base):
    __tablename__ = "user_filters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(String, default="")
    locations = Column(JSON, default=list)
    types = Column(JSON, default=list)
    sources = Column(JSON, default=list)
    language = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="filters")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
    job = relationship("Job")
