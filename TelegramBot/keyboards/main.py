from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Создает основную клавиатуру для отчетов"""
    keyboard = [
        [KeyboardButton(text="📊 Сформировать отчет"), KeyboardButton(text="📝 Секторы экономики")],
        [KeyboardButton(text="🔔 Управление уведомлениями"), KeyboardButton(text="📈 Ежедневный отчет")]
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)
