# WellSpring Android app

Wellspring is an Expo + React Native app for monitoring campus drinking-water quality. It includes a site overview, per-parameter history charts, a mock water assistant, and recent alerts.

## Run on Android

1. Install dependencies with `npm install`.
2. Start Metro with `npx expo start`.
3. Open the QR code in Expo Go on an Android device, or press `a` when an Android emulator is available.

Use `npm run typecheck` for a TypeScript check. The project follows the device light/dark setting automatically.

## Data integrations

All sensor reads go through `services/dataSource.ts`. It currently uses deterministic mock data from `services/mockData.ts`; the ThingSpeak channel placeholders and integration notes are isolated in the data source.

Assistant responses go through `services/aiAssistant.ts`. Its keyword-based mock logic can be replaced with an approved model request without changing the chat screen. Keep all future credentials in environment variables, never in source control.
