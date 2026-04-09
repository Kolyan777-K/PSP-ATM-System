const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'currencies.json');

// 1. Получение всех валют
app.get('/api/currencies', (req, res) => {
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Ошибка чтения" });
        res.json(JSON.parse(data));
    });
});

// 2. ОБНОВЛЕНИЕ РЕЗЕРВА (PATCH) — то, что ты просил
app.patch('/api/currencies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { amount } = req.body; // Получаем сумму снятия

    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Ошибка чтения" });

        let currencies = JSON.parse(data);
        const index = currencies.findIndex(c => c.id === id);

        if (index !== -1) {
            // УМЕНЬШАЕМ РЕЗЕРВ
            if (currencies[index].reserve >= amount) {
                currencies[index].reserve -= amount;

                // Записываем обновленные данные обратно в файл
                fs.writeFile(DATA_PATH, JSON.stringify(currencies, null, 2), (err) => {
                    if (err) return res.status(500).json({ error: "Ошибка записи" });
                    res.json(currencies[index]); // Отправляем обновленную карточку обратно
                });
            } else {
                res.status(400).json({ error: "Недостаточно средств в резерве" });
            }
        } else {
            res.status(404).json({ error: "Валюта не найдена" });
        }
    });
});

// Добавь это в backend/src/index.js перед app.listen

// 3. ДОБАВЛЕНИЕ новой валюты (POST)
app.post('/api/currencies', (req, res) => {
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        const currencies = JSON.parse(data);
        const newCurrency = { id: Date.now(), ...req.body };
        currencies.push(newCurrency);
        fs.writeFile(DATA_PATH, JSON.stringify(currencies, null, 2), () => {
            res.status(201).json(newCurrency);
        });
    });
});

// 4. УДАЛЕНИЕ валюты (DELETE)
app.delete('/api/currencies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        let currencies = JSON.parse(data);
        currencies = currencies.filter(c => c.id !== id);
        fs.writeFile(DATA_PATH, JSON.stringify(currencies, null, 2), () => {
            res.status(204).send();
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер V ATM запущен на http://localhost:${PORT}`);
});
