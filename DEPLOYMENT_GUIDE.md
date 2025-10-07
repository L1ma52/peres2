# 🚀 Полное руководство по развертыванию СТО Level

## От локальной разработки до публикации в интернете

Это пошаговое руководство покажет, как разместить ваш проект в интернете с настоящей базой данных PostgreSQL.

---

## 📋 Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Вариант 1: Полностью бесплатный (Render + Vercel)](#вариант-1-полностью-бесплатный)
3. [Вариант 2: Railway (Проще всего)](#вариант-2-railway-проще-всего)
4. [Вариант 3: VPS (Полный контроль)](#вариант-3-vps-полный-контроль)
5. [Настройка домена](#настройка-домена)
6. [Мониторинг и обслуживание](#мониторинг-и-обслуживание)

---

## Обзор архитектуры

### Что нужно разместить?

```
┌─────────────────────────────────────────────────────────┐
│                     СТО Level                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │  Frontend    │───▶│   Backend    │───▶│PostgreSQL│ │
│  │ (HTML/CSS/JS)│    │(Node.js API) │    │    БД    │ │
│  └──────────────┘    └──────────────┘    └──────────┘ │
│   Vercel/Netlify      Render/Railway      Render/      │
│                                           Railway       │
└─────────────────────────────────────────────────────────┘
```

### Компоненты:

1. **Frontend** - HTML, CSS, JavaScript файлы
2. **Backend** - Node.js + Express API сервер
3. **Database** - PostgreSQL база данных

---

## Вариант 1: Полностью бесплатный

**Стек:**
- Frontend: Vercel (бесплатно навсегда)
- Backend: Render (бесплатно 750 часов/месяц)
- Database: Render PostgreSQL (бесплатно 90 дней)

**Плюсы:** Полностью бесплатно для начала
**Минусы:** БД бесплатна только 90 дней, backend засыпает через 15 минут неактивности

---

### Шаг 1.1: Подготовка проекта

#### 1. Создайте аккаунт на GitHub

1. Перейдите на https://github.com
2. Зарегистрируйтесь (бесплатно)
3. Подтвердите email

#### 2. Загрузите проект на GitHub

```bash
# Если еще не сделали, инициализируйте git
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub (через веб-интерфейс)
# Затем:
git remote add origin https://github.com/ваш-username/sto-level.git
git branch -M main
git push -u origin main
```

#### 3. Подготовьте структуру проекта

Убедитесь, что структура выглядит так:
```
sto-level/
├── backend/              # Backend код
│   ├── server.js
│   ├── db.js
│   ├── routes/
│   └── middleware/
├── public/              # Frontend файлы (СОЗДАЙТЕ)
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── package.json
├── .env.example
└── .gitignore
```

**Переместите фронтенд файлы:**
```bash
mkdir public
mv index.html styles.css script.js public/
```

**Обновите `backend/server.js`:**
```javascript
// Измените путь к статическим файлам
app.use(express.static(path.join(__dirname, '..', 'public')));
```

---

### Шаг 1.2: Развертывание базы данных на Render

#### 1. Создайте аккаунт на Render

1. Перейдите на https://render.com
2. Нажмите "Get Started"
3. Войдите через GitHub

#### 2. Создайте PostgreSQL базу данных

1. На dashboard нажмите **"New +"** → **"PostgreSQL"**
2. Заполните форму:
   - **Name:** `stolevel-db`
   - **Database:** `stolevel`
   - **User:** `stolevel_user` (можно оставить по умолчанию)
   - **Region:** Выберите ближайший к вам
   - **Plan:** **Free** (бесплатно 90 дней)
3. Нажмите **"Create Database"**

#### 3. Получите данные подключения

После создания БД вы увидите:
- **Hostname:** `xxxx.render.com`
- **Port:** `5432`
- **Database:** `stolevel`
- **Username:** `stolevel_user`
- **Password:** (длинная случайная строка)
- **Internal Database URL:** `postgresql://...`
- **External Database URL:** `postgresql://...`

**Скопируйте Internal Database URL** - она понадобится!

#### 4. Импортируйте схему базы данных

Render предоставляет онлайн PSQL консоль:

1. В dashboard БД найдите вкладку **"Connect"**
2. Скопируйте **PSQL Command**
3. Откройте терминал на вашем компьютере:

```bash
# Вставьте скопированную команду, примерно так:
PGPASSWORD=ваш_пароль psql -h xxxx.render.com -U stolevel_user stolevel

# Вставьте содержимое database-schema.sql
# Или используйте:
PGPASSWORD=ваш_пароль psql -h xxxx.render.com -U stolevel_user stolevel < database-schema.sql
```

**Альтернатива:** Используйте Render Dashboard:
1. Перейдите на вкладку **"Shell"** в вашей БД
2. Скопируйте и вставьте содержимое `database-schema.sql`
3. Выполните

✅ **База данных готова!**

---

### Шаг 1.3: Развертывание Backend на Render

#### 1. Создайте Web Service

1. На Render dashboard: **"New +"** → **"Web Service"**
2. Подключите GitHub репозиторий
3. Выберите ваш репозиторий `sto-level`

#### 2. Настройте сервис

Заполните форму:

- **Name:** `stolevel-api`
- **Region:** Тот же, что и БД
- **Branch:** `main`
- **Root Directory:** `.` (корень)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node backend/server.js`
- **Plan:** **Free**

#### 3. Добавьте Environment Variables

В разделе **"Environment"** добавьте:

```
DATABASE_URL=postgresql://user:password@host:5432/stolevel
# (используйте Internal Database URL из Шага 1.2)

PORT=3000

JWT_SECRET=ваш_очень_секретный_ключ_для_production_12345

NODE_ENV=production
```

**Важно:** Вместо `DATABASE_URL` можно добавить по отдельности:
```
DB_HOST=xxxx.render.com
DB_PORT=5432
DB_NAME=stolevel
DB_USER=stolevel_user
DB_PASSWORD=ваш_пароль_из_шага_1.2
```

#### 4. Обновите `backend/db.js`

Добавьте поддержку `DATABASE_URL`:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    // Если есть DATABASE_URL, используем его
    connectionString: process.env.DATABASE_URL,
    
    // Иначе используем отдельные переменные
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    
    // Для production (Render требует SSL)
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});
```

#### 5. Закоммитьте и отправьте изменения

```bash
git add .
git commit -m "Add production database support"
git push
```

Render автоматически задеплоит изменения!

#### 6. Проверьте deployment

1. Дождитесь завершения деплоя (статус "Live")
2. Скопируйте URL (например: `https://stolevel-api.onrender.com`)
3. Откройте в браузере: `https://stolevel-api.onrender.com/api/health`

Должны увидеть:
```json
{
  "status": "ok",
  "database": "connected"
}
```

✅ **Backend развернут!**

---

### Шаг 1.4: Развертывание Frontend на Vercel

#### 1. Создайте аккаунт на Vercel

1. Перейдите на https://vercel.com
2. Нажмите "Sign Up"
3. Войдите через GitHub

#### 2. Подготовьте конфигурацию

Создайте файл `vercel.json` в корне проекта:

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

#### 3. Обновите `public/script.js`

Замените все обращения к API:

```javascript
// Было:
// const API_URL = 'http://localhost:3000/api';

// Стало:
const API_URL = 'https://stolevel-api.onrender.com/api';
// (используйте ваш URL из Шага 1.3)
```

**Или лучше:**
```javascript
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://stolevel-api.onrender.com/api';
```

#### 4. Закоммитьте изменения

```bash
git add .
git commit -m "Add Vercel config and production API URL"
git push
```

#### 5. Разверните на Vercel

1. На Vercel dashboard: **"Add New..."** → **"Project"**
2. Import Git Repository: выберите `sto-level`
3. Configure Project:
   - **Framework Preset:** Other
   - **Root Directory:** `.`
   - **Build Command:** (оставьте пустым)
   - **Output Directory:** `public`
4. Нажмите **"Deploy"**

#### 6. Получите URL

После деплоя вы получите URL типа:
```
https://sto-level.vercel.app
```

Откройте его в браузере - ваш сайт работает! 🎉

✅ **Frontend развернут!**

---

### Шаг 1.5: Финальная настройка

#### 1. Обновите CORS в backend

В `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://sto-level.vercel.app',  // Ваш Vercel URL
        'https://your-custom-domain.com' // Если есть свой домен
    ],
    credentials: true
}));
```

#### 2. Добавьте переменные окружения в Vercel (опционально)

На Vercel dashboard:
1. Выберите проект
2. Settings → Environment Variables
3. Добавьте:
```
NEXT_PUBLIC_API_URL=https://stolevel-api.onrender.com/api
```

И используйте в коде:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

---

## Вариант 2: Railway (Проще всего)

**Стек:** Всё на Railway
**Цена:** $5-10/месяц (без бесплатного плана с 2023 года)
**Плюсы:** Проще всего, всё в одном месте
**Минусы:** Платный

### Шаг 2.1: Регистрация

1. Перейдите на https://railway.app
2. Войдите через GitHub
3. Добавьте карту для $5 кредита

### Шаг 2.2: Создайте новый проект

1. Dashboard → **"New Project"**
2. **"Deploy from GitHub repo"**
3. Выберите репозиторий `sto-level`

### Шаг 2.3: Добавьте PostgreSQL

1. В проекте: **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway автоматически создаст БД и добавит переменные

### Шаг 2.4: Настройте backend service

1. Кликните на ваш сервис
2. Settings:
   - **Start Command:** `node backend/server.js`
   - **Root Directory:** `.`
3. Variables:
   - Railway автоматически добавит `DATABASE_URL`
   - Добавьте вручную:
     ```
     PORT=3000
     JWT_SECRET=your_secret_key
     NODE_ENV=production
     ```

### Шаг 2.5: Импортируйте данные в БД

1. В PostgreSQL сервисе → **"Data"** → **"Query"**
2. Вставьте содержимое `database-schema.sql`
3. Execute

### Шаг 2.6: Сгенерируйте домен

1. Backend сервис → Settings → **"Generate Domain"**
2. Скопируйте URL (например: `stolevel-api.up.railway.app`)

### Шаг 2.7: Обновите frontend и задеплойте

Обновите `API_URL` в `script.js` и задеплойте frontend на Vercel (как в Варианте 1).

✅ **Готово!**

---

## Вариант 3: VPS (Полный контроль)

**Стек:** DigitalOcean/Hetzner/Linode VPS
**Цена:** $5-12/месяц
**Плюсы:** Полный контроль, можно всё настроить
**Минусы:** Нужны навыки Linux

### Краткий обзор:

1. **Арендуйте VPS** (Ubuntu 22.04)
2. **Установите Node.js, PostgreSQL, Nginx**
3. **Настройте приложение**
4. **Настройте домен и SSL**

Подробная инструкция в файле `VPS_DEPLOYMENT.md` (создам отдельно).

---

## Настройка домена

### Купите домен

Провайдеры:
- **Namecheap** (от $1/год .ru домены)
- **REG.RU** (русский провайдер)
- **Cloudflare** (от $9/год)

### Настройте DNS

#### Для Vercel (Frontend):

1. Vercel Dashboard → Проект → Settings → Domains
2. Добавьте домен: `stolevel.ru`
3. У регистратора домена добавьте:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

#### Для Render/Railway (Backend):

1. Настройте поддомен: `api.stolevel.ru`
2. У регистратора домена:
   ```
   Type: CNAME
   Name: api
   Value: stolevel-api.onrender.com
   ```

---

## Мониторинг и обслуживание

### Логи

**Render:**
- Dashboard → Service → Logs

**Vercel:**
- Dashboard → Deployment → Runtime Logs

**Railway:**
- Service → Deployments → Logs

### Резервное копирование БД

**Render:**
```bash
# Через PSQL
pg_dump -h xxxx.render.com -U user -d stolevel > backup.sql
```

**Railway:**
```bash
# Railway CLI
railway run pg_dump > backup.sql
```

### Мониторинг uptime

Бесплатные сервисы:
- **UptimeRobot** (https://uptimerobot.com)
- **StatusCake** (https://www.statuscake.com)

---

## Проверка после деплоя

### Чеклист:

- [ ] Frontend открывается
- [ ] API отвечает на `/api/health`
- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Услуги загружаются
- [ ] Отзывы работают
- [ ] Форма обратной связи работает
- [ ] SSL сертификат активен (HTTPS)
- [ ] CORS настроен правильно
- [ ] База данных принимает подключения

---

## Стоимость (ежемесячно)

### Бесплатный вариант:
```
Frontend (Vercel):     $0
Backend (Render Free): $0
Database (Render):     $0 (90 дней), потом $7/мес
──────────────────────────
Итого:                 $0-7/мес
```

### Railway:
```
Frontend (Vercel):     $0
Backend + DB:          $5-10/мес
──────────────────────────
Итого:                 $5-10/мес
```

### VPS:
```
VPS (DigitalOcean):    $6/мес
Домен:                 $10/год ≈ $1/мес
──────────────────────────
Итого:                 $7/мес
```

---

## Часто задаваемые вопросы

### Q: Render backend засыпает после 15 минут
**A:** На бесплатном плане это нормально. Первый запрос будет долгим (30 сек). Решение - апгрейд на $7/мес или использовать Railway.

### Q: Как обновить сайт после изменений?
**A:** Просто сделайте `git push` - Render и Vercel задеплоят автоматически.

### Q: База данных заполнена?
**A:** Нет, нужно импортировать `database-schema.sql` (см. инструкции выше).

### Q: Ошибка CORS
**A:** Добавьте URL фронтенда в настройки CORS в `backend/server.js`.

---

## Следующие шаги

1. ✅ Сайт развернут
2. 📊 Настройте Google Analytics
3. 🔍 Добавьте SEO мета-теги
4. 📧 Настройте email уведомления
5. 🎨 Доработайте дизайн
6. 🚀 Маркетинг!

---

**Готово! Ваш сайт в интернете!** 🎉

Если возникли проблемы - см. файлы:
- `TROUBLESHOOTING.md` - Решение проблем
- `VPS_DEPLOYMENT.md` - VPS инструкция
- `API_DOCUMENTATION.md` - API документация