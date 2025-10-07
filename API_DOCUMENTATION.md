# API Документация - СТО Level

## Базовый URL
```
http://localhost:3000/api
```

## Аутентификация

Большинство защищенных endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints

### 🔐 Аутентификация (`/api/auth`)

#### Регистрация пользователя
```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "Иван Петров",
  "email": "ivan@example.com",
  "password": "securepassword123",
  "car_brand": "BMW",
  "car_model": "X5",
  "car_year": 2020
}
```

**Ответ (201):**
```json
{
  "message": "Пользователь успешно зарегистрирован",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "Иван Петров",
    "email": "ivan@example.com",
    "car_brand": "BMW",
    "car_model": "X5",
    "car_year": 2020
  }
}
```

#### Вход в систему
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ivan@example.com",
  "password": "securepassword123"
}
```

**Ответ (200):**
```json
{
  "message": "Успешный вход",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "Иван Петров",
    "email": "ivan@example.com",
    "car_brand": "BMW",
    "car_model": "X5",
    "car_year": 2020
  }
}
```

#### Получить профиль (требует авторизации)
```http
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "user": {
    "id": 1,
    "full_name": "Иван Петров",
    "email": "ivan@example.com",
    "car_brand": "BMW",
    "car_model": "X5",
    "car_year": 2020,
    "created_at": "2023-10-07T10:00:00.000Z"
  }
}
```

#### Обновить профиль (требует авторизации)
```http
PUT /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "full_name": "Иван Петрович Петров",
  "car_brand": "Mercedes",
  "car_model": "E-Class",
  "car_year": 2022
}
```

---

### 🔧 Услуги (`/api/services`)

#### Получить все услуги
```http
GET /api/services
```

**Параметры запроса:**
- `category` (optional): `repair` или `tuning`

**Ответ (200):**
```json
{
  "services": [
    {
      "id": 1,
      "name": "Замена колодок",
      "description": "Замена передних и задних тормозных колодок",
      "price": "3500.00",
      "category": "repair",
      "stage": null,
      "created_at": "2023-10-07T10:00:00.000Z"
    }
  ]
}
```

#### Получить услугу по ID
```http
GET /api/services/:id
```

#### Получить услуги по категории
```http
GET /api/services/category/repair
GET /api/services/category/tuning
```

---

### 📋 История услуг (`/api/service-history`)

#### Получить историю услуг (требует авторизации)
```http
GET /api/service-history
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "history": [
    {
      "id": 1,
      "service_date": "2023-10-07T10:00:00.000Z",
      "price": "3500.00",
      "status": "completed",
      "notes": null,
      "service_name": "Замена колодок",
      "service_description": "Замена передних и задних тормозных колодок",
      "category": "repair"
    }
  ]
}
```

#### Оформить заказ (требует авторизации)
```http
POST /api/service-history
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "service_id": 1,
      "price": 3500.00,
      "notes": "Срочно"
    },
    {
      "service_id": 2,
      "price": 8500.00
    }
  ]
}
```

**Ответ (201):**
```json
{
  "message": "Заказ успешно оформлен",
  "records": [
    {
      "id": 1,
      "service_date": "2023-10-07T10:00:00.000Z",
      "price": "3500.00",
      "status": "pending"
    }
  ]
}
```

#### Получить статистику (требует авторизации)
```http
GET /api/service-history/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "stats": {
    "total_services": "5",
    "total_spent": "25000.00",
    "completed_services": "3"
  }
}
```

---

### ⭐ Отзывы (`/api/reviews`)

#### Получить все отзывы
```http
GET /api/reviews?limit=10&offset=0
```

**Параметры запроса:**
- `limit` (default: 10): Количество отзывов
- `offset` (default: 0): Смещение для пагинации

**Ответ (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "full_name": "Иван Петров",
      "rating": 5,
      "comment": "Отличный сервис!",
      "created_at": "2023-10-07T10:00:00.000Z"
    }
  ],
  "total": 4
}
```

#### Добавить отзыв
```http
POST /api/reviews
Content-Type: application/json

{
  "full_name": "Мария Иванова",
  "rating": 5,
  "comment": "Очень довольна обслуживанием!"
}
```

**Ответ (201):**
```json
{
  "message": "Отзыв успешно добавлен",
  "review": {
    "id": 5,
    "full_name": "Мария Иванова",
    "rating": 5,
    "comment": "Очень довольна обслуживанием!",
    "created_at": "2023-10-07T10:00:00.000Z"
  }
}
```

#### Получить средний рейтинг
```http
GET /api/reviews/average
```

**Ответ (200):**
```json
{
  "average_rating": "4.8",
  "total_reviews": "15"
}
```

---

### ✉️ Контакты (`/api/contact`)

#### Отправить сообщение
```http
POST /api/contact
Content-Type: application/json

{
  "name": "Алексей Смирнов",
  "email": "alexey@example.com",
  "phone": "+7 (999) 123-45-67",
  "message": "Хочу записаться на тюнинг Stage 2"
}
```

**Ответ (201):**
```json
{
  "message": "Сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.",
  "request_id": 1
}
```

#### Получить все заявки
```http
GET /api/contact?status=new&limit=50&offset=0
```

**Параметры запроса:**
- `status` (optional): `new`, `in_progress`, `completed`
- `limit` (default: 50)
- `offset` (default: 0)

---

### 🏥 Health Check

#### Проверка состояния сервера
```http
GET /api/health
```

**Ответ (200):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2023-10-07T10:00:00.000Z"
}
```

---

## Коды ошибок

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверный запрос (валидация)
- `401` - Не авторизован
- `403` - Доступ запрещен (неверный токен)
- `404` - Ресурс не найден
- `500` - Ошибка сервера

## Примеры использования

### cURL

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@test.com","password":"123456"}'

# Получение услуг
curl http://localhost:3000/api/services

# Добавление отзыва
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","rating":5,"comment":"Great!"}'
```

### JavaScript (fetch)

```javascript
// Регистрация
const register = async () => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      full_name: 'Test User',
      email: 'test@test.com',
      password: '123456'
    })
  });
  const data = await response.json();
  console.log(data);
};

// Получение профиля с токеном
const getProfile = async (token) => {
  const response = await fetch('http://localhost:3000/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  console.log(data);
};
```