import { MainPage } from '../pages/main/index.js';

const root = document.getElementById('root');

if (root) {
    const mainPage = new MainPage(root);
    mainPage.render();
} else {
    console.error("Элемент #root не найден в index.html!");
}
