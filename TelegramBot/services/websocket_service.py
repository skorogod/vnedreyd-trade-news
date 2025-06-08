import json
import logging
import asyncio
import socketio
from aiogram import Bot
from config import settings
from database.crud import get_users_by_sectors, get_user
from helpers import get_sticker

class WebSocketClient:
    def __init__(self, bot: Bot):
        self.bot = bot
        self.sio = socketio.AsyncClient()
        self.connected = False

        print("socket url", settings.WEBSOCKET_URL)
        
        # Регистрируем обработчики событий
        @self.sio.event
        async def connect():
            self.connected = True
            logging.info("Socket.IO connected successfully")
            
        @self.sio.event
        async def disconnect():
            self.connected = False
            logging.info("Socket.IO disconnected")
            
        @self.sio.on('article')
        async def on_article(data):
            await self.process_new_article(data)

    async def connect(self):
        while True:
            try:
                await self.sio.connect(settings.WEBSOCKET_URL)
                await self.sio.wait()
            except Exception as e:
                logging.error(f"Socket.IO connection error: {e}")
                self.connected = False
                await asyncio.sleep(5)  # Ждем 5 секунд перед повторным подключением


    async def process_new_article(self, data: dict):
        try:
            print("Received article data:", data)
            
            sectors = data.get("sectors")
            score = data.get("score")

            if not len(sectors):
                logging.warning("No sector found in news data")
                return

            # Получаем всех пользователей, интересующихся данным сектором
            users = await get_users_by_sectors(sectors)

            for user in users:
                # Проверяем статус уведомлений пользователя
                if not user.notifications:
                    continue

                try:
                    message = (
                        f"📰Важная новость!!!"
                        f"{data.get('content', '')}\n\n"
                        f"<a href='{data.get('link', '')}'>Читать подробнее</a>"
                    )
                    
                    if score:
                        sticker = get_sticker(score)
                    else:
                        sticker = None

                    if sticker:
                        await self.bot.send_sticker(user.user_id, sticker=sticker) 

                    await self.bot.send_message(
                        user.user_id,
                        message,
                        parse_mode='HTML'
                    )
                except Exception as e:
                    logging.error(f"Error sending message to user {user.user_id}: {e}")
        except Exception as e:
            logging.error(f"Error processing message: {e}")

    async def start(self):
        await self.connect() 