import numpy as np
import tensorflow as tf

# Загрузка сохранённой модели
model = tf.keras.models.load_model('with_meteo/model_wm.keras')

# Входные данные (вектор)
input_data = np.array([[0.567108, 0.000000, 0.00007, 0, 0.9884683,0.000087, 0, 7.894800e-09]])

# Преобразование данных в ожидаемую форму (batch_size, sequence_length, num_features)
input_data = input_data.reshape((1, 1, 8))  # batch_size=1, sequence_length=1, num_features=8

# Убедимся, что размерность данных правильная
print("Shape of input data:", input_data.shape)

# Предсказание
predictions = model.predict(input_data)

# Вывод предсказаний
print("Predictions:", predictions)

