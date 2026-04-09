import { HeaderComponent } from '../../components/header/index.js';
import { DetailPage } from '../detail/index.js';

export class MainPage {
    constructor(parent) {
        this.parent = parent;
        this.data = [
            {"id":1,"currency":"USD","symbol":"$","title":"Доллары США","reserve":15000,"desc":"Глобальная резервная валюта. Терминал оснащен кассетами для выдачи банкнот номиналом: $100, $50, $20 и $10. Мелкие купюры не используются для ускорения работы диспенсера.","src":"https://img.freepik.com/fotos-premium/trasfondo-billetes-100-dolares_210052-195.jpg"},
            {"id":2,"currency":"EUR","symbol":"€","title":"Евро Инвестиции","reserve":11250,"desc":"Официальная валюта Еврозоны. Хранилище поддерживает выдачу банкнот: €500, €200, €100, €50, €20 и €10. Алгоритм подбирает купюры так, чтобы в пачке было меньше бумаги.","src":"https://avatars.mds.yandex.net/i?id=c3b5cd8e0006c4737b69b9c105404c53_l-3095911-images-thumbs&n=13"},
            {"id":4,"currency":"CNY","symbol":"¥","title":"Активы в Юанях","reserve":80000,"desc":"Валюта Китайской Народной Республики. Кассеты банкомата сконфигурированы для работы с банкнотами: ¥100, ¥50, ¥20 и ¥10. Обеспечивается высокая точность счета.","src":"https://avatars.mds.yandex.net/i?id=45ec4c06641444460ca76274c0865eef_l-4674942-images-thumbs&n=13"},
            {"id":3,"currency":"RUB","symbol":"₽","title":"Рублевая Копилка","reserve":5000000,"desc":"Национальная валюта РФ. Доступны кассеты с номиналами: 5000₽, 2000₽, 1000₽, 500₽, 200₽ и 100₽. Выдача производится моментально в соответствии с лимитами банка.","src":"https://s0.rbk.ru/v6_top_pics/media/img/5/72/754598866016725.jpeg"},
            {"id":5,"currency":"GBP","symbol":"£","title":"Фунты стерлингов","reserve":10000,"desc":"Британская валюта. Диспенсер настроен на работу с полимерными банкнотами нового образца: £50, £20, £10 и £5. Гарантированная защита от замятия при выдаче.","src":"https://avatars.mds.yandex.net/i?id=87c490dbd9aeefb342dc7fc5dd3fb91fb06c24f5-5904855-images-thumbs&n=13"}
        ]; // Массив теперь пустой, мы наполним его с сервера
    }

    // Тот же HTML, что и был
    getHTML() {
        return `
            <div id="header-container"></div>
            <main class="main_content">
                <div class="full_width">
                    <div class="hero_intro">
                        <div class="hero_intro_text">
                            <h1 style="color: var(--t-yellow);">Модуль кассовых операций</h1>
                            <p>Защищенный интерфейс управления валютными резервами V ATM. Система обеспечивает прямой доступ к физическим кассетам банкомата.</p>
                            <p>Выберите кассету для расчета оптимальной выдачи банкнот. Все операции логируются в соответствии с протоколами безопасности.</p>
                        </div>
                        <img src="https://png.pngtree.com/background/20230525/original/pngtree-atm-machine-in-an-empty-room-picture-image_2739911.jpg" class="hero_intro_img" alt="ATM">
                    </div>
                    <h2 style="color: var(--t-text-main); margin-bottom: 25px;">Валютные кассеты</h2>
                    <div id="cards-container" class="currency_grid"></div>
                    <div class="author_info_block">
                        <details class="author_details">
                            <summary>Информация о разработчике</summary>
                            <div class="details_content">
                                <p><strong>Студент:</strong> Васильев Николай Денисович</p>
                                <p><strong>Группа:</strong> ИУ5-42Б</p>
                            </div>
                        </details>
                        <a href="https://github.com/itisneutro/PSP-ATM-System.git" target="_blank" class="github_link_btn">🔗 Ссылка на GitHub</a>
                    </div>
                </div>
            </main>
            <footer class="atm_footer_signature">&copy; 2026 V ATM</footer>
        `;
    }

    // Функция загрузки данных с сервера
    async loadData() {
        try {
            const response = await fetch('http://localhost:3000/api/currencies');
            this.data = await response.json();
            this.renderCards(); // Рисуем карточки только ПОСЛЕ того, как получили данные
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
            document.getElementById('cards-container').innerHTML = "<p style='color:red;'>Ошибка связи с сервером!</p>";
        }
    }

    clickCard(e) {
        const cardElement = e.target.closest('.currency_card');
        if (!cardElement) return;
        const cardId = parseInt(cardElement.dataset.id);
        const selectedData = this.data.find(item => item.id === cardId);

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
                    <p class="currency_desc">${item.desc || 'Описание кассеты загружается...'}</p>
                    <button class="action_link_btn">Инициировать выдачу</button>
                </div>`;
        });
        container.innerHTML = cardsHTML;
        container.querySelectorAll('.currency_card').forEach(card => {
            card.addEventListener('click', this.clickCard.bind(this));
        });
    }

    render() {
    this.parent.innerHTML = this.getHTML();
    const header = new HeaderComponent(document.getElementById('header-container'));
    header.render(false);
    this.renderCards(); // Сразу вызываем отрисовку, не ждем сервер
    }
}
