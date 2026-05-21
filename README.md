# ЛР 5. Взаимодействие с внешним API через XMLHttpRequest

**Цель данной лабораторной работы** — изучение принципов взаимодействия с внешним API через `XMLHttpRequest`. В ходе работы существующий фронтенд системы банкомата (V ATM) переведён на получение данных с сервера через XHR-запросы, реализована динамическая отрисовка карточек валют на основе ответов API и обеспечена корректная обработка CORS.

## Содержание
* [1. Что такое XMLHttpRequest](#1-что-такое-xmlhttprequest)
* [2. Архитектура модулей для работы с API](#2-архитектура-модулей-для-работы-с-api)
* [3. Работа с URL-адресами эндпоинтов](#3-работа-с-url-адресами-эндпоинтов)
* [4. Класс Ajax для выполнения запросов](#4-класс-ajax-для-выполнения-запросов)
* [5. Интеграция API в страницы приложения](#5-интеграция-api-в-страницы-приложения)
* [6. Решение проблемы CORS](#6-решение-проблемы-cors)
* [Дополнительное задание](#дополнительное-задание)
* [Инструкция по запуску](#инструкция-по-запуску)

---

## 1. Что такое XMLHttpRequest

`XMLHttpRequest` (XHR) — это встроенный браузерный API, который позволяет выполнять HTTP-запросы к серверу **без перезагрузки страницы**. Несмотря на «XML» в названии, с его помощью можно работать с любыми форматами данных — JSON, текстом, бинарными файлами.

Основные возможности XHR:
- Выполнение GET, POST, PATCH, DELETE запросов
- Отслеживание состояния запроса через `readyState` и `onreadystatechange`
- Установка заголовков (`setRequestHeader`)
- Отправка данных в теле запроса (`send`)

---

## 2. Архитектура модулей для работы с API

Для удобной и масштабируемой работы с API в проект добавлен новый слой — директория `modules`.

### Структура проекта:
```
├── pages
├── components
├── modules
│   ├── ajax.js          # Класс для выполнения XHR-запросов
│   └── stockUrls.js     # Эндпоинты API
├── index.html
└── main.js
```

Разделение ответственности позволяет:
- Переиспользовать методы запросов в любом месте приложения
- Менять базовый URL сервера в одном файле
- Легко расширять набор доступных эндпоинтов

---

## 3. Работа с URL-адресами эндпоинтов

Все URL сгруппированы в классе `StockUrls` в файле `modules/stockUrls.js`. Базовый адрес сервера — `http://localhost:3000`.

```javascript
class StockUrls {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
    }

    getStocks() {
        return `${this.baseUrl}/stocks`;
    }

    getStockById(id) {
        return `${this.baseUrl}/stocks/${id}`;
    }

    createStock() {
        return `${this.baseUrl}/stocks`;
    }

    removeStockById(id) {
        return `${this.baseUrl}/stocks/${id}`;
    }

    updateStockById(id) {
        return `${this.baseUrl}/stocks/${id}`;
    }
}

export const stockUrls = new StockUrls();
```

**Использование:**
```javascript
import { stockUrls } from './modules/stockUrls.js';

stockUrls.getStocks();        // http://localhost:3000/stocks
stockUrls.getStockById(3);    // http://localhost:3000/stocks/3
```

---

## 4. Класс Ajax для выполнения запросов

Весь XHR-функционал инкапсулирован в классе `Ajax` в файле `modules/ajax.js`. Это позволяет не дублировать код создания и настройки `XMLHttpRequest` в каждом месте его вызова.

```javascript
class Ajax {
    get(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) this._handleResponse(xhr, callback);
        };
    }

    post(url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) this._handleResponse(xhr, callback);
        };
    }

    patch(url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('PATCH', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) this._handleResponse(xhr, callback);
        };
    }

    delete(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', url);
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) this._handleResponse(xhr, callback);
        };
    }

    _handleResponse(xhr, callback) {
        try {
            const data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            callback(data, xhr.status);
        } catch (e) {
            console.error('Ошибка парсинга JSON:', e);
            callback(null, xhr.status);
        }
    }
}

export const ajax = new Ajax();
```

**Примеры использования:**
```javascript
import { ajax } from './modules/ajax.js';

// GET
ajax.get('http://localhost:3000/stocks', (data, status) => {
    console.log(status, data);
});

// POST
ajax.post('http://localhost:3000/stocks', { name: 'USD', reserve: 1000 }, (data, status) => {
    console.log(status, data);
});

// PATCH
ajax.patch('http://localhost:3000/stocks/1', { reserve: 500 }, (data, status) => {
    console.log(status, data);
});

// DELETE
ajax.delete('http://localhost:3000/stocks/1', (data, status) => {
    console.log(status, data);
});
```

---

## 5. Интеграция API в страницы приложения

### 5.1. Главная страница — список карточек валют

Получение списка карточек переведено с локального объекта на запрос к API. После получения ответа данные передаются в функцию отрисовки.

```javascript
import { ajax } from '../../modules/ajax.js';
import { stockUrls } from '../../modules/stockUrls.js';

getData() {
    ajax.get(stockUrls.getStocks(), (data) => {
        this.renderData(data);
    });
}

renderData(items) {
    items.forEach((item) => {
        const productCard = new ProductCardComponent(this.pageRoot);
        productCard.render(item, this.clickCard.bind(this));
    });
}

render() {
    this.parent.innerHTML = '';
    const html = this.getHTML();
    this.parent.insertAdjacentHTML('beforeend', html);
    this.getData();
}
```

### 5.2. Страница карточки валюты

При переходе на страницу конкретной карточки её данные запрашиваются по ID через API.

```javascript
getData() {
    ajax.get(stockUrls.getStockById(this.id), (data) => {
        this.renderData(data);
    });
}

renderData(item) {
    const product = new ProductCardComponent(this.pageRoot);
    product.render(item);
}

render() {
    this.parent.innerHTML = '';
    const html = this.getHTML();
    this.parent.insertAdjacentHTML('beforeend', html);

    const backButton = new BackButtonComponent(this.pageRoot);
    backButton.render(this.clickBack.bind(this));

    this.getData();
}
```

Выполнение запросов можно отслеживать в DevTools → вкладка **Network**.

---

## 6. Решение проблемы CORS

При обращении фронтенда (например, `http://127.0.0.1:5501`) к серверу на другом порту (`http://localhost:3000`) браузер блокирует запрос из-за политики **CORS** (Cross-Origin Resource Sharing).

```
Access to XMLHttpRequest at 'http://localhost:3000/stocks' from origin
'http://127.0.0.1:5501' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Варианты решения:

**Рекомендуемый (продакшн-подход)** — настройка CORS на сервере через пакет `cors`:
```javascript
const cors = require('cors');
app.use(cors()); // разрешает запросы с любого источника
```

**Для разработки** — расширение браузера **CORS Unblock**. После установки включите следующие пункты в настройках и нажмите **Start (Restart)**:
- `Overwrite 4xx status codes with 200`
- `Access-Control-Request-Headers`

> **Важно:** Расширение CORS Unblock нельзя использовать в продакшне — оно обходит встроенную защиту браузера. В готовом проекте CORS настроен на стороне сервера через `app.use(cors())`.

---

## Дополнительное задание

Для обеспечения стабильной и безошибочной работы всего проекта выполнены следующие улучшения:

**Обработка ошибок сети** — если сервер недоступен, пользователь видит понятное сообщение вместо пустой страницы:
```javascript
ajax.get(stockUrls.getStocks(), (data, status) => {
    if (!data || status !== 200) {
        this.pageRoot.innerHTML = '<p class="error">Не удалось загрузить данные. Проверьте, что сервер запущен.</p>';
        return;
    }
    this.renderData(data);
});
```

**Исправление опечаток в `StockUrls`** — методы `removeStockById` и `updateStockById` принимали `id` из внешней области видимости вместо аргумента. Исправлено передачей `id` как параметра:
```javascript
removeStockById(id) {
    return `${this.baseUrl}/stocks/${id}`;
}

updateStockById(id) {
    return `${this.baseUrl}/stocks/${id}`;
}
```

**CORS на сервере** — вместо расширения браузера CORS обрабатывается правильно на стороне сервера (`app.use(cors())`), что позволяет приложению работать без дополнительных расширений.

---

## Инструкция по запуску

1. Перейти в директорию `backend`:
   ```bash
   cd backend
   ```
2. Установить зависимости:
   ```bash
   npm install
   ```
3. Запустить сервер:
   ```bash
   npm run start
   ```
4. Убедиться, что сервер запущен: в терминале появится сообщение о запуске на `http://localhost:3000`.
5. Открыть `index.html` через **Live Server** в VS Code.
6. Карточки валют загрузятся автоматически с сервера через XHR-запросы.
