# ЛР 2. Calculator: JavaScript

**Цель данной лабораторной работы** - знакомство с инструментами построения пользовательских интерфейсов web-сайтов: HTML, CSS, JavaScript. В ходе выполнения работы предстоит продолжить реализовывать калькулятор (банковский терминал V ATM) и выполнить индивидуальные дополнительные задания по варианту.

## Содержание
* [1. Программирование логики с помощью JavaScript](#1-программирование-логики-с-помощью-javascript)
* [2. Доступ к HTML-элементам из JavaScript](#2-доступ-к-html-элементам-из-javascript)
* [3. Программирование кнопок калькулятора](#3-программирование-кнопок-калькулятора)
* [4. Запуск калькулятора с помощью Live Server](#4-запуск-калькулятора-с-помощью-live-server)
* [5. Выполнение заданий по варианту (Дополнения V ATM)](#5-выполнение-заданий-по-варианту-дополнения-v-atm)

---

## 1. Программирование логики с помощью JavaScript

Язык программирования JavaScript служит основным инструментом для описания логики и интерактивности веб-страниц. В данной работе с помощью JS мы программируем кнопки калькулятора.

**Как подключить JavaScript к HTML?**
Есть два способа добавить JavaScript на веб-страницу:

1. **Встроенный скрипт** - когда код пишется прямо в HTML-файле внутри тега `<script>`:
```html
<script>
    console.log("Привет, мир!");
</script>
```

2. **Внешний файл** - когда код хранится в отдельном файле с расширением `.js`:
```html
<head>
    <link rel="stylesheet" href="style.css">
    <script type="text/javascript" src="script.js"></script>
</head>
```
Для нашего калькулятора мы используем второй способ, так как это более организованный и профессиональный подход.

---

## 2. Доступ к HTML-элементам из JavaScript

Чтобы управлять элементами на странице, нужно сначала получить к ним доступ.

Основные методы получения элементов:
* **По ID (`getElementById`)** - самый распространенный способ:
```javascript
let element = document.getElementById("paragraph");
element.innerHTML = "Измененный текст";
```
* **По тегу (`getElementsByTagName`)**:
```javascript
let paragraphs = document.getElementsByTagName("p");
```
* **По классу (`getElementsByClassName`)**:
```javascript
let buttons = document.getElementsByClassName("textRed");
```

### Обработчики событий
Это функции, которые вызываются при совершении какого-либо события (например, клика мыши).
Основные события:
* `click` – клик левой кнопкой мыши.
* `mouseover` / `mouseout` – наведение мыши на элемент.
* `keydown` и `keyup` – нажатие и отпускание клавиши клавиатуры.

**Способы задания обработчиков:**
1. Через свойство элемента (используется в нашей работе):
```javascript
element.onclick = function() {
    alert('Кнопка нажата!');
}
```
2. Через метод `addEventListener` (современный стандарт):
```javascript
element.addEventListener('click', () => {
    alert('Кнопка нажата!');
});
```

### Пример взаимодействия
Рассмотрим простой пример сложения двух чисел из полей ввода:
```html
<input id="a" type="number" placeholder="Первое число">
<input id="b" type="number" placeholder="Второе число">
<button id="equal">=</button>
<span id="result"></span>
```
```javascript
document.getElementById('equal').onclick = function() {
    // Получаем значения и приводим их к числу (Number), чтобы избежать склеивания строк
    const a = Number(document.getElementById('a').value);
    const b = Number(document.getElementById('b').value);
    const sum = a + b;
    // Выводим результат на страницу
    document.getElementById('result').textContent = 'Результат: ' + sum;
}
```

---

## 3. Программирование кнопок калькулятора

Разберем код реализации логики нашего калькулятора. В калькуляторе число задается по цифрам, поэтому добавлены переменные для хранения операндов и выбранной операции.

### Шаг 1: Инициализация переменных
```javascript
let a = '';                  // Первое число
let b = '';                  // Второе число
let expressionResult = '';   // Результат вычисления
let selectedOperation = null; // Выбранная операция
```

### Шаг 2: Получение доступа к элементам
```javascript
const outputElement = documentyId("result");
// Получаем все кнопки с цифрами по совпадению начала ID
const digitButtons = document.querySelectorAll('[id ^= "btn_digit_"]');
```

### Шаг 3: Функция обработки нажатия цифр
```javascript
function onDigitButtonClicked(digit) {
    if (!selectedOperation) {
        // Формируем первое число
        if ((digit != '.') || (digit == '.' && !a.includes(digit))) {
            a += digit;
        }
        outputElement.innerHTML = a;
    } else {
        // Формируем второе число
        if ((digit != '.') || (digit == '.' && !b.includes(digit))) {
            b += digit;
            outputElement.innerHTML = b;
        }
    }
}
```

### Шаг 4: Настройка обработчиков
```javascript
digitButtons.forEach(button => {
    button.onclick = function() {
        const digitValue = button.innerHTML;
        onDigitButtonClicked(digitValue);
    }
});

document.getElementById("btn_op_plus").onclick = function() {
    if (a === '') return;
    selectedOperation = '+';
}
// Аналогично для минус, умножить, разделить...
```

### Шаг 5: Вычисление результата (Кнопка Равно)
```javascript
document.getElementById("btn_op_equal").onclick = function() {
    if (a === '' || b === '' || !selectedOperation) return;

    // Используем switch для выбора операции
    switch(selectedOperation) {
        case 'x': expressionResult = (+a) * (+b); break;
        case '+': expressionResult = (+a) + (+b); break;
        case '-': expressionResult = (+a) - (+b); break;
        case '/': expressionResult = (+a) / (+b); break;
    }

    a = expressionResult.toString();
    b = '';
    selectedOperation = null;
    outputElement.innerHTML = a;
}
```

---

## 4. Запуск калькулятора с помощью Live Server

Чтобы увидеть работу скриптов в реальном времени, использовался локальный сервер.

1. Установлено расширение **Live Server** в VS Code.
2. Сервер запущен нажатием кнопки **"Go Live"** в нижней панели интерфейса.
3. Калькулятор открывается в браузере с автоматической перезагрузкой страницы при любых изменениях в коде `.js` или `.html`.

---

## 5. Выполнение заданий по варианту (Дополнения V ATM)

В рамках самостоятельной проработки базовый функционал калькулятора был расширен.

* **5.1. Управление с клавиатуры:** На объект `document` добавлен обработчик `keydown`. Нажатия физических клавиш сопоставляются с ID виртуальных кнопок, после чего вызывается метод `.click()` и добавляется класс временной подсветки `.kb_active`.
* **5.2. Перевод в 16-ричную систему (HEX):** Добавлена функция конвертации с помощью встроенного метода `toString(16).toUpperCase()`. При вводе новых цифр калькулятор сбрасывает режим HEX и начинает новый пример..getElementB
