# Current project state

Snapshot date: 2026-10-02 (Asia/Calcutta).

This is a factual description of the tracked Android project at the snapshot date. Unknown or externally dependent information is marked **UNKNOWN / NOT VERIFIED**.

## Project purpose

WellSpring is a native Android campus drinking-water monitoring application. It presents quality readings for four campus sites, historical charts for five water parameters, a mock question-answer assistant, and a display-only alerts list.

The current application is a demonstration backed entirely by deterministic in-memory mock data. It is not connected to campus hardware or a live AI provider.

## Technology stack

| Layer | Current technology |
|---|---|
| Application | Expo SDK 57.0.26, managed workflow |
| UI runtime | React 19.2.3, React Native 0.86.3 |
| Language | TypeScript 6.0.3 with strict mode and `noUncheckedIndexedAccess` |
| Navigation | React Navigation 7: bottom tabs plus native stack |
| Charts | `react-native-svg` 15.15.4 |
| Fonts | Expo Google Fonts: Fraunces, IBM Plex Sans, IBM Plex Mono |
| Icons | Expo Vector Icons / Ionicons |
| Insets/screens | React Native Safe Area Context and React Native Screens |
| Package manager evidence | npm lockfile version 3 |

No backend framework, database client, authentication SDK, state-management framework, HTTP client library, or persistent-storage library is a direct dependency.

## Application configuration

- App name: `Wellspring`
- Expo slug: `wellspring-app`
- App version: `1.0.0`
- Android package: `com.raghav7tech.wellspring`
- Orientation: portrait
- UI style: automatic/system
- Config plugin: `expo-font`
- Adaptive icon: only a teal background color is configured; a foreground image is not declared.
- Entry point: `node_modules/expo/AppEntry.js`, which loads root `App.tsx`.

## Repository and directory structure

```text
/
├── App.tsx                    # fonts, navigation, navigation theme, status bar
├── app.json                   # Expo/Android configuration
├── package.json               # scripts and direct dependencies
├── package-lock.json          # locked dependency graph
├── tsconfig.json              # strict Expo TypeScript configuration
├── types.ts                   # domain and navigation types
├── components/
│   ├── ParameterChart.tsx     # 24-hour chart and safe-range band
│   ├── SiteCard.tsx           # site summary card
│   ├── Sparkline.tsx          # TDS mini chart
│   └── StatusBadge.tsx        # safe/watch/unsafe pill
├── screens/
│   ├── HomeScreen.tsx
│   ├── SiteDetailScreen.tsx
│   ├── AssistantScreen.tsx
│   └── AlertsScreen.tsx
├── services/
│   ├── dataSource.ts          # site/history service boundary
│   ├── mockData.ts            # parameter, site, history, and alert mocks
│   └── aiAssistant.ts         # keyword assistant boundary
├── theme/
│   └── tokens.ts              # light/dark palettes, fonts, status colors, spacing
├── ai/                        # AI-maintainer documentation created by this audit
├── README.md                  # basic run and integration notes
├── start.md                   # product scope and implementation requirements
└── contribute.md              # Git/commit/push requirements
```

Generated local directories `.expo/`, `dist/`, and `node_modules/` are present and ignored. No tracked native `android/` or `ios/` directory exists.

An untracked root `index.html` exists. It is not part of the committed application and was not inspected because `start.md` explicitly excludes website work.

## Architecture

The project is a small client-only layered application:

```text
App.tsx
  ├─ font loading
  ├─ NavigationContainer + theme
  └─ Native stack
       ├─ MainTabs
       │    ├─ HomeScreen ─────────┐
       │    ├─ AssistantScreen ────┼─ services
       │    └─ AlertsScreen ───────┘
       └─ SiteDetailScreen

services/dataSource.ts ──> services/mockData.ts
services/aiAssistant.ts ─> services/dataSource.ts
screens/components ──────> theme/tokens.ts + types.ts
```

There is no dependency-injection container, global state store, backend process, persistent cache, or database. State is held in screen-local React state.

## Navigation and frontend flow

### Startup

1. `App` loads one Fraunces face, three IBM Plex Sans faces, and one IBM Plex Mono face.
2. Until all font hooks report loaded, a centered teal activity indicator appears on a fixed light background.
3. `SafeAreaProvider` and `NavigationContainer` mount.
4. The app opens the bottom-tab navigator on Home.
5. Navigation/status-bar colors are rebuilt from the current system theme.

### Home

1. On mount, `getSites()` is called.
2. For each returned site, `getSiteHistory(site.id, 'tds')` is called in parallel.
3. The screen shows a campus summary, safe/attention counts, and one `SiteCard` per site.
4. Each card shows current pH/TDS/turbidity and a 24-sample TDS sparkline.
5. Pull-to-refresh repeats the same mock reads.
6. Selecting a card pushes `SiteDetail` with `siteId`.

### Site Detail

1. The screen calls `getSites()` and fetches all five histories for the selected site in parallel.
2. pH is the initial selected parameter.
3. A horizontal tab row changes the active parameter locally.
4. `ParameterChart` scales the series and safe range into a 244-pixel SVG chart.
5. A horizontally scrollable table displays indices representing Now, 4h, 8h, 12h, 16h, and 20h ago.
6. The screen does not provide refresh or retry controls.

### Assistant

1. A welcome message is initialized in local component state.
2. A user submits typed text or a suggested question chip.
3. `getAnswer(question)` loads current sites and applies ordered keyword rules.
4. The response is appended as a new local chat bubble.
5. No message persistence, streaming, remote model, or multi-turn semantic context exists.

### Alerts

1. The screen imports four static events from `MOCK_ALERTS`.
2. Cards show site, literal relative timestamp text, parameter/value, and watch/unsafe styling.
3. No acknowledgement, filtering, navigation, refresh, persistence, or notification behavior exists.

## Theme and visual behavior

- `useAppTheme()` maps React Native `useColorScheme()` to a light or dark token object.
- There is no theme context, toggle, persistence, or “system/light/dark” preference model.
- Status colors are constant across themes: safe `#3FA796`, watch `#C98A3B`, unsafe `#BD4B3C`.
- App/navigation backgrounds and text colors respond to system changes when components rerender.
- Main content widths are capped for larger screens; charts calculate widths from viewport width; parameter tabs, recent-reading tables, and suggestion chips can scroll horizontally.

## Domain data

### Sites

| ID | Site | Building | Hard-coded status |
|---|---|---|---|
| `hostel` | Hostel Wing A Cooler | Hostel Block A | watch |
| `canteen` | Canteen Cooler | Central Canteen | safe |
| `sports` | Sports Complex | Sports & Gym Block | unsafe |
| `admin` | Admin Building | Administrative Block · Lobby | safe |

### Parameters

| Key | Label | Unit | Safe range |
|---|---|---|---|
| `ph` | pH | none | 6.5–8.5 |
| `tds` | TDS | ppm | 0–300 |
| `turb` | Turbidity | NTU | 0–5 |
| `doo` | Dissolved O₂ | mg/L | 5–9 |
| `temp` | Temperature | °C | 15–28 |

Each site/parameter receives 24 values. Series combine linear drift, a sine wave, and deterministic pseudo-random jitter. Sports trends outside multiple safe ranges; Hostel approaches limits; Canteen/Admin remain stable. Latest values are the final values in each series. Status is not calculated from those values.

## Backend flow

No backend is present.

- No server source or server runtime was found.
- No API routes, functions, queues, jobs, or server deployment configuration were found.
- All service functions execute inside the mobile application.
- Future backend ownership, hosting, protocol, and data contract are **UNKNOWN / NOT VERIFIED**.

## Database and persistence

No database or persistent application storage is present.

- No schema, migrations, ORM, database SDK, SQLite dependency, AsyncStorage dependency, or secure-storage dependency was found.
- Site data, alerts, and assistant messages are memory/static-module data.
- Restarting/remounting the app resets chat state.
- Future persistence requirements are **UNKNOWN / NOT VERIFIED**.

## APIs and integrations

### Active integrations

- No external data or AI HTTP request is active.
- Expo packages provide fonts, status bar, icons, safe areas, and navigation/runtime support.

### ThingSpeak placeholder

- `THINGSPEAK_CHANNEL_ID` and `THINGSPEAK_READ_API_KEY` are empty string constants.
- A commented example maps five parameters to fields 1–5 and fetches 24 feed results from `api.thingspeak.com`.
- The example is not executable from the current non-mock path.
- Channel topology for four sites, field mapping, payload schema, timestamps, rate limits, and credentials are **UNKNOWN / NOT VERIFIED**.

### LLM placeholder

- `getAnswer()` is local keyword logic.
- The file contains a TODO to replace its body with an approved LLM request.
- Provider, model, endpoint, backend/proxy, authentication, budget, privacy, logging, and safety policy are **UNKNOWN / NOT VERIFIED**.

## Authentication and authorization

No authentication or authorization exists.

- There are no login/account screens, tokens, sessions, identity SDKs, protected routes, roles, or permission checks.
- All in-app mock information is accessible immediately.
- Whether authentication is required for the intended product is **UNKNOWN / NOT VERIFIED**.

## Environment and secrets

- No `.env` or `.env.example` file was found.
- `.gitignore` excludes `.env`, `.env.local`, `.env.*.local`, keystores, JKS files, build outputs, logs, and dependency directories.
- A tracked-secret pattern scan found no credential-shaped value.
- Empty API placeholders are present in `services/dataSource.ts`.
- The supported Node version is not pinned and is **UNKNOWN / NOT VERIFIED**.

## Build and run process

Documented development flow:

```text
npm install
npx expo start
```

An Android emulator can be requested through:

```text
npm run android
```

Static type validation:

```text
npm run typecheck
```

Validation observed during this audit:

- `npm run typecheck`: passed.
- `npm audit --json`: zero known vulnerabilities at this point-in-time snapshot.
- `npx expo-doctor`: **NOT VERIFIED in this audit** because the sandboxed command could not obtain `expo-doctor` from the registry cache.
- Actual Android device/emulator interaction: **NOT VERIFIED from repository evidence**.

There are no lint, test, coverage, production-build, or release scripts.

## Deployment setup

- Git remote: `https://github.com/Raghav7-tech/WellSpring.git`
- Branch observed: `main`, tracking `origin/main`.
- No EAS configuration, native signing setup, CI/CD workflow, deployment manifest, store metadata, or documented release procedure exists.
- `start.md` explicitly defers Play Store build/submission.
- Deployment status is **UNKNOWN / NOT VERIFIED**; no claim of a published app is supported by the repository.

## Current feature status

| Feature | State |
|---|---|
| Home site list | Implemented with mock data |
| Site summary cards | Implemented |
| TDS sparklines | Implemented |
| Site Detail navigation | Implemented |
| Five parameter tabs | Implemented |
| 24-hour SVG chart + safe band | Implemented |
| Six-row recent readings table | Implemented |
| Assistant chat UI | Implemented with keyword responses |
| Suggested assistant questions | Implemented |
| Alerts list | Implemented with static mock events |
| System light/dark mode | Implemented |
| Manual theme toggle | Not implemented |
| Real ThingSpeak data | Not implemented |
| Real LLM | Not implemented |
| Authentication/authorization | Not implemented |
| Database/persistence | Not implemented |
| Push/local notifications | Not implemented |
| Alert acknowledgement | Not implemented |
| Automated tests/CI | Not implemented |
| EAS/store release | Not configured |

## Documentation currently present

- `README.md`: short Android run instructions and service-boundary notes.
- `start.md`: detailed product scope, design system, required screens, architecture, and done criteria.
- `contribute.md`: Git initialization, ignore, secret scanning, logical commits, remote, and push expectations.
- `ai/instructions.md`: future-agent rules and cautions.
- `ai/decisions.md`: evidence-based technical decision log.
- `ai/known-issues.md`: open risks and investigation targets.
- `ai/current-state.md`: this snapshot.

## Known limitations summary

- All business data is mock/static.
- Refresh does not fetch new real-world readings.
- Status is hard-coded rather than derived.
- Freshness/timestamp labels are static.
- Assistant understanding is keyword-based and non-persistent.
- No authentication, backend, database, or secure provider proxy exists.
- No automated tests, CI, or release pipeline exists.
- Device-level behavior and accessibility are not verified by repository artifacts.
- Manual theme selection is absent.

See `ai/known-issues.md` for evidence, severity, impact, and recommended next investigations.
