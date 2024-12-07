from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
import pickle
import pandas as pd
# Инициализация Flask
from flask_cors import CORS
# Инициализация Flask и CORS
app = Flask(__name__)
CORS(app)  # Это позволяет принимать запросы с любых источников


# Загрузка сохраненной модели и scaler
import joblib

# Загружаем объект scaler
scaler = joblib.load('basic/scaler.pkl')
df_build_data_NN = pd.read_parquet("combined data/combined_atlas.parquet")
# Проверьте тип объекта
print(type(scaler))
# Загрузка модели нейронной сети (предполагается, что она сохранена в формате .h5)
model = tf.keras.models.load_model('basic/model.keras')


# Функция для нормализации входных данных
# Функция для нормализации входных данных
def normalize_input(data):
    # Преобразуем данные в правильный формат
    # Ваши данные (например, широта, долгота, ландшафт и т.д.)
    input_data = np.array(
        [[(data['lat']- min(df_build_data_NN['lat'])) / (max(df_build_data_NN['lat']) - min(df_build_data_NN['lat'])),
          (data['lon']- min(df_build_data_NN['lon'])) / (max(df_build_data_NN['lon']) - min(df_build_data_NN['lon'])),
          np.minimum(data['landcover'] / 10, 1) - min(df_build_data_NN['landcover']),
          data['month_sin'], data['day_sin']]])



    # Проверка, что scaler это StandardScaler

    normalized_data = input_data.reshape((1, 1, 5))
    return normalized_data



# Функция для обратной нормализации

def denormalize_output(predictions):
    # Преобразуем значения обратно в исходные масштабы
    print(predictions.shape)
    predictions = predictions.reshape(1,4)
    print(predictions.shape)
    print(predictions)
    denormalized_data = {
        'duration': predictions[0][0] * 31,
        'expansion': predictions[0][1],
        'speed': predictions[0][2],
        'direction': predictions[0][3] * 8
    }

    print(denormalized_data)
    return denormalized_data


# API для обработки данных с клиента
@app.route('/process_fire_data', methods=['POST'])
def process_fire_data():
    data = request.json

    # Нормализуем данные
    normalized_data = normalize_input(data)

    # Получаем предсказания от нейронной сети
    predictions = model.predict(normalized_data)

    # Обратная нормализация
    result = denormalize_output(predictions)
    result = {key: float(value) for key, value in result.items()}

    # Отправляем результат обратно клиенту
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
