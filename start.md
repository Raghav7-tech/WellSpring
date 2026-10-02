PROJECT: Wellspring — Campus Water Intelligence (Android App ONLY)

IMPORTANT SCOPE BOUNDARY:
A website for this project already exists and has already been approved
separately — DO NOT build, rebuild, or modify any website or web page.
Your ONLY task is the native Android mobile app (React Native + Expo).

The existing website is referenced below ONLY to copy its color palette,
fonts, and visual style (Section 2) — treat it purely as a design
reference, not as code to port or a target to build. There is no web
output expected from this task at all.

ROLE: Build a React Native (Expo, TypeScript) Android app for an IoT-based
campus drinking-water quality monitoring system — this is a 100% native
mobile app, no web component, no browser preview as the end deliverable.

====================================================================
1. TECH STACK (required)
====================================================================
- Expo (managed workflow) + React Native + TypeScript
- react-navigation (bottom tab navigator: Home, Assistant, Alerts; stack
  navigator for the Site Detail screen, pushed from Home)
- react-native-svg for charts (line chart with a shaded "safe range" band)
- A single `services/dataSource.ts` file abstracting all data fetching —
  see Section 3, this is important.
- No native Android Studio config needed — everything through Expo/EAS.

====================================================================
2. DESIGN SYSTEM — match the approved website exactly
====================================================================
Fonts:
  - Display/headings: "Fraunces" (serif) — load via @expo-google-fonts/fraunces
  - Body/UI text: "IBM Plex Sans" — load via @expo-google-fonts/ibm-plex-sans
  - Monospace (for numeric readings): "IBM Plex Mono" — via
    @expo-google-fonts/ibm-plex-mono

Color tokens (light theme — also implement a dark theme variant using the
values in parentheses):
  - background: #F4F8F6 (dark: #0B2224)
  - surface/card: #FFFFFF (dark: #122E31)
  - sunken surface: #EAF1EE (dark: #0A1D1F)
  - text primary: #0B2426 (dark: #EAF3F1)
  - text muted: #4A6560 (dark: #9FBAB5)
  - text faint: #7C948F (dark: #5F8580)
  - brand / primary accent: #0E7C74 (dark: #4FC0AE)
  - brand strong (buttons): #0B2426 (dark: #EAF3F1)
  - status "safe": #3FA796
  - status "watch": #C98A3B
  - status "unsafe": #BD4B3C
  - border/line: rgba(11,36,38,0.12) light / rgba(244,248,246,0.14) dark

Style notes:
  - Rounded cards (16px radius), soft shadows, generous padding — calm,
    "mineral water lab" aesthetic, not a flashy dashboard.
  - Status badges are pill-shaped with a small colored dot + label
    (Safe / Watch / Unsafe).
  - Support both light and dark mode, following system setting.

====================================================================
3. DATA LAYER — MOCK FOR NOW, REAL API IN ~1 WEEK (IMPORTANT)
====================================================================
I do NOT have the ThingSpeak API key yet — it will be provided in
approximately one week once the hardware team shares it.

Build the data layer so switching from mock to real data later requires
changing ONLY one file, with zero changes to any screen/component:

- Create `services/dataSource.ts` exporting:
    getSites(): Promise<Site[]>
    getSiteHistory(siteId: string, param: string): Promise<number[]>
- For now, implement these functions using a local mock generator
  (`services/mockData.ts`) that produces realistic time-series data for
  4 sites:

    sites = [
      { id: 'hostel', name: 'Hostel Wing A Cooler', building: 'Hostel Block A',
        status: 'watch' },
      { id: 'canteen', name: 'Canteen Cooler', building: 'Central Canteen',
        status: 'safe' },
      { id: 'sports', name: 'Sports Complex', building: 'Sports & Gym Block',
        status: 'unsafe' },
      { id: 'admin', name: 'Admin Building', building: 'Administrative Block · Lobby',
        status: 'safe' },
    ]

    parameters = [
      { key: 'ph',   label: 'pH',            unit: '',     safeRange: [6.5, 8.5] },
      { key: 'tds',  label: 'TDS',           unit: 'ppm',  safeRange: [0, 300] },
      { key: 'turb', label: 'Turbidity',     unit: 'NTU',  safeRange: [0, 5] },
      { key: 'doo',  label: 'Dissolved O₂',  unit: 'mg/L', safeRange: [5, 9] },
      { key: 'temp', label: 'Temp',          unit: '°C',   safeRange: [15, 28] },
    ]

  Each site should have 24 hourly mock readings per parameter, generated
  with light random noise + a slow drift (so charts look realistic, not
  flat). Sports Complex's data should trend toward the unsafe band;
  Hostel Wing A toward the watch band; others should stay stable/safe.

- Add a clearly marked constant at the top of dataSource.ts:
    const USE_MOCK_DATA = true; // TODO: set to false once ThingSpeak API
    key is received, and fill in THINGSPEAK_CHANNEL_ID + THINGSPEAK_READ_API_KEY below.
  Include commented-out real ThingSpeak fetch code (using fetch() against
  https://api.thingspeak.com/channels/{channelId}/feeds.json) ready to
  uncomment and activate in one step later.

====================================================================
4. SCREENS TO BUILD
====================================================================
A) HOME (Site List)
   - Scrollable list of site cards (one per site above)
   - Each card shows: site name, building, status badge (Safe/Watch/
     Unsafe with correct color), 3 mini stat values (latest pH, TDS,
     Turbidity), and a small sparkline chart of TDS over last 24h
   - Tapping a card navigates to Site Detail

B) SITE DETAIL
   - Site name + building as header
   - Horizontal tab row to switch between the 5 parameters (pH, TDS,
     Turbidity, Dissolved O₂, Temp)
   - Large line chart (react-native-svg) of the selected parameter's
     24-hour history, with a shaded horizontal band showing the safe
     range, and the line colored according to current status
   - Table below showing last 6 readings (now, 4h ago, 8h ago, 12h ago,
     16h ago, 20h ago) across all 5 parameters

C) AI ASSISTANT (Chat)
   - Simple chat UI: message bubbles (user right-aligned, AI left-aligned)
   - A row of suggested-question chips above the input, e.g.:
     "Which site is unsafe right now?", "How's the Canteen trending?",
     "Which cooler has the best reading?"
   - For now, implement with simple keyword-matched mock logic that
     returns a pre-written plain-English answer referencing the mock
     site data (no real LLM call yet) — but structure this in a separate
     `services/aiAssistant.ts` file with a single
     `getAnswer(question: string): Promise<string>` function, so a real
     Claude/OpenAI API call can replace the inside of that function
     later without touching the Chat screen at all.

D) ALERTS
   - List of alert events (mock a handful): site name, parameter that
     triggered it, value, and timestamp, with a colored left border
     matching status severity
   - Simple, clean list — no action needed beyond display for now

====================================================================
5. NAVIGATION
====================================================================
- Bottom tab bar with 3 tabs: Home, Assistant (chat), Alerts
- Site Detail is pushed as a stack screen from Home (not a tab)
- Use the brand teal color for active tab icon/label, muted gray for
  inactive

====================================================================
6. WHAT NOT TO DO
====================================================================
- Do NOT build, touch, or reference any website/HTML/web files at all —
  this task produces an Android app only.
- Do NOT wire any real ThingSpeak or LLM API call yet — mock everything
  as described, but structure the code so swapping to real data later
  is a small, isolated change (see Section 3).
- Do NOT use any web-only libraries (no react-dom, no HTML tags) — this
  is a real native Android app via Expo.
- Do NOT worry about Play Store build/submission yet — just get the app
  running correctly in Expo Go on a real device/emulator first.

====================================================================
7. DELIVERABLE / DONE CRITERIA
====================================================================
- `npx expo start` runs cleanly with no errors
- Verified working in Expo Go on an actual Android device or emulator
  (not just a browser preview)
- All 4 screens functional and navigable
- Matches the color/typography system in Section 2
- Mock data clearly isolated per Section 3, with TODO comments marking
  exactly where the real ThingSpeak API key and LLM API call will go
  once available (~1 week from now)
- Code organized as: /screens, /components, /services, /theme
- No website/web files created anywhere in the project
-it must be responsive for all devices