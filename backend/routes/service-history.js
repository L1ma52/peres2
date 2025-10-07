const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Получить историю услуг текущего пользователя
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                sh.id,
                sh.service_date,
                sh.price,
                sh.status,
                sh.notes,
                s.name as service_name,
                s.description as service_description,
                s.category
             FROM service_history sh
             JOIN services s ON sh.service_id = s.id
             WHERE sh.user_id = $1
             ORDER BY sh.service_date DESC`,
            [req.user.id]
        );

        res.json({ history: result.rows });
    } catch (error) {
        console.error('Ошибка получения истории:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавить запись в историю (оформление заказа)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { items } = req.body; // массив объектов {service_id, price, notes}

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Необходимо указать услуги' });
        }

        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const insertedRecords = [];

            for (const item of items) {
                const result = await client.query(
                    `INSERT INTO service_history (user_id, service_id, price, status, notes)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id, service_date, price, status`,
                    [req.user.id, item.service_id, item.price, 'pending', item.notes || null]
                );
                insertedRecords.push(result.rows[0]);
            }

            await client.query('COMMIT');

            res.status(201).json({
                message: 'Заказ успешно оформлен',
                records: insertedRecords
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить статистику по услугам пользователя
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                COUNT(*) as total_services,
                SUM(price) as total_spent,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_services
             FROM service_history
             WHERE user_id = $1`,
            [req.user.id]
        );

        res.json({ stats: result.rows[0] });
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;