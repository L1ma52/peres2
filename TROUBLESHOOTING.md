# 🔧 Решение проблем при развертывании

Руководство по устранению частых проблем при деплое СТО Level.

---

## 📋 Содержание

1. [Проблемы с базой данных](#проблемы-с-базой-данных)
2. [Проблемы с Backend](#проблемы-с-backend)
3. [Проблемы с Frontend](#проблемы-с-frontend)
4. [CORS ошибки](#cors-ошибки)
5. [SSL/HTTPS проблемы](#ssl-https-проблемы)
6. [Проблемы производительности](#проблемы-производительности)

---

## Проблемы с базой данных

### ❌ "password authentication failed"

**Причина:** Неверный пароль в переменных окружения

**Решение:**
```bash
# Проверьте переменные окружения
echo $DB_PASSWORD

# Render: Проверьте Environment Variables
# Railway: Проверьте Variables
# VPS: Проверьте файл .env

# Убедитесь, что пароль совпадает с паролем БД
```

### ❌ "ECONNREFUSED" или "could not connect to server"

**Причина:** База данных недоступна или неверный хост

**Решение:**

**Для Render:**
```bash
# Используйте INTERNAL Database URL (не External)
DATABASE_URL=postgresql://user:pass@dpg-xxx-a.oregon-postgres.render.com/stolevel
```

**Для VPS:**
```bash
# Проверьте, запущен ли PostgreSQL
sudo systemctl status postgresql

# Если не запущен:
sudo systemctl start postgresql

# Проверьте порт
sudo netstat -tlnp | grep 5432
```

### ❌ "relation does not exist" (таблица не найдена)

**Причина:** Схема базы данных не импортирована

**Решение:**

**Render:**
1. Dashboard → PostgreSQL → Shell
2. Вставьте содержимое `database-schema.sql`

**Railway:**
1. PostgreSQL → Data → Query
2. Вставьте содержимое `database-schema.sql`

**VPS:**
```bash
psql -U stouser -d stolevel -f database-schema.sql
```

### ❌ "SSL connection is required"

**Причина:** Managed база требует SSL

**Решение:**

Обновите `backend/db.js`:
```javascript
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});
```

---

## Проблемы с Backend

### ❌ "Application failed to respond"

**Причина:** Backend не запускается или вылетает

**Решение:**

**Проверьте логи:**
- Render: Dashboard → Logs
- Railway: Service → Deployments → Logs
- VPS: `pm2 logs sto-level`

**Частые причины:**
1. Ошибка в коде
2. Отсутствует зависимость в `package.json`
3. Неверные переменные окружения

### ❌ "Cannot find module 'dotenv'"

**Причина:** Не установлены зависимости

**Решение:**
```bash
# Локально
npm install

# Проверьте, что в package.json есть:
{
  "dependencies": {
    "dotenv": "^16.3.1",
    ...
  }
}

# Закоммитьте изменения
git add package.json
git commit -m "Add missing dependencies"
git push
```

### ❌ "Port already in use"

**Причина:** Порт занят другим процессом

**Решение:**

**VPS:**
```bash
# Найдите процесс на порту 3000
sudo lsof -ti:3000

# Убейте процесс
sudo kill -9 $(sudo lsof -ti:3000)

# Или используйте другой порт в .env
PORT=3001
```

### ❌ Backend засыпает (Render Free)

**Причина:** Бесплатный план Render усыпляет приложения после 15 минут

**Решение:**
1. **Апгрейд на платный план** ($7/мес)
2. **Используйте ping сервис:**
   - UptimeRobot (пингует каждые 5 минут)
   - Настройте на вашем фронтенде:
   ```javascript
   // Пинговать API каждые 10 минут
   setInterval(() => {
       fetch('https://your-api.onrender.com/api/health')
           .catch(() => {});
   }, 10 * 60 * 1000);
   ```

---

## Проблемы с Frontend

### ❌ "Failed to fetch" или "Network Error"

**Причина:** Неверный API URL или CORS

**Решение:**

Проверьте `API_URL` в вашем `script.js`:
```javascript
// Должно быть:
const API_URL = 'https://your-backend.onrender.com/api';

// НЕ:
const API_URL = 'http://localhost:3000/api';
```

### ❌ Статические файлы не загружаются (404)

**Причина:** Неверные пути к файлам

**Решение Vercel:**

Создайте `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

**Решение VPS:**

Проверьте Nginx конфигурацию:
```nginx
location / {
    root /home/stouser/sto-level/public;
    try_files $uri $uri/ /index.html;
}
```

### ❌ CSS/JS не применяются

**Причина:** Неверные пути в HTML

**Решение:**

В `index.html` используйте относительные пути:
```html
<!-- Правильно -->
<link rel="stylesheet" href="./styles.css">
<script src="./script.js"></script>

<!-- Неправильно -->
<link rel="stylesheet" href="/styles.css">
```

---

## CORS ошибки

### ❌ "CORS policy: No 'Access-Control-Allow-Origin'"

**Причина:** Backend не разрешает запросы с фронтенд домена

**Решение:**

В `backend/server.js`:
```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:3000',                    // Локальная разработка
        'https://sto-level.vercel.app',            // Vercel
        'https://your-custom-domain.com',           // Свой домен
        'https://sto-level-git-*.vercel.app'       // Preview деплои
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

Не забудьте закоммитить и задеплоить!

### ❌ CORS работает локально, но не в production

**Причина:** Забыли добавить production URL

**Решение:**

Добавьте переменную окружения в backend:
```env
FRONTEND_URL=https://sto-level.vercel.app
```

И используйте:
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
```

---

## SSL HTTPS проблемы

### ❌ "Mixed Content" ошибки

**Причина:** HTTPS сайт обращается к HTTP API

**Решение:**

Убедитесь, что API URL использует HTTPS:
```javascript
// Правильно
const API_URL = 'https://your-api.onrender.com/api';

// Неправильно
const API_URL = 'http://your-api.onrender.com/api';
```

### ❌ SSL сертификат не работает (VPS)

**Причина:** Certbot не смог получить сертификат

**Решение:**
```bash
# Проверьте, что домен указывает на IP
dig ваш-домен.ru

# Убедитесь, что порт 80 открыт
sudo ufw allow 80/tcp

# Попробуйте снова
sudo certbot --nginx -d ваш-домен.ru
```

### ❌ "Your connection is not private"

**Причина:** Expired или self-signed сертификат

**Решение:**
```bash
# Обновите сертификат
sudo certbot renew

# Перезапустите Nginx
sudo systemctl reload nginx
```

---

## Проблемы производительности

### ❌ Медленные запросы к базе данных

**Причина:** Отсутствуют индексы или неоптимальные запросы

**Решение:**

1. Проверьте индексы в `database-schema.sql` (уже добавлены)
2. Включите логирование медленных запросов:

```javascript
// В db.js
const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (duration > 1000) {
        console.warn('Slow query:', { text, duration });
    }
    
    return res;
};
```

### ❌ Сайт грузится долго

**Причина:** Большие файлы, нет кэширования

**Решение Nginx (VPS):**
```nginx
# Кэширование статики
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Сжатие
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

**Решение Vercel:**

Добавьте в `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### ❌ Слишком много подключений к БД

**Причина:** Утечка соединений

**Решение:**

Используйте пул подключений (уже настроен в `db.js`):
```javascript
const pool = new Pool({
    max: 20,                      // Максимум 20 подключений
    idleTimeoutMillis: 30000,     // Закрывать неактивные через 30 сек
    connectionTimeoutMillis: 2000  // Таймаут подключения 2 сек
});
```

---

## Проблемы с переменными окружения

### ❌ "JWT_SECRET is not defined"

**Причина:** Не задана переменная окружения

**Решение:**

**Render/Railway:**
1. Dashboard → Environment Variables
2. Добавьте: `JWT_SECRET=ваш_секретный_ключ`

**VPS:**
```bash
# Проверьте .env
cat .env

# Должно быть:
JWT_SECRET=your_very_secret_jwt_key
```

### ❌ Переменные не загружаются

**Причина:** `dotenv` не настроен или неверный путь к `.env`

**Решение:**

В `backend/server.js` (в самом начале файла):
```javascript
require('dotenv').config();

console.log('Environment check:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('PORT:', process.env.PORT);
// Не выводите пароли!
```

---

## Ошибки деплоя

### ❌ "Build failed" на Render/Railway

**Причина:** Ошибка при установке зависимостей

**Решение:**

Проверьте `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

Проверьте логи билда:
- Render: Build logs
- Railway: Deployment logs

### ❌ Деплой зависает

**Причина:** Слишком долгая установка зависимостей

**Решение:**

Используйте `.npmrc` для ускорения:
```bash
# Создайте .npmrc
echo "prefer-offline=true" >> .npmrc
echo "progress=false" >> .npmrc
```

---

## Утилиты для диагностики

### Проверка подключения к БД

Создайте `test-db.js`:
```javascript
require('dotenv').config();
const db = require('./backend/db');

async function testDB() {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('✅ БД подключена:', result.rows[0]);
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка подключения:', error);
        process.exit(1);
    }
}

testDB();
```

Запустите:
```bash
node test-db.js
```

### Проверка API endpoints

```bash
# Health check
curl https://your-api.onrender.com/api/health

# Получить услуги
curl https://your-api.onrender.com/api/services

# С форматированием (jq)
curl https://your-api.onrender.com/api/health | jq
```

---

## Контрольный чеклист

Если ничего не работает, проверьте:

- [ ] GitHub репозиторий обновлен
- [ ] `package.json` содержит все зависимости
- [ ] `.env.example` существует
- [ ] База данных создана и схема импортирована
- [ ] Переменные окружения заданы правильно
- [ ] CORS настроен с правильными доменами
- [ ] API URL в frontend указывает на production
- [ ] SSL сертификат активен (если используете HTTPS)
- [ ] Firewall открыт для портов 80/443 (VPS)
- [ ] DNS записи настроены правильно (если есть домен)

---

## Получение помощи

### Где искать логи:

**Render:**
```
Dashboard → Service → Logs
```

**Railway:**
```
Service → Deployments → View Logs
```

**Vercel:**
```
Deployments → Your Deployment → Runtime Logs
```

**VPS:**
```bash
# PM2 логи
pm2 logs sto-level

# Nginx логи
sudo tail -f /var/log/nginx/stolevel-error.log

# Системные логи
sudo journalctl -u nginx -n 100 --no-pager
```

---

## Полезные команды для диагностики

```bash
# Проверка DNS
nslookup ваш-домен.ru

# Проверка портов
telnet ваш-IP 80
telnet ваш-IP 443

# Проверка SSL
openssl s_client -connect ваш-домен.ru:443

# Проверка Nginx конфигурации
sudo nginx -t

# Проверка PostgreSQL
sudo systemctl status postgresql

# Проверка процессов
ps aux | grep node
```

---

**Если проблема не решена - проверьте логи и документацию провайдера!**