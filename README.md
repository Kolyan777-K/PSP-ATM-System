# ЛР 6. Promise, Fetch и сборка клиентской части через Vite

**Цель данной лабораторной работы** состоит из двух частей: замена `XMLHttpRequest` на современный `fetch` API с использованием промисов и `async/await`, а также сборка клиентской части системы банкомата (V ATM) через Vite и настройка раздачи фронтенда в качестве статики с сервера — для окончательного решения проблемы CORS без сторонних расширений.

## Содержание
* [Часть 1. Promise и Fetch](#часть-1-promise-и-fetch)
  * [1. Что такое Promise](#1-что-такое-promise)
  * [2. Использование Promise](#2-использование-promise)
  * [3. Async/Await](#3-asyncawait)
  * [4. Fetch — замена XMLHttpRequest](#4-fetch--замена-xmlhttprequest)
  * [5. Рефакторинг Ajax-модуля под fetch](#5-рефакторинг-ajax-модуля-под-fetch)
* [Часть 2. Сборка и раздача статики](#часть-2-сборка-и-раздача-статики)
  * [6. Сборка клиентской части через Vite](#6-сборка-клиентской-части-через-vite)
  * [7. Раздача фронтенда в качестве статики](#7-раздача-фронтенда-в-качестве-статики)
* [Дополнительное задание](#дополнительное-задание)
* [Инструкция по запуску](#инструкция-по-запуску)

---

## Часть 1. Promise и Fetch

### 1. Что такое Promise

`Promise` (промис) — специальный объект JavaScript для работы с асинхронными операциями. Он «обещает» уведомить о результате выполнения операции, когда та завершится.

Промис находится в одном из трёх состояний:

| Состояние | Описание |
|-----------|----------|
| `pending` | Начальное состояние — операция выполняется |
| `fulfilled` | Операция завершена успешно |
| `rejected` | Операция завершена с ошибкой |

```javascript
const promise = new Promise((resolve, reject) => {
    // resolve() — переводит промис в fulfilled
    // reject()  — переводит промис в rejected

    if (всёОкей) {
        resolve(результат);
    } else {
        reject(ошибка);
    }
});
```

Для обработки результата промиса используются методы:

- **`.then(onFulfilled, onRejected)`** — вызывается при успехе (первый аргумент) или ошибке (второй)
- **`.catch(onRejected)`** — удобное сокращение для обработки ошибок
- **`.finally(callback)`** — выполняется всегда, независимо от результата

```javascript
promise
    .then((result) => console.log('Успех:', result))
    .catch((error) => console.log('Ошибка:', error))
    .finally(() => console.log('Завершено'));
```

---

### 2. Использование Promise

Пример промиса с задержкой — имитация асинхронной операции:

```javascript
const promise = new Promise((resolve, reject) => {
    const randNumber = Math.random() * 100;

    setTimeout(() => {
        if (randNumber > 20) {
            resolve('Успех');
        } else {
            reject('Ошибка');
        }
    }, 10000); // 10 секунд в состоянии pending
});

promise
    .then((result) => console.log(result))
    .catch((error) => console.log(error))
    .finally(() => console.log('Операция завершена'));
```

---

### 3. Async/Await

`async/await` — синтаксический сахар над промисами, делающий асинхронный код похожим на синхронный. Вместо цепочки `.then().catch()` используется конструкция `try/catch`.

**До (с `.then/.catch`):**
```javascript
const getData = () => {
    return fetch('http://localhost:3000/stocks')
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err));
};
```

**После (с `async/await`):**
```javascript
const getData = async () => {
    try {
        const res = await fetch('http://localhost:3000/stocks');
        const data = await res.json();
        console.log(data);
    } catch (err) {
        console.log(err);
    }
};
```

Ключевое слово `await` останавливает выполнение функции до получения результата промиса. Следующая строка кода не выполнится, пока промис не перейдёт из `pending` в `fulfilled` или `rejected`.

---

### 4. Fetch — замена XMLHttpRequest

`fetch` — встроенная браузерная функция для HTTP-запросов, возвращающая промис. Это современная и более удобная альтернатива `XMLHttpRequest`.

**Сравнение подходов:**

```javascript
// Старый способ (XHR + callback)
const xhr = new XMLHttpRequest();
xhr.onload = () => { /* обработка */ };
xhr.onerror = () => { /* ошибка */ };
xhr.open('GET', url);
xhr.send();

// Новый способ (fetch + async/await)
const getData = async () => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (e) {
        console.error(e);
    }
};
```

**Особенность `fetch`:** функция не выбрасывает ошибку при HTTP-статусах 4xx/5xx — нужно проверять `response.ok` вручную:

```javascript
const response = await fetch(url);
if (!response.ok) {
    throw new Error(`Ошибка: ${response.status}`);
}
const data = await response.json();
```

---

### 5. Рефакторинг Ajax-модуля под fetch

Класс `Ajax` из прошлой лабораторной работы переписан с `XMLHttpRequest` на `fetch`. Все методы теперь возвращают промис и используют `async/await`.

```javascript
// modules/ajax.js
class Ajax {
    async get(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error('GET ошибка:', e);
            throw e;
        }
    }

    async post(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error('POST ошибка:', e);
            throw e;
        }
    }

    async patch(url, data) {
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error('PATCH ошибка:', e);
            throw e;
        }
    }

    async delete(url) {
        try {
            const response = await fetch(url, { method: 'DELETE' });
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            return response.status === 204 ? null : await response.json();
        } catch (e) {
            console.error('DELETE ошибка:', e);
            throw e;
        }
    }
}

export const ajax = new Ajax();
```

**Использование в страницах** стало чище за счёт `async/await` вместо колбэков:

```javascript
// Было (XHR + callback)
getData() {
    ajax.get(stockUrls.getStocks(), (data) => {
        this.renderData(data);
    });
}

// Стало (fetch + async/await)
async getData() {
    const data = await ajax.get(stockUrls.getStocks());
    this.renderData(data);
}
```

---

## Часть 2. Сборка и раздача статики

### 6. Сборка клиентской части через Vite

**Vite** — современная система сборки для фронтенд-приложений. Она обеспечивает быстрый dev-сервер и оптимизированный production-бандл.

#### Установка и настройка:

```bash
# Переходим в директорию фронтенда
cd frontend

# Устанавливаем Vite как dev-зависимость
npm install -D vite
```

Добавляем команды в `package.json`:
```json
{
    "scripts": {
        "dev":     "vite",
        "build":   "vite build",
        "preview": "vite preview"
    }
}
```

Создаём `vite.config.js` в корне фронтенда:
```javascript
// vite.config.js
export default {
    build: {
        outDir: './public',
        emptyOutDir: true,
    },
};
```

#### Команды:

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер на `http://localhost:5173` с горячей перезагрузкой |
| `npm run build` | Сборка production-бандла в папку `public/` |
| `npm run preview` | Предпросмотр собранного бандла локально |

После выполнения `npm run build` в директории `frontend/public/` появятся минифицированные и оптимизированные файлы, готовые к деплою.

---

### 7. Раздача фронтенда в качестве статики

Чтобы сервер на `localhost:3000` сам отдавал клиентскую часть, папка `public/` копируется в директорию бэкенда, а сервер настраивается на раздачу статических файлов.

#### Структура бэкенда после копирования:
```
backend/
├── public/          ← собранный фронтенд
│   ├── index.html
│   ├── assets/
│   └── ...
├── src/
├── package.json
└── server.js
```

#### Настройка Express для раздачи статики:

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

// Раздача статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Сервер V ATM запущен на порту 3000');
});
```

После перезапуска сервера фронтенд доступен по адресу `http://localhost:3000/`. Запросы к API выполняются с того же домена и порта, поэтому CORS-ограничений не возникает — расширение браузера больше не нужно.

---

## Дополнительное задание

Все вызовы `XMLHttpRequest` в проекте заменены на `fetch`. Дополнительно внесены улучшения для обеспечения стабильной работы:

**Проверка `response.ok`** — `fetch` не выбрасывает ошибку при статусах 4xx/5xx, поэтому добавлена явная проверка во всех методах `Ajax`:
```javascript
if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status}`);
}
```

**Обработка ошибок в страницах** — если запрос не удался (сервер не запущен или вернул ошибку), пользователь видит информативное сообщение:
```javascript
async getData() {
    try {
        const data = await ajax.get(stockUrls.getStocks());
        this.renderData(data);
    } catch (e) {
        this.pageRoot.innerHTML = '<p class="error">Не удалось загрузить данные. Убедитесь, что сервер запущен на порту 3000.</p>';
    }
}
```

**Скрипт автокопирования сборки** — чтобы не копировать `public/` вручную после каждого билда, в `package.json` фронтенда добавлена команда `deploy`, которая собирает проект и копирует результат в директорию бэкенда:
```json
{
    "scripts": {
        "dev":     "vite",
        "build":   "vite build",
        "preview": "vite preview",
        "deploy":  "vite build && cp -r ./public ../backend/public"
    }
}
```

---

## Инструкция по запуску

### Dev-режим (фронтенд и бэкенд отдельно):

1. Запустить бэкенд:
   ```bash
   cd backend
   npm install
   npm run start
   ```
2. Запустить фронтенд:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Открыть `http://localhost:5173/` в браузере.

### Production-режим (всё через бэкенд):

1. Собрать фронтенд и скопировать в бэкенд:
   ```bash
   cd frontend
   npm install
   npm run build
   cp -r ./public ../backend/public
   ```
2. Запустить бэкенд:
   ```bash
   cd backend
   npm install
   npm run start
   ```
3. Открыть `http://localhost:3000/` в браузере — фронтенд и API работают с одного порта, CORS отсутствует.
