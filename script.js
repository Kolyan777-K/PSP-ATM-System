window.onload = function() {
    // Базовые переменные калькулятора
    let a = '';
    let b = '';
    let selectedOperation = null;
    let expressionResult = '';

    // Переменная для накапливаемой памяти (Пункты 9, 10)
    let memory = 0;

    const outputElement = document.getElementById("result");
    const digitButtons = document.querySelectorAll('[id^="btn_digit_"]');

    // Функция обновления экрана
    function updateScreen() {
        if (!selectedOperation) {
            outputElement.innerHTML = a === '' ? '0' : a;
        } else {
            outputElement.innerHTML = b === '' ? a : b;
        }
    }

    // Вспомогательная функция: получаем активную переменную (с которой сейчас работаем)
    function getActiveVar() { return selectedOperation ? b : a; }
    function setActiveVar(val) {
        if (selectedOperation) b = val.toString();
        else a = val.toString();
    }

    // --- БАЗОВАЯ ЛОГИКА ---
    function onDigitButtonClicked(digit) {
        if (!selectedOperation) {
            if (digit === '000' && a === '') return; // Защита от лишних нулей в начале
            if ((digit !== '.') || (digit === '.' && !a.includes(digit))) {
                a += digit;
            }
        } else {
            if (digit === '000' && b === '') return;
            if ((digit !== '.') || (digit === '.' && !b.includes(digit))) {
                b += digit;
            }
        }
        updateScreen();
    }

    digitButtons.forEach(button => {
        button.onclick = function() {
            onDigitButtonClicked(button.innerHTML);
        }
    });

    // Установка базовых операций (+, -, *, /)
    const setOperation = (op) => {
        if (a === '') return;
        selectedOperation = op;
    };
    document.getElementById("calc_plus").onclick = () => setOperation('+');
    document.getElementById("calc_minus").onclick = () => setOperation('-');
    document.getElementById("calc_mult").onclick = () => setOperation('x');
    document.getElementById("calc_div").onclick = () => setOperation('/');

    // Кнопка С (Очистка)
    document.getElementById("calc_clear").onclick = function() {
        a = ''; b = ''; selectedOperation = null; expressionResult = '';
        updateScreen();
    };

    // --- ВЫПОЛНЕНИЕ 12 ЗАДАНИЙ ДЛЯ САМОСТОЯТЕЛЬНОЙ РАБОТЫ ---

    // 1. Смена знака +/-
    document.getElementById("calc_sign").onclick = function() {
        let val = Number(getActiveVar());
        if (val !== 0) setActiveVar(val * -1);
        updateScreen();
    };

    // 2. Процент %
    document.getElementById("calc_percent").onclick = function() {
        let val = Number(getActiveVar());
        setActiveVar(val / 100);
        updateScreen();
    };

    // 3. Стирание последней цифры (Backspace)
    document.getElementById("calc_backspace").onclick = function() {
        let val = getActiveVar();
        if (val.length > 0) setActiveVar(val.slice(0, -1));
        updateScreen();
    };

    // 4. Смена цвета фона (работает с темой)
    document.getElementById("trigger_theme").onclick = function() {
        document.getElementById("atm_environment").classList.toggle("light_theme");
    };

    // 5. Квадратный корень √
    document.getElementById("calc_sqrt").onclick = function() {
        let val = Number(getActiveVar());
        if (val >= 0) setActiveVar(Math.sqrt(val));
        else alert("Ошибка: корень из отрицательного числа!");
        updateScreen();
    };

    // 6. Возведение в квадрат x²
    document.getElementById("calc_sq").onclick = function() {
        let val = Number(getActiveVar());
        setActiveVar(Math.pow(val, 2));
        updateScreen();
    };

    // 7. Факториал x!
    document.getElementById("calc_fact").onclick = function() {
        let val = parseInt(getActiveVar());
        if (isNaN(val) || val < 0) return alert("Только положительные целые числа!");
        let fact = 1;
        for (let i = 2; i <= val; i++) fact *= i;
        setActiveVar(fact);
        updateScreen();
    };

    // 8. Кнопка "000" уже обрабатывается в функции onDigitButtonClicked благодаря селектору

    // 9. Накапливаемое сложение (M+)
    document.getElementById("calc_m_plus").onclick = function() {
        let val = Number(getActiveVar() || 0);
        memory += val;
        alert("В памяти: " + memory);
    };

    // 10. Накапливаемое вычитание (M-)
    document.getElementById("calc_m_minus").onclick = function() {
        let val = Number(getActiveVar() || 0);
        memory -= val;
        alert("В памяти: " + memory);
    };

    // 11. Смена цвета окна вывода
    document.getElementById("trigger_screen_color").onclick = function() {
        document.getElementById("atm_monitor").classList.toggle("alt_color");
    };

    // 12. Индивидуальная операция: Комиссия банка (вычитаем 3%)
    document.getElementById("calc_commission").onclick = function() {
        let val = Number(getActiveVar());
        setActiveVar(val * 0.97); // Оставляем 97% от суммы
        updateScreen();
    };

    // --- КНОПКА РАВНО ---
    document.getElementById("calc_equal").onclick = function() {
        if (a === '' || b === '' || !selectedOperation) return;

        let numA = Number(a);
        let numB = Number(b);

        switch(selectedOperation) {
            case 'x': expressionResult = numA * numB; break;
            case '+': expressionResult = numA + numB; break;
            case '-': expressionResult = numA - numB; break;
            case '/':
                if (numB === 0) { alert("Деление на ноль!"); return; }
                expressionResult = numA / numB;
                break;
        }

        // Защита от слишком длинных дробей
        expressionResult = Math.round(expressionResult * 10000) / 10000;

        a = expressionResult.toString();
        b = '';
        selectedOperation = null;
        updateScreen();
    };

    // Логика переключения символа валюты из 1 лабы
    document.getElementById("currency_selector").onchange = function() {
        const symbols = { 'rub': '₽', 'usd': '$', 'eur': '€' };
        document.getElementById('currency_symbol').innerText = symbols[this.value];
    };
};
