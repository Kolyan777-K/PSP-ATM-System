import { HeaderComponent } from '../../components/header/index.js';
import { DetailPage } from '../detail/index.js';

export class MainPage {
    constructor(parent) {
        this.parent = parent;
        this.data = [];
        this.deleteTargetId = null;
    }

    getHTML() {
        return `
            <div id="header-container"></div>
            <main class="main_content">
                <div class="full_width">
                    <div class="hero_intro">
                        <div class="hero_intro_text">
                            <h1 style="color: var(--t-yellow);">Модуль кассовых операций</h1>
                            <p>Защищенный интерфейс управления валютными резервами V ATM. Система обеспечивает прямой доступ к физическим кассетам банкомата.</p>
                        </div>
                    </div>

                    <div style="text-align: center; margin: 40px 0;">
                        <button id="btn_open_add_modal" class="action_link_btn" style="max-width: 350px; font-size: 1.2rem; padding: 18px 40px; box-shadow: 0 0 20px rgba(255, 221, 45, 0.2);">
                          ➕ Добавить новую кассету
                        </button>
                    </div>

                    <h2 style="color: var(--t-text-main); margin-bottom: 25px;">Валютные кассеты</h2>
                    <div id="status_message" style="margin-bottom: 20px;"></div>
                    <div id="cards-container" class="currency_grid"></div>
                </div>
            </main>

            <div id="crud_modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center;">
                <div style="background: var(--t-card-bg); padding: 30px; border-radius: 16px; width: 420px; border: 1px solid var(--t-yellow); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                  <h3 id="modal_title" style="color: var(--t-yellow); margin-top: 0; font-size: 1.4rem;">Управление кассетой</h3>
                  <div id="modal_error" style="display: none; color: #ff3b30; background: rgba(255,59,48,0.1); padding: 10px; border-radius: 8px; margin-bottom: 15px; font-weight: 500; font-size: 0.9rem;"></div>

                  <form id="crud_form">
                    <input type="hidden" id="edit_id">
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Код валюты (например: USD):</label><input type="text" id="input_currency" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Символ ($ или ₽):</label><input type="text" id="input_symbol" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Название кассеты:</label><input type="text" id="input_title" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Количество купюр (Резерв):</label><input type="number" id="input_reserve" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 12px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Описание технологии:</label><input type="text" id="input_desc" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>
                    <div style="margin-bottom: 20px;"><label style="font-size:0.9rem; color:var(--t-text-muted);">Ссылка на фоновое изображение:</label><input type="url" id="input_src" style="width:100%; padding:10px; margin-top:5px; background:#111; color:#fff; border:1px solid #444; border-radius:8px;"></div>

                    <div style="display: flex; gap: 10px;">
                      <button type="submit" style="flex: 1; background: var(--t-yellow); color: #000; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Сохранить кассету</button>
                      <button type="button" id="btn_close_modal" style="flex: 1; background: #333; color: #fff; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">Отмена</button>
                    </div>
                  </form>
                </div>
            </div>

            <div id="confirm_modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center;">
                <div style="background: var(--t-card-bg); padding: 30px; border-radius: 16px; width: 350px; border: 1px solid #ff3b30; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;">
                  <h3 style="color: #ff3b30; margin-top: 0; font-size: 1.4rem;">Внимание!</h3>
                  <p style="color: var(--t-text-main); margin-bottom: 25px;">Точно изъять кассету? Это действие нельзя отменить.</p>
                  <div style="display: flex; gap: 10px;">
                    <button id="btn_confirm_delete" style="flex: 1; background: #ff3b30; color: #fff; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Удалить</button>
                    <button id="btn_cancel_delete" style="flex: 1; background: #333; color: #fff; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">Отмена</button>
                  </div>
                </div>
            </div>

            <footer class="atm_footer_signature">&copy; 2026 V ATM</footer>
        `;
    }

    // Загрузка данных через FETCH
    async loadData() {
        try {
            // Если бэкенд и фронтенд на одном домене (после сборки Vite), полный URL не нужен.
            // Но пока оставим полный для dev-режима.
            const response = await fetch('http://localhost:3000/api/currencies');
            if (!response.ok) throw new Error('Ошибка сервера');
            this.data = await response.json();
            document.getElementById('status_message').innerHTML = '';
            this.renderCards();
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
            document.getElementById('status_message').innerHTML = "<p style='color:red;'>Ошибка связи с сервером!</p>";
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
                <div class="currency_card" data-id="${item.id}" style="cursor: pointer; position: relative;">
                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 12px;">
                        <button class="crud-btn-edit" data-id="${item.id}" style="background: var(--t-yellow); border: none; border-radius: 6px; cursor: pointer; padding: 6px 10px; font-weight:bold;">✏️ Редактировать</button>
                        <button class="crud-btn-del" data-id="${item.id}" style="background: #ff3b30; color: white; border: none; border-radius: 6px; cursor: pointer; padding: 6px 10px; font-weight:bold;">✖ Удалить</button>
                    </div>
                    <img src="${item.src}" alt="${item.title}">
                    <h3 style="margin-bottom: 5px;">${item.title}</h3>
                    <p style="color: var(--t-yellow); font-weight: bold; margin-bottom: 10px;">Резерв: ${item.reserve} ${item.symbol}</p>
                    <p class="currency_desc">${item.desc || 'Описание кассеты загружается...'}</p>
                    <button class="action_link_btn">Инициировать выдачу</button>
                </div>`;
        });
        container.innerHTML = cardsHTML;

        // Навешиваем слушатели
        container.querySelectorAll('.currency_card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Если кликнули по кнопкам CRUD, не открываем терминал
                if (!e.target.classList.contains('crud-btn-edit') && !e.target.classList.contains('crud-btn-del')) {
                    this.clickCard(e);
                }
            });
        });

        container.querySelectorAll('.crud-btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.openEditModal(parseInt(e.target.dataset.id)));
        });

        container.querySelectorAll('.crud-btn-del').forEach(btn => {
            btn.addEventListener('click', (e) => this.openDeleteModal(parseInt(e.target.dataset.id)));
        });
    }

    // --- ЛОГИКА МОДАЛОК ---
    openDeleteModal(id) {
        this.deleteTargetId = id;
        document.getElementById('confirm_modal').style.display = 'flex';
    }

    async confirmDelete() {
        if (!this.deleteTargetId) return;
        try {
            await fetch(`http://localhost:3000/api/currencies/${this.deleteTargetId}`, { method: 'DELETE' });
            document.getElementById('confirm_modal').style.display = 'none';
            this.deleteTargetId = null;
            await this.loadData();
        } catch(e) { console.error('Ошибка удаления', e); }
    }

    openEditModal(id) {
        const item = this.data.find(c => c.id === id);
        if (!item) return;
        document.getElementById('modal_title').innerText = '✏️ Модификация кассеты';
        document.getElementById('edit_id').value = item.id;
        document.getElementById('input_currency').value = item.currency;
        document.getElementById('input_symbol').value = item.symbol;
        document.getElementById('input_title').value = item.title;
        document.getElementById('input_reserve').value = item.reserve;
        document.getElementById('input_desc').value = item.desc;
        document.getElementById('input_src').value = item.src;
        document.getElementById('modal_error').style.display = 'none';
        document.getElementById('crud_modal').style.display = 'flex';
    }

    openAddModal() {
        document.getElementById('crud_form').reset();
        document.getElementById('edit_id').value = '';
        document.getElementById('modal_title').innerText = '➕ Добавление новой кассеты';
        document.getElementById('modal_error').style.display = 'none';
        document.getElementById('crud_modal').style.display = 'flex';
    }

    async submitForm(e) {
        e.preventDefault();
        const modalError = document.getElementById('modal_error');
        const id = document.getElementById('edit_id').value;
        const data = {
            currency: document.getElementById('input_currency').value.trim(),
            symbol: document.getElementById('input_symbol').value.trim(),
            title: document.getElementById('input_title').value.trim(),
            reserve: parseInt(document.getElementById('input_reserve').value.trim()),
            desc: document.getElementById('input_desc').value.trim(),
            src: document.getElementById('input_src').value.trim()
        };

        if (!data.currency || !data.symbol || !data.title || isNaN(data.reserve) || !data.desc || !data.src) {
            modalError.innerText = '❌ Пожалуйста, заполните все поля!';
            modalError.style.display = 'block';
            return;
        }

        try {
            if (id) {
                await fetch(`http://localhost:3000/api/currencies/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                await fetch(`http://localhost:3000/api/currencies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }
            document.getElementById('crud_modal').style.display = 'none';
            await this.loadData();
        } catch(e) {
            modalError.innerText = '❌ Ошибка при сохранении!';
            modalError.style.display = 'block';
        }
    }

    setupModalListeners() {
        document.getElementById('btn_open_add_modal').addEventListener('click', () => this.openAddModal());
        document.getElementById('btn_close_modal').addEventListener('click', () => document.getElementById('crud_modal').style.display = 'none');
        document.getElementById('crud_form').addEventListener('submit', (e) => this.submitForm(e));

        document.getElementById('btn_cancel_delete').addEventListener('click', () => document.getElementById('confirm_modal').style.display = 'none');
        document.getElementById('btn_confirm_delete').addEventListener('click', () => this.confirmDelete());
    }

    render() {
        this.parent.innerHTML = this.getHTML();
        const header = new HeaderComponent(document.getElementById('header-container'));
        header.render(false);
        this.setupModalListeners();
        this.loadData();
    }
}
