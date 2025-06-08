from aiogram import Dispatcher, types, F
from aiogram.filters import Command
from aiogram.exceptions import TelegramBadRequest
from database.crud import get_sectors, get_sector, get_user_sectors
from keyboards.reports import get_sectors_report_keyboard
from keyboards.main import get_main_keyboard
from keyboards.sectors import get_sectors_keyboard
from aiogram.fsm.context import FSMContext
from services.report_service import report_service

async def get_sector_report(sector_id: int) -> str:
    """Получает отчет по сектору"""
    report = await report_service.get_sector_report(sector_id)
    if report:
        return report
    return "К сожалению, не удалось получить отчет. Пожалуйста, попробуйте позже."

async def get_daily_report() -> str:
    """Получает ежедневный отчет"""
    report = await report_service.get_daily_summary()
    if report:
        return (
            f"{report['content']}\n\n"
            f"Период: {report['timeRangeStart']} - {report['timeRangeEnd']}"
        )
    return "К сожалению, не удалось получить ежедневный отчет. Пожалуйста, попробуйте позже."

async def cmd_reports(message: types.Message):
    """Показать клавиатуру отчетов"""
    await message.answer(
        "Выберите действие:",
        reply_markup=get_main_keyboard()
    )

async def process_report_button(message: types.Message, state: FSMContext):
    """Обработка нажатия на кнопку 'Сформировать отчет'"""
    state.clear()
    await state.set_data({"mode": "report"})
    sectors = await get_sectors()
    user_id = message.from_user.id
    selected_sectors = await get_user_sectors(user_id)
    await message.answer(
        "Выберите сектор экономики для формирования отчета:",
        reply_markup=get_sectors_keyboard(sectors, page=1, selected_sectors=selected_sectors, prefix="report_")
    )

async def process_daily_report_button(message: types.Message):
    """Обработка нажатия на кнопку 'Ежедневный отчет'"""
    # Показываем индикатор загрузки
    await message.answer("⏳ Формируем ежедневный отчет...")
    
    # Получаем отчет
    report = await get_daily_report()
    
    # Отправляем отчет
    await message.answer(
        f"📊 Ежедневный отчет\n\n{report}"
    )

async def process_sector_report(callback: types.CallbackQuery):
    """Обработка выбора сектора для отчета"""
    if not callback.data.startswith("report_"):
        return

    if callback.data == "report_ignore":
        await callback.answer()
        return

    if callback.data.startswith(("report_prev-page:", "report_next-page:")):
        page = int(callback.data.split(":")[1])
        sectors = await get_sectors()
        try:
            await callback.message.edit_reply_markup(
                reply_markup=get_sectors_report_keyboard(sectors, page=page)
            )
        except TelegramBadRequest as e:
            if "message is not modified" not in str(e):
                raise
        await callback.answer()
        return

    if callback.data.startswith("report_sector:"):
        sector_id = int(callback.data.split(":")[1])
        sector = await get_sector(sector_id)
        
        if not sector:
            await callback.answer("Сектор не найден")
            return

        # Показываем индикатор загрузки
        await callback.message.edit_text("⏳ Формируем отчет...")
        
        # Получаем отчет
        report = await get_sector_report(sector_id)
        
        # Отправляем отчет
        await callback.message.edit_text(
            f"📊 Отчет по сектору: {sector.name}\n\n{report}"
        )
        await callback.answer()

def register_reports_handlers(dp: Dispatcher):
    dp.message.register(cmd_reports, Command(commands=["reports"]))
    dp.message.register(process_report_button, F.text == "📊 Сформировать отчет")
    dp.message.register(process_daily_report_button, F.text == "📈 Ежедневный отчет")
    dp.callback_query.register(process_sector_report) 