from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from database.models import Sector
from typing import List, Tuple
from database.crud import get_sectors

ITEMS_PER_PAGE = 5


def get_sectors_for_page(sectors: List[Sector], page: int) -> Tuple[List[Sector], int]:
    """Получает секторы для указанной страницы и общее количество страниц"""
    start_idx = (page - 1) * ITEMS_PER_PAGE
    end_idx = start_idx + ITEMS_PER_PAGE
    total_pages = (len(sectors) + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE
    return sectors[start_idx:end_idx], total_pages

def get_sectors_report_keyboard(sectors: List[Sector], page: int = 1) -> InlineKeyboardMarkup:
    """Создает клавиатуру выбора сектора для отчета"""
    keyboard = []
    
    # Получаем секторы для текущей страницы
    current_sectors, total_pages = get_sectors_for_page(sectors, page)
    
    # Добавляем секторы на текущей странице
    for sector in current_sectors:
        keyboard.append([
            InlineKeyboardButton(
                text=sector.name,
                callback_data=f"report_sector:{sector.id}"
            )
        ])
    
    # Добавляем навигационные кнопки
    nav_buttons = []
    
    # Кнопка "Предыдущая страница"
    if page > 1:
        nav_buttons.append(
            InlineKeyboardButton(
                text="◀️",
                callback_data=f"report_prev-page:{page-1}"
            )
        )
    
    # Информация о текущей странице
    nav_buttons.append(
        InlineKeyboardButton(
            text=f"📄 {page}/{total_pages}",
            callback_data="report_ignore"
        )
    )
    
    # Кнопка "Следующая страница"
    if page < total_pages:
        nav_buttons.append(
            InlineKeyboardButton(
                text="▶️",
                callback_data=f"report_next-page:{page+1}"
            )
        )
    
    if nav_buttons:
        keyboard.append(nav_buttons)
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard) 