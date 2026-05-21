const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Для 6 лабы он уже особо не нужен, но пусть будет

const currenciesRouter = require('./routes/currencies');

const app = express();
const PORT = 3000;

// === ВОТ ЭТА САМАЯ ГЛАВНАЯ СТРОЧКА ДЛЯ 6 ЛАБЫ ===
// Она берет собранный фронтенд из папки public и раздает его как статику!
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'currencies.json');

app.use('/api/currencies', currenciesRouter);

// ... дальше твои старые app.get, app.patch и т.д.
// ... дальше идут app.get, app.patch и т.д.

app.get('/api/currencies', (req, res) => {
    const { title, currency, reserve_min, reserve_max } = req.query;

    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Ошибка чтения базы данных" });

        let currencies = JSON.parse(data);

        if (title) {
            currencies = currencies.filter(c =>
                c.title.toLowerCase().includes(title.toLowerCase())
            );
        }

        if (currency) {
            currencies = currencies.filter(c =>
                c.currency.toLowerCase() === currency.toLowerCase()
            );
        }

        if (reserve_min) {
            currencies = currencies.filter(c => c.reserve >= parseInt(reserve_min));
        }

        if (reserve_max) {
            currencies = currencies.filter(c => c.reserve <= parseInt(reserve_max));
        }

        res.json(currencies);
    });
});

app.get('/api/currencies/:id', (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Ошибка чтения" });

        const currencies = JSON.parse(data);
        const currency = currencies.find(c => c.id === id);

        if (currency) {
            res.json(currency);
        } else {
            res.status(404).json({ error: "Кассета не найдена" });
        }
    });
});

// POST ЗАПРОС УДАЛЕН ОТСЮДА, ТАК КАК ОН ТЕПЕРЬ В routes/currencies.js

app.patch('/api/currencies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const body = req.body;

    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Ошибка чтения" });

        let currencies = JSON.parse(data);
        const index = currencies.findIndex(c => c.id === id);

        if (index !== -1) {
            // Если пришел запрос на выдачу купюр (есть поле amount)
            if (body.amount !== undefined) {
                if (currencies[index].reserve >= body.amount) {
                    currencies[index].reserve -= body.amount;
                } else {
                    return res.status(400).json({ error: "Недостаточно средств в резерве" });
                }
            }
            // Если пришел запрос на редактирование из модалки (обновляем все поля)
            else {
                currencies[index] = { ...currencies[index], ...body };
            }

            fs.writeFile(DATA_PATH, JSON.stringify(currencies, null, 2), (err) => {
                if (err) return res.status(500).json({ error: "Ошибка записи" });
                res.json(currencies[index]);
            });
        } else {
            res.status(404).json({ error: "Валюта не найдена" });
        }
    });
});

app.delete('/api/currencies/:id', (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile(DATA_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Ошибка чтения" });

        let currencies = JSON.parse(data);
        currencies = currencies.filter(c => c.id !== id);

        fs.writeFile(DATA_PATH, JSON.stringify(currencies, null, 2), () => {
            res.status(200).json({ message: "Кассета успешно удалена" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер V ATM запущен на http://localhost:${PORT}`);
});
