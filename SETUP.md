# Быстрая установка и запуск - СТО Level

## 📋 Предварительные требования

1. **Node.js** (версия 14 или выше)
   ```bash
   node --version
   ```

2. **PostgreSQL** (версия 12 или выше)
   ```bash
   psql --version
   ```

3. **npm** (обычно устанавливается с Node.js)
   ```bash
   npm --version
   ```

---

## 🚀 Быстрый старт

### Шаг 1: Установка зависимостей

```bash
npm install
```

### Шаг 2: Настройка базы данных

#### 2.1. Создайте базу данных PostgreSQL

```bash
# Войдите в PostgreSQL
sudo -u postgres psql

# Создайте базу данных
CREATE DATABASE stolevel;

# Создайте пользователя (опционально)
CREATE USER stouser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stolevel TO stouser;

# Выйдите
\q
```

#### 2.2. Инициализируйте схему базы данных

```bash
# Метод 1: Используя psql напрямую
psql stolevel < database-schema.sql

# Метод 2: С указанием пользователя
psql -U postgres -d stolevel -f database-schema.sql

# Метод 3: Если настроили пользователя
psql -U stouser -d stolevel -f database-schema.sql
```

### Шаг 3: Настройте переменные окружения

```bash
# Скопируйте пример файла
cp .env.example .env

# Отредактируйте .env своими данными
nano .env
```

Пример `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stolevel
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
JWT_SECRET=your_very_secret_jwt_key_12345
NODE_ENV=development
```

### Шаг 4: Запустите сервер

```bash
# Обычный запуск
npm start

# Или с автоперезагрузкой (для разработки)
npm run dev
```

Сервер запустится на `http://localhost:3000`

---

## ✅ Проверка работоспособности

### 1. Проверьте Health Check

```bash
curl http://localhost:3000/api/health
```

Должен вернуть:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

### 2. Получите список услуг

```bash
curl http://localhost:3000/api/services
```

### 3. Запустите полный тест API

```bash
./test-api.sh
```

---

## 📁 Структура проекта

```
sto-level/
│
├── backend/                    # Backend код
│   ├── server.js              # Главный файл сервера
│   ├── db.js                  # Подключение к БД
│   ├── routes/                # API маршруты
│   │   ├── auth.js           # Аутентификация
│   │   ├── services.js       # Услуги
│   │   ├── service-history.js # История
│   │   ├── reviews.js        # Отзывы
│   │   └── contact.js        # Контакты
│   └── middleware/           # Middleware
│       └── auth.js           # JWT аутентификация
│
├── database-schema.sql        # SQL схема БД
├── database-demo.html         # Визуализация схемы
├── package.json              # Зависимости
├── .env.example              # Пример конфигурации
├── .gitignore               # Git ignore
├── test-api.sh              # Тест скрипт
├── API_DOCUMENTATION.md      # API документация
├── SETUP.md                 # Это руководство
└── README.md                # Основная документация
```

---

## 🔧 Полезные команды

### База данных

```bash
# Подключиться к БД
psql stolevel

# Посмотреть все таблицы
\dt

# Посмотреть структуру таблицы
\d users

# Посмотреть данные
SELECT * FROM services;

# Пересоздать БД (ВНИМАНИЕ: удалит все данные!)
dropdb stolevel
createdb stolevel
psql stolevel < database-schema.sql
```

### Разработка

```bash
# Установить зависимости
npm install

# Запустить сервер
npm start

# Запустить с автоперезагрузкой
npm run dev

# Инициализировать БД из npm
npm run init-db
```

### Тестирование

```bash
# Запустить тесты API
./test-api.sh

# ПроверитьHealth
curl http://localhost:3000/api/health

# Посмотреть API документацию
curl http://localhost:3000/api
```

---

## 🐛 Устранение неполадок

### Проблема: "Cannot connect to database"

**Решение:**
1. Проверьте, что PostgreSQL запущен:
   ```bash
   sudo systemctl status postgresql
   # или
   sudo service postgresql status
   ```

2. Проверьте настройки в `.env`

3. Проверьте доступность БД:
   ```bash
   psql -U postgres -d stolevel -c "SELECT 1"
   ```

### Проблема: "Port 3000 already in use"

**Решение:**
1. Измените порт в `.env`:
   ```env
   PORT=3001
   ```

2. Или остановите процесс на порту 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

### Проблема: "JWT secret not set"

**Решение:**
Убедитесь, что в `.env` установлен `JWT_SECRET`:
```env
JWT_SECRET=your_very_secret_key_here
```

### Проблема: "Module not found"

**Решение:**
Переустановите зависимости:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Дополнительная информация

- **API Документация**: См. `API_DOCUMENTATION.md`
- **Схема БД**: Откройте `database-demo.html` в браузере
- **Основная документация**: См. `README.md`

---

## 🎯 Что дальше?

1. ✅ Создайте фронтенд (`index.html`, `styles.css`, `script.js`)
2. ✅ Интегрируйте фронтенд с API
3. ✅ Добавьте обработку корзины
4. ✅ Реализуйте личный кабинет
5. ✅ Добавьте админ-панель (опционально)

---

## 💡 Советы

- Используйте `npm run dev` во время разработки для автоматической перезагрузки
- Регулярно делайте резервные копии БД
- Храните `.env` в секрете и не коммитьте в git
- Используйте сильные пароли для production
- Для production используйте переменные окружения сервера вместо `.env`

---

**Успешной разработки! 🚗💨**