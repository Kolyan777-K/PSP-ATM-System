import { HeaderComponent } from '../../components/header/index.js';
import { DetailPage } from '../detail/index.js';
import { ajax } from '../../modules/ajax.js';
import { currencyUrls } from '../../modules/currencyUrls.js';

export class MainPage {
    constructor(parent) {
        this.parent = parent;
        this.data = []; // Изначально пустой массив, ждем ответа от сервера
    }

    getHTML() {
        return `
            <div id="header-container"></div>
            <main class="main_content">
                <div class="full_width">
                    <div class="hero_intro">
                        <div class="hero_intro_text">
                            <h1 style="color: var(--t-yellow);">Модуль кассовых операций</h1>
                            <p>Защищенный интерфейс управления валютными резервами V ATM. Система общается с реальным сервером через XHR (AJAX).</p>
                            <button id="add-currency-btn" class="sys_btn" style="margin-top: 15px;">+ Создать тестовую кассету (POST)</button>
                        </div>
                        <img src="https://png.pngtree.com/background/20230525/original/pngtree-atm-machine-in-an-empty-room-picture-image_2739911.jpg" class="hero_intro_img" alt="ATM">
                    </div>
                    <h2 style="color: var(--t-text-main); margin-bottom: 25px;">Валютные кассеты</h2>
                    <div id="cards-container" class="currency_grid">
                        <p style="color: var(--t-text-muted);">Загрузка данных с сервера...</p>
                    </div>
                </div>
            </main>
            <footer class="atm_footer_signature">&copy; 2026 V ATM</footer>
        `;
    }

    // Фирменное всплывающее уведомление (Toast) в стиле V ATM
    showNotification(message, isError = false) {
        const toast = document.createElement('div');

        // Добавляем иконку и текст
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 1.4rem;">${isError ? '⚠️' : '🏦'}</span>
                <span style="font-size: 1.05rem;">${message}</span>
            </div>
        `;

        // Стилизуем под дизайн банкомата (используем CSS переменные)
        toast.style.position = 'fixed';
        toast.style.bottom = '40px';
        toast.style.right = '40px';
        toast.style.backgroundColor = 'var(--t-card-bg)';
        toast.style.color = 'var(--t-text-main)';
        toast.style.padding = '16px 28px';
        toast.style.borderRadius = '16px';

        // Рамка и свечение (желтая для успеха, красная для ошибки)
        const borderColor = isError ? '#ff3b30' : 'var(--t-yellow)';
        toast.style.border = `1px solid ${borderColor}`;
        toast.style.borderLeft = `6px solid ${borderColor}`;
        toast.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4)';
        toast.style.fontWeight = '600';
        toast.style.zIndex = '9999';

        // Анимация (с эффектом отскока)
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(30px) scale(0.95)';
        toast.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

        document.body.appendChild(toast);

        // Плавное появление
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        // Исчезновение и удаление через 3.5 секунды
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(30px) scale(0.95)';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // Получаем данные по AJAX (XHR) - GET запрос
    loadData() {
        ajax.get(currencyUrls.getCurrencies(), (data, status) => {
            if (status === 200 && data) {
                this.data = data;
                this.renderCards();
            } else {
                document.getElementById('cards-container').innerHTML = "<p style='color:#ff3b30;'>Ошибка связи с сервером (Проверьте CORS и запущен ли Бэкенд)!</p>";
            }
        });
    }

    // Создание новой кассеты для теста POST запроса
    createNewCurrency() {
        const newCurrencyData = {
            currency: "CHF",
            symbol: "₣",
            title: "Швейцарские франки",
            reserve: 50000,
            desc: "Тестовая валюта, добавленная через клиентский POST запрос",
            src: "https://cdn-icons-png.flaticon.com/512/330/330431.png"
        };

        // Блокируем кнопку на время запроса
        const btn = document.getElementById('add-currency-btn');
        btn.disabled = true;
        btn.innerText = "Отправка...";

        ajax.post(currencyUrls.createCurrency(), newCurrencyData, (data, status) => {
            btn.disabled = false;
            btn.innerText = "+ Создать тестовую кассету (POST)";

            if (status === 201) {
                this.showNotification("Кассета успешно добавлена!");
                this.loadData(); // Перезагружаем список с сервера, чтобы увидеть новую карточку
            } else {
                this.showNotification(`Ошибка сервера (Статус ${status})`, true);
            }
        });
    }

    clickCard(e) {
        const cardElement = e.target.closest('.currency_card');
        if (!cardElement) return;

        const cardId = parseInt(cardElement.dataset.id);
        const selectedData = this.data.find(item => item.id === cardId);

        // Переходим на детальную страницу
        const detailPage = new DetailPage(this.parent, selectedData, this.render.bind(this));
        detailPage.render();
    }

    renderCards() {
        const container = document.getElementById('cards-container');
        let cardsHTML = '';

        this.data.forEach(item => {
            cardsHTML += `
                <div class="currency_card" data-id="${item.id}" style="cursor: pointer;">
                    <img src="${item.src}" alt="${item.title}">
                    <h3 style="margin-bottom: 5px;">${item.title}</h3>
                    <p style="color: var(--t-yellow); font-weight: bold; margin-bottom: 10px;">Резерв: ${item.reserve} ${item.symbol}</p>
                    <p class="currency_desc">${item.desc || '...'}</p>
                    <button class="action_link_btn">Инициировать выдачу</button>
                </div>`;
        });

        container.innerHTML = cardsHTML;

        // Навешиваем слушатели событий на новые отрисованные карточки
        container.querySelectorAll('.currency_card').forEach(card => {
            card.addEventListener('click', this.clickCard.bind(this));
        });
    }

    render() {
        // 1. Очищаем экран и вставляем базовый HTML
        this.parent.innerHTML = this.getHTML();

        // 2. Рисуем шапку (Header)
        const header = new HeaderComponent(document.getElementById('header-container'));
        header.render(false);

        // 3. Активируем кнопку POST запроса
        document.getElementById('add-currency-btn').addEventListener('click', () => this.createNewCurrency());

        // 4. Запускаем загрузку данных с бэкенда
        this.loadData();
    }
}
