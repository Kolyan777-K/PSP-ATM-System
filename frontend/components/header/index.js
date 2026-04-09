export class HeaderComponent {
    constructor(parent) {
        this.parent = parent;
    }

    getHTML(showBackButton = false) {
        // Кнопка стала большой: увеличил font-size и padding
        const leftZone = showBackButton
            ? `<button id="back-btn" class="sys_btn" style="border-color: var(--t-yellow); color: var(--t-yellow); font-size: 1.2rem; padding: 10px 25px; border-width: 2px;">← Назад</button>`
            : `<div class="bank_logo" id="logo_home">
                   <span class="logo_icon">V</span>
                   <span class="logo_text">ATM</span>
               </div>`;

        return `
            <header class="bank_header">
                <div style="display: flex; align-items: center;">
                    ${leftZone}
                </div>
                <div class="header_controls">
                    <button id="trigger_theme" class="sys_btn">Сменить тему</button>
                </div>
            </header>
        `;
    }

    initThemeSwitcher() {
        const btn = document.getElementById('trigger_theme');
        btn.addEventListener('click', () => {
            document.body.classList.toggle('light_theme');
        });
    }

    render(showBackButton = false, onBackClick = null) {
        this.parent.insertAdjacentHTML('beforeend', this.getHTML(showBackButton));
        this.initThemeSwitcher();

        if (showBackButton && onBackClick) {
            document.getElementById('back-btn').addEventListener('click', onBackClick);
        }
    }
}
