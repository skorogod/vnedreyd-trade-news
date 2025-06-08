import aiohttp
import logging
from typing import Optional, Dict, Any
from config import settings

class ReportService:
    def __init__(self):
        self.base_url = settings.API_URL
        
    async def get_sector_report(self, sector_id: int) -> Optional[str]:
        """
        Получает отчет по сектору с указанным ID
        
        Args:
            sector_id: ID сектора
            
        Returns:
            str: Текст отчета или None в случае ошибки
        """
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/report/summary?sectorId={sector_id}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("summary")
                    else:
                        logging.error(f"Ошибка при получении отчета: {response.status}")
                        return None
        except Exception as e:
            logging.error(f"Ошибка при запросе отчета: {e}")
            return None

    async def get_daily_summary(self) -> Optional[Dict[str, Any]]:
        """
        Получает ежедневный обобщенный отчет
        
        Returns:
            Dict[str, Any]: Словарь с данными отчета или None в случае ошибки
            Формат ответа:
            {
                "content": str,
                "reportType": str,
                "sectorId": Optional[int],
                "timeRangeStart": str,
                "timeRangeEnd": str,
                "articlesHash": str
            }
        """
        print(self.base_url)
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/report/daily-summary"
                async with session.get(url) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logging.error(f"Ошибка при получении ежедневного отчета: {response.status}")
                        return None
        except Exception as e:
            logging.error(f"Ошибка при запросе ежедневного отчета: {e}")
            return None

# Создаем экземпляр сервиса
report_service = ReportService() 