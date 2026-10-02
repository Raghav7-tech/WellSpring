# Known issues, risks, and technical debt

Last verified against the repository: 2026-10-02 (Asia/Calcutta).

Status values used below: **Open**, **Planned**, **Not verified**, or **Informational**. No issue was fixed during this audit.

## 1. Live ThingSpeak data is not implemented

- **Severity:** High for production use; expected for the current mock milestone.
- **Evidence:** `USE_MOCK_DATA = true`; both non-mock branches throw; the fetch implementation is commented out in `services/dataSource.ts`.
- **Affected area:** Home, Site Detail, Assistant, sensor freshness, and production readiness.
- **Current behavior:** All sites and histories are generated locally and remain unchanged between refreshes within the same build logic.
- **Expected behavior, if verifiable:** `start.md` expects a future ThingSpeak feed after the hardware team supplies credentials.
- **Possible impact:** The app can look live while showing demo data; production decisions cannot rely on it.
- **Status:** **Planned / Open.**
- **Recommended next investigation/fix:** Obtain approved channel IDs, per-site/field mapping, sample payloads, rate limits, timestamps, and credential handling requirements before designing the implementation.

## 2. Site status is hard-coded rather than derived from readings

- **Severity:** Medium.
- **Evidence:** `SITE_DEFINITIONS` assigns `status`, while `MOCK_SITES` copies it independently of `safeRange` and generated values in `services/mockData.ts`.
- **Affected area:** Home summary counts, badges, chart colors, assistant answers, and alert consistency.
- **Current behavior:** A site's displayed status does not automatically change if its readings or safe ranges change.
- **Expected behavior, if verifiable:** **UNKNOWN / NOT VERIFIED.** No project rule says whether status must be device-provided or computed locally.
- **Possible impact:** Status and measurements can diverge, especially during real API integration.
- **Status:** **Open.**
- **Recommended next investigation/fix:** Confirm the authoritative status source and escalation rules with the water/hardware stakeholders before changing logic.

## 3. Parameter metadata and alerts bypass the intended data boundary

- **Severity:** Medium.
- **Evidence:** `SiteDetailScreen.tsx` imports `PARAMETERS` and `AlertsScreen.tsx` imports `MOCK_ALERTS` directly from `services/mockData.ts`.
- **Affected area:** Provider replacement and future live alerts/configuration.
- **Current behavior:** Sites/histories use `dataSource.ts`, but parameter definitions and alerts remain coupled to the mock module.
- **Expected behavior, if verifiable:** `start.md` explicitly guarantees a one-file provider switch for `getSites()` and `getSiteHistory()` only; it does not define a live alerts contract.
- **Possible impact:** A real provider may require screen/import changes despite the broader architectural intent.
- **Status:** **Open technical debt.**
- **Recommended next investigation/fix:** Decide whether parameter metadata is static domain configuration and whether alerts need a service contract before refactoring.

## 4. Alert timestamps and Home freshness text are static

- **Severity:** Medium because the product communicates water-data freshness.
- **Evidence:** `MOCK_ALERTS` contains literal “Today”/“Yesterday” text; Home always renders “Updated just now.”
- **Affected area:** Home and Alerts trust/freshness indicators.
- **Current behavior:** Labels do not reflect the current time, refresh completion time, or source timestamps.
- **Expected behavior, if verifiable:** **UNKNOWN / NOT VERIFIED** for production formatting, but live-data freshness should correspond to source data.
- **Possible impact:** Users can believe stale data is current.
- **Status:** **Open.**
- **Recommended next investigation/fix:** Define timestamp semantics, timezone, stale thresholds, and display rules with the future API contract.

## 5. No manual theme toggle or persisted theme preference

- **Severity:** Low; requested feature gap.
- **Evidence:** `useAppTheme()` reads only `useColorScheme()`; there is no theme context/storage; `app.json` uses automatic UI style.
- **Affected area:** All screens and navigation.
- **Current behavior:** Theme changes only with the OS setting.
- **Expected behavior, if verifiable:** The latest user message requested a toggle, but the same task prohibited UI/source changes. Desired persistence and “system” option are **UNKNOWN / NOT VERIFIED**.
- **Possible impact:** Users cannot override system appearance.
- **Status:** **Open; not implemented due to the documentation-only constraint.**
- **Recommended next investigation/fix:** In a separate implementation task, confirm whether choices should be Light/Dark or Light/Dark/System and whether selection must persist.

## 6. Assistant understanding is intentionally narrow and state is ephemeral

- **Severity:** Low for the mock milestone; medium if presented as general AI.
- **Evidence:** `getAnswer()` uses ordered `String.includes()` checks; messages live only in `AssistantScreen` state.
- **Affected area:** Assistant accuracy, supported phrasing, and conversation continuity.
- **Current behavior:** Unsupported phrasing returns a generic prompt; chat history disappears when the component is remounted/app restarts; there is no multi-turn context.
- **Expected behavior, if verifiable:** `start.md` only requires simple keyword-matched mock logic.
- **Possible impact:** Users may infer broader intelligence than exists or receive a generic answer for a valid question.
- **Status:** **Known limitation.**
- **Recommended next investigation/fix:** Define supported intents and product language before expanding logic or choosing an LLM.

## 7. A future direct LLM integration could expose credentials

- **Severity:** High security risk if implemented inside the mobile client.
- **Evidence:** `services/aiAssistant.ts` says to replace the function body with an approved LLM request and keep credentials in environment variables; no backend exists.
- **Affected area:** Future AI integration and secret management.
- **Current behavior:** No LLM request or secret is present, so there is no current exposure.
- **Expected behavior, if verifiable:** `contribute.md` and README prohibit committed secrets. A secure provider architecture is **UNKNOWN / NOT VERIFIED**.
- **Possible impact:** Secrets included in an Expo client bundle can be extracted and abused; user questions/readings may be sent without a defined privacy policy.
- **Status:** **Open design risk.**
- **Recommended next investigation/fix:** Perform an architecture/security review and approve a server-side proxy, authentication, rate limiting, logging, retention, and safety policy before integration.

## 8. Future remote data has no runtime schema validation, timeout, retry, or caching design

- **Severity:** Medium.
- **Evidence:** The commented ThingSpeak helper casts JSON directly; service signatures return raw arrays; no validation/retry/abort/cache library or logic exists.
- **Affected area:** Reliability of live sensor data and error handling.
- **Current behavior:** In-memory mocks always have the expected shape. Invalid mock site/parameter requests throw.
- **Expected behavior, if verifiable:** **UNKNOWN / NOT VERIFIED** because the real payload and reliability requirements are unavailable.
- **Possible impact:** Malformed/null feeds, slow networks, or rate limits could produce incorrect values or poor UX.
- **Status:** **Open integration risk.**
- **Recommended next investigation/fix:** Obtain representative payloads and define parsing, missing-data behavior, retry/backoff, cancellation, caching, and stale-data presentation.

## 9. Error recovery is limited

- **Severity:** Low now; medium with real networking.
- **Evidence:** Home shows an error and supports pull-to-refresh; Site Detail shows a terminal error message without retry; Assistant shows a generic failure bubble.
- **Affected area:** Home, Site Detail, Assistant.
- **Current behavior:** Recovery varies by screen; no shared error boundary or offline state exists.
- **Expected behavior, if verifiable:** **UNKNOWN / NOT VERIFIED.**
- **Possible impact:** Transient live-API failures may require backing out/reopening the detail screen.
- **Status:** **Open.**
- **Recommended next investigation/fix:** Define consistent loading/error/empty/retry patterns after the real data contract is known.

## 10. No automated tests, linting, formatting check, or CI workflow

- **Severity:** Medium.
- **Evidence:** No test/spec files, Jest configuration, ESLint/Prettier configuration, lint/test scripts, or `.github` workflow were found. `package.json` only exposes start, Android start, and typecheck scripts.
- **Affected area:** Regression prevention, code quality, and release confidence.
- **Current behavior:** Validation is manual plus TypeScript compilation.
- **Expected behavior, if verifiable:** `start.md` requires manual Expo Go verification; it does not require automated tests.
- **Possible impact:** Navigation, rendering, data classification, and responsive regressions can reach `main` undetected.
- **Status:** **Open technical debt.**
- **Recommended next investigation/fix:** Audit the highest-risk logic and agree on a testing/CI strategy before adding dependencies.

## 11. Android device/emulator acceptance testing is not verified in this audit

- **Severity:** Medium against the documented done criteria.
- **Evidence:** `start.md` requires Expo Go verification on a real Android device/emulator. No test record or automated device artifact exists in the repository.
- **Affected area:** Runtime behavior, navigation, keyboard, fonts, SVG rendering, dark mode, and responsive layouts.
- **Current behavior:** `npm run typecheck` passed during this audit. A device session was not observable from repository evidence.
- **Expected behavior, if verifiable:** All four screens should work in Expo Go on Android.
- **Possible impact:** Device-only issues may remain undiscovered.
- **Status:** **NOT VERIFIED.**
- **Recommended next investigation/fix:** Perform and record an Android test matrix with screenshots/logs on at least one narrow phone and one larger layout.

## 12. Release/deployment configuration is incomplete

- **Severity:** Medium for release; low for Expo Go development.
- **Evidence:** No `eas.json`, build profiles, signing setup, CI, Android `versionCode`, store listing metadata, or release instructions exist.
- **Affected area:** Reproducible builds and Play Store delivery.
- **Current behavior:** The documented workflow stops at `npx expo start`/Expo Go.
- **Expected behavior, if verifiable:** `start.md` explicitly defers Play Store submission.
- **Possible impact:** The repository cannot demonstrate a repeatable production release process.
- **Status:** **Deferred / Open.**
- **Recommended next investigation/fix:** When release work is authorized, audit EAS ownership, application identity, signing, versioning, environment separation, and store requirements.

## 13. Node/package-manager runtime is not pinned

- **Severity:** Low to medium.
- **Evidence:** No `engines`, `.nvmrc`, or `.node-version` was found. `package-lock.json` is npm lockfile version 3.
- **Affected area:** Developer onboarding and reproducible tooling.
- **Current behavior:** Dependency versions are locked, but Node/npm selection depends on the developer machine.
- **Expected behavior, if verifiable:** **UNKNOWN / NOT VERIFIED.**
- **Possible impact:** Expo/Metro behavior may differ across unsupported Node versions.
- **Status:** **Open.**
- **Recommended next investigation/fix:** Confirm the supported Node LTS version for Expo SDK 57 and document/pin it after approval.

## 14. Possible composer width overflow on narrow devices

- **Severity:** Low.
- **Evidence:** `AssistantScreen` gives the composer `width: '100%'` and also applies positive horizontal margins. In React Native layout this can exceed the parent width depending on measurement behavior.
- **Affected area:** Assistant input row.
- **Current behavior:** Source inspection shows the risk; no clipping/overflow was verified on a device.
- **Expected behavior, if verifiable:** Input and send button should remain fully visible at all supported widths.
- **Possible impact:** Horizontal clipping or uneven spacing on narrow screens.
- **Status:** **NOT VERIFIED.**
- **Recommended next investigation/fix:** Measure on representative Android widths before changing the layout.

## 15. Accessibility coverage is partial and unverified

- **Severity:** Low to medium depending on product requirements.
- **Evidence:** Some controls/charts have labels/roles, but no accessibility audit/test exists; alert cards are visual-only; chart information is summarized only at a high level.
- **Affected area:** Screen-reader, focus, contrast, and touch-target usability.
- **Current behavior:** Site cards, send action, parameter tabs, badges, and SVGs include some accessibility metadata.
- **Expected behavior, if verifiable:** Formal accessibility requirements are **UNKNOWN / NOT VERIFIED**.
- **Possible impact:** Some information may be difficult to interpret with assistive technologies.
- **Status:** **NOT VERIFIED.**
- **Recommended next investigation/fix:** Run TalkBack, font-scaling, contrast, focus-order, and touch-target audits before release.

## 16. Untracked website file is present at the repository root

- **Severity:** Low repository-hygiene risk.
- **Evidence:** `git status` reports `?? index.html`; it is absent from `git ls-files`.
- **Affected area:** Git staging and the Android-only scope boundary.
- **Current behavior:** The file is not part of the committed app and was not inspected during this audit.
- **Expected behavior, if verifiable:** `start.md` says website files are out of scope and must not be touched.
- **Possible impact:** A broad `git add .` could accidentally commit out-of-scope web content.
- **Status:** **Open / intentionally untouched.**
- **Recommended next investigation/fix:** Ask the user how the file should be managed; do not delete, edit, ignore, or commit it without approval.

## Audit notes that are not current issues

- `npm run typecheck` passed on 2026-10-02.
- `npm audit --json` reported zero known vulnerabilities across the installed dependency tree on 2026-10-02. This is a point-in-time registry result, not a guarantee of future security.
- A tracked-secret pattern scan found no credential-shaped values. Empty API placeholders remain in `services/dataSource.ts`.
- `npx expo-doctor` was **NOT VERIFIED in this audit** because the sandboxed invocation could not obtain the package from the registry cache. No source file was changed as a result.

