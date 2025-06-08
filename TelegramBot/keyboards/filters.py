from dataclasses import dataclass
from typing import Optional

@dataclass
class KeyboardFilters:
    """Класс для хранения фильтров клавиатуры"""
    sector: Optional[str] = None
    
    def has_filters(self) -> bool:
        """Проверяет, есть ли активные фильтры"""
        return self.sector is not None
    
    def clear(self):
        """Очищает все фильтры"""
        self.sector = None 