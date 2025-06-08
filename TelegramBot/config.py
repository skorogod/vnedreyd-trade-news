from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from aiogram.fsm.state import State, StatesGroup

load_dotenv()

class Settings(BaseSettings):
    BOT_TOKEN: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str = "trade-me"
    WEBSOCKET_URL: str
    API_URL: str = "http://localhost:3000"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        env_file = ".env"

settings = Settings() 

class SectorSearch(StatesGroup):
    waiting_for_query = State()


STICKER_HELLO="CAACAgIAAxkBAAEOqYloRRg8ivSdfFEZlU-PwQiIgAdjRQACVhgAAtk-GUhnGFQ1T6HUWjYE"
STICKER_SHUT_UP="CAACAgIAAxkBAAEOqYtoRRhQISNJNvEX9qmS16TGV_-ZugACaB4AAhmFGUm3vsWL__4d4TYE"
STICKER_MAY_BE="CAACAgIAAxkBAAEOqY1oRRhrnhsiDQ9xUPJpknB6JQfMzgACWSYAAr4BGEn-xS8Wp03b9jYE"
STICKER_KAKAYA_RAZNICA="CAACAgIAAxkBAAEOqY9oRRiRPCHTW1PMt_hoBnaTfZoUqgACrR4AAi_nIUnBBewnIFZs9jYE"
STICKER_COOL="CAACAgIAAxkBAAEOqZFoRRi10DL5rGeXJuH9FCeVfVgPGQAC-0EAAq0wIEtkOxgIUCsYPTYE"
STICKER_SUPER="CAACAgIAAxkBAAEOqZNoRRjt6CFNTjj4fxmRVxBra0eiswACCEQAApVesEv1Dd-Q5W4BjzYE"
STICKER_BAD_THEME="CAACAgIAAxkBAAEOqZVoRRj6IaQEm6SHAgVA3wABD5JsMR0AArg5AAINq7FLL3szzkInFAg2BA"
STICKER_OK="CAACAgIAAxkBAAEOqZdoRRkLSoLf2NE0xDgHOmbhB2bQWAACaz8AApxEIEtOMpPMWPXyhTYE"
STICKER_BAY="CAACAgIAAxkBAAEOqbdoRSdH4YQTISngR8298anmDT2jnwACBGgAAlMG0EnOB1tjRUw6WDYE"
STICKER_THUMB="CAACAgIAAxkBAAEOqbloRSehb73jDRZys41LhFjjaJ5YPAACGB0AAuIEIEk6ao1vFBpiejYE"
STICKER_KAK_ZHIT="CAACAgIAAxkBAAEOqdNoRTOmZ2eX91hyLZn6KX7L72TNkgACfyEAArl_GEl53PCjj6O9PjYE"
STICKER_SOMNITELNO="CAACAgIAAxkBAAEOqdVoRTP2NLuCaOsoP_lEM7ubxVXYIgAClCEAAu1BGEl4dY1WFr6IHjYE"
STICKER_NE_HOCHU_ZHIT="CAACAgIAAxkBAAEOqddoRTQgt0nz8kwny0V2ivXdmYysOwAC4R8AArR0IEkD6kLdFEf3ujYE"
STICKER_ZAPLAKAL="CAACAgIAAxkBAAEOqdloRTRMduKUG2c5TLVXZ2_mg0BwOAACEiUAArUIGUmZSEDMwwp0QzYE"

HELLO_TEXT="""
Ты тут, значит, бабки рубить? Хорошо! Но запомни: рынок ошибок не прощает, он тебя без масла сожрёт, если будешь тупить. Ты либо быстрый, либо банкрот – третьего не дано.

Если ты не из слабаков – вперёд, зарабатывай! Но если слился – не ной, рынку плевать на твои слёзы.

Ниже я привел список секторов экономики, новости по которым должны помочь тебе принять правильное решение. Можешь выбрать несколько из них, и я обязательно поделюсь с тобой инсайдами на эту тему!

Жми на газ, делай деньги! 💰🔥"""


VERY_BAD_NEWS_STICKERS = [
    STICKER_ZAPLAKAL,
    STICKER_NE_HOCHU_ZHIT,
    STICKER_KAK_ZHIT,
]

MEDIUM_NEWS = [
    STICKER_SOMNITELNO
]


BAD_NEWS_STICKERS = [
    STICKER_BAD_THEME,
]

GOOD_NEWS_STICKERS= [
    STICKER_OK,
]

SUPER_NEWS_STICKER = [
    STICKER_SUPER,
    STICKER_COOL,
]
