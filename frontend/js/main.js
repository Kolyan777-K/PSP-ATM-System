import { currencyUrls } from './modules/currencyUrls.js';
import { ajax } from './modules/ajax.js';

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('currencies_grid');

    // 1. Отрисовка карточек
    const renderCards = (items) => {
        if (!grid) return;
        grid.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'currency_card';
            card.innerHTML = `
                <img src="${item.src}" class="card_icon" style="width:48px; margin-bottom:10px;">
                <h3 class="card_title" style="color:#ffdd2d; margin:0;">${item.title} (${item.symbol})</h3>
                <p class="card_text" style="color:#8e8e93; font-size:0.9rem;">Код: <b>${item.currency}</b></p>
                <div class="card_reserve" style="margin-top:10px; font-weight:bold;">В кассете: ${item.reserve}</div>
            `;
            grid.appendChild(card);
        });
    };

    // 2. Вызов GET-запроса через XHR
    const loadData = () => {
        // Делаем запрос на бэкенд (вызовет CORS ошибку, если порты разные!)
        ajax.get(currencyUrls.getCurrencies(), (data, status) => {
            if (status === 200 && data) {
                renderCards(data);
            } else {
                console.error('Ошибка сети. Проверьте CORS или запущен ли бэкенд.');
            }
        });
    };

    // Инициализация
    loadData();
});
