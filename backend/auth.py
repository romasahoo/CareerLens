import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import User

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    token = credentials.credentials
    if "|" not in token:
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    provider, access_token = token.split("|", 1)
    
    user_info = None
    async with httpx.AsyncClient() as client:
        if provider == "github":
            resp = await client.get("https://api.github.com/user", headers={
                "Authorization": f"Bearer {access_token}"
            })
            if resp.status_code == 200:
                data = resp.json()
                user_info = {
                    "email": data.get("email") or f"{data.get('login')}@github.com",
                    "name": data.get("name") or data.get("login"),
                    "avatar": data.get("avatar_url")
                }
        elif provider == "google":
            resp = await client.get("https://www.googleapis.com/oauth2/v3/userinfo", headers={
                "Authorization": f"Bearer {access_token}"
            })
            if resp.status_code == 200:
                data = resp.json()
                user_info = {
                    "email": data.get("email"),
                    "name": data.get("name"),
                    "avatar": data.get("picture")
                }
    
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    email = user_info["email"]
    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from provider")
    
    # Sync user to DB
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        user = User(
            email=email,
            name=user_info["name"],
            avatar=user_info["avatar"]
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    return user
