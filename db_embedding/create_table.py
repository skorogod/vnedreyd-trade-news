import pandas as pd
from sqlalchemy import create_engine

# Загрузка CSV
df = pd.read_csv('merged_and_scaled_concat.csv')

# Подключение к PostgreSQL
engine = create_engine('postgresql://postgres:postgres@10.10.144.2:5432/postgres')

# Загрузка в новую таблицу, например, 'my_table'
df.to_sql('news_scaled', engine, if_exists='replace', index=False)