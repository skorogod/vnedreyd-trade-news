from aiogram import Dispatcher
from .start import register_start_handlers
from .sectors import register_sectors_handlers
from .reports import register_reports_handlers
from .main import register_main_handlers
from .search import register_search_handlers

def register_all_handlers(dp: Dispatcher):
    register_reports_handlers(dp) 
    register_sectors_handlers(dp)
    register_search_handlers(dp)
    register_main_handlers(dp)
    register_start_handlers(dp)
    
    