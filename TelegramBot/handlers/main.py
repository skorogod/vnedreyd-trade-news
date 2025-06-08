from aiogram import types, Dispatcher
from aiogram.fsm.context import FSMContext
from keyboards.filters import KeyboardFilters
from keyboards.sectors import get_search_keyboard, get_sectors_keyboard
from config import SectorSearch, STICKER_SHUT_UP, STICKER_HELLO
from database.crud import get_sectors, get_user_sectors, get_user, update_user_notifications
from aiogram.exceptions import TelegramBadRequest
from handlers.sectors import cmd_sectors
from aiogram import F


async def process_notifications_button(message: types.Message):
    """Обработка нажатия на кнопку управления уведомлениями"""
    user = await get_user(message.from_user.id)
    if not user:
        await message.answer("Пожалуйста, сначала используйте команду /start")
        return

    status = "включены" if user.notifications else "отключены"
    await message.answer(
        f"Уведомления сейчас {status}.\n"
        "Нажмите на кнопку ниже, чтобы изменить статус:",
        reply_markup=types.InlineKeyboardMarkup(inline_keyboard=[
            [types.InlineKeyboardButton(
                text="🔕 Отключить уведомления" if user.notifications else "🔔 Включить уведомления",
                callback_data="toggle_notifications"
            )]
        ])
    )

async def process_notifications_toggle(callback: types.CallbackQuery):
    print(1)
    """Обработка переключения статуса уведомлений"""
    user = await get_user(callback.from_user.id)
    if not user:
        await callback.answer("Ошибка: пользователь не найден")
        return

    new_status = not user.notifications
    await update_user_notifications(callback.from_user.id, new_status)
    
    status = "включены" if new_status else "отключены"
    await callback.message.reply_sticker(sticker=f"{STICKER_SHUT_UP if not new_status else STICKER_HELLO}")
    await callback.message.edit_text(
        f"Уведомления теперь {status}.\n"
        "Нажмите на кнопку ниже, чтобы изменить статус:",
        reply_markup=types.InlineKeyboardMarkup(inline_keyboard=[
            [types.InlineKeyboardButton(
                text="🔕 Отключить уведомления" if new_status else "🔔 Включить уведомления",
                callback_data="toggle_notifications"
            )]
        ])
    )
    await callback.answer()

async def process_common_callbacks(callback: types.Message, state: FSMContext):
    print("toggle notificateions")
    if callback.data == "toggle_notifications":
        await process_notifications_toggle(callback)
        return

    state_data = await state.get_data()
    mode = state_data.get("mode", "select")
    sectors = await get_sectors()
    user_sectors = await get_user_sectors(callback.from_user.id)

    if callback.data == "search_sectors":
        await callback.message.edit_text(
            "Введите название сектора для поиска:",
            reply_markup=get_search_keyboard()
        )
        await state.set_state(SectorSearch.waiting_for_query)
        await callback.answer()
        return

    if callback.data == "clear_filters":
        # Получаем текущие фильтры из состояния
        state_data = await state.get_data()
        filters = state_data.get("filters")
        if filters:
            filters = KeyboardFilters(**filters)
            filters.clear()
            await state.update_data(**filters.__dict__)
        
        
        await callback.message.edit_text(
            "Выберите интересующие вас секторы экономики.\n"
            "Вы можете выбрать несколько секторов.\n"
            "Для отмены выбора нажмите на сектор повторно.",
            reply_markup=get_sectors_keyboard(sectors, user_sectors, prefix=f"{mode}_", page=1)
        )
        await callback.answer()
        return

    if callback.data == "cancel_search":
        await state.set_state(None)
        sectors = await get_sectors()
        user_sectors = await get_user_sectors(callback.from_user.id)
        await callback.message.edit_text(
            "Выберите интересующие вас секторы экономики.\n"
            "Вы можете выбрать несколько секторов.\n"
            "Для отмены выбора нажмите на сектор повторно.",
            reply_markup=get_sectors_keyboard(sectors, user_sectors, prefix=f"{mode}_", page=1)
        )
        await callback.answer()
        return
    
    if callback.data == "back_to_sectors":
        await cmd_sectors(callback.message)
        await callback.answer()
        return

    if callback.data == "ignore":
        await callback.answer()
        return
    
    

    if callback.data.startswith(("prev-page:", "next-page:")):
        page = int(callback.data.split(":")[1])
        sectors = await get_sectors()
        
        # Получаем текущие фильтры из состояния
        state_data = await state.get_data()
        filters = KeyboardFilters(**state_data["filters"]) if state_data.get("filters") else KeyboardFilters()
        
        try:
            await callback.message.edit_reply_markup(
                reply_markup=get_sectors_keyboard(sectors, user_sectors, page=page, prefix=f"{mode}_", filters=filters)
            )
        except TelegramBadRequest as e:
            if "message is not modified" not in str(e):
                raise
        await callback.answer()
        return
    

def register_main_handlers(dp: Dispatcher):
    dp.message.register(process_notifications_button, F.text == "🔔 Управление уведомлениями")
    dp.callback_query.register(process_common_callbacks)