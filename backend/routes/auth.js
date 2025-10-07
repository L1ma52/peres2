const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Регистрация пользователя
router.post('/register', async (req, res) => {
    try {
        const { full_name, email, password, car_brand, car_model, car_year } = req.body;

        // Валидация
        if (!full_name || !email || !password) {
            return res.status(400).json({ error: 'Заполните все обязательные поля' });
        }

        // Проверка существующего пользователя
        const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Хеширование пароля
        const password_hash = await bcrypt.hash(password, 10);

        // Создание пользователя
        const result = await db.query(
            `INSERT INTO users (full_name, email, password_hash, car_brand, car_model, car_year)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, full_name, email, car_brand, car_model, car_year, created_at`,
            [full_name, email, password_hash, car_brand, car_model, car_year]
        );

        const user = result.rows[0];

        // Создание JWT токена
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                car_brand: user.car_brand,
                car_model: user.car_model,
                car_year: user.car_year
            }
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Ошибка сервера при регистрации' });
    }
});

// Вход пользователя
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Введите email и пароль' });
        }

        // Поиск пользователя
        const result = await db.query(
            'SELECT id, full_name, email, password_hash, car_brand, car_model, car_year FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const user = result.rows[0];

        // Проверка пароля
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Успешный вход',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                car_brand: user.car_brand,
                car_model: user.car_model,
                car_year: user.car_year
            }
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Ошибка сервера при входе' });
    }
});

// Получение профиля пользователя
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, full_name, email, car_brand, car_model, car_year, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновление профиля пользователя
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { full_name, car_brand, car_model, car_year } = req.body;

        const result = await db.query(
            `UPDATE users 
             SET full_name = COALESCE($1, full_name),
                 car_brand = COALESCE($2, car_brand),
                 car_model = COALESCE($3, car_model),
                 car_year = COALESCE($4, car_year),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id, full_name, email, car_brand, car_model, car_year`,
            [full_name, car_brand, car_model, car_year, req.user.id]
        );

        res.json({
            message: 'Профиль успешно обновлен',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;