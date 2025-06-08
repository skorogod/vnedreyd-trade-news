from typing import List
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from .models import User, Sector, NewsItem, get_session, user_sector

async def create_user(user_id: int, username: str) -> User:
    async with await get_session() as session:
        user = User(user_id=user_id, username=username)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

async def get_user(user_id: int) -> User:
    async with await get_session() as session:
        result = await session.execute(
            select(User)
            .options(selectinload(User.sectors))
            .where(User.user_id == user_id)
        )
        return result.scalar_one_or_none()

async def get_sector(sector_id: int) -> Sector:
    async with await get_session() as session:
        result = await session.execute(
            select(Sector).where(Sector.id == sector_id)
        )
        return result.scalar_one_or_none()

async def create_sector(name: str, description: str = None) -> Sector:
    async with await get_session() as session:
        sector = Sector(name=name, description=description)
        session.add(sector)
        await session.commit()
        await session.refresh(sector)
        return sector

async def update_user_sectors(user_id: int, sector_id: int):
    async with await get_session() as session:
        # Получаем пользователя с загруженными связями
        result = await session.execute(
            select(User)
            .options(selectinload(User.sectors))
            .where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None

        # Получаем сектор
        result = await session.execute(
            select(Sector).where(Sector.id == sector_id)
        )
        sector = result.scalar_one_or_none()
        
        if not sector:
            return None

        # Проверяем, есть ли уже такая связь
        if sector not in user.sectors:
            user.sectors.append(sector)
            await session.commit()
            await session.refresh(user)
            return sector
        return None

async def get_users_by_sectors(sector_ids: List[int]) -> List[User]:
    async with await get_session() as session:
        result = await session.execute(
            select(User)
            .join(User.sectors)
            .where(Sector.id.in_(sector_ids))
            .distinct()
        )
        return result.scalars().all()

async def create_news(title: str, content: str, sector_name: str, timestamp: str) -> NewsItem:
    async with await get_session() as session:
        sector = await get_sector(sector_name)
        if not sector:
            sector = await create_sector(sector_name)

        news = NewsItem(
            title=title,
            content=content,
            sector_id=sector.id,
            timestamp=timestamp
        )
        session.add(news)
        await session.commit()
        await session.refresh(news)
        return news

async def get_sectors() -> List[Sector]:
    async with await get_session() as session:
        result = await session.execute(
            select(Sector)
        )
        return result.scalars().all()

async def get_user_sectors(user_id: int) -> List[int]:
    """Получает список идентификаторов секторов, которыми интересуется пользователь"""
    print(user_id)
    async with await get_session() as session:
        result = await session.execute(
            select(Sector.id)
            .join(user_sector)
            .join(User)
            .where(User.user_id == user_id)
        )
        return result.scalars().all()
    
async def delete_user_sector(user_id: int, sector_id: int):
    async with await get_session() as session:
        # Получаем пользователя с загруженными связями
        result = await session.execute(
            select(User)
            .options(selectinload(User.sectors))
            .where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None

        # Получаем сектор
        result = await session.execute(
            select(Sector).where(Sector.id == sector_id)
        )
        sector = result.scalar_one_or_none()
        
        if not sector:
            return None

        if sector in user.sectors:
            user.sectors.remove(sector)
            await session.commit()
            await session.refresh(user)
            return sector
        return None
    
async def update_user(user_id: int, username: str):
    async with await get_session() as session:
        # Получаем пользователя в рамках текущей сессии
        result = await session.execute(
            select(User).where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
            
        user.username = username
        await session.commit()
        await session.refresh(user)
        return user

async def update_user_notifications(user_id: int, notifications: bool):
    async with await get_session() as session:
        # Получаем пользователя в рамках текущей сессии
        result = await session.execute(
            select(User).where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
            
        user.notifications = notifications
        await session.commit()
        await session.refresh(user)
        return user

async def get_all_users() -> List[User]:
    """Получает список всех пользователей"""
    async with await get_session() as session:
        result = await session.execute(
            select(User)
            .options(selectinload(User.sectors))
        )
        return result.scalars().all()