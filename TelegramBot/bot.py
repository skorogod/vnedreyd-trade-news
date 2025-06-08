import asyncio
import logging
from aiogram import Bot, Dispatcher
from config import settings
from handlers import register_all_handlers
from database.models import init_db
from services.websocket_service import WebSocketClient
from services.daily_report_service import init_daily_report_service


async def main():
    logging.basicConfig(level=logging.INFO)

   
    # Инициализация бота и диспетчера
    bot = Bot(token=settings.BOT_TOKEN)

    dp = Dispatcher()
    
    # Регистрация хендлеров
    register_all_handlers(dp)
    
    # Инициализация базы данных
    await init_db()
    
    # Инициализация сервисов
    ws = WebSocketClient(bot)
    daily_report = init_daily_report_service(bot)
    
    # Запуск сервисов
    tasks = [
        asyncio.create_task(ws.start()),
        asyncio.create_task(daily_report.start())
    ]
    
    try:
        await dp.start_polling(bot)
        await asyncio.gather(*tasks)
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main()) 