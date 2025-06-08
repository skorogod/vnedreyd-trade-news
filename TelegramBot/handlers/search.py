from aiogram.fsm.context import FSMContext
from keyboards.filters import KeyboardFilters
from aiogram import Dispatcher, types, F
from database.crud import update_user_sectors, get_user, get_sectors, get_user_sectors, delete_user_sector
from keyboards.sectors import get_sectors_keyboard
from config import SectorSearch

async def process_search_query(message: types.Message, state: FSMContext):
    print(message.text)
    """Обработка поискового запроса"""
    search_query = message.text
    sectors = await get_sectors()
    user_sectors = await get_user_sectors(message.from_user.id)

    state_data = await state.get_data()
    
    # Создаем и сохраняем фильтры
    mode = state_data.get("mode", "select")
    filters = KeyboardFilters(sector=search_query)
    print("filters")
    state_data["filters"] = filters.__dict__
    await state.update_data(state_data)
    print(await state.get_data())
    
    await message.answer(
        f"Результаты поиска по запросу '{search_query}':",
        reply_markup=get_sectors_keyboard(sectors, user_sectors, page=1, prefix=f"{mode}_", filters=filters)
    )


def register_search_handlers(dp: Dispatcher):
    dp.message.register(process_search_query, SectorSearch.waiting_for_query)