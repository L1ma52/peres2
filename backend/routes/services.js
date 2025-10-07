const express = require('express');
const router = express.Router();
const db = require('../db');

// Получить все услуги
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        
        let query = 'SELECT * FROM services';
        let params = [];

        if (category) {
            query += ' WHERE category = $1';
            params.push(category);
        }

        query += ' ORDER BY category, price';

        const result = await db.query(query, params);
        res.json({ services: result.rows });
    } catch (error) {
        console.error('Ошибка получения услуг:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить конкретную услугу
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Услуга не найдена' });
        }

        res.json({ service: result.rows[0] });
    } catch (error) {
        console.error('Ошибка получения услуги:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить услуги по категории (repair или tuning)
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!['repair', 'tuning'].includes(category)) {
            return res.status(400).json({ error: 'Неверная категория' });
        }

        const result = await db.query(
            'SELECT * FROM services WHERE category = $1 ORDER BY price',
            [category]
        );

        res.json({ services: result.rows });
    } catch (error) {
        console.error('Ошибка получения услуг по категории:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;