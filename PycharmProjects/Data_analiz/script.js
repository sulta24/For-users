// Инициализация карты
var map = L.map('map').setView([43.242202, 76.956997], 13);

// Основной слой карты
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Массив для хранения всех кругов
var fireCircles = [];
var fireTimers = [];
var Run = false; // Флаг состояния пожара

// Создание окна для отображения координат и параметров
var infoBox = document.createElement('div');
infoBox.id = 'info-box';
infoBox.innerHTML = `
  <h3>Параметры</h3>
  <p>Кликните на карту, чтобы выбрать координаты.</p>
  <label>Дата начала: <input type="date" id="start-date" value="${new Date().toISOString().split('T')[0]}"></label><br>
  <label>Дата начала: <input type="date" id="start-date" value="${new Date().toISOString().split('T')[0]}"></label><br>
      <label>Вид местности:
        <select id="land-type">
          <option value="0">Городские территории</option>
      <option value="1">Вечнозелёные широколиственные леса</option>
      <option value="2">Листопадные хвойные леса</option>
      <option value="3">Листопадные хвойные леса</option>
      <option value="4">Листопадные широколиственные леса</option>
      <option value="5">Смешанные леса</option>
      <option value="6">Саванны</option>
      <option value="7">Болотные территории</option>
      <option value="8">Кустарниковые территории</option>
      <option value="9">Пустыни</option>
      <option value="10">Сельскохозяйственные земли</option>
      <option value="11">Вечнозелёные хвойные леса</option>
        </select>
      </label><br>
      <label>Направление ветра (°): <input type="number" id="wind-direction" value="3" min="0" max="360"></label><br>
      <label>Скорость ветра (км/ч): <input type="number" id="wind-speed" value="50" min="0"></label><br>
      <label>Влажность (%): <input type="number" id="humidity" value="20" min="0" max="100"></label>
`;
document.body.appendChild(infoBox);

// Стили для окна
var styleInfoBox = document.createElement('style');
styleInfoBox.innerHTML = `
  #info-box {
    position: absolute;
    top: 100px;
    right: 20px;
    width: 320px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    z-index: 1000;
  }
  #info-box h3 {
    margin: 0 0 10px 0;
    font-size: 20px;
    border-bottom: 1px solid #444;
    padding-bottom: 5px;
  }
  #info-box p {
    margin: 10px 0;
  }
  #info-box label {
    display: block;
    margin: 5px 0;
  }
  #info-box input, #info-box select {
    width: calc(100% - 10px);
    padding: 5px;
    margin-top: 5px;
  }
`;
document.head.appendChild(styleInfoBox);

// Функция для создания нового очага пожара
function createFire(lat, lng, color, fillColor, radius = 10) {
    var bounds = map.getBounds();
    if (!bounds.contains([lat, lng])) return;

    var fireCircle = L.circle([lat, lng], {
        color: color,
        fillColor: fillColor,
        fillOpacity: 0.7,
        radius: radius * Math.random() * 3
    }).addTo(map);

    fireCircles.push(fireCircle);
}

// Функция для удаления всех кругов
function clearOldFireCircles() {
    fireCircles.forEach(function (circle) {
        map.removeLayer(circle);
    });
    fireCircles = [];
}

// Функция для остановки пожара
function stopFireSpread() {
    fireTimers.forEach(function (timer) {
        clearTimeout(timer);
    });
    fireTimers = [];
    Run = false;
}

// Распространение пожара
function spreadFire(centerLat, centerLng, maxRadius, delay, steps, centerOffset) {
    var step = 0;

    function addFire() {
        if (step >= steps) return;

        var angle = Math.random() * Math.PI * 2;
        var radius = Math.random() * maxRadius;

        if (step % 2 === 0 && step !== 0) {
            centerLat -= centerOffset.lng;
            centerLng += centerOffset.lng;
        }

        var newLat = centerLat + (radius * (step / 10 + 1.6) / 111000) * Math.cos(angle);
        var newLng = centerLng + (radius / (111000 * Math.cos(centerLat * (Math.PI / 180)))) * Math.sin(angle);

        var color = (step % 10 === 0) ? 'orange' : 'red';
        var fillColor = color;

        createFire(newLat, newLng, color, fillColor);

        step++;
        var timerId = setTimeout(addFire, delay);
        fireTimers.push(timerId);
    }

    addFire();
}

// Кнопка "Запустить пожар"
var startButton = document.createElement('button');
startButton.innerHTML = 'Запустить пожар';
startButton.style.position = 'absolute';
startButton.style.bottom = '10%';
startButton.style.left = '45%';
startButton.style.transform = 'translateX(-50%)';
startButton.style.padding = '12px 18px';
startButton.style.background = 'linear-gradient(135deg, #32cd32, #228b22)';
startButton.style.border = 'none';
startButton.style.borderRadius = '20px';
startButton.style.cursor = 'pointer';
startButton.style.fontSize = '18px';
startButton.style.fontWeight = 'bold';
startButton.style.color = '#ffffff';
startButton.style.zIndex = '2';
startButton.disabled = true;
document.body.appendChild(startButton);

startButton.onclick = function () {
    if (!Run) {
        Run = true;
        infoBox.innerHTML += `<p>Пожар запущен.</p>`;
    }
};

// Кнопка "Очистить пожар"
var clearButton = document.createElement('button');
clearButton.innerHTML = 'Очистить пожар';
clearButton.style.position = 'absolute';
clearButton.style.bottom = '10%';
clearButton.style.left = '56%';
clearButton.style.transform = 'translateX(-50%)';
clearButton.style.padding = '12px 18px';
clearButton.style.background = 'linear-gradient(135deg, #ff6d00, #ff4500)';
clearButton.style.border = 'none';
clearButton.style.borderRadius = '20px';
clearButton.style.cursor = 'pointer';
clearButton.style.fontSize = '18px';
clearButton.style.fontWeight = 'bold';
clearButton.style.color = '#ffffff';
clearButton.style.zIndex = '2';
clearButton.onclick = function () {
    clearOldFireCircles();
    stopFireSpread();
    infoBox.innerHTML = `<h3>Параметры</h3><p>Пожар очищен.</p>`;
    startButton.disabled = true;
};
document.body.appendChild(clearButton);

// Обработчик клика на карте
map.on('click', function (e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    clearOldFireCircles();

    infoBox.innerHTML = `
      <h3>Параметры</h3>
      <p><b>Широта:</b> ${lat.toFixed(6)}</p>
      <p><b>Долгота:</b> ${lng.toFixed(6)}</p>
      <label>Дата начала: <input type="date" id="start-date" value="${new Date().toISOString().split('T')[0]}"></label><br>
      <label>Вид местности:
        <select id="land-type">
          <option value="0">Городские территории</option>
      <option value="1">Вечнозелёные широколиственные леса</option>
      <option value="2">Листопадные хвойные леса</option>
      <option value="3">Листопадные хвойные леса</option>
      <option value="4">Листопадные широколиственные леса</option>
      <option value="5">Смешанные леса</option>
      <option value="6">Саванны</option>
      <option value="7">Болотные территории</option>
      <option value="8">Кустарниковые территории</option>
      <option value="9">Пустыни</option>
      <option value="10">Сельскохозяйственные земли</option>
      <option value="11">Вечнозелёные хвойные леса</option>
        </select>
      </label><br>
      <label>Направление ветра (°): <input type="number" id="wind-direction" value="3" min="0" max="360"></label><br>
      <label>Скорость ветра (км/ч): <input type="number" id="wind-speed" value="50" min="0"></label><br>
      <label>Влажность (%): <input type="number" id="humidity" value="20" min="0" max="100"></label>
    `;
    startButton.disabled = false;

    startButton.onclick = function () {
        if (!Run) {
            Run = true;
            var centerOffset = { lat: 0.0001, lng: 0.0002 };
            spreadFire(lat, lng, 50, 100, 120, centerOffset);
            infoBox.innerHTML += `<p>Пожар запущен.</p>`;
        }
    };
});





function openMenu() {
    document.getElementById("donermenu").style.width = "250px";
    document.getElementById("menuButton").classList.add("hidden");
}

function closeMenu() {
    document.getElementById("donermenu").style.width = "0";
    document.getElementById("menuButton").classList.remove("hidden");

    const popups = document.querySelectorAll('.popup');
    popups.forEach(popup => {
        popup.remove();
    });
}

function showPopup(element, text) {
    const existingPopup = document.querySelector('.popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.textContent = text;


    const rect = element.getBoundingClientRect();


    popup.style.position = 'absolute';
    popup.style.top = `${rect.top + rect.height / 2 + window.scrollY}px`; // Центр по Y
    popup.style.left = `${rect.right + 10}px`; // Справа от ссылки


    popup.style.transform = 'translateY(-50%)';


    document.body.appendChild(popup);

    popup.addEventListener('click', () => {
        popup.remove();
    });
}



