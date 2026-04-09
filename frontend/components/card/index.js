export class CurrencyCardComponent {
    constructor(parent) {
        this.parent = parent;
    }

    getHTML(data) {
        return `
            <div class="atm-card" id="card-${data.id}" data-id="${data.id}">
                <img src="${data.src}" alt="${data.title}">
                <h3>${data.title}</h3>
                <p style="color: var(--text-secondary); margin-top: 10px;">В резерве: <b>${data.reserve} ${data.currency}</b></p>
                <button class="btn-primary">Оформить заявку / 3D</button>
            </div>
        `;
    }

    addListeners(data, listener) {
        const cardElement = document.getElementById(`card-${data.id}`);
        if (cardElement) {
            cardElement.addEventListener("click", listener);
        }
    }

    render(data, listener) {
        const html = this.getHTML(data);
        this.parent.insertAdjacentHTML('beforeend', html);
        this.addListeners(data, listener);
    }
}
