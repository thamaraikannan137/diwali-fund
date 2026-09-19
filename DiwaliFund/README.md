# Diwali Fund 2026

React Native (Expo) app for Diwali fund collectors — ported from the design prototype in `Waiting for project scope`.

## Stack

- Expo SDK 57 + TypeScript
- **NativeWind v4** (Tailwind CSS for React Native)
- React Navigation (bottom tabs)

Brand tokens live in `tailwind.config.js` (`bg`, `ink`, `brand`, `amber`, etc.). Dynamic scheme colors still use inline `style` where needed.

## Features

- Login, Home, Schemes, Collect, Members, Summary
- Scheme/member detail, membership page, payment collect/edit
- Create scheme, add members, logout

Data is in-memory with seeded sample data.

## Run

```bash
cd DiwaliFund
npm start
# or
npm run web
```

After changing NativeWind/Tailwind config, restart Metro with a clean cache:

```bash
npx expo start -c
```
