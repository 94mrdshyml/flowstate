# Flowstate — Project Overview

A minimal desktop Pomodoro app for deep work, built for personal use. This doc is a snapshot reference: what the app is, how it's built, and what it actually does — read this to get oriented without re-reading the whole build history in `SESSION_LOG.md`.

## What We're Building

Flowstate is a single-user Electron desktop app that runs a Pomodoro-style focus timer (work sessions → short breaks → long breaks, with a configurable cadence). It's tray-resident — it lives in the system tray and stays running between focus sessions rather than being opened and closed like a regular app. Session history syncs to the cloud (Appwrite) so the user can see their daily stats, a GitHub-style contribution heatmap, and which hours of the day they focus best.

It is **not** a SaaS product, not multi-tenant, and not aiming for App Store distribution — one person, one Appwrite account, one desktop install. See `CLAUDE.md`'s Single-User Model section for the reasoning behind that constraint.

## Tech Stack

| Layer                                 | Choice                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Desktop shell                         | Electron (latest stable)                                                                           |
| Build tooling                         | electron-vite (dev/build), electron-builder (packaging → Windows installer)                        |
| Renderer                              | React + TypeScript + Tailwind CSS v4                                                               |
| Backend                               | Appwrite Cloud — Auth (email/password) + TablesDB (`sessions` table) + user Preferences (settings) |
| Package manager                       | bun                                                                                                |
| Lint/format                           | eslint + prettier                                                                                  |
| Testing (configured, not yet written) | Vitest (unit), Playwright Electron support (E2E)                                                   |

No component library (no MUI/Chakra/etc.) — every UI piece is hand-built, including SVG icons. No routing library — the app is a single window whose content swaps based on state (auth vs. app, timer phase, etc.), not a multi-page app.

## Features

### Auth

- Email/password signup (first name + last name, combined into Appwrite's single `name` field as `"First Last"`) and login, via Appwrite Account.
- Password field has a show/hide toggle (eye icon).
- Protected app shell — unauthenticated users see the auth screen; authenticated users see the timer.

### Timer

- Work → short break → long break cycle, cadence configurable (how many work sessions before a long break).
- Countdown state lives in the **main process** (not the renderer), so it keeps running accurately even when the window is hidden.
- Manual `Start` required for each phase — phases don't auto-chain into each other. After a phase ends (naturally or via Skip), the app returns to idle with the next phase loaded, waiting for the user to start it.
- Controls: Start, Pause/Resume, Skip (ends the current phase early), Reset.
- Circular progress ring showing time elapsed/remaining, with a distinct color for work vs. break phases.
- System tray: icon + context menu (Show/Hide, Start/Pause, Quit), tooltip shows current phase and remaining time. Closing the window hides it rather than quitting — only the tray's Quit action exits the app.

### Settings

- Work duration, short break duration, long break duration, sessions-before-long-break — all editable from a settings panel (gear icon).
- Stored in Appwrite user Preferences, defaults 25 / 5 / 15 / 4 minutes/sessions.
- Saving applies immediately to the running timer.

### Notifications & Sound

- Native OS notification on every phase transition (e.g. "Work session complete — Time for a short break").
- A short chime plays alongside each notification — currently 3 procedurally-synthesized placeholder tones (real sound files to be swapped in later).

### Motivational Quotes

- A quote rotates every 5–10 minutes, fetched from a free public API (`dummyjson.com/quotes/random`).
- Fails silently if the fetch fails — never blocks or crashes the timer.

### Greeting

- "Good morning/afternoon/evening, {first name}" based on local time, shown at the top of the main view.

### Stats & Insights

- **Today's stats**: sessions completed today, total focused minutes today.
- **Heatmap**: GitHub-style contribution grid, ~1 year of history, intensity reflects sessions per day, with a legend.
- **Most-focused-hour insight**: auto-computed from session history — surfaces the 2-hour window with the most completed sessions (e.g. "You focus best around 9–11 AM").
- All session history is written to Appwrite on every phase completion (`completed: true` for natural completion, `false` if skipped early), scoped to the logged-in user via per-row Appwrite permissions.

### Theming

- Light and dark mode, following the OS setting automatically (`prefers-color-scheme`) — no manual in-app toggle.

## Data Model (Appwrite)

- **Auth**: Appwrite Account, email/password. `name` field holds `"First Last"`; first name is split off client-side for the greeting.
- **Settings**: Appwrite user **Preferences** (no separate table) — `workMinutes`, `shortBreakMinutes`, `longBreakMinutes`, `sessionsBeforeLongBreak`.
- **`sessions` table** (database `flowstate`): `userId`, `phase` (`work` | `short_break` | `long_break`), `startedAt`, `endedAt`, `durationSeconds`, `completed` (bool). Row-level permissions (`Permission.read/write(Role.user(userId))`) are set per-row at write time — one user can never read another's session history. Schema lives in `appwrite.json` (modern `tablesDB`/`tables`/`columns` API, not the legacy `databases`/`collections`).
- Stats, heatmap, and focus-hour insight are all computed **client-side** from queries against `sessions` — no server-side aggregation.

## Architecture Notes

- **Main ↔ renderer split**: `src/main/timer.ts` owns the authoritative timer state machine; `src/preload/` exposes a typed `window.pomodoro` API via `contextBridge` (never direct Node/Electron access from the renderer); `src/renderer/src/` is the React UI, mirroring timer state via IPC ticks.
- **IPC contract**: renderer → main (`start`, `pause`, `resume`, `skip`, `reset`, `updateSettings`, `getState`); main → renderer (`tick` snapshots, `session-complete` events carrying both the finished phase and the next one).
- **Appwrite client** (`src/renderer/src/appwrite.ts`) runs only in the renderer, using the public endpoint + project ID from `.env` (not secrets — see `CLAUDE.md` Security Rules).

## Current Status

Fully functional end-to-end: auth, timer, tray, notifications, sound, quotes, greeting, settings, session logging, stats, heatmap, focus-hour insight, light/dark theming. Packaged into a working Windows installer (`bun run build:win` → `dist/flowstate-*-setup.exe`).

**Not yet done:**

- No automated tests written (Vitest/Playwright are configured but empty — `bun run test` currently fails with "no test files found").
- Sound files are placeholder synthesized tones, not real audio.
- `docs/DESIGN_PROMPT.md` is a ready-to-use design brief for a proper visual design pass — hasn't been run through one yet. Current styling is a light, functional consistency pass only, deliberately not a full redesign.
- Only Windows packaging has been built/tested; `build:mac`/`build:linux` scripts exist but are unverified.

See `docs/SESSION_LOG.md` for the detailed build history and reasoning behind specific decisions.
