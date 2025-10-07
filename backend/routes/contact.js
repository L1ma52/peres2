const express = require('express');
const router = express.Router();
const db = require('../db');

// Отправить сообщение через форму обратной связи
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Заполните все обязательные поля' });
        }

        // Простая валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Неверный формат email' });
        }

        const result = await db.query(
            `INSERT INTO contact_requests (name, email, phone, message, status)
             VALUES ($1, $2, $3, $4, 'new')
             RETURNING id, created_at`,
            [name, email, phone || null, message]
        );

        res.status(201).json({
            message: 'Сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.',
            request_id: result.rows[0].id
        });
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить все заявки (для админки, можно добавить auth)
router.get('/', async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM contact_requests';
        let params = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const result = await db.query(query, params);

        res.json({ requests: result.rows });
    } catch (error) {
        console.error('Ошибка получения заявок:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;