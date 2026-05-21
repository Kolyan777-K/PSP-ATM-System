class CurrencyUrls {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    getCurrencies() {
        return `${this.baseUrl}/currencies`;
    }

    getCurrencyById(id) {
        return `${this.baseUrl}/currencies/${id}`;
    }

    createCurrency() {
        return `${this.baseUrl}/currencies`;
    }

    // ВОТ ЭТОТ МЕТОД МЫ ЗАБЫЛИ ДОБАВИТЬ ДЛЯ РЕДАКТИРОВАНИЯ И ВЫДАЧИ!
    updateCurrency(id) {
        return `${this.baseUrl}/currencies/${id}`;
    }

    deleteCurrency(id) {
        return `${this.baseUrl}/currencies/${id}`;
    }
}

export const currencyUrls = new CurrencyUrls();
