from flask import Flask, request, render_template
import tensorflow as tf
import numpy as np
import beta_AI

app = Flask(__name__)

# Загрузка модели Keras
model = tf.keras.models.load_model('model.h5')


# Функция для обработки входных данных и передачи их в модель
def predict(inputs):
    inputs_array = np.array(inputs).reshape(1, -1)  # Преобразуем в массив для модели
    prediction = model.predict(inputs_array)
    return prediction


# Главная страница с формой
@app.route('/')
def home():
    return render_template('index.html')


# Обработка формы
@app.route('/predict', methods=['POST'])
def predict_route():
    # Получаем данные из формы
    lat = float(request.form['latitude'])
    lon = float(request.form['longitude'])
    landcover = float(request.form['soil'])
    start_day = float(request.form['start_day'])
    start_month = float(request.form['start_month'])

    # Преобразование дня и месяца в синусоиды для учета времени года (если это требуется для модели)
    day_sin = np.sin(2 * np.pi * start_day / 31)  # Преобразование дня
    month_sin = np.sin(2 * np.pi * start_month / 12)  # Преобразование месяца
    lat = (lat + 60) / 130
    lon = (lon + 180) / 360
    landcover = landcover / 10
    # Подготовка входных данных в виде вектора
    inputs = [lat, lon, landcover, month_sin, day_sin]

    # Прогноз от модели
    result = predict(inputs)

    # Возвращаем результат
    return render_template('result.html', result=result[0])


if __name__ == '__main__':
    app.run(debug=True)
