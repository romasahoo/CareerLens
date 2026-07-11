from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    remote: bool = False
    url: str
    source: str
    posted_date: Optional[datetime] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
