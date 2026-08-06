# Flowstate — Design Brief

Use this prompt to design every screen and state of Flowstate, a minimal desktop Pomodoro app for deep work.

## Product Overview

Flowstate is a personal, single-user desktop app (Electron + React + TypeScript + Tailwind CSS) that runs a Pomodoro-style focus timer: work sessions, short breaks, and long breaks (after N work sessions, N is user-configurable). It tracks session history in the cloud (Appwrite) so the user can see daily stats, a GitHub-style contribution heatmap, and their most-focused time of day. It shows a rotating motivational quote every 5–10 minutes, greets the user by first name based on time of day, and fires a native OS notification + sound on every phase transition.

This is not a SaaS product — one person, one account, one desktop window (tray-resident). No multi-user, no admin views, no onboarding funnel. Design for a single focused individual who opens this app dozens of times a day and needs it to feel calm, fast, and unobtrusive.

## Platform & Technical Constraints

- **Window**: single Electron `BrowserWindow`, roughly 900×670px default size, resizable. App is tray-resident — closing the window hides it, doesn't quit.
- **Stack**: React + TypeScript, styled with Tailwind CSS v4 utility classes. No component library (no MUI/Chakra/etc.) — all components are custom-built, hand-rolled SVG icons (no icon font/library).
- **Theming**: must support both **light and dark mode**, switching automatically with the OS (`prefers-color-scheme`), not a manual in-app toggle. Every screen needs a light and a dark treatment.
- **Typography**: system font stack is acceptable, or a single clean sans-serif if you want to recommend one — but must be a font easily available via a normal web font load (no license complications).
- **No routing library**: the app is a single view that swaps content based on state (auth vs. app, timer phase, etc.) — not a multi-page site. Design accordingly: screens are "states" of one window, not separate pages with URLs.

## Design Principles

- **Minimal and aesthetic.** Generous whitespace, restrained color (one accent color + neutrals), no visual clutter. This is a tool the user glances at constantly during focus work — it must never compete for attention.
- **Calm, not gamified.** No confetti, no streak-shaming, no aggressive gradients. The emotional tone is quiet competence, not a habit-tracking app trying to hook the user.
- **Countdown is the hero.** Whatever screen shows the timer, the remaining time should be the single largest, most legible element on screen — readable at a glance from a few feet away.
- **Fast to scan.** Stats, heatmap, and insights should communicate at a glance, not require study.

## Screens & States to Design

### 1. Auth — Login

- Fields: Email, Password (with a show/hide toggle — eye icon).
- Primary action: "Log in" button.
- Secondary action: text link to switch to Sign up.
- Error state: inline message below the fields (e.g. wrong password, network error).
- Loading/submitting state on the button.

### 2. Auth — Sign up

- Fields: First name, Last name (side by side), Email, Password (with show/hide toggle).
- Primary action: "Sign up" button.
- Secondary action: text link to switch to Log in.
- Same error/loading states as Login.

### 3. App launch — Loading

- Brief state shown while checking if a session already exists (before routing to Auth or the main app). Should be near-instant but needs a non-jarring placeholder (e.g. a subtle spinner or just a blank calm screen — your call).

### 4. Main shell — Greeting header

- Shown at the top of the main app view once logged in.
- Time-of-day-aware greeting ("Good morning/afternoon/evening") + user's first name, pulled from their account.
- Should feel warm but brief — one line, not a banner.

### 5. Timer — Idle / ready state

- No session running yet. Shows the configured work duration, a clear "Start" call to action.
- This is the resting state the user sees most often — it should feel inviting to start, not empty/unfinished.

### 6. Timer — Work session running

- Large countdown (MM:SS), counting down from the configured work duration.
- Visual progress indicator (e.g. a progress ring or bar) showing elapsed/remaining proportion of the session.
- Controls: Pause, Skip (to break early).
- Indicate which session number this is within the current cycle (e.g. "Session 2 of 4 before long break").

### 7. Timer — Paused state

- Same layout as running, but visually distinct (e.g. dimmed countdown, "Resume" replaces "Pause") so it's unmistakable the timer isn't counting down.

### 8. Timer — Short break running

- Distinct visual treatment from work sessions (e.g. a different accent tint) so the user can tell at a glance "this is break time, not work time" even from a distance.
- Countdown + progress indicator, same mechanics as work session.
- Controls: Pause, Skip.

### 9. Timer — Long break running

- Same as short break, but should read as a bigger, more restful moment — e.g. a more pronounced visual shift, since it means a full cycle of work is complete.

### 10. Motivational quote banner

- Appears periodically (every 5–10 minutes) somewhere in the main view — design as a small, unobtrusive banner or card, not a modal/interruption. Should not compete with the countdown for visual weight.
- Include an attribution line (quote author) in a smaller, muted style.
- Consider how it enters/exits (fade, slide) without being distracting.

### 11. Settings panel

- Fields: Work duration, Short break duration, Long break duration (all in minutes), Sessions before long break (a count).
- Should feel like a lightweight panel/drawer/modal, not a full separate page — this is a quick adjustment, not deep configuration.
- Save action, with a clear confirmation that the change applied (and persisted).
- Sensible defaults shown: 25 / 5 / 15 / 4.

### 12. Stats panel — Today

- Two key numbers: sessions completed today, total focused minutes today. Should be legible at a glance — large numbers, small labels.

### 13. Heatmap — Session history

- GitHub-style contribution heatmap: a grid of small colored cells, one per day, intensity/color reflecting number of completed sessions that day, spanning roughly the past year.
- Needs a legend (e.g. "less → more").
- Should work cleanly in both light and dark mode — the empty/zero-session cell state must be visually distinct from the lightest "some activity" cell.

### 14. Most-focused-hour insight

- A small callout/card surfacing something like "You focus best around 9–11 AM," computed from the user's session history. Should read as a friendly, earned insight — not a chart the user has to interpret themselves.

### 15. Native OS notification (design guidance, not in-app UI)

- Fired on every phase transition (work starts, short break starts, long break starts). Provide guidance on notification title/body copy tone (calm, brief) to pair with the accompanying sound — not a screen to mock up pixel-by-pixel, but worth a short content/tone recommendation.

### 16. Tray icon

- Small icon representing the app in the OS tray, ideally able to reflect at-a-glance state (e.g. subtle visual difference between idle/running/paused) if feasible within icon constraints. Tray context menu: Show/Hide window, Start/Pause, Quit — simple text menu, but the icon itself deserves a couple of design directions.

## Deliverables Requested

1. **Color palette** — light mode and dark mode, including: background, surface/card, primary text, muted/secondary text, borders, one accent color (used for primary actions, active states, and the work-session progress indicator), a distinct tint for break states, and a success/error color pair.
2. **Typography scale** — font family recommendation, and a scale covering: the countdown display (needs to be huge and legible), headings, body text, labels/captions.
3. **Spacing & layout system** — consistent spacing scale, and a layout direction for how the greeting, timer, quote banner, and quick-access to stats/settings/heatmap coexist in one ~900×670 window without feeling cramped or requiring scrolling for the core timer experience.
4. **Iconography style** — line weight, corner radius, sizing convention for hand-rolled SVG icons (show/hide password, settings, pause/play/skip, etc.) so they're visually consistent.
5. **Component states** — hover, focus, active/pressed, disabled, and error treatments for buttons and inputs, in both light and dark mode.
6. **Motion notes** — where subtle transitions matter (quote banner enter/exit, pause/resume state change, phase transitions) and where motion should be deliberately avoided (the countdown itself should never visually "jump" or distract).
7. Mockups or detailed visual descriptions for each of the 16 screens/states above, in both light and dark mode.

## Explicit Non-Goals

- No onboarding flow, no tutorial/tooltips.
- No social features, no sharing, no multi-user anything.
- No dashboard-style analytics beyond what's listed above (today's stats, heatmap, most-focused hour) — resist the urge to add more charts.
- No manual light/dark toggle UI — theme follows the OS automatically.
