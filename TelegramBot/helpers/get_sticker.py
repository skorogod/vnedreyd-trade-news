from config import VERY_BAD_NEWS_STICKERS, BAD_NEWS_STICKERS, MEDIUM_NEWS, GOOD_NEWS_STICKERS, SUPER_NEWS_STICKER
import random

def get_sticker(score: float):
  if score <= -0.7:
    return VERY_BAD_NEWS_STICKERS[random.randint(0, len(VERY_BAD_NEWS_STICKERS) - 1)]
  elif score > -0.7 and score <= -0.1:
    return BAD_NEWS_STICKERS[random.randint(0, len(BAD_NEWS_STICKERS) - 1)]
  elif score > -0.1 and score <= 1:
    return MEDIUM_NEWS[random.randint(0, len(MEDIUM_NEWS) - 1)]
  elif score > 1 <= 0.7:
    return GOOD_NEWS_STICKERS[random.randint(0, len(GOOD_NEWS_STICKERS) - 1)]
  elif score > 0.7:
    return SUPER_NEWS_STICKER[random.randint(0, len(SUPER_NEWS_STICKER)  - 1)]
  else:
    return None
