-- =====================================================
-- База данных для СТО Level
-- =====================================================

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS sto_level
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sto_level;

-- =====================================================
-- Таблица: users (Пользователи)
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT 'ФИО пользователя',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email для входа',
    password VARCHAR(255) NOT NULL COMMENT 'Хеш пароля',
    car_brand VARCHAR(100) COMMENT 'Марка автомобиля',
    car_model VARCHAR(100) COMMENT 'Модель автомобиля',
    car_year INT COMMENT 'Год выпуска автомобиля',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата регистрации',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Таблица зарегистрированных пользователей';

-- =====================================================
-- Таблица: services (Услуги)
-- =====================================================
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(255) NOT NULL COMMENT 'Название услуги',
    category ENUM('repair', 'tuning') NOT NULL COMMENT 'Категория: ремонт или тюнинг',
    price DECIMAL(10,2) NOT NULL COMMENT 'Базовая цена услуги',
    description TEXT COMMENT 'Описание услуги',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Каталог услуг СТО';

-- =====================================================
-- Таблица: service_history (История услуг)
-- =====================================================
CREATE TABLE service_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT 'ID пользователя',
    service_id INT NOT NULL COMMENT 'ID услуги',
    service_date DATE NOT NULL COMMENT 'Дата оказания услуги',
    price_paid DECIMAL(10,2) NOT NULL COMMENT 'Фактическая цена',
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending' COMMENT 'Статус услуги',
    notes TEXT COMMENT 'Дополнительные заметки',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания записи',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_service_date (service_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='История оказанных услуг';

-- =====================================================
-- Таблица: reviews (Отзывы)
-- =====================================================
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT COMMENT 'ID пользователя (может быть NULL для гостей)',
    author_name VARCHAR(255) NOT NULL COMMENT 'Имя автора отзыва',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5) COMMENT 'Оценка от 1 до 5',
    review_text TEXT NOT NULL COMMENT 'Текст отзыва',
    car_info VARCHAR(255) COMMENT 'Информация об автомобиле',
    is_approved BOOLEAN DEFAULT FALSE COMMENT 'Одобрен ли отзыв',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания отзыва',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_rating (rating),
    INDEX idx_is_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Отзывы клиентов';

-- =====================================================
-- Таблица: contact_requests (Заявки с формы обратной связи)
-- =====================================================
CREATE TABLE contact_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT 'Имя клиента',
    phone VARCHAR(20) NOT NULL COMMENT 'Телефон',
    email VARCHAR(255) NOT NULL COMMENT 'Email',
    car_info VARCHAR(255) COMMENT 'Марка и модель автомобиля',
    message TEXT NOT NULL COMMENT 'Сообщение клиента',
    status ENUM('new', 'in_progress', 'completed', 'cancelled') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Заявки с формы обратной связи';

-- =====================================================
-- Наполнение таблицы services
-- =====================================================

INSERT INTO services (service_name, category, price, description) VALUES
-- Услуги ремонта
('Замена колодок', 'repair', 3500.00, 'Замена тормозных колодок передних и задних'),
('Ремонт подвески', 'repair', 8500.00, 'Диагностика и ремонт ходовой части'),
('Диагностика двигателя', 'repair', 2500.00, 'Компьютерная диагностика всех систем'),
('Замена масла', 'repair', 1800.00, 'Замена моторного масла и фильтров'),
('Шиномонтаж', 'repair', 2000.00, 'Замена и балансировка колес'),
('Обслуживание кондиционера', 'repair', 3000.00, 'Заправка и ремонт кондиционера'),

-- Услуги тюнинга
('Stage 1 - Базовый тюнинг', 'tuning', 35000.00, 'Чип-тюнинг, прирост до 30 л.с. Программная оптимизация, улучшение динамики, экономия топлива'),
('Stage 2 - Умеренный тюнинг', 'tuning', 75000.00, 'Чип-тюнинг + выхлопная система, прирост до 60 л.с. Включает Stage 1, спортивный выхлоп, улучшенную турбину, впускную систему'),
('Stage 3 - Максимальный тюнинг', 'tuning', 150000.00, 'Комплексная доработка, прирост до 150 л.с. Включает Stage 2, увеличенную турбину, интеркулер, усиленные форсунки, спортивную подвеску');

-- =====================================================
-- Примеры данных для демонстрации
-- =====================================================

-- Добавление тестовых пользователей
-- Пароль для всех: "password123" (в реальности должен быть хеш)
INSERT INTO users (name, email, password, car_brand, car_model, car_year) VALUES
('Иванов Алексей Петрович', 'ivanov@mail.ru', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789', 'BMW', 'M3', 2020),
('Петров Дмитрий Сергеевич', 'petrov@gmail.com', '$2y$10$defghijklmnopqrstuvwxyz123456789abc', 'Audi', 'A6', 2019),
('Смирнов Максим Владимирович', 'smirnov@yandex.ru', '$2y$10$ghijklmnopqrstuvwxyz123456789abcdef', 'Volkswagen', 'Golf R', 2021);

-- Добавление истории услуг
INSERT INTO service_history (user_id, service_id, service_date, price_paid, status, notes) VALUES
(1, 8, '2025-10-03', 75000.00, 'completed', 'Stage 2 тюнинг на BMW M3. Клиент очень доволен результатом'),
(2, 2, '2025-10-03', 8500.00, 'completed', 'Замена амортизаторов и сайлентблоков'),
(3, 7, '2025-10-03', 35000.00, 'completed', 'Базовый чип-тюнинг Golf R'),
(1, 1, '2025-10-04', 3500.00, 'pending', 'Запланирована замена тормозных колодок');

-- Добавление отзывов
INSERT INTO reviews (user_id, author_name, rating, review_text, car_info, is_approved) VALUES
(1, 'Алексей Иванов', 5, 'Отличный сервис! Сделали Stage 2 на мою BMW. Машина преобразилась, динамика стала просто невероятной. Ребята знают свое дело!', 'BMW M3 • Stage 2', TRUE),
(2, 'Дмитрий Петров', 5, 'Обращался за ремонтом подвески. Все сделали быстро и качественно. Цены адекватные, мастера профессионалы. Буду обращаться еще!', 'Audi A6 • Ремонт подвески', TRUE),
(3, 'Максим Смирнов', 5, 'Лучшее СТО в городе! Делали чип-тюнинг на мой Golf R. Прирост мощности ощутим, расход даже немного снизился. Рекомендую всем!', 'VW Golf R • Stage 1', TRUE);

-- =====================================================
-- Полезные представления (Views)
-- =====================================================

-- Представление для получения полной информации о пользователе и его заказах
CREATE VIEW user_full_info AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.car_brand,
    u.car_model,
    u.car_year,
    COUNT(DISTINCT sh.id) as total_services,
    SUM(sh.price_paid) as total_spent,
    MAX(sh.service_date) as last_service_date
FROM users u
LEFT JOIN service_history sh ON u.id = sh.user_id
GROUP BY u.id;

-- Представление для статистики по услугам
CREATE VIEW service_statistics AS
SELECT 
    s.id,
    s.service_name,
    s.category,
    s.price as base_price,
    COUNT(sh.id) as times_ordered,
    AVG(sh.price_paid) as avg_price_paid,
    SUM(sh.price_paid) as total_revenue
FROM services s
LEFT JOIN service_history sh ON s.id = sh.service_id
GROUP BY s.id;

-- =====================================================
-- Хранимые процедуры
-- =====================================================

-- Процедура для регистрации нового пользователя
DELIMITER //
CREATE PROCEDURE register_user(
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_car_brand VARCHAR(100),
    IN p_car_model VARCHAR(100),
    IN p_car_year INT
)
BEGIN
    -- Проверка существования пользователя
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Пользователь с таким email уже существует';
    ELSE
        INSERT INTO users (name, email, password, car_brand, car_model, car_year)
        VALUES (p_name, p_email, p_password, p_car_brand, p_car_model, p_car_year);
        
        SELECT LAST_INSERT_ID() as user_id, 'Регистрация успешна' as message;
    END IF;
END //
DELIMITER ;

-- Процедура для добавления услуги в историю
DELIMITER //
CREATE PROCEDURE add_service_to_history(
    IN p_user_id INT,
    IN p_service_id INT,
    IN p_service_date DATE,
    IN p_price_paid DECIMAL(10,2),
    IN p_notes TEXT
)
BEGIN
    INSERT INTO service_history (user_id, service_id, service_date, price_paid, notes)
    VALUES (p_user_id, p_service_id, p_service_date, p_price_paid, p_notes);
    
    SELECT LAST_INSERT_ID() as history_id, 'Услуга добавлена в историю' as message;
END //
DELIMITER ;

-- Процедура для получения истории услуг пользователя
DELIMITER //
CREATE PROCEDURE get_user_service_history(IN p_user_id INT)
BEGIN
    SELECT 
        sh.id,
        s.service_name,
        s.category,
        sh.service_date,
        sh.price_paid,
        sh.status,
        sh.notes,
        sh.created_at
    FROM service_history sh
    JOIN services s ON sh.service_id = s.id
    WHERE sh.user_id = p_user_id
    ORDER BY sh.service_date DESC;
END //
DELIMITER ;

-- =====================================================
-- Триггеры
-- =====================================================

-- Триггер для логирования изменений в истории услуг
CREATE TABLE service_history_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    history_id INT,
    action VARCHAR(50),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER //
CREATE TRIGGER log_service_status_change
AFTER UPDATE ON service_history
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO service_history_log (history_id, action, old_status, new_status)
        VALUES (NEW.id, 'status_change', OLD.status, NEW.status);
    END IF;
END //
DELIMITER ;

-- =====================================================
-- Примеры запросов
-- =====================================================

-- Пример 1: Получить всех пользователей с их автомобилями
-- SELECT id, name, email, CONCAT(car_brand, ' ', car_model, ' (', car_year, ')') as car 
-- FROM users;

-- Пример 2: Получить историю услуг конкретного пользователя
-- CALL get_user_service_history(1);

-- Пример 3: Получить статистику по услугам
-- SELECT * FROM service_statistics ORDER BY times_ordered DESC;

-- Пример 4: Получить топ-5 самых популярных услуг
-- SELECT service_name, times_ordered, total_revenue 
-- FROM service_statistics 
-- ORDER BY times_ordered DESC 
-- LIMIT 5;

-- Пример 5: Получить пользователей, потративших больше 50000 рублей
-- SELECT name, email, total_spent 
-- FROM user_full_info 
-- WHERE total_spent > 50000 
-- ORDER BY total_spent DESC;

-- Пример 6: Зарегистрировать нового пользователя
-- CALL register_user(
--     'Сидоров Иван Иванович',
--     'sidorov@mail.ru',
--     '$2y$10$hashedpassword',
--     'Mercedes',
--     'C63 AMG',
--     2022
-- );

-- Пример 7: Добавить услугу в историю
-- CALL add_service_to_history(1, 8, '2025-10-05', 75000.00, 'Stage 2 тюнинг');
