import { currencyUrls } from './modules/currencyUrls.js';
import { ajax } from './modules/ajax.js';

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('currencies_grid');
    const statusMsg = document.getElementById('status_message');
    const modal = document.getElementById('crud_modal');
    const form = document.getElementById('crud_form');
    const modalError = document.getElementById('modal_error');

    // Навигация
    const switchTab = (tabName) => {
        document.getElementById('tab_home').style.display = tabName === 'home' ? 'block' : 'none';
        document.getElementById('tab_atm').style.display = tabName === 'atm' ? 'block' : 'none';
    };
    document.getElementById('logo_home').addEventListener('click', () => switchTab('home'));
    document.getElementById('btn_back_to_home').addEventListener('click', () => {
        switchTab('home');
        loadData(); // Обновляем карточки при возврате (вдруг мы сняли деньги)
    });

    // --- ОТРИСОВКА КАРТОЧЕК ---
    const renderCards = (items) => {
        grid.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'currency_card';
            card.style.cursor = 'pointer';

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.crud-btn')) window.openTerminal(item.id);
            });

            card.innerHTML = `
                <div style="display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 12px;">
                    <button class="crud-btn" onclick="event.stopPropagation(); window.editCard(${item.id})" style="background: var(--t-yellow); border: none; border-radius: 6px; cursor: pointer; padding: 6px 10px; font-weight:bold;">✏️ Редактировать</button>
                    <button class="crud-btn" onclick="event.stopPropagation(); window.deleteCard(${item.id})" style="background: #ff3b30; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 10px; font-weight:bold;">✖ Удалить</button>
                </div>
                <img src="${item.src}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 12px; margin-bottom: 15px;">
                <h3>${item.title} (${item.symbol})</h3>
                <p class="currency_desc">${item.desc}</p>
                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.08); font-weight: bold; color: var(--t-yellow);">
                    Код: ${item.currency} | Доступно купюр: ${item.reserve}
                </div>
            `;
            grid.appendChild(card);
        });
    };

    const loadData = () => {
        ajax.get(currencyUrls.getCurrencies(), (data, status) => {
            if (status === 200 && data) {
                statusMsg.innerHTML = '';
                renderCards(data);
            } else {
                grid.innerHTML = '';
                statusMsg.innerHTML = `<div style="background: rgba(255,59,48,0.1); border-left: 5px solid #ff3b30; padding: 20px; border-radius: 12px;"><h3 style="color: #ff3b30; margin-top:0;">❌ Ошибка CORS</h3><p style="color:white;">Включите CORS Unblock.</p></div>`;
            }
        });
    };

    // --- ТЕРМИНАЛ: ВЫДАЧА НАЛИЧНЫХ ---
    window.openTerminal = (id) => {
        ajax.get(currencyUrls.getCurrencyById(id), (item, status) => {
            if (status === 200 && item) {
                document.getElementById('atm_hero_img').src = item.src;
                document.getElementById('atm_title').innerText = `Операция выдачи: ${item.title}`;
                document.getElementById('atm_available').innerText = `${item.reserve} ${item.symbol}`;

                const inputAmount = document.getElementById('atm_amount_input');
                inputAmount.value = 100;

                document.getElementById('atm_receipt').style.display = 'none';
                document.getElementById('atm_error').style.display = 'none';

                // Логика кнопок + и -
                document.getElementById('btn_plus').onclick = () => { inputAmount.value = parseInt(inputAmount.value) + 10; };
                document.getElementById('btn_minus').onclick = () => {
                    if (parseInt(inputAmount.value) > 10) inputAmount.value = parseInt(inputAmount.value) - 10;
                };

                // Подтвердить и выдать (Отправляем PATCH на бэкенд)
                document.getElementById('btn_execute_transaction').onclick = () => {
                    const amount = parseInt(inputAmount.value);
                    if (amount > 0 && amount <= item.reserve) {
                        // Снимаем деньги с базы данных
                        const newReserve = item.reserve - amount;
                        ajax.patch(currencyUrls.updateCurrency(id), { reserve: newReserve }, (res, patchStatus) => {
                            if (patchStatus === 200) {
                                document.getElementById('atm_error').style.display = 'none';
                                document.getElementById('rec_currency').innerText = item.title;
                                document.getElementById('rec_amount').innerText = `${amount} купюр`;
                                document.getElementById('rec_total').innerText = `${amount} ${item.symbol}`;
                                document.getElementById('atm_receipt').style.display = 'block';

                                // Обновляем значение на экране
                                item.reserve = newReserve;
                                document.getElementById('atm_available').innerText = `${newReserve} ${item.symbol}`;
                            }
                        });
                    } else {
                        document.getElementById('atm_error').innerText = '❌ Недостаточно средств в кассете!';
                        document.getElementById('atm_error').style.display = 'block';
                        document.getElementById('atm_receipt').style.display = 'none';
                    }
                };

                switchTab('atm');
            }
        });
    };

    // --- CRUD ОПЕРАЦИИ (МОДАЛКА) ---
    window.deleteCard = (id) => {
        if (confirm('Точно изъять кассету?')) {
            ajax.delete(currencyUrls.deleteCurrency(id), (data, status) => {
                if (status === 200) loadData();
            });
        }
    };

    document.getElementById('btn_open_add_modal').addEventListener('click', () => {
        form.reset();
        document.getElementById('edit_id').value = '';
        document.getElementById('modal_title').innerText = '➕ Добавление новой кассеты';
        modalError.style.display = 'none';
        modal.style.display = 'flex';
    });

    window.editCard = (id) => {
        ajax.get(currencyUrls.getCurrencyById(id), (item, status) => {
            if (status === 200 && item) {
                document.getElementById('modal_title').innerText = '✏️ Модификация кассеты';
                document.getElementById('edit_id').value = item.id;
                document.getElementById('input_currency').value = item.currency;
                document.getElementById('input_symbol').value = item.symbol;
                document.getElementById('input_title').value = item.title;
                document.getElementById('input_reserve').value = item.reserve;
                document.getElementById('input_desc').value = item.desc;
                document.getElementById('input_src').value = item.src;
                modalError.style.display = 'none';
                modal.style.display = 'flex';
            }
        });
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // КАСТОМНАЯ ВАЛИДАЦИЯ ФОРМЫ (Вместо подсказок браузера)
        const currency = document.getElementById('input_currency').value.trim();
        const symbol = document.getElementById('input_symbol').value.trim();
        const title = document.getElementById('input_title').value.trim();
        const reserve = document.getElementById('input_reserve').value.trim();
        const desc = document.getElementById('input_desc').value.trim();
        const src = document.getElementById('input_src').value.trim();

        if (!currency || !symbol || !title || !reserve || !desc || !src) {
            modalError.innerText = '❌ Внимание: Пожалуйста, заполните все поля формы!';
            modalError.style.display = 'block';
            return; // Прерываем сохранение
        }

        modalError.style.display = 'none';

        const id = document.getElementById('edit_id').value;
        const data = { currency, symbol, title, reserve: parseInt(reserve), desc, src };

        if (id) {
            ajax.patch(currencyUrls.updateCurrency(id), data, (res, status) => {
                if (status === 200) { modal.style.display = 'none'; loadData(); }
            });
        } else {
            ajax.post(currencyUrls.createCurrency(), data, (res, status) => {
                if (status === 201) { modal.style.display = 'none'; loadData(); }
            });
        }
    });

    document.getElementById('btn_close_modal').addEventListener('click', () => modal.style.display = 'none');

    loadData();
});
