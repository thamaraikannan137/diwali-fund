# Diwali Fund

Mobile app + API for Diwali fund collection.

## Structure

- `DiwaliFund/` — Expo React Native app
- `backend/` — Express + Sequelize API (Postgres / Neon)

## Backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL
npm install
npm run seed
npm run dev            # http://localhost:4000
```

Demo login: `9876543210` / `diwali123`

## App

```bash
cd DiwaliFund
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` if the API is not at `http://localhost:4000/api`.
