import pandas as pd
import numpy as np
from datetime import timedelta
from meteostat import Point, Daily

# Загрузка данных
df = pd.read_parquet("combined data/combined_atlas.parquet")[-20001::]

# Проверка типов данных и приведение к нужным
df['start_date'] = pd.to_datetime(df['start_date'], errors='coerce')
counter = 0
# Функция для получения метео-данных за период
def get_weather_data(lat, lon, start_date, duration):
    global counter
    # Преобразуем start_date в формат datetime
    start_date = pd.to_datetime(start_date)

    # Определяем конечную дату (start_date + duration)
    end_date = start_date + timedelta(days=duration)

    # Создаем точку для метеостанции
    point = Point(lat, lon)

    # Получаем данные за заданный период
    data = Daily(point, start_date, end_date)
    data = data.fetch()
    counter += 1
    # Если данные получены, считаем среднее для интересующих столбцов
    if not data.empty:

        avg_wspd = data['wspd'].mean()  # Скорость ветра
        avg_wdir = data['wdir'].mean()  # Направление ветра
        print(counter)
        return avg_wspd, avg_wdir
    else:
        print(counter)
        return np.nan, np.nan  # Если данных нет, возвращаем NaN

# Итерация по строкам в DataFrame и добавление метео-данных
weather_data = []
for _, row in df.iterrows():
    lat = row['lat']
    lon = row['lon']
    start_date = row['start_date']
    duration = row['duration']

    # Получаем метео-данные за период
    avg_wspd, avg_wdir = get_weather_data(lat, lon, start_date, duration)

    # Добавляем данные в список
    weather_data.append([avg_wspd, avg_wdir])

# Преобразуем список в DataFrame и добавляем к исходному DataFrame
weather_df = pd.DataFrame(weather_data, columns=['avg_wspd', 'avg_wdir'])
df = pd.concat([df, weather_df], axis=1)

# Проверка результата
print(df.head())
print(df.describe())
# Преобразование данных: нормализация (если нужно)
df['lat'] = (df['lat'] - min(df['lat'])) / (max(df['lat']) - min(df['lat']))
df['lon'] = (df['lon'] - min(df['lon'])) / (max(df['lon']) - min(df['lon']))
df['landcover'] = df['landcover'] / 12
df['duration'] = (df['duration'] - min(df['duration'])) / (max(df['duration']) - min(df['duration']))
df['expansion'] = df['expansion'] / 10
df['speed'] = df['speed'] / 10
df['direction'] = df['direction'] / 10
df['avg_wspd'] = (df['avg_wspd'] - min(df['avg_wspd'])) / (max(df['avg_wspd']) - min(df['avg_wspd']))
df['avg_wdir'] = (df['avg_wdir'] - min(df['avg_wdir'])) / (max(df['avg_wdir']) - min(df['avg_wdir']))
# Проверка результатов
print(df[['lat', 'lon', 'duration', 'expansion', 'speed', 'direction', 'landcover', 'avg_wspd', 'avg_wdir']].head())
print(df.isnull().sum())
# Сохранение данных в новый файл parquet
df.to_parquet("Atlas_with_weather.parquet")
