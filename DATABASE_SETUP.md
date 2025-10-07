# Установка и настройка PostgreSQL для СТО Level

## 📋 Содержание

1. [Установка PostgreSQL](#установка-postgresql)
2. [Создание базы данных](#создание-базы-данных)
3. [Импорт схемы](#импорт-схемы)
4. [Проверка](#проверка)
5. [Графические инструменты](#графические-инструменты)
6. [Устранение проблем](#устранение-проблем)

---

## 1. Установка PostgreSQL

### Windows

#### Вариант A: Через установщик (рекомендуется)

1. **Скачайте PostgreSQL:**
   - Перейдите на https://www.postgresql.org/download/windows/
   - Скачайте установщик (например, PostgreSQL 15 или новее)

2. **Запустите установщик:**
   - Запустите скачанный `.exe` файл
   - Нажмите "Next" несколько раз
   - **Запомните пароль** для пользователя `postgres`!
   - Порт оставьте по умолчанию: `5432`
   - Установите также pgAdmin 4 (графический интерфейс)

3. **Добавьте PostgreSQL в PATH:**
   - Обычно установщик делает это автоматически
   - Путь: `C:\Program Files\PostgreSQL\15\bin`

4. **Проверьте установку:**
   ```cmd
   psql --version
   ```

#### Вариант B: Через Chocolatey

```powershell
# Установите Chocolatey (если нет)
# Затем:
choco install postgresql
```

### macOS

#### Вариант A: Через Homebrew (рекомендуется)

```bash
# Установите Homebrew (если нет)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установите PostgreSQL
brew install postgresql@15

# Запустите PostgreSQL
brew services start postgresql@15

# Добавьте в PATH (добавьте в ~/.zshrc или ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Вариант B: Postgres.app

1. Скачайте с https://postgresapp.com/
2. Перетащите в Applications
3. Запустите приложение

### Linux (Ubuntu/Debian)

```bash
# Обновите пакеты
sudo apt update

# Установите PostgreSQL
sudo apt install postgresql postgresql-contrib

# Запустите службу
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Проверьте статус
sudo systemctl status postgresql
```

### Linux (CentOS/RHEL/Fedora)

```bash
# Установите PostgreSQL
sudo dnf install postgresql-server postgresql-contrib

# Инициализируйте БД
sudo postgresql-setup --initdb

# Запустите службу
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 2. Создание базы данных

### Способ 1: Через командную строку (psql)

#### Windows (CMD или PowerShell)

```cmd
# Перейдите в папку с проектом
cd C:\path\to\your\project

# Войдите в PostgreSQL (введите пароль, который задали при установке)
psql -U postgres

# Или сразу подключитесь к postgres БД
psql -U postgres -d postgres
```

#### macOS/Linux

```bash
# Перейдите в папку с проектом
cd /path/to/your/project

# Войдите в PostgreSQL
# Для Linux может потребоваться sudo
sudo -u postgres psql

# Для macOS (если через Homebrew)
psql postgres
```

#### После входа в psql:

```sql
-- Создайте базу данных
CREATE DATABASE stolevel;

-- Создайте пользователя (опционально, но рекомендуется)
CREATE USER stouser WITH PASSWORD 'your_strong_password_here';

-- Дайте права пользователю
GRANT ALL PRIVILEGES ON DATABASE stolevel TO stouser;

-- Выйдите
\q
```

### Способ 2: Через одну команду (без входа в psql)

#### Windows

```cmd
# В командной строке Windows
"C:\Program Files\PostgreSQL\15\bin\createdb.exe" -U postgres stolevel

# Введите пароль postgres когда попросит
```

#### macOS/Linux

```bash
# Создание БД одной командой
createdb stolevel

# Или с указанием пользователя
sudo -u postgres createdb stolevel

# Или
createdb -U postgres stolevel
```

---

## 3. Импорт схемы (database-schema.sql)

### Способ 1: Через команду psql

#### Windows

```cmd
# Перейдите в папку проекта
cd C:\path\to\sto-level

# Импортируйте схему
psql -U postgres -d stolevel -f database-schema.sql

# Введите пароль postgres
```

#### macOS

```bash
# Перейдите в папку проекта
cd /path/to/sto-level

# Импортируйте схему
psql -d stolevel -f database-schema.sql

# Или с пользователем
psql -U postgres -d stolevel -f database-schema.sql
```

#### Linux

```bash
# Перейдите в папку проекта
cd /path/to/sto-level

# Импортируйте схему
sudo -u postgres psql -d stolevel -f database-schema.sql

# Или если создали отдельного пользователя
psql -U stouser -d stolevel -f database-schema.sql
```

### Способ 2: Через интерактивный режим psql

```bash
# 1. Войдите в PostgreSQL с нужной БД
psql -U postgres -d stolevel

# 2. Внутри psql выполните:
\i database-schema.sql

# 3. Выйдите
\q
```

### Способ 3: Копирование и вставка

1. Откройте файл `database-schema.sql` в текстовом редакторе
2. Скопируйте весь SQL код
3. Войдите в psql:
   ```bash
   psql -U postgres -d stolevel
   ```
4. Вставьте скопированный SQL код и нажмите Enter
5. Выйдите: `\q`

---

## 4. Проверка

### Проверьте, что БД создана

```bash
# Войдите в psql
psql -U postgres

# Посмотрите список баз данных
\l

# Или
\list

# Вы должны увидеть stolevel в списке
```

### Подключитесь к БД и проверьте таблицы

```bash
# Подключитесь к БД stolevel
psql -U postgres -d stolevel

# Посмотрите список таблиц
\dt

# Вы должны увидеть:
# - users
# - services
# - service_history
# - reviews
# - contact_requests
```

### Посмотрите данные в таблицах

```sql
-- Посмотрите услуги (должны быть предзаполнены)
SELECT * FROM services;

-- Посмотрите отзывы (должны быть предзаполнены)
SELECT * FROM reviews;

-- Посмотрите пользователей (должна быть пустой)
SELECT * FROM users;

-- Выйдите
\q
```

---

## 5. Графические инструменты (Проще для новичков!)

### pgAdmin 4 (устанавливается с PostgreSQL)

1. **Запустите pgAdmin 4**
   - Windows: Пуск → pgAdmin 4
   - macOS: Applications → pgAdmin 4

2. **Подключитесь к серверу:**
   - Кликните "Servers" → "PostgreSQL 15"
   - Введите пароль postgres

3. **Создайте базу данных:**
   - Правый клик на "Databases" → "Create" → "Database"
   - Name: `stolevel`
   - Owner: `postgres`
   - Нажмите "Save"

4. **Импортируйте схему:**
   - Кликните на базу данных `stolevel`
   - Tools → Query Tool
   - File → Open → выберите `database-schema.sql`
   - Нажмите F5 или кнопку ▶ (Execute)

5. **Проверьте таблицы:**
   - Раскройте: stolevel → Schemas → public → Tables
   - Вы должны увидеть 5 таблиц

### DBeaver (Бесплатный, кроссплатформенный)

1. **Скачайте и установите:**
   - https://dbeaver.io/download/

2. **Создайте подключение:**
   - Database → New Database Connection
   - Выберите PostgreSQL
   - Host: `localhost`
   - Port: `5432`
   - Database: `postgres` (сначала)
   - Username: `postgres`
   - Password: ваш пароль
   - Test Connection → Finish

3. **Создайте БД:**
   - Правый клик на подключении → Create → Database
   - Name: `stolevel`
   - OK

4. **Импортируйте SQL:**
   - Кликните на `stolevel`
   - SQL Editor → New SQL Script
   - File → Open → выберите `database-schema.sql`
   - Ctrl+Enter для выполнения

---

## 6. Устранение проблем

### Проблема: "psql: command not found"

**Решение для Windows:**
```cmd
# Используйте полный путь
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres

# Или добавьте в PATH:
# Системные переменные → Path → Добавить:
# C:\Program Files\PostgreSQL\15\bin
```

**Решение для macOS/Linux:**
```bash
# Найдите, где установлен psql
which psql

# Если не найден, добавьте в PATH
# Для macOS (Homebrew):
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc

# Для Linux:
export PATH="/usr/lib/postgresql/15/bin:$PATH"
```

### Проблема: "FATAL: password authentication failed"

**Решение:**
1. Проверьте пароль
2. Для Linux, попробуйте:
   ```bash
   sudo -u postgres psql
   ```
3. Сбросьте пароль:
   ```bash
   sudo -u postgres psql
   ALTER USER postgres PASSWORD 'новый_пароль';
   ```

### Проблема: "could not connect to server"

**Решение:**
```bash
# Проверьте, запущен ли PostgreSQL

# Windows:
# Services → PostgreSQL → Start

# macOS:
brew services start postgresql@15

# Linux:
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Проблема: "database stolevel already exists"

**Решение:**
```bash
# Удалите и пересоздайте БД
psql -U postgres

DROP DATABASE IF EXISTS stolevel;
CREATE DATABASE stolevel;
\q

# Затем импортируйте схему заново
psql -U postgres -d stolevel -f database-schema.sql
```

---

## 📝 Краткая шпаргалка

### Полная последовательность команд

#### Windows (PowerShell/CMD)

```cmd
:: 1. Создать БД
createdb -U postgres stolevel

:: 2. Импортировать схему
psql -U postgres -d stolevel -f database-schema.sql

:: 3. Проверить
psql -U postgres -d stolevel -c "\dt"
```

#### macOS (Homebrew)

```bash
# 1. Создать БД
createdb stolevel

# 2. Импортировать схему
psql -d stolevel -f database-schema.sql

# 3. Проверить
psql -d stolevel -c "\dt"
```

#### Linux (Ubuntu)

```bash
# 1. Создать БД
sudo -u postgres createdb stolevel

# 2. Импортировать схему
sudo -u postgres psql -d stolevel -f database-schema.sql

# 3. Проверить
sudo -u postgres psql -d stolevel -c "\dt"
```

---

## ✅ Следующий шаг

После создания БД, настройте `.env` файл:

```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте .env
nano .env  # или любой текстовый редактор
```

Пример `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stolevel
DB_USER=postgres
DB_PASSWORD=ваш_пароль_postgres
PORT=3000
JWT_SECRET=очень_секретный_ключ_12345
NODE_ENV=development
```

Затем:
```bash
npm install
npm start
```

---

**Готово! База данных настроена! 🎉**

Если остались вопросы - смотрите раздел [Устранение проблем](#6-устранение-проблем) или используйте графические инструменты (pgAdmin/DBeaver).