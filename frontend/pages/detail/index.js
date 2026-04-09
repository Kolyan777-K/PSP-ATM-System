import { HeaderComponent } from '../../components/header/index.js';

export class DetailPage {
    constructor(parent, currencyData, onBack) {
        this.parent = parent;
        this.data = currencyData;
        this.onBack = onBack;

        this.denominations = {
            "RUB": [5000, 2000, 1000, 500, 200, 100],
            "USD": [100, 50, 20, 10],
            "EUR": [500, 200, 100, 50, 20, 10],
            "CNY": [100, 50, 20, 10],
            "GBP": [50, 20, 10, 5]
        };
    }

    getMinDenomination() {
        const notes = this.denominations[this.data.currency];
        return notes[notes.length - 1];
    }

    renderDenominationTags() {
        const notes = this.denominations[this.data.currency];
        return notes.map(note =>
            `<span style="background: rgba(255,221,45,0.1); color: var(--t-yellow); padding: 5px 12px; border-radius: 6px; font-weight: bold; border: 1px solid rgba(255,221,45,0.3); font-size: 0.9rem;">${note}</span>`
        ).join(' ');
    }

    getHTML() {
        const minNote = this.getMinDenomination();
        const tagsHTML = this.renderDenominationTags();

        return `
            <div id="header-container"></div>
            <main class="main_content">
                <div class="full_width">
                    <img src="${this.data.src}" class="detail_hero_img" alt="${this.data.title}">

                    <div class="terminal_layout">
                        <div class="terminal_info">
                            <h2>Операция выдачи: ${this.data.title}</h2>
                            <p style="margin-bottom: 25px;">Подтвердите сумму. Данные в банковском хранилище будут обновлены локально (Режим Лабы 3).</p>

                            <div style="background: var(--t-dark-bg); padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid var(--t-yellow);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                    <span style="color: var(--t-text-muted);">Доступно в хранилище:</span>
                                    <span style="font-size: 1.2rem; color: var(--t-text-main);"><b id="reserve-display">${this.data.reserve} ${this.data.symbol}</b></span>
                                </div>
                                <div>
                                    <span style="color: var(--t-text-muted); display: block; margin-bottom: 8px;">Номиналы в кассете:</span>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                        ${tagsHTML}
                                    </div>
                                </div>
                            </div>

                            <div id="error-msg" class="error_msg"></div>

                            <label style="display: block; margin-bottom: 10px; color: var(--t-text-muted);">
                                Укажите сумму (кратно ${minNote} ${this.data.symbol}):
                            </label>

                            <div class="input_wrapper">
                                <button class="input_btn" id="btn-minus" type="button">−</button>
                                <input type="number" id="withdraw-amount" value="${minNote * 10}" step="${minNote}">
                                <button class="input_btn" id="btn-plus" type="button">+</button>
                            </div>

                            <button id="calc-btn" class="action_link_btn" type="button">Подтвердить и выдать</button>

                            <div id="algo-result" class="receipt_box"></div>
                        </div>
                    </div>
                </div>
            </main>

            <footer class="atm_footer_signature">
                &copy; 2026 V ATM
            </footer>
        `;
    }

    setupInputControls() {
        const input = document.getElementById('withdraw-amount');
        const btnMinus = document.getElementById('btn-minus');
        const btnPlus = document.getElementById('btn-plus');
        const step = this.getMinDenomination();

        btnMinus.onclick = () => {
            let val = parseInt(input.value) || 0;
            if (val >= step * 2) input.value = val - step;
        };

        btnPlus.onclick = () => {
            let val = parseInt(input.value) || 0;
            input.value = val + step;
        };
    }

    calculateDispense(e) {
        if (e) e.preventDefault();

        const input = document.getElementById('withdraw-amount');
        const resultDiv = document.getElementById('algo-result');
        const errorMsg = document.getElementById('error-msg');
        const reserveDisplay = document.getElementById('reserve-display');

        let targetAmount = parseInt(input.value);
        const minNote = this.getMinDenomination();

        resultDiv.style.display = 'none';
        errorMsg.style.display = 'none';

        // ПРОВЕРКИ
        if (!targetAmount || targetAmount <= 0) {
            errorMsg.innerText = "⚠️ Введите сумму больше нуля.";
            errorMsg.style.display = 'block';
            return;
        }
        if (targetAmount % minNote !== 0) {
            errorMsg.innerText = `⚠️ Сумма должна быть кратна ${minNote} ${this.data.symbol}. В кассете нет купюр меньше этого номинала.`;
            errorMsg.style.display = 'block';
            return;
        }
        if (targetAmount > this.data.reserve) {
            errorMsg.innerText = "⚠️ Недостаточно средств в хранилище банкомата.";
            errorMsg.style.display = 'block';
            return;
        }

        // Обновляем данные локально (БЕЗ СЕРВЕРА)
        this.data.reserve -= targetAmount;
        reserveDisplay.innerText = `${this.data.reserve} ${this.data.symbol}`;

        // Жадный алгоритм выдачи купюр
        const notes = this.denominations[this.data.currency];
        let dispensed = {};
        let currentNoteIndex = 0;
        let remaining = targetAmount;

        while (remaining > 0 && currentNoteIndex < notes.length) {
            let note = notes[currentNoteIndex];
            if (remaining >= note) {
                if (!dispensed[note]) dispensed[note] = 0;
                dispensed[note]++;
                remaining -= note;
            } else {
                currentNoteIndex++;
            }
        }

        // Отрисовка чека
        let receiptHTML = `<div class="receipt_header">Транзакция выполнена</div>`;
        for (let note in dispensed) {
            receiptHTML += `<div class="receipt_row"><span>Купюра ${note} ${this.data.symbol}</span><span>${dispensed[note]} шт.</span></div>`;
        }
        receiptHTML += `<div class="receipt_total"><span>ВЫДАНО:</span><span>${targetAmount} ${this.data.symbol}</span></div>`;

        resultDiv.innerHTML = receiptHTML;
        resultDiv.style.display = 'block';
    }

    render() {
        this.parent.innerHTML = this.getHTML();
        const header = new HeaderComponent(document.getElementById('header-container'));
        header.render(true, this.onBack);

        this.setupInputControls();

        const calcBtn = document.getElementById('calc-btn');
        calcBtn.onclick = (e) => this.calculateDispense(e);
    }
}
