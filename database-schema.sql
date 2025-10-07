-- База данных для автосервиса СТО Level
-- PostgreSQL версия 12+

-- Удаление существующих таблиц (если нужно пересоздать)
DROP TABLE IF EXISTS contact_requests CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS service_history CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    car_brand VARCHAR(100),
    car_model VARCHAR(100),
    car_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица услуг
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('repair', 'tuning')),
    stage VARCHAR(20), -- Для тюнинга: stage1, stage2, stage3
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица истории оказанных услуг
CREATE TABLE service_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    service_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица отзывов клиентов
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заявок с формы обратной связи
CREATE TABLE contact_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для улучшения производительности
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_service_history_user_id ON service_history(user_id);
CREATE INDEX idx_service_history_service_id ON service_history(service_id);
CREATE INDEX idx_service_history_date ON service_history(service_date);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_services_category ON services(category);

-- Вставка начальных данных - Услуги ремонта
INSERT INTO services (name, description, price, category) VALUES
('Замена колодок', 'Замена передних и задних тормозных колодок', 3500.00, 'repair'),
('Ремонт подвески', 'Диагностика и ремонт подвески автомобиля', 8500.00, 'repair'),
('Диагностика двигателя', 'Компьютерная диагностика двигателя', 2500.00, 'repair'),
('Замена масла', 'Замена моторного масла и масляного фильтра', 1800.00, 'repair'),
('Шиномонтаж', 'Снятие, установка и балансировка колес', 2000.00, 'repair'),
('Обслуживание кондиционера', 'Заправка и чистка системы кондиционирования', 3000.00, 'repair');

-- Вставка начальных данных - Услуги тюнинга
INSERT INTO services (name, description, price, category, stage) VALUES
('Stage 1 - Базовый тюнинг', 'Чип-тюнинг ECU, увеличение мощности на 15-20%', 35000.00, 'tuning', 'stage1'),
('Stage 2 - Умеренный тюнинг', 'Чип-тюнинг + выхлопная система, увеличение мощности на 25-35%', 75000.00, 'tuning', 'stage2'),
('Stage 3 - Максимальный тюнинг', 'Полный тюнинг двигателя с турбиной, увеличение мощности на 50%+', 150000.00, 'tuning', 'stage3');

-- Вставка тестовых отзывов
INSERT INTO reviews (full_name, rating, comment) VALUES
('Иван Петров', 5, 'Отличный сервис! Быстро и качественно провели тюнинг моей BMW. Рекомендую!'),
('Мария Сидорова', 5, 'Профессиональная команда. Решили проблему с подвеской за один день.'),
('Алексей Коваль', 4, 'Хорошее соотношение цены и качества. Буду обращаться еще.'),
('Дмитрий Новиков', 5, 'Stage 2 тюнинг превзошел все ожидания! Машина просто летает!');

-- Функция для автоматического обновления поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Зарегистрированные пользователи системы';
COMMENT ON TABLE services IS 'Каталог услуг автосервиса';
COMMENT ON TABLE service_history IS 'История оказанных услуг';
COMMENT ON TABLE reviews IS 'Отзывы клиентов';
COMMENT ON TABLE contact_requests IS 'Заявки с формы обратной связи';