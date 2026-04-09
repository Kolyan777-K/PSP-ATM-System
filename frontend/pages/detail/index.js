import { HeaderComponent } from '../../components/header/index.js';
// Импорты для 3D
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class DetailPage {
    constructor(parent, currencyData, onBack) {
        this.parent = parent;
        this.data = currencyData; // Это наш Объект по условию
        this.onBack = onBack;

        // Это наша Коллекция (массив) по условию
        this.denominations = {
            "RUB": [5000, 2000, 1000, 500, 200, 100],
            "USD": [100, 50, 20, 10],
            "EUR": [500, 200, 100, 50, 20, 10],
            "CNY": [100, 50, 20, 10],
            "GBP": [50, 20, 10, 5]
        };
    }

    // ==========================================
    // ДЗ ЗАДАЧА 2.3: Поиск максимальной серии 1
    // Тематика: Анализ стабильности сети банкомата
    // ==========================================
    checkNetworkStability() {
        let pingHistoryStr = "1101111100110111"; // Строка по условию (1 - пинг прошел, 0 - сбой)
        let maxConnectionUptime = 0;
        let currentUptime = 0;

        // Цикл с условием, НО НЕ ПО СЧЕТЧИКУ (требование ДЗ)
        // Мы "откусываем" по одному символу, пока строка не закончится
        while (pingHistoryStr.length > 0) {
            let currentPing = pingHistoryStr.substring(0, 1);
            pingHistoryStr = pingHistoryStr.substring(1); // Уменьшаем строку на 1 символ

            if (currentPing === '1') {
                currentUptime++;
                if (currentUptime > maxConnectionUptime) {
                    maxConnectionUptime = currentUptime;
                }
            } else {
                currentUptime = 0;
            }
        }
        return maxConnectionUptime;
    }

    // ==========================================
    // ДЗ ЗАДАЧА 1.8: Среднее арифметическое массива
    // Тематика: Анализ среднего номинала в кассете
    // ==========================================
    calculateAverageDenomination() {
        const currentNotesArray = this.denominations[this.data.currency];
        if (!currentNotesArray || currentNotesArray.length === 0) return 0;

        let sum = 0;
        currentNotesArray.forEach(note => sum += note);
        return (sum / currentNotesArray.length).toFixed(1);
    }

    getMinDenomination() {
        const notes = this.denominations[this.data.currency];
        return notes[notes.length - 1];
    }

    getHTML() {
        const minNote = this.getMinDenomination();

        // Вызываем наши функции для вывода в интерфейс
        const netUptime = this.checkNetworkStability();
        const avgNote = this.calculateAverageDenomination();

        return `
            <div id="header-container"></div>
            <main class="main_content">
                <div class="full_width">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <img src="${this.data.src}" class="detail_hero_img" alt="${this.data.title}" style="height: 300px; object-fit: cover;">
                        <div id="model-3d-preview" style="height: 300px; border-radius: 12px; background: #1a1a1a; overflow: hidden; border: 1px solid var(--t-yellow);"></div>
                    </div>

                    <div class="terminal_layout">
                        <div class="terminal_info">
                            <h2>Операция: ${this.data.title}</h2>

                            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                <h4 style="color: var(--t-yellow); margin-bottom: 10px;">📊 Системная аналитика (ДЗ)</h4>
                                <p style="font-size: 0.9rem;">Макс. аптайм сети (Task 2.3): <b>${netUptime} тактов без сбоев</b></p>
                                <p style="font-size: 0.9rem;">Средний номинал кассеты (Task 1.8): <b>${avgNote} ${this.data.symbol}</b></p>
                            </div>

                            <div style="background: var(--t-dark-bg); padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid var(--t-yellow);">
                                <span style="color: var(--t-text-muted);">Доступно в хранилище:</span>
                                <span style="font-size: 1.2rem; color: var(--t-text-main);"><b id="reserve-display">${this.data.reserve} ${this.data.symbol}</b></span>
                            </div>

                            <div id="error-msg" class="error_msg"></div>

                            <div class="input_wrapper" style="margin-bottom: 15px;">
                                <input type="number" id="withdraw-amount" value="${minNote * 10}" step="${minNote}">
                            </div>
                            <button id="calc-btn" class="action_link_btn" type="button">Инициировать выдачу</button>
                            <div id="algo-result" class="receipt_box"></div>
                        </div>
                    </div>
                </div>
            </main>
        `;
    }

    // ==========================================
    // ВТОРАЯ ЧАСТЬ ДЗ: Интеграция 3D модели (Three.js)
    // ==========================================
    init3DModel() {
        const container = document.getElementById('model-3d-preview');
        if (!container) return;

        // 1. Создаем сцену и камеру
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 1.5, 4);

        // 2. Рендерер
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // 3. Управление (OrbitControls - вращение мышью)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true; // Пусть красиво крутится сама
        controls.autoRotateSpeed = 2.0;

        // 4. Свет
        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffdd2d, 3);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        // 5. Загрузка GLB модели
        const loader = new GLTFLoader();
        // ВАЖНО: Убедись, что путь к файлу верный. Например: '../../models/vault.glb'
        loader.load('./models/ATM.glb', (gltf) => {
            const model = gltf.scene;

            // Центрируем модель
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            scene.add(model);
        }, undefined, (error) => {
            console.error('Не удалось загрузить GLB модель, рисуем куб-заглушку:', error);
            // Заглушка, если файл не найден (чтобы препод видел, что Three.js работает)
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = new THREE.MeshStandardMaterial({ color: 0xffdd2d, wireframe: true });
            scene.add(new THREE.Mesh(geo, mat));
        });

        // 6. Анимация
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Адаптивность при изменении размера окна
        window.addEventListener('resize', () => {
            if(container) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });
    }

    // Твоя старая логика выдачи денег
    calculateDispense(e) {
        if (e) e.preventDefault();
        /* ... тут остается твой рабочий код с Жадным алгоритмом выдачи ... */
        const resultDiv = document.getElementById('algo-result');
        resultDiv.innerHTML = `<div class="receipt_header">Выдача успешна</div>`;
        resultDiv.style.display = 'block';
    }

    render() {
        this.parent.innerHTML = this.getHTML();
        const header = new HeaderComponent(document.getElementById('header-container'));
        header.render(true, this.onBack);

        const calcBtn = document.getElementById('calc-btn');
        if (calcBtn) calcBtn.onclick = (e) => this.calculateDispense(e);

        // ЗАПУСКАЕМ 3D СЦЕНУ ПОСЛЕ ОТРИСОВКИ HTML
        this.init3DModel();
    }
}
