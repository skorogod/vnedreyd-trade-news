from typing import List
from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from config import settings

Base = declarative_base()

# Таблица связи пользователей и секторов
user_sector = Table(
    'user_sector',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('sector_id', Integer, ForeignKey('sectors.id'))
)

class Sector(Base):
    __tablename__ = "sectors"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    description = Column(String, nullable=True)
    
    # Связи
    users = relationship("User", secondary=user_sector, back_populates="sectors")
    news = relationship("NewsItem", back_populates="sector")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, unique=True)
    username = Column(String)
    notifications = Column(Boolean, default=True)
    
    # Связи
    sectors = relationship("Sector", secondary=user_sector, back_populates="users")

class NewsItem(Base):
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True)
    title = Column(String)
    content = Column(String)
    timestamp = Column(String)
    sector_id = Column(Integer, ForeignKey('sectors.id'))
    
    # Связи
    sector = relationship("Sector", back_populates="news")

async def init_db():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    return engine

async def get_session():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    return async_session() 