from aiogram import Dispatcher, types, F
from aiogram.filters import Command
from aiogram.exceptions import TelegramBadRequest
from database.crud import update_user_sectors, get_user, get_sectors, get_user_sectors, delete_user_sector
from keyboards.sectors import get_sectors_keyboard, get_selected_sectors_keyboard, get_search_keyboard
from keyboards.filters import KeyboardFilters
from aiogram.fsm.context import FSMContext



async def economic_sectors_button(message: types.Message, state: FSMContext):
    """Обработка нажатия на кнопку economic sectors'"""
    await state.clear()
    await state.set_data({"mode": "select"})
    sectors = await get_sectors()
    user_id = message.from_user.id
    selected_sectors = await get_user_sectors(user_id)
    await message.answer(
        "Пожалуйста, выберите интересующие вас секторы экономики:",
        reply_markup=get_sectors_keyboard(sectors, page=1, selected_sectors=selected_sectors, prefix="select_")
    )


async def cmd_sectors(message: types.Message):
    """Показать клавиатуру выбора секторов"""
    user = await get_user(message.from_user.id)
    if not user:
        await message.answer("Пожалуйста, сначала используйте команду /start")
        return

    sectors = await get_sectors()
    user_sectors = await get_user_sectors(message.from_user.id)

    await message.answer(
        "Выбери интересующие тебя секторы экономики.\n"
        "Ты можешь выбрать несколько секторов.\n",
        reply_markup=get_sectors_keyboard(sectors, user_sectors, page=1, prefix="select_")
    )

async def process_sector_selection(callback: types.CallbackQuery, state: FSMContext):
    """Обработка выбора сектора"""
    user_id = callback.from_user.id
    user = await get_user(user_id)
    user_sectors = await get_user_sectors(user_id)

    sectorId = int(callback.data.split(":")[1])
    
    if not user:
        await callback.answer("Ошибка: пользователь не найден")
        return

    # Проверяем, выбран ли уже этот сектор
    is_selected = sectorId in user_sectors
    
    if is_selected:
        # Если сектор уже выбран, удаляем его
        sector = await delete_user_sector(user_id, sectorId)
        if sector:
            await callback.answer(f"Сектор {sector.name} удален из ваших интересов")
        else:
            await callback.answer("Сектор не найден")
    else:
        # Если сектор не выбран, добавляем его
        sector = await update_user_sectors(user_id, sectorId)
        if sector:
            await callback.answer(f"Сектор {sector.name} добавлен в ваши интересы")
        else:
            await callback.answer("Сектор не найден")

    # Обновляем клавиатуру, сохраняя текущую страницу
    current_page = 1
    if callback.message.reply_markup:
        for row in callback.message.reply_markup.inline_keyboard:
            for button in row:
                if button.callback_data.startswith("prev-page:"):
                    current_page = int(button.callback_data.split(":")[1]) + 1
                    break
                elif button.callback_data.startswith("next-page:"):
                    current_page = int(button.callback_data.split(":")[1]) - 1
                    break
            if current_page != 1:
                break

    try:
        sectors = await get_sectors()
        selected_sectors = await get_user_sectors(user_id=user_id)
        
        # Получаем текущие фильтры из состояния
        state_data = await state.get_data()
        filters = KeyboardFilters(**state_data["filters"]) if state_data.get("filters") else KeyboardFilters()
        
        await callback.message.edit_reply_markup(
            reply_markup=get_sectors_keyboard(sectors, selected_sectors, page=current_page, filters=filters, prefix="select_")
        )
    except TelegramBadRequest as e:
        if "message is not modified" not in str(e):
            raise


async def show_selected_sectors(message: types.Message):
    """Показать выбранные секторы"""
    user = await get_user(message.from_user.id)
    if not user:
        await message.answer("Пожалуйста, сначала используйте команду /start")
        return

    if not user.sectors:
        await message.answer(
            "Вы еще не выбрали ни одного сектора.\n"
            "Используйте команду /sectors для выбора секторов."
        )
        return

    sectors_text = "\n".join([f"• {sector.name}" for sector in user.sectors])
    await message.answer(
        "Ваши выбранные секторы:\n\n" + sectors_text + "\n\n"
        "Используйте команду /sectors для изменения выбора.",
        reply_markup=get_selected_sectors_keyboard(user.sectors)
    )

def register_sectors_handlers(dp: Dispatcher):
    dp.message.register(cmd_sectors, Command(commands=["sectors"]))
    dp.message.register(show_selected_sectors, Command(commands=["my_sectors"]))
    dp.callback_query.register(process_sector_selection, lambda c: c.data.startswith("select_"))
    dp.message.register(economic_sectors_button, F.text == "📝 Секторы экономики")