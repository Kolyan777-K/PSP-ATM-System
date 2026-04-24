const express = require('express');
const router = express.Router();
const currenciesService = require('../services/currenciesService');

router.post('/', (req, res) => {
    currenciesService.createCurrency(req.body, (err, newCurrency) => {
        if (err) return res.status(500).json({ error: "Ошибка сервера при добавлении валюты" });
        res.status(201).json(newCurrency);
    });
});

// Вот эта строчка супер-важная, из-за её отсутствия и бывает твоя ошибка!
module.exports = router;
