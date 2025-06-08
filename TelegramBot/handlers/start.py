from aiogram import Dispatcher, types
from aiogram.filters import Command
from keyboards.sectors import get_sectors_keyboard
from keyboards.main import get_main_keyboard
from database.crud import create_user, get_user, update_user
from database.crud import get_sectors, get_user_sectors
from config import STICKER_HELLO, HELLO_TEXT
from aiogram.fsm.context import FSMContext


async def cmd_start(message: types.Message, state: FSMContext):
    state.clear()
    user_id = message.from_user.id
    username = message.from_user.username
    sectors = await get_sectors()
    user_sectors = await get_user_sectors(user_id=user_id)
    
    # Создаем пользователя в БД
    user = await get_user(user_id)
    await message.reply_sticker(sticker=STICKER_HELLO)
    if not user:
        await create_user(user_id, username)
        await message.answer(
            HELLO_TEXT,
            reply_markup=get_sectors_keyboard(sectors=sectors, selected_sectors=user_sectors)
        )
    else:
        await update_user(user_id, username)
        # Отправляем сообщение с основной клавиатурой
    await message.answer(
        "Заканчивай там копаться, и погнали!",
        reply_markup=get_main_keyboard()
    )

def register_start_handlers(dp: Dispatcher):
    dp.message.register(cmd_start, Command(commands=["start"])) 