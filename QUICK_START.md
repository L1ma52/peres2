# 🚀 Быстрый старт за 5 минут

Самый простой способ запустить проект СТО Level с базой данных.

---

## Вариант 1: Использование pgAdmin (Графический интерфейс) ⭐ ПРОЩЕ ВСЕГО

### Шаг 1: Установите PostgreSQL

**Windows:**
1. Скачайте с https://www.postgresql.org/download/windows/
2. Запустите установщик
3. **ЗАПОМНИТЕ ПАРОЛЬ** для пользователя `postgres`!
4. Установите также pgAdmin 4 (галочка в установщике)

**macOS:**
1. Скачайте Postgres.app с https://postgresapp.com/
2. Перетащите в Applications и запустите

### Шаг 2: Откройте pgAdmin 4

1. Запустите pgAdmin 4 (должен быть установлен с PostgreSQL)
2. Введите master password (можно придумать свой)
3. Раскройте "Servers" → "PostgreSQL 15" (введите пароль postgres)

### Шаг 3: Создайте базу данных

1. **Правый клик** на "Databases"
2. Выберите "Create" → "Database..."
3. В поле "Database" введите: `stolevel`
4. Нажмите "Save"

### Шаг 4: Импортируйте таблицы

1. **Кликните** на только что созданную БД `stolevel`
2. Нажмите **Tools** → **Query Tool**
3. Нажмите **File** → **Open**
4. Найдите и откройте файл `database-schema.sql` из вашего проекта
5. Нажмите **▶ Execute/Refresh** (или F5)
6. Должно появиться сообщение об успешном выполнении

### Шаг 5: Проверьте

1. В левой панели раскройте:
   - `stolevel` → `Schemas` → `public` → `Tables`
2. Вы должны увидеть 5 таблиц:
   - contact_requests
   - reviews
   - service_history
   - services
   - users

### Шаг 6: Настройте проект

1. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Откройте `.env` в блокноте и введите свой пароль:
   ```env
   DB_PASSWORD=ваш_пароль_postgres_который_вы_запомнили
   ```

### Шаг 7: Запустите сервер

```bash
npm install
npm start
```

Готово! Откройте http://localhost:3000

---

## Вариант 2: Через командную строку (быстро, но нужно знать пароль)

### Windows (PowerShell или CMD)

```powershell
# 1. Перейдите в папку проекта
cd C:\путь\к\вашему\проекту

# 2. Создайте БД
"C:\Program Files\PostgreSQL\15\bin\createdb.exe" -U postgres stolevel

# 3. Импортируйте схему (введите пароль когда попросит)
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d stolevel -f database-schema.sql

# 4. Настройте .env
copy .env.example .env
# Откройте .env в блокноте и укажите пароль

# 5. Установите зависимости и запустите
npm install
npm start
```

### macOS (Terminal)

```bash
# 1. Перейдите в папку проекта
cd /путь/к/вашему/проекту

# 2. Создайте БД
createdb stolevel

# 3. Импортируйте схему
psql -d stolevel -f database-schema.sql

# 4. Настройте .env
cp .env.example .env
# Откройте .env и укажите пароль (если нужно)

# 5. Установите зависимости и запустите
npm install
npm start
```

### Linux (Ubuntu/Debian)

```bash
# 1. Перейдите в папку проекта
cd /путь/к/вашему/проекту

# 2. Создайте БД
sudo -u postgres createdb stolevel

# 3. Импортируйте схему
sudo -u postgres psql -d stolevel -f database-schema.sql

# 4. Настройте .env
cp .env.example .env
# Откройте .env (обычно пароль не нужен для локального подключения)

# 5. Установите зависимости и запустите
npm install
npm start
```

---

## ✅ Проверка работы

После запуска сервера (`npm start`), откройте новый терминал и выполните:

```bash
# Проверка здоровья API
curl http://localhost:3000/api/health
```

Должно вернуть:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

Или просто откройте в браузере:
```
http://localhost:3000/api/health
```

---

## 🆘 Частые проблемы

### "psql: command not found" (Windows)

**Решение:** Используйте полный путь к команде:
```cmd
"C:\Program Files\PostgreSQL\15\bin\psql.exe" ...
```

### "password authentication failed"

**Решение:** 
1. Проверьте пароль в `.env`
2. Убедитесь, что используете правильный пароль postgres

### "could not connect to server"

**Решение:** Убедитесь, что PostgreSQL запущен:
- **Windows:** Services → PostgreSQL → Start
- **macOS:** Запустите Postgres.app
- **Linux:** `sudo systemctl start postgresql`

### "Port 3000 already in use"

**Решение:** Измените порт в `.env`:
```env
PORT=3001
```

---

## 📚 Дополнительная помощь

- **Подробная инструкция:** См. `DATABASE_SETUP.md`
- **API документация:** См. `API_DOCUMENTATION.md`
- **Установка с нуля:** См. `SETUP.md`

---

## 🎯 Что дальше?

1. ✅ База данных работает
2. ✅ API сервер запущен
3. 📝 Создайте фронтенд (index.html, styles.css, script.js)
4. 🔗 Подключите фронтенд к API
5. 🚀 Готово!

---

**Успехов! 🚗💨**