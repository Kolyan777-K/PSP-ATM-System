const fs = require('fs');
const path = require('path');
const DATA_PATH = path.join(__dirname, '../data/currencies.json');

const createCurrency = (data, callback) => {
    fs.readFile(DATA_PATH, 'utf8', (err, fileData) => {
        if (err) return callback(err);

        const currencies = JSON.parse(fileData);
        const newId = currencies.length > 0 ? Math.max(...currencies.map(c => c.id)) + 1 : 1;
        const newCurrency = { id: newId, ...data };

        currencies.push(newCurrency);
        fs.writeFile(DATA_PATH, JSON.stringify(currencies, null, 2), (writeErr) => {
            if (writeErr) return callback(writeErr);
            callback(null, newCurrency);
        });
    });
};

module.exports = { createCurrency };
