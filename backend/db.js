const { Pool } = require('pg');
require('dotenv').config();

// Создание пула подключений к PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'stolevel',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20, // максимальное количество клиентов в пуле
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Проверка подключения
pool.on('connect', () => {
    console.log('✅ Подключено к базе данных PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Неожиданная ошибка подключения к БД:', err);
    process.exit(-1);
});

// Вспомогательная функция для выполнения запросов
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Выполнен запрос:', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error);
        throw error;
    }
};

// Вспомогательная функция для транзакций
const getClient = () => {
    return pool.connect();
};

module.exports = {
    query,
    getClient,
    pool
};