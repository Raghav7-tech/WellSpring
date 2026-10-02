# Instructions for future AI agents

Last verified against the repository: 2026-10-02 (Asia/Calcutta).

This file separates rules already present in the project from recommendations introduced by this audit. Existing rules are binding project context. Recommendations are not evidence of an already-adopted team policy and should not be treated as authorization to change code.

## Existing project rules and constraints

These rules are stated in `start.md`, `contribute.md`, or enforced by the current implementation.

1. The deliverable is a native Android application built with Expo, React Native, and TypeScript. The existing website is out of scope. Do not build, port, edit, or commit website/HTML output as part of Android-app work. Evidence: `start.md`; the tracked repository contains no HTML/CSS source.
2. Use the Expo managed workflow. Native Android Studio configuration is not currently part of the project. Evidence: `start.md`, `app.json`, and the absence of tracked `android/` and `ios/` projects.
3. Preserve the navigation model unless a requested change requires otherwise:
   - Bottom tabs: Home, Assistant, Alerts.
   - Native stack: Site Detail is pushed from Home.
   Evidence: `App.tsx` and `types.ts`.
4. Keep site and history reads behind `services/dataSource.ts`. Screens currently depend on `getSites()` and `getSiteHistory()`, not on a live provider. Evidence: `HomeScreen.tsx`, `SiteDetailScreen.tsx`, and `services/dataSource.ts`.
5. Keep assistant calls behind `services/aiAssistant.ts#getAnswer(question)`. The current screen must not need provider-specific logic. Evidence: `AssistantScreen.tsx` and `services/aiAssistant.ts`.
6. Real ThingSpeak and LLM requests are not active. Do not add live credentials or enable either integration without explicit approval and the required service details. Evidence: `start.md`, `services/dataSource.ts`, and `services/aiAssistant.ts`.
7. Never commit API keys, tokens, keystores, `.env` contents, or other credentials. `.env*`, `*.keystore`, and `*.jks` are ignored. Evidence: `contribute.md` and `.gitignore`.
8. Use the established visual system:
   - Fraunces for display headings.
   - IBM Plex Sans for body/UI text.
   - IBM Plex Mono for numeric readings.
   - Colors and status colors from `theme/tokens.ts`.
   - Rounded cards, quiet shadows, generous spacing, and pill-shaped status badges.
   Evidence: `start.md`, `theme/tokens.ts`, and existing components.
9. Light/dark appearance currently follows the operating-system color scheme through `useColorScheme()`. There is no persisted or manual theme selection. Evidence: `theme/tokens.ts` and `app.json` (`userInterfaceStyle: "automatic"`).
10. Maintain responsive layouts. Existing screens use `useWindowDimensions()`, responsive horizontal padding, capped content widths, horizontal scrolling where needed, and safe-area containers. Evidence: all four screen modules.
11. Preserve short, human-sounding, lowercase-start commit subjects and logical commits when the user asks for commits. Do not squash unrelated work or commit secrets. Evidence: `contribute.md` and existing Git history.

## Current coding conventions discovered

- TypeScript is strict and enables `noUncheckedIndexedAccess` (`tsconfig.json`).
- Components and screens are functional React components using hooks.
- The default export is reserved for `App`; screens/components/services use named exports.
- UI styles use React Native `StyleSheet.create` plus runtime theme colors.
- Imports are relative; no path alias is configured.
- Shared domain types and navigation parameter lists live in `types.ts`.
- Shared font, color, status, and spacing tokens live in `theme/tokens.ts`.
- Charts are implemented with `react-native-svg`; do not introduce browser DOM or web-only chart code.
- Service functions are asynchronous even when backed by in-memory mock data, preserving an API-like screen contract.
- Error handling is local to screens and displays plain fallback text; there is no global error boundary.
- Responsive content is generally capped near 720–784 logical pixels.

## Files and modules requiring extra caution

| Area | Why it is sensitive |
|---|---|
| `services/dataSource.ts` | It is the intended provider boundary. A live-data change here affects Home, Site Detail, and Assistant behavior. The non-mock branch currently throws. |
| `services/mockData.ts` | Defines all sites, parameter ranges, trends, current statuses, and alerts. Screens also import parameter metadata and alerts directly from this module. |
| `services/aiAssistant.ts` | Contains health/safety-oriented user messaging and is the future LLM boundary. Do not expose provider secrets in a mobile bundle. |
| `theme/tokens.ts` | Every screen/component calls `useAppTheme()`. Theme-state changes have app-wide effects. |
| `App.tsx` | Owns font loading, the navigation hierarchy, navigation theming, and status-bar mode. |
| `types.ts` | Changes affect navigation contracts, site data, charts, alerts, and services. |
| `app.json` | Contains the Android package identifier, app version, portrait restriction, theme mode, and Expo plugin configuration. |
| `package.json` / `package-lock.json` | Expo native-module versions must remain compatible with the installed Expo SDK. Use Expo-compatible installation commands and validate after changes. |
| `start.md` | Defines the Android-only scope, required architecture, approved design system, and acceptance criteria. |
| Untracked `index.html` | This file existed before this audit, is not tracked, and was not inspected because `start.md` excludes website work. Avoid staging it accidentally. |

## Changes requiring explicit user approval

- Enabling or designing a live ThingSpeak integration, including channel/field mappings and credential handling.
- Adding a real LLM integration or any backend/proxy needed to protect provider credentials.
- Adding authentication, authorization, accounts, telemetry, analytics, notifications, persistent storage, or a database.
- Changing water-safety thresholds, site identities, status rules, or safety advice.
- Changing the Android application ID `com.raghav7tech.wellspring`.
- Adding native Android/iOS directories, ejecting/prebuilding, or introducing native modules outside the managed Expo workflow.
- Adding a website or web target.
- Publishing to EAS, an app store, or any other deployment destination.
- Changing dependency major versions or the Expo SDK.
- Deleting or staging the untracked `index.html`.

## Testing and validation expectations

Existing documented expectations:

1. Run `npm run typecheck`.
2. Run `npx expo start` and confirm Metro starts without application errors.
3. Verify the app in Expo Go on an Android device or emulator, including all four screens and navigation.
4. Check both system light and dark modes.
5. Check at least a narrow phone layout and a wider Android layout.
6. Before committing, scan tracked changes for secrets and confirm no website files are staged.

Current repository limitation: there is no automated unit, component, navigation, or end-to-end test suite and no lint script. Therefore, do not claim automated behavioral coverage.

Recommended validation for future changes (recommendation, not an existing policy):

- Run `npx expo-doctor` when registry/network access is available.
- Generate an Android bundle/export before release-oriented changes.
- Manually exercise loading, error, empty, keyboard, rotation/orientation constraint, and accessibility behavior.
- Add tests only after the user approves the testing dependencies and scope.

## Deployment and release precautions

- No `eas.json`, CI workflow, signing setup, Play Store metadata, Android `versionCode`, or release pipeline is tracked.
- `app.json` declares version `1.0.0`, portrait orientation, and the Android package ID, but this is not sufficient evidence of a deployable store release.
- Do not state that the app is deployed or production-ready without a verified EAS/native build and device test.
- Keep keystores and signing credentials out of Git. `.gitignore` already excludes common keystore extensions.
- `dist/` and `.expo/` are generated/ignored directories; do not commit them unless a future release process explicitly requires a different policy.

## Security-sensitive guidance

- The current repository contains empty ThingSpeak placeholders and no detected credential value.
- Environment variables embedded into a client application do not make secrets private. A real LLM provider secret should not be shipped directly in the Expo bundle; obtain approval for an appropriate server-side proxy or other secure design.
- Validate and constrain any future remote payload before rendering or using it for safety status.
- Treat water-quality conclusions and user-facing safety advice as domain-sensitive. Threshold or wording changes require stakeholder approval.
- Authentication and authorization do not exist. Do not imply access control is present.

## Important current context

- A manual theme toggle was requested immediately before this documentation-only audit, but the same request explicitly prohibited source/UI/behavior changes and allowed only `ai/` documentation files. The toggle was therefore not implemented. A later implementation task must clarify/preserve desired behavior (system default versus explicit override and persistence).
- Actual ThingSpeak channel IDs, field mappings by site, API credentials, update cadence, and error/rate-limit requirements are **UNKNOWN / NOT VERIFIED**.
- The intended LLM provider, model, backend, data-retention policy, and safety-review process are **UNKNOWN / NOT VERIFIED**.
- Production authentication, authorization, user roles, privacy requirements, and database requirements are **UNKNOWN / NOT VERIFIED**.

