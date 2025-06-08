import asyncio
import logging
from datetime import datetime, time
from aiogram import Bot
from database.crud import get_user, get_all_users
from services.report_service import report_service

class DailyReportService:
    def __init__(self, bot: Bot):
        self.bot = bot
        self.is_running = False

    async def start(self):
        """Запускает сервис ежедневной рассылки"""
        self.is_running = True
        while self.is_running:
            now = datetime.now().time()
            target_time = time(8, 30)  # 8:30 утра
            
            # Если текущее время больше целевого, ждем до следующего дня
            if now > target_time:
                # Ждем до следующего дня
                seconds_until_next = (24 * 3600) - (
                    (now.hour * 3600 + now.minute * 60 + now.second) -
                    (target_time.hour * 3600 + target_time.minute * 60)
                )
                await asyncio.sleep(seconds_until_next)
            else:
                # Ждем до целевого времени
                seconds_until_target = (
                    (target_time.hour * 3600 + target_time.minute * 60) -
                    (now.hour * 3600 + now.minute * 60 + now.second)
                )
                await asyncio.sleep(seconds_until_target)

            # Получаем и рассылаем отчет
            await self.send_daily_reports()

    async def stop(self):
        """Останавливает сервис ежедневной рассылки"""
        self.is_running = False

    async def send_daily_reports(self):
        """Получает и рассылает ежедневный отчет всем пользователям"""
        try:
            # Получаем отчет
            report = await report_service.get_daily_summary()
            if not report:
                logging.error("Не удалось получить ежедневный отчет")
                return

            # Формируем сообщение
            message = (
                "📊 Ежедневный отчет\n\n"
                f"{report['content']}\n\n"
                f"Период: {report['timeRangeStart']} - {report['timeRangeEnd']}"
            )

            # Получаем всех пользователей и отправляем им отчет
            # TODO: Добавить функцию get_all_users в database/crud.py
            users = await get_all_users()
            for user in users:
                try:
                    await self.bot.send_message(
                        user.user_id,
                        message,
                        parse_mode='HTML'
                    )
                except Exception as e:
                    logging.error(f"Ошибка при отправке отчета пользователю {user.user_id}: {e}")

        except Exception as e:
            logging.error(f"Ошибка при рассылке ежедневного отчета: {e}")

# Создаем экземпляр сервиса
daily_report_service = None

def init_daily_report_service(bot: Bot):
    """Инициализирует сервис ежедневной рассылки"""
    global daily_report_service
    daily_report_service = DailyReportService(bot)
    return daily_report_service 