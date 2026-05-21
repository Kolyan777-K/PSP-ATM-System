import { currencyUrls } from './modules/currencyUrls.js';
import { ajax } from './modules/ajax.js';

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('currencies_grid');
    const statusMsg = document.getElementById('status_message');
    const modal = document.getElementById('crud_modal');
    const form = document.getElementById('crud_form');
    const modalError = document.getElementById('modal_error');

    // Новые переменные для модалки удаления
    const confirmModal = document.getElementById('confirm_modal');
    let deleteTargetId = null;

    const switchTab = (tabName) => {
        document.getElementById('tab_home').style.display = tabName === 'home' ? 'block' : 'none';
        document.getElementById('tab_atm').style.display = tabName === 'atm' ? 'block' : 'none';
    };

    document.getElementById('logo_home').addEventListener('click', () => switchTab('home'));
    document.getElementById('btn_back_to_home').addEventListener('click', () => {
        switchTab('home');
        loadData();
    });

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
                    Код: ${item.currency} | Доступно в кассете: ${item.reserve}
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
                statusMsg.innerHTML = `<div style="background: rgba(255,59,48,0.1); border-left: 5px solid #ff3b30; padding: 20px; border-radius: 12px;"><h3 style="color: #ff3b30; margin-top:0;">❌ Ошибка CORS</h3><p style="color:white;">Запрос заблокирован. Включите расширение CORS Unblock.</p></div>`;
            }
        });
    };

    window.openTerminal = (id) => {
        ajax.get(currencyUrls.getCurrencyById(id), (item, status) => {
            if (status === 200 && item) {
                const currencyDenominations = {
                    "RUB": [5000, 2000, 1000, 500, 200, 100],
                    "USD": [100, 50, 20, 10],
                    "EUR": [500, 200, 100, 50, 20, 10],
                    "CNY": [100, 50, 20, 10],
                    "GBP": [50, 20, 10, 5]
                };

                const denominations = currencyDenominations[item.currency] || [100, 50, 20, 10];
                const minNote = denominations[denominations.length - 1];

                document.getElementById('atm_hero_img').src = item.src;
                document.getElementById('atm_title').innerText = `Операция выдачи: ${item.title}`;
                document.getElementById('atm_available').innerText = `${item.reserve} ${item.symbol}`;

                const denomBox = document.getElementById('atm_denominations');
                denomBox.innerHTML = '';
                denominations.forEach(d => {
                    denomBox.innerHTML += `<span style="border: 1px solid var(--t-yellow); color: var(--t-yellow); padding: 4px 15px; border-radius: 8px; font-weight: bold;">${d}</span>`;
                });
                document.getElementById('atm_amount_label').innerText = `Укажите сумму (кратно ${minNote} ${item.symbol}):`;

                const inputAmount = document.getElementById('atm_amount_input');
                inputAmount.value = minNote * 10;

                document.getElementById('atm_receipt').style.display = 'none';
                document.getElementById('atm_error').style.display = 'none';

                document.getElementById('btn_plus').onclick = () => { inputAmount.value = parseInt(inputAmount.value) + minNote; };
                document.getElementById('btn_minus').onclick = () => {
                    if (parseInt(inputAmount.value) > minNote) inputAmount.value = parseInt(inputAmount.value) - minNote;
                };

                document.getElementById('btn_execute_transaction').onclick = () => {
                    const amount = parseInt(inputAmount.value);

                    if (amount > 0 && amount <= item.reserve) {
                        let remaining = amount;
                        let notesDispensed = {};

                        for (let denom of denominations) {
                            if (remaining >= denom) {
                                let count = Math.floor(remaining / denom);
                                notesDispensed[denom] = count;
                                remaining -= count * denom;
                            }
                        }

                        if (remaining > 0) {
                            document.getElementById('atm_error').innerText = `❌ Невозможно выдать эту сумму имеющимися номиналами (кратно ${minNote})!`;
                            document.getElementById('atm_error').style.display = 'block';
                            document.getElementById('atm_receipt').style.display = 'none';
                            return;
                        }

                        const newReserve = item.reserve - amount;
                        ajax.patch(currencyUrls.updateCurrency(id), { reserve: newReserve }, (res, patchStatus) => {
                            if (patchStatus === 200) {
                                document.getElementById('atm_error').style.display = 'none';

                                let receiptHtml = `<div style="text-align: center; color: var(--t-text-muted); font-size: 0.9rem; letter-spacing: 1.5px; margin-bottom: 20px; text-transform: uppercase;">ТРАНЗАКЦИЯ ВЫПОЛНЕНА (XHR API)</div>`;

                                for (let denom of denominations) {
                                    if (notesDispensed[denom]) {
                                        receiptHtml += `
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1.1rem;">
                                            <span style="color: var(--t-text-main);">Купюра ${denom} ${item.symbol}</span>
                                            <span style="font-weight: bold; color: var(--t-yellow);">${notesDispensed[denom]} шт.</span>
                                        </div>`;
                                    }
                                }

                                receiptHtml += `
                                <div style="display: flex; justify-content: space-between; font-size: 1.4rem; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                                    <span style="color: var(--t-text-main);">ВЫДАНО:</span>
                                    <span style="color: var(--t-text-main);">${amount} ${item.symbol}</span>
                                </div>`;

                                const receiptBox = document.getElementById('atm_receipt');
                                receiptBox.innerHTML = receiptHtml;
                                receiptBox.style.display = 'block';

                                item.reserve = newReserve;
                                document.getElementById('atm_available').innerText = `${newReserve} ${item.symbol}`;
                            }
                        });
                    } else {
                        document.getElementById('atm_error').innerText = '❌ Недостаточно средств в хранилище!';
                        document.getElementById('atm_error').style.display = 'block';
                        document.getElementById('atm_receipt').style.display = 'none';
                    }
                };

                switchTab('atm');
            }
        });
    };

    // --- ЛОГИКА УДАЛЕНИЯ ЧЕРЕЗ КРАСИВУЮ МОДАЛКУ ---
    window.deleteCard = (id) => {
        deleteTargetId = id;
        confirmModal.style.display = 'flex'; // Показываем кастомное окно
    };

    document.getElementById('btn_confirm_delete').addEventListener('click', () => {
        if (deleteTargetId !== null) {
            ajax.delete(currencyUrls.deleteCurrency(deleteTargetId), (data, status) => {
                if (status === 200) loadData();
            });
            confirmModal.style.display = 'none';
            deleteTargetId = null;
        }
    });

    document.getElementById('btn_cancel_delete').addEventListener('click', () => {
        confirmModal.style.display = 'none';
        deleteTargetId = null;
    });

    // --- CRUD ОПЕРАЦИИ (МОДАЛКА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ) ---
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

        const currency = document.getElementById('input_currency').value.trim();
        const symbol = document.getElementById('input_symbol').value.trim();
        const title = document.getElementById('input_title').value.trim();
        const reserve = document.getElementById('input_reserve').value.trim();
        const desc = document.getElementById('input_desc').value.trim();
        const src = document.getElementById('input_src').value.trim();

        if (!currency || !symbol || !title || !reserve || !desc || !src) {
            modalError.innerText = '❌ Внимание: Пожалуйста, заполните все поля формы!';
            modalError.style.display = 'block';
            return;
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
