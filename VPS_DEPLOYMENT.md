# 🖥️ Развертывание на VPS (Ubuntu 22.04)

Полное руководство по развертыванию СТО Level на собственном VPS сервере.

---

## 📋 Что вам понадобится

- VPS с Ubuntu 22.04 (DigitalOcean, Hetzner, Linode, AWS)
- Доменное имя (опционально, но рекомендуется)
- SSH клиент (терминал в macOS/Linux, PuTTY для Windows)

---

## Шаг 1: Аренда VPS

### Рекомендуемые провайдеры:

#### DigitalOcean (Самый популярный)
- Сайт: https://digitalocean.com
- Цена: от $6/месяц (1GB RAM)
- Регистрация: Требуется карта
- Промокод: DORETRY10 ($10 бесплатно)

#### Hetzner (Дешевле)
- Сайт: https://hetzner.com
- Цена: от €4.5/месяц (~$5)
- Работает из России

#### Timeweb (Русский хостинг)
- Сайт: https://timeweb.com
- Цена: от 200₽/месяц
- Поддержка на русском

### Создание сервера:

1. Зарегистрируйтесь на выбранном провайдере
2. Создайте новый Droplet/Server:
   - **OS:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($6/мес)
   - **CPU:** Regular (1 vCPU)
   - **RAM:** 1GB (минимум)
   - **Storage:** 25GB SSD
   - **Region:** Ближайший к вам
3. Добавьте SSH ключ (или используйте пароль)
4. Нажмите "Create"

Через 1 минуту получите IP адрес сервера (например: `123.45.67.89`)

---

## Шаг 2: Первое подключение

### Подключение по SSH:

#### macOS / Linux:
```bash
ssh root@123.45.67.89
# Введите пароль (если не использовали SSH ключ)
```

#### Windows:
1. Скачайте PuTTY: https://www.putty.org/
2. Host Name: `123.45.67.89`
3. Port: `22`
4. Connection type: SSH
5. Open → введите `root` и пароль

---

## Шаг 3: Начальная настройка сервера

### 3.1. Обновление системы

```bash
# Обновите списки пакетов
apt update

# Обновите все пакеты
apt upgrade -y
```

### 3.2. Создание пользователя (не root)

```bash
# Создайте нового пользователя
adduser stouser
# Введите пароль и данные

# Добавьте в группу sudo
usermod -aG sudo stouser

# Переключитесь на нового пользователя
su - stouser
```

### 3.3. Настройка Firewall

```bash
# Разрешите SSH
sudo ufw allow OpenSSH

# Разрешите HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включите firewall
sudo ufw enable

# Проверьте статус
sudo ufw status
```

---

## Шаг 4: Установка необходимого ПО

### 4.1. Установка Node.js

```bash
# Добавьте NodeSource репозиторий (Node.js 18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Установите Node.js
sudo apt install -y nodejs

# Проверьте версии
node --version  # должно быть v18.x.x
npm --version   # должно быть 9.x.x
```

### 4.2. Установка PostgreSQL

```bash
# Установите PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Проверьте статус
sudo systemctl status postgresql

# Должно быть: active (running)
```

### 4.3. Установка Nginx

```bash
# Установите Nginx
sudo apt install -y nginx

# Запустите и включите автозапуск
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверьте
sudo systemctl status nginx
```

### 4.4. Установка PM2 (менеджер процессов)

```bash
# Установите PM2 глобально
sudo npm install -g pm2

# Проверьте
pm2 --version
```

### 4.5. Установка Git

```bash
sudo apt install -y git

# Проверьте
git --version
```

---

## Шаг 5: Настройка PostgreSQL

### 5.1. Создание базы данных и пользователя

```bash
# Переключитесь на пользователя postgres
sudo -u postgres psql

# В psql выполните:
CREATE DATABASE stolevel;
CREATE USER stouser WITH PASSWORD 'ваш_надежный_пароль';
GRANT ALL PRIVILEGES ON DATABASE stolevel TO stouser;
\q
```

### 5.2. Импорт схемы базы данных

```bash
# Скачайте database-schema.sql с GitHub (или скопируйте вручную)
wget https://raw.githubusercontent.com/ваш-username/sto-level/main/database-schema.sql

# Импортируйте
sudo -u postgres psql -d stolevel -f database-schema.sql

# Проверьте таблицы
sudo -u postgres psql -d stolevel -c "\dt"
```

---

## Шаг 6: Развертывание приложения

### 6.1. Клонирование репозитория

```bash
# Перейдите в домашнюю директорию
cd ~

# Клонируйте проект
git clone https://github.com/ваш-username/sto-level.git

# Перейдите в папку
cd sto-level
```

### 6.2. Установка зависимостей

```bash
# Установите npm пакеты
npm install --production
```

### 6.3. Создание .env файла

```bash
# Создайте .env
nano .env
```

Вставьте:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stolevel
DB_USER=stouser
DB_PASSWORD=ваш_пароль_из_шага_5.1
PORT=3000
JWT_SECRET=очень_длинный_и_сложный_ключ_для_production_12345678
NODE_ENV=production
```

Сохраните: `Ctrl+X`, `Y`, `Enter`

### 6.4. Тестовый запуск

```bash
# Запустите сервер
node backend/server.js

# Должно появиться:
# ✅ Подключено к базе данных PostgreSQL
# 🚗 СТО Level API Server
# 🌐 Сервер запущен на порту 3000
```

Откройте в браузере: `http://ваш-IP:3000/api/health`

Если работает - нажмите `Ctrl+C` для остановки.

---

## Шаг 7: Настройка PM2 (автозапуск)

### 7.1. Запуск через PM2

```bash
# Запустите приложение
pm2 start backend/server.js --name "sto-level"

# Сохраните конфигурацию
pm2 save

# Настройте автозапуск при перезагрузке
pm2 startup

# Выполните команду, которую покажет PM2 (примерно такую):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u stouser --hp /home/stouser
```

### 7.2. Полезные команды PM2

```bash
# Посмотреть статус
pm2 status

# Посмотреть логи
pm2 logs sto-level

# Перезапустить
pm2 restart sto-level

# Остановить
pm2 stop sto-level

# Удалить
pm2 delete sto-level
```

---

## Шаг 8: Настройка Nginx (Reverse Proxy)

### 8.1. Создание конфигурации

```bash
# Создайте конфигурацию сайта
sudo nano /etc/nginx/sites-available/stolevel
```

Вставьте:
```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;
    # Или используйте IP: server_name 123.45.67.89;

    # Логи
    access_log /var/log/nginx/stolevel-access.log;
    error_log /var/log/nginx/stolevel-error.log;

    # Frontend (статические файлы)
    location / {
        root /home/stouser/sto-level/public;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статики
        location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Сохраните: `Ctrl+X`, `Y`, `Enter`

### 8.2. Активация конфигурации

```bash
# Создайте симлинк
sudo ln -s /etc/nginx/sites-available/stolevel /etc/nginx/sites-enabled/

# Удалите дефолтный сайт
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

### 8.3. Проверка

Откройте в браузере:
- `http://ваш-IP` - должен открыться сайт
- `http://ваш-IP/api/health` - должен вернуть JSON

---

## Шаг 9: Настройка SSL (HTTPS)

### 9.1. Установка Certbot

```bash
# Установите Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2. Получение SSL сертификата

**Важно:** У вас должен быть домен, направленный на IP сервера!

```bash
# Получите сертификат
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Следуйте инструкциям:
# 1. Введите email
# 2. Согласитесь с ToS
# 3. Выберите: Redirect HTTP to HTTPS (опция 2)
```

Certbot автоматически:
- Получит SSL сертификат от Let's Encrypt
- Обновит конфигурацию Nginx
- Настроит автоматическое обновление

### 9.3. Проверка автообновления

```bash
# Протестируйте обновление
sudo certbot renew --dry-run
```

Теперь ваш сайт доступен по HTTPS! 🔒

---

## Шаг 10: Настройка домена (если есть)

### 10.1. Настройка DNS записей

У вашего регистратора домена (REG.RU, Namecheap, etc) добавьте:

```
Type: A
Name: @
Value: 123.45.67.89 (IP вашего VPS)
TTL: 3600

Type: A
Name: @
Value: 123.45.67.89
TTL: 3600
```

Для поддомена (например, `api.ваш-домен.ru`):
```
Type: A
Name: api
Value: 123.45.67.89
TTL: 3600
```

### 10.2. Обновите конфигурацию Nginx

```bash
sudo nano /etc/nginx/sites-available/stolevel
```

Измените `server_name`:
```nginx
server_name ваш-домен.ru www.ваш-домен.ru;
```

Перезапустите:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Шаг 11: Резервное копирование

### 11.1. Создание скрипта бэкапа

```bash
# Создайте директорию для бэкапов
mkdir -p ~/backups

# Создайте скрипт
nano ~/backup.sh
```

Вставьте:
```bash
#!/bin/bash

DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/home/stouser/backups"

# Бэкап базы данных
PGPASSWORD='ваш_пароль' pg_dump -U stouser -h localhost stolevel > "$BACKUP_DIR/db_$DATE.sql"

# Бэкап кода (опционально)
tar -czf "$BACKUP_DIR/code_$DATE.tar.gz" /home/stouser/sto-level

# Удалить бэкапы старше 7 дней
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Сделайте исполняемым:
```bash
chmod +x ~/backup.sh
```

### 11.2. Автоматические бэкапы (cron)

```bash
# Откройте crontab
crontab -e

# Добавьте строку (бэкап каждый день в 3:00 ночи)
0 3 * * * /home/stouser/backup.sh >> /home/stouser/backups/backup.log 2>&1
```

---

## Шаг 12: Мониторинг и обслуживание

### 12.1. Просмотр логов

```bash
# Логи приложения (PM2)
pm2 logs sto-level

# Логи Nginx
sudo tail -f /var/log/nginx/stolevel-access.log
sudo tail -f /var/log/nginx/stolevel-error.log

# Системные логи
sudo journalctl -u nginx -f
```

### 12.2. Мониторинг ресурсов

```bash
# Использование CPU/RAM
htop

# Или
top

# Место на диске
df -h

# PM2 мониторинг
pm2 monit
```

### 12.3. Обновление приложения

```bash
# Перейдите в папку проекта
cd ~/sto-level

# Получите последние изменения
git pull

# Установите зависимости (если были изменения)
npm install --production

# Перезапустите через PM2
pm2 restart sto-level

# Проверьте логи
pm2 logs sto-level --lines 50
```

---

## Часто задаваемые вопросы

### Q: Как увеличить RAM если сайт тормозит?
**A:** На DigitalOcean: Droplet → Resize → Upgrade (от $6 до $12/мес)

### Q: База данных слишком большая?
**A:** Настройте PostgreSQL оптимизацию или перенесите на managed БД.

### Q: Сайт недоступен после перезагрузки сервера?
**A:** Проверьте `pm2 startup` - он должен быть настроен.

### Q: Как посмотреть кто заходит на сайт?
**A:** 
```bash
sudo tail -f /var/log/nginx/stolevel-access.log
```

---

## Безопасность

### Дополнительные меры:

1. **Измените SSH порт:**
```bash
sudo nano /etc/ssh/sshd_config
# Port 22 → Port 2222
sudo systemctl restart sshd
```

2. **Отключите вход под root:**
```bash
sudo nano /etc/ssh/sshd_config
# PermitRootLogin yes → PermitRootLogin no
```

3. **Установите Fail2Ban:**
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

4. **Регулярно обновляйте систему:**
```bash
sudo apt update && sudo apt upgrade -y
```

---

## Стоимость VPS решения

```
VPS (DigitalOcean):        $6/мес
Домен (.ru):               $10/год ≈ $1/мес
SSL сертификат:            Бесплатно (Let's Encrypt)
────────────────────────────────────
Итого:                     $7/мес
```

**+ Полный контроль над сервером!**

---

## Следующие шаги

- [ ] Настройте мониторинг (UptimeRobot)
- [ ] Настройте CDN (Cloudflare)
- [ ] Добавьте Redis для кэширования
- [ ] Настройте email (SendGrid/Mailgun)
- [ ] Регулярные бэкапы на S3/Backblaze

---

**Поздравляю! Ваш сайт на собственном VPS! 🎉**