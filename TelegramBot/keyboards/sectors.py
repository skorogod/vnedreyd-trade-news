from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message
from database.models import Sector
from typing import List, Tuple
from database.crud import get_sectors, get_user_sectors
from .filters import KeyboardFilters
from aiogram.fsm.context import FSMContext

ITEMS_PER_PAGE = 5


def get_sectors_for_page(sectors: List[Sector], page: int) -> Tuple[List[Sector], int]:
    """Получает секторы для указанной страницы и общее количество страниц"""
    start_idx = (page - 1) * ITEMS_PER_PAGE
    end_idx = start_idx + ITEMS_PER_PAGE
    total_pages = (len(sectors) + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE
    return sectors[start_idx:end_idx], total_pages

def get_sectors_keyboard(sectors: List[Sector], selected_sectors: List[int] = None, page: int = 1, filters: KeyboardFilters = None, prefix=None) -> InlineKeyboardMarkup:
    """Создает клавиатуру выбора секторов с пагинацией и поиском"""
    keyboard = []
    
    if filters is None:
        filters = KeyboardFilters()
    
    # Фильтруем секторы по поисковому запросу
    if filters.sector:
        sectors = [s for s in sectors if filters.sector.lower() in s.name.lower()]
    
        if len(sectors) == 0:
            keyboard.append([
            InlineKeyboardButton(
                text=f"Ничего не найдено",
                callback_data="ignore"
            ),
            InlineKeyboardButton(
                text="🔍 Поиск секторов",
                callback_data=f"search_sectors"
            ),
            InlineKeyboardButton(
                text="❌ Сбросить фильтры",
                callback_data=f"clear_filters"
            )
        ])
    # Сортируем секторы: сначала выбранные, потом остальные
    if selected_sectors:
        sectors = sorted(sectors, key=lambda x: x.id not in selected_sectors)
    
    # Получаем секторы для текущей страницы
    current_sectors, total_pages = get_sectors_for_page(sectors, page)
    
    # Добавляем кнопку поиска
    keyboard.append([
        InlineKeyboardButton(
            text="🔍 Поиск секторов",
            callback_data=f"search_sectors"
        )
    ])

    # Если есть активные фильтры, добавляем кнопку сброса
    if filters.has_filters():
        keyboard.append([
            InlineKeyboardButton(
                text="❌ Сбросить фильтры",
                callback_data=f"clear_filters"
            )
        ])

    # Добавляем секторы на текущей странице
    for sector in current_sectors:
        selectedPrefix = "✅ " if sector.id in selected_sectors else ""
        keyboard.append([
            InlineKeyboardButton(
                text=f"{selectedPrefix}{sector.name}",
                callback_data=f"{prefix if prefix else ""}sector:{sector.id}"
            )
        ])
    
    # Добавляем навигационные кнопки
    nav_buttons = []
    
    # Кнопка "Предыдущая страница"
    if page > 1:
        nav_buttons.append(
            InlineKeyboardButton(
                text="◀️",
                callback_data=f"prev-page:{page-1}"
            )
        )
    
    # Информация о текущей странице
    nav_buttons.append(
        InlineKeyboardButton(
            text=f"📄 {page}/{total_pages}",
            callback_data="ignore"
        )
    )
    
    # Кнопка "Следующая страница"
    if page < total_pages:
        nav_buttons.append(
            InlineKeyboardButton(
                text="▶️",
                callback_data=f"next-page:{page+1}"
            )
        )
    
    if nav_buttons:
        keyboard.append(nav_buttons)
    
    # Добавляем кнопку для просмотра выбранных секторов
    #keyboard.append([
    #    InlineKeyboardButton(
    #        text="📋 Мои секторы",
    #        callback_data="show_selected"
    #    )
    #])
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_search_keyboard() -> InlineKeyboardMarkup:
    """Создает клавиатуру для поиска секторов"""
    keyboard = [
        [InlineKeyboardButton(
            text="❌ Отменить поиск",
            callback_data="cancel_search"
        )]
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_selected_sectors_keyboard(selected_sectors: List[Sector]) -> InlineKeyboardMarkup:
    """Создает клавиатуру для просмотра выбранных секторов"""
    keyboard = []
    
    for sector in selected_sectors:
        keyboard.append([
            InlineKeyboardButton(
                text=f"❌ {sector.name}",
                callback_data=f"sector:{sector.name}"
            )
        ])
    
    # Добавляем кнопку для возврата к выбору секторов
    keyboard.append([
        InlineKeyboardButton(
            text="◀️ Назад к выбору секторов",
            callback_data="back_to_sectors"
        )
    ])
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard) 