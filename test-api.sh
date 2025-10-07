#!/bin/bash

# Скрипт для тестирования API СТО Level
# Использование: ./test-api.sh

API_URL="http://localhost:3000/api"

echo "🧪 Тестирование API СТО Level"
echo "=============================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Health Check${NC}"
curl -s "${API_URL}/health" | jq .
echo ""

# 2. Получение всех услуг
echo -e "${BLUE}2. Получение всех услуг${NC}"
curl -s "${API_URL}/services" | jq '.services[] | {id, name, price, category}'
echo ""

# 3. Получение услуг по категории (ремонт)
echo -e "${BLUE}3. Услуги категории 'repair'${NC}"
curl -s "${API_URL}/services/category/repair" | jq '.services[] | {name, price}'
echo ""

# 4. Получение услуг по категории (тюнинг)
echo -e "${BLUE}4. Услуги категории 'tuning'${NC}"
curl -s "${API_URL}/services/category/tuning" | jq '.services[] | {name, price, stage}'
echo ""

# 5. Регистрация нового пользователя
echo -e "${BLUE}5. Регистрация тестового пользователя${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Тестовый Пользователь",
    "email": "test'$(date +%s)'@example.com",
    "password": "testpassword123",
    "car_brand": "BMW",
    "car_model": "X5",
    "car_year": 2020
  }')
echo $REGISTER_RESPONSE | jq .
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo -e "${GREEN}✓ Токен получен${NC}"
echo ""

# 6. Получение профиля
echo -e "${BLUE}6. Получение профиля пользователя${NC}"
curl -s "${API_URL}/auth/profile" \
  -H "Authorization: Bearer ${TOKEN}" | jq .
echo ""

# 7. Получение отзывов
echo -e "${BLUE}7. Получение отзывов${NC}"
curl -s "${API_URL}/reviews" | jq '.reviews[] | {full_name, rating, comment}'
echo ""

# 8. Добавление отзыва
echo -e "${BLUE}8. Добавление отзыва${NC}"
curl -s -X POST "${API_URL}/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Тестовый Клиент",
    "rating": 5,
    "comment": "Отличный сервис! Очень доволен работой."
  }' | jq .
echo ""

# 9. Средний рейтинг
echo -e "${BLUE}9. Средний рейтинг${NC}"
curl -s "${API_URL}/reviews/average" | jq .
echo ""

# 10. Оформление заказа
echo -e "${BLUE}10. Оформление заказа${NC}"
curl -s -X POST "${API_URL}/service-history" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' | jq .
echo ""

# 11. История услуг
echo -e "${BLUE}11. История услуг пользователя${NC}"
curl -s "${API_URL}/service-history" \
  -H "Authorization: Bearer ${TOKEN}" | jq .
echo ""

# 12. Статистика
echo -e "${BLUE}12. Статистика пользователя${NC}"
curl -s "${API_URL}/service-history/stats" \
  -H "Authorization: Bearer ${TOKEN}" | jq .
echo ""

# 13. Отправка контактной формы
echo -e "${BLUE}13. Отправка контактной формы${NC}"
curl -s -X POST "${API_URL}/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тест Контакт",
    "email": "contact@test.com",
    "phone": "+7 (999) 123-45-67",
    "message": "Хочу записаться на Stage 2 тюнинг"
  }' | jq .
echo ""

echo -e "${GREEN}✓ Все тесты завершены${NC}"