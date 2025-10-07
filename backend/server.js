const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const serviceHistoryRoutes = require('./routes/service-history');
const reviewsRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Статические файлы (фронтенд)
app.use(express.static(path.join(__dirname, '..')));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/service-history', serviceHistoryRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/contact', contactRoutes);

// Базовый маршрут API
app.get('/api', (req, res) => {
    res.json({
        message: 'API автосервиса СТО Level',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile (требует auth)',
                updateProfile: 'PUT /api/auth/profile (требует auth)'
            },
            services: {
                getAll: 'GET /api/services',
                getOne: 'GET /api/services/:id',
                getByCategory: 'GET /api/services/category/:category'
            },
            serviceHistory: {
                getHistory: 'GET /api/service-history (требует auth)',
                createOrder: 'POST /api/service-history (требует auth)',
                getStats: 'GET /api/service-history/stats (требует auth)'
            },
            reviews: {
                getAll: 'GET /api/reviews',
                create: 'POST /api/reviews',
                getAverage: 'GET /api/reviews/average'
            },
            contact: {
                send: 'POST /api/contact',
                getAll: 'GET /api/contact'
            }
        }
    });
});

// Проверка здоровья сервера
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
});

// Обработка несуществующих API маршрутов
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint не найден' });
});

// Для всех остальных запросов возвращаем index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   🚗 СТО Level API Server                 ║
║   🌐 Сервер запущен на порту ${PORT}        ║
║   📝 API документация: http://localhost:${PORT}/api
║   🏥 Health check: http://localhost:${PORT}/api/health
╚════════════════════════════════════════════╝
    `);
});

// Обработка завершения работы
process.on('SIGTERM', async () => {
    console.log('SIGTERM получен, завершение работы...');
    await db.pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT получен, завершение работы...');
    await db.pool.end();
    process.exit(0);
});

module.exports = app;