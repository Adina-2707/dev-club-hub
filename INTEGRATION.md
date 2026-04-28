# Интеграция фронта и бэка

## Что было сделано:

### Бэк (Backend)
- ✅ `backend/package.json` — добавлен script `postinstall` для автоматической сборки при деплое
- ✅ `backend/Procfile` — по умолчанию запускает `npm start`
- ✅ `backend/.env.example` — пример конфигурации для локальной разработки и Railway

### Фронт (Frontend)
- ✅ `src/services/api.ts` — специальный сервис для всех запросов к API
- ✅ `src/contexts/AuthContext.tsx` — обновлён на работу с реальным API
- ✅ `src/pages/LoginPage.tsx` — обновлена на асинхронный login
- ✅ `src/pages/RegisterPage.tsx` — обновлена на асинхронный register
- ✅ `.env` — локальная разработка указывает на `http://localhost:3001/api`
- ✅ `.env.example` — наример конфига для production

## Как соединить на Railway:

### 1. Настройка бэка (dev-club-hub-production-6bd7.up.railway.app)

В Railway Dashboard для бэк-проекта:
1. Зайти в **Settings** → **Variables**
2. Выставить переменные окружения:
   - `FRONTEND_URL=https://dev-club-hub-7gul.vercel.app`
   - `JWT_SECRET=<придумай случайный длинный строку>`
   - `DATABASE_URL=file:./dev.db` (или PostgreSQL URL если хочешь)
   - `PORT=<Railway выставит автоматически>`

> **Внимание:** FRONTEND_URL должен совпадать с URL фронта на Vercel для работы CORS!

### 2. Настройка фронта (https://dev-club-hub-7gul.vercel.app/)

В Vercel Dashboard для фронт-проекта:
1. Зайти в **Settings** → **Environment Variables**
2. Выставить переменную:
   - `VITE_API_URL=https://dev-club-hub-production-6bd7.up.railway.app/api`

3. **Trigger redeploy:**
   - Зайти в **Deployments** 
   - Кликнуть на последний деплой
   - Нажать кнопку **Redeploy**

Или пустить `git` commit с пометкой `[redeploy]`.

### 3. Локальная разработка

Убедись что оба процесса работают на машине:

**Терминал 1 (БЭК):**
```bash
cd backend
npm install
npm run dev
```

**Терминал 2 (ФРОНТ):**
```bash
npm install
npm run dev
```

Проверить что в `.env` фронта указано:
```
VITE_API_URL=http://localhost:3001/api
```

### 4. Проверка

Локально:
1. Открыть http://localhost:5173
2. Попробовать зарегистрироваться или логиниться
3. Проверить в Chrome DevTools → Network, что запросы идут на `localhost:3001/api`

На Production:
1. Открыть https://dev-club-hub-7gul.vercel.app/
2. Попробовать зарегистрироваться или логиниться
3. Проверить в Chrome DevTools → Network, что запросы идут на `dev-club-hub-production-6bd7.up.railway.app/api`

## Демо аккаунты для тестирования

На бэке есть встроенные демо-аккаунты в `backend/prisma/seed.ts`:
- `student@test.com` / `123456` (Student)
- `mentor@test.com` / `123456` (Mentor)
- `alumni@test.com` / `123456` (Alumni)

Если они не создались автоматически, запусти:
```bash
cd backend
npm run db:seed
```

## Если что-то не работает:

1. **CORS ошибка** — проверь что `FRONTEND_URL` на бэке совпадает с URL фронта
2. **Сеть недостижима** — проверь что `VITE_API_URL` на фронте совпадает с URL бэка
3. **API не отвечает** — проверь что бэк запущен и слушает на нужном PORT
4. **Логин/регистрация не работает** — посмотри ошибки в Chrome DevTools → Console и Network

## API Endpoints

Все endpoints находятся по адресу: `{API_BASE_URL}/api`

Примеры:
- `POST /api/auth/login` — вход
- `POST /api/auth/register` — регистрация
- `GET /api/auth/me` — текущий пользователь
- `GET /api/projects` — все проекты
- `GET /api/teams` — все команды
- `GET /api/blog` — все посты
- и т.д. (см. `src/services/api.ts`)
