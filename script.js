window.onload = function() {
    const navButtons = document.querySelectorAll('.nav_btn');
    const tabSections = document.querySelectorAll('.tab_section');

    function switchTab(targetId) {
        navButtons.forEach(b => b.classList.remove('active'));
        tabSections.forEach(sec => sec.classList.remove('active'));
        const btn = document.querySelector(`[data-target="${targetId}"]`);
        if(btn) btn.classList.add('active');
        document.getElementById(targetId).classList.add('active');
    }
    navButtons.forEach(btn => { btn.onclick = function() { switchTab(this.getAttribute('data-target')); }; });
    document.getElementById("logo_home").onclick = () => switchTab('tab_home');
    document.getElementById("trigger_theme").onclick = () => document.getElementById("atm_environment").classList.toggle("light_theme");

    let a = ''; let b = ''; let selectedOperation = null; let memory = 0;
    let isFinished = false;

    const outputElement = document.getElementById("result");
    const historyElement = document.getElementById("calc_history");
    const memoryIndicator = document.getElementById("memory_indicator");

    const currencyDropdown = document.getElementById("currency_selector");
    const symbolEl = document.getElementById('currency_symbol');
    const screenEl = document.getElementById('atm_monitor');

    function updateScreen() {
        let formatVal = (val) => val.toString().length > 9 ? val.toString().substring(0, 9) : val;

        if (selectedOperation) {
            historyElement.innerText = `${formatVal(a)} ${selectedOperation}`;
            outputElement.innerText = b === '' ? formatVal(a) : formatVal(b);
        } else {
            historyElement.innerText = '';
            outputElement.innerText = a === '' ? '0' : formatVal(a);
        }
    }

    function getActiveVar() { return selectedOperation ? b : a; }
    function setActiveVar(val) {
        if(isNaN(val)) return;
        let strVal = (Math.round(val * 1000000) / 1000000).toString();
        if (selectedOperation) b = strVal; else a = strVal;
    }

    // КОНВЕРТАЦИЯ
    const rates = { rub: 1, usd: 90, eur: 100 };
    const symbols = { rub: '₽', usd: '$', eur: '€' };
    const colors = {
        rub: { color: '#ffdd2d', shadow: 'rgba(255, 221, 45, 0.2)' },
        usd: { color: '#34c759', shadow: 'rgba(52, 199, 89, 0.2)' },
        eur: { color: '#0a84ff', shadow: 'rgba(10, 132, 255, 0.2)' }
    };

    function renderConversionButtons() {
        const panel = document.getElementById('conv_buttons');
        const curr = currencyDropdown.value;
        panel.innerHTML = '';

        symbolEl.innerText = symbols[curr];
        screenEl.style.color = colors[curr].color;
        screenEl.style.borderColor = colors[curr].color;
        screenEl.style.boxShadow = `0 0 15px ${colors[curr].shadow}`;

        Object.keys(rates).forEach(c => {
            if (c !== curr) {
                let btn = document.createElement('button');
                btn.className = 'conv_btn'; btn.innerText = `В ${c.toUpperCase()}`;
                btn.onclick = () => {
                    let valRub = Number(getActiveVar() || 0) * rates[curr];
                    setActiveVar(valRub / rates[c]);
                    currencyDropdown.value = c;
                    renderConversionButtons(); updateScreen();
                };
                panel.appendChild(btn);
            }
        });
    }
    currencyDropdown.onchange = renderConversionButtons;
    renderConversionButtons();

    document.querySelectorAll('[id^="btn_digit_"]').forEach(btn => {
        btn.onclick = () => {
            let digit = btn.innerText === ',' ? '.' : btn.innerText;

            if (isFinished && !selectedOperation) { a = ''; isFinished = false; }
            let target = selectedOperation ? b : a;

            if (target.replace('.', '').length >= 9) return;

            if (digit !== '.') {
                if (target === '0') target = digit;
                else target += digit;
            } else {
                if (target === '') target = '0.';
                else if (!target.includes('.')) target += '.';
            }

            if (selectedOperation) b = target; else a = target;
            updateScreen();
        };
    });

    const setOp = (op) => {
        if (a !== '') {
            if (b !== '') document.getElementById("calc_equal").click();
            selectedOperation = op; isFinished = false; updateScreen();
        }
    };

    document.getElementById("calc_plus").onclick = () => setOp('+');
    document.getElementById("calc_minus").onclick = () => setOp('-');
    document.getElementById("calc_mult").onclick = () => setOp('×');
    document.getElementById("calc_div").onclick = () => setOp('÷');

    document.getElementById("calc_clear").onclick = () => { a = ''; b = ''; selectedOperation = null; updateScreen(); };

    function updateMemoryIndicator() {
        if(memory !== 0) memoryIndicator.classList.add('visible');
        else memoryIndicator.classList.remove('visible');
    }

    document.getElementById("calc_m_plus").onclick = () => { memory += Number(getActiveVar() || 0); updateMemoryIndicator(); };
    document.getElementById("calc_m_minus").onclick = () => { memory -= Number(getActiveVar() || 0); updateMemoryIndicator(); };
    document.getElementById("calc_m_recall").onclick = () => { setActiveVar(memory); updateScreen(); };
    document.getElementById("calc_m_clear").onclick = () => { memory = 0; updateMemoryIndicator(); };

    document.getElementById("calc_sign").onclick = () => { if(getActiveVar()) { setActiveVar(Number(getActiveVar()) * -1); updateScreen(); }};
    document.getElementById("calc_percent").onclick = () => { if(getActiveVar()) { setActiveVar(Number(getActiveVar()) / 100); updateScreen(); }};
    document.getElementById("calc_backspace").onclick = () => {
        let val = getActiveVar();
        if (val.length > 0) { if (selectedOperation) b = b.slice(0, -1); else a = a.slice(0, -1); }
        if (a === '' && !selectedOperation) a = '0';
        updateScreen();
    };

    document.getElementById("calc_sqrt").onclick = () => { let v = Number(getActiveVar()); if(v >= 0) {setActiveVar(Math.sqrt(v)); updateScreen();}};
    document.getElementById("calc_sq").onclick = () => { if(getActiveVar()) {setActiveVar(Math.pow(Number(getActiveVar()), 2)); updateScreen();}};
    document.getElementById("calc_fact").onclick = () => {
        if(!getActiveVar()) return;
        let v = parseInt(getActiveVar()); if (v < 0 || v > 170) return; // Защита от бесконечности
        let fact = 1; for(let i=2; i<=v; i++) fact *= i; setActiveVar(fact); updateScreen();
    };

    document.getElementById("calc_equal").onclick = () => {
        if (a === '' || b === '' || !selectedOperation) return;
        let nA = Number(a), nB = Number(b), res = 0;
        switch(selectedOperation) {
            case '×': res = nA * nB; break;
            case '+': res = nA + nB; break;
            case '-': res = nA - nB; break;
            case '÷': if (nB === 0) return; res = nA / nB; break;
        }
        res = Math.round(res * 10000000) / 10000000;

        a = res.toString(); b = ''; selectedOperation = null; isFinished = true; updateScreen();
    };
}
