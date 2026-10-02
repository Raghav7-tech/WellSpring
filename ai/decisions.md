# Existing technical decisions

Last verified against the repository: 2026-10-02 (Asia/Calcutta).

The entries below are ordered by repository history and current evidence. “Verified” means the reason is explicitly stated in project documentation. “Inferred” means the implementation is clear but the original rationale was not recorded.

## 2026-10-02 — Keep the deliverable Android-only and Expo-managed

- **Decision:** Build a native Android app with Expo managed workflow, React Native, and TypeScript; exclude website work and native Android Studio configuration.
- **Why it appears to have been made:** `start.md` explicitly sets the product and scope boundary.
- **Current implementation:** Expo entry point in `App.tsx`, Expo configuration in `app.json`, and no tracked `android/`, `ios/`, DOM, or React DOM code.
- **Files/components affected:** `start.md`, `package.json`, `app.json`, `App.tsx`.
- **Known trade-offs:** Fast Expo Go iteration and minimal native configuration; store-specific/native customization is not yet configured.
- **Evidence/source:** `start.md` sections 1 and 6; commit `4a73963`.
- **Reason status:** **Verified.**

## 2026-10-02 — Use typed tab-plus-stack navigation

- **Decision:** Use bottom tabs for Home, Assistant, and Alerts; push Site Detail from a root native stack.
- **Why it appears to have been made:** This hierarchy is required by `start.md`.
- **Current implementation:** `MainTabs` is nested under `RootStackParamList`; Home navigates to `SiteDetail` with a typed `siteId` route parameter.
- **Files/components affected:** `App.tsx`, `types.ts`, `screens/HomeScreen.tsx`, `screens/SiteDetailScreen.tsx`.
- **Known trade-offs:** Simple navigation model; no deep-link configuration or route persistence is present.
- **Evidence/source:** `start.md` section 5; commit `4a73963`.
- **Reason status:** **Verified.**

## 2026-10-02 — Centralize visual tokens and follow system theme

- **Decision:** Use Fraunces, IBM Plex Sans, and IBM Plex Mono with centralized light/dark color tokens. Select the palette using the system color scheme.
- **Why it appears to have been made:** The fonts, colors, and system-following dark mode are specified in `start.md`.
- **Current implementation:** Fonts are loaded in `App.tsx`; `theme/tokens.ts` exports font names, status colors, palettes, spacing, and `useAppTheme()` based on `useColorScheme()`; `app.json` uses `userInterfaceStyle: "automatic"`.
- **Files/components affected:** `App.tsx`, `theme/tokens.ts`, all screens and visual components, `app.json`.
- **Known trade-offs:** Consistent styling and automatic OS integration; no manual override, persistence, or theme context exists.
- **Evidence/source:** `start.md` section 2; `theme/tokens.ts`; commit `4a73963`.
- **Reason status:** **Verified** for the design system and system following; **inferred** that avoiding a theme provider was chosen for simplicity.

## 2026-10-02 — Use shared TypeScript domain and navigation types

- **Decision:** Define site statuses, sensor keys, site/alert shapes, and navigation parameter lists in one root `types.ts` module.
- **Why it appears to have been made:** No written rationale exists; central typing reduces duplication across navigation, services, screens, and charts.
- **Current implementation:** `SiteStatus`, `ParameterKey`, `Parameter`, `Site`, `AlertEvent`, `RootStackParamList`, and `MainTabParamList` are exported from `types.ts`.
- **Files/components affected:** `types.ts` and most source modules.
- **Known trade-offs:** Simple for a small project; a single type file may become crowded as the application grows.
- **Evidence/source:** `types.ts`; commit `4a73963`.
- **Reason status:** **Inferred.**

## 2026-10-02 — Isolate sensor access behind an asynchronous service boundary

- **Decision:** Expose `getSites()` and `getSiteHistory(siteId, param)` from `services/dataSource.ts`, using mocks until ThingSpeak is available.
- **Why it appears to have been made:** `start.md` explicitly requires screens/components to remain unchanged when the provider changes.
- **Current implementation:** `USE_MOCK_DATA` is `true`; functions clone and return mock values. The non-mock branches throw. A commented ThingSpeak feed request illustrates a future implementation.
- **Files/components affected:** `services/dataSource.ts`, `services/mockData.ts`, `screens/HomeScreen.tsx`, `screens/SiteDetailScreen.tsx`, `services/aiAssistant.ts`.
- **Known trade-offs:** Screen contracts are provider-agnostic for sites/histories; parameter metadata and alerts still come directly from `mockData.ts`, and live response mapping is unfinished.
- **Evidence/source:** `start.md` section 3; commit `8317a4f`.
- **Reason status:** **Verified.**

## 2026-10-02 — Generate deterministic 24-hour mock histories

- **Decision:** Produce 24 values per parameter/site using a slow linear drift, sine wave, and deterministic seeded jitter.
- **Why it appears to have been made:** `start.md` requires realistic, non-flat trends with Sports moving unsafe, Hostel moving toward watch, and other sites stable/safe. Determinism itself is not explicitly required.
- **Current implementation:** `generateSeries()` runs at module initialization; the latest value is derived from the final sample; site status remains separately hard-coded.
- **Files/components affected:** `services/mockData.ts`, all data-consuming screens/components.
- **Known trade-offs:** Stable demos and repeatable visuals; data does not advance with wall-clock time and status is not computed from readings.
- **Evidence/source:** `start.md` section 3; `services/mockData.ts`; commit `8317a4f`.
- **Reason status:** **Verified** for realistic trends; **inferred** for deterministic noise.

## 2026-10-02 — Render native SVG charts without a chart framework

- **Decision:** Build a reusable sparkline and parameter chart directly with `react-native-svg` paths, shapes, gradients, ticks, and labels.
- **Why it appears to have been made:** `react-native-svg` and a shaded safe-range band are explicit requirements; no rationale records why a higher-level chart library was avoided.
- **Current implementation:** `Sparkline.tsx` renders TDS cards; `ParameterChart.tsx` calculates scales, a safe band, grid lines, a status-colored line, and endpoint marker.
- **Files/components affected:** `components/Sparkline.tsx`, `components/ParameterChart.tsx`, `components/SiteCard.tsx`, `screens/SiteDetailScreen.tsx`.
- **Known trade-offs:** Low dependency surface and complete visual control; scaling, labeling, accessibility, and edge cases are maintained manually.
- **Evidence/source:** `start.md` sections 1 and 4; commits `7a5cbcb` and `0eb0b0a`.
- **Reason status:** **Verified** for SVG/safe band; **inferred** for the hand-built implementation.

## 2026-10-02 — Make layouts responsive with capped widths and horizontal overflow

- **Decision:** Compute padding/chart widths from `useWindowDimensions()`, cap wide content, and horizontally scroll tabs/tables/chips.
- **Why it appears to have been made:** `start.md` requires responsiveness for all devices.
- **Current implementation:** Every screen uses responsive horizontal padding; Home and Site Detail calculate chart widths; wide tabular/chip content scrolls horizontally.
- **Files/components affected:** all files under `screens/`, `components/SiteCard.tsx`, and chart components.
- **Known trade-offs:** Supports a range of logical widths with little infrastructure; there are no automated visual regression or device-size tests.
- **Evidence/source:** `start.md` done criteria; commits `7a5cbcb`, `0eb0b0a`, `94bc5eb`, and `f3c7670`.
- **Reason status:** **Verified** for responsiveness; implementation details are **inferred**.

## 2026-10-02 — Use a keyword-based assistant behind `getAnswer()`

- **Decision:** Implement a local assistant that matches keywords and returns prepared explanations derived from current mock sites.
- **Why it appears to have been made:** `start.md` requires mock assistant behavior now and a single function boundary for later replacement.
- **Current implementation:** `getAnswer()` lowercases the question and checks unsafe/risk, Canteen, best/cleanest, Hostel/watch, and safe/summary keywords in order. Chat state exists only in component memory.
- **Files/components affected:** `services/aiAssistant.ts`, `screens/AssistantScreen.tsx`.
- **Known trade-offs:** No network or provider cost; limited language understanding and no persistence. A future direct client LLM call would create credential/security concerns.
- **Evidence/source:** `start.md` section 4C; commit `94bc5eb`.
- **Reason status:** **Verified.**

## 2026-10-02 — Keep alerts display-only and mock-backed

- **Decision:** Render a static list of four alert events with severity-colored styling and no actions.
- **Why it appears to have been made:** `start.md` explicitly says alerts need display only for now.
- **Current implementation:** `AlertsScreen` imports `MOCK_ALERTS` directly and renders cards. Timestamps are literal “Today”/“Yesterday” strings.
- **Files/components affected:** `services/mockData.ts`, `screens/AlertsScreen.tsx`.
- **Known trade-offs:** Simple demo; alerts are not live, persisted, acknowledged, filtered, or routed through the data service.
- **Evidence/source:** `start.md` section 4D; commit `f3c7670`.
- **Reason status:** **Verified.**

## 2026-10-02 — Defer backend, database, authentication, and release setup

- **Decision:** The repository currently contains only client-side mock functionality and Expo development configuration.
- **Why it appears to have been made:** `start.md` says real APIs are pending and Play Store work is not required yet. It does not explicitly discuss database or authentication needs.
- **Current implementation:** No server source, database schema/client, account flow, auth library, EAS profile, CI workflow, signing configuration, or store metadata was found.
- **Files/components affected:** repository-wide absence; `start.md`, `package.json`, `app.json`.
- **Known trade-offs:** Small development surface; no production data, access control, persistence, server-side secret protection, or reproducible release automation.
- **Evidence/source:** `start.md` sections 3 and 6; file inventory and dependency inventory.
- **Reason status:** **Verified** for deferring live APIs/Play Store; **UNKNOWN / NOT VERIFIED** for the intended future backend, database, or authentication architecture.

