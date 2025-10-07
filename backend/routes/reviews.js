const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuth } = require('../middleware/auth');

// Получить все отзывы
router.get('/', async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;

        const result = await db.query(
            `SELECT id, full_name, rating, comment, created_at
             FROM reviews
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await db.query('SELECT COUNT(*) FROM reviews');

        res.json({
            reviews: result.rows,
            total: parseInt(countResult.rows[0].count)
        });
    } catch (error) {
        console.error('Ошибка получения отзывов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавить отзыв
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { full_name, rating, comment } = req.body;

        if (!full_name || !rating || !comment) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
        }

        const user_id = req.user ? req.user.id : null;

        const result = await db.query(
            `INSERT INTO reviews (user_id, full_name, rating, comment)
             VALUES ($1, $2, $3, $4)
             RETURNING id, full_name, rating, comment, created_at`,
            [user_id, full_name, rating, comment]
        );

        res.status(201).json({
            message: 'Отзыв успешно добавлен',
            review: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка добавления отзыва:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить средний рейтинг
router.get('/average', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                AVG(rating) as average_rating,
                COUNT(*) as total_reviews
             FROM reviews`
        );

        res.json({
            average_rating: parseFloat(result.rows[0].average_rating || 0).toFixed(1),
            total_reviews: parseInt(result.rows[0].total_reviews)
        });
    } catch (error) {
        console.error('Ошибка получения среднего рейтинга:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;