# Beacon — Complete Master Product, Architecture & Branding Context

> **Canonical Reference Document**  
> *Target Domain*: `beacon.tarunya.me`  
> *Author*: Tarunya Kesh  
> *Target OS*: macOS 12+ (Apple Silicon M1/M2/M3/M4 & Intel Universal)

---

## 1. Executive Summary & Brand Identity

### What is Beacon?
**Beacon** is the first intentional **Dynamic Island HUD & Autonomous AI Companion Workspace** built natively for macOS. It transforms the physical camera notch of Apple Silicon MacBooks (and provides a floating island on external monitors and notchless Macs) into a living hardware HUD for deep focus, daily habit momentum, and context-free task execution.

### The Core Problem
Modern knowledge workers, developers, and founders suffer from catastrophic context-switching:
- Opening a browser tab to log a habit or check tasks derails attention.
- Typical habit trackers force users into rigid daily checkmarks that fail to model complex real-world milestones, hour-logging, or bad habit avoidance.
- Existing productivity software has exploded in size (400MB+ Electron containers running idle at 3–8% CPU, draining battery).

### The Beacon Solution
1. **Zero-Distance Hardware HUD**: Lives in the dead space of the MacBook notch. Expands on hover or via global hotkey (`⌘⇧B`).
2. **6 Human Behavioral Paradigms**: Handles streaks, numeric quotas, hard deadlines, phased checklists, hour sprints, and avoidance.
3. **Autonomous Beacon Spirit AI**: A living companion that executes tools on your Mac with sub-second latency (`~930ms`) and Claude/ChatGPT-style word-by-word streaming.
4. **Air-gapped & Private**: Powered by local SQLite in WAL mode. 0.1% idle CPU. Zero telemetry, zero mandatory accounts.

---

## 2. The 5 Core Application Surfaces

Beacon consists of 5 tightly synchronized native macOS surfaces:

### Surface 1: The Main Obsidian Command Dashboard (`dashboard-full.png`)
- **Header**: macOS native traffic lights, `[Goals]` and `[Focus Mode]` navigation, `[✨ AI Brain]` launcher, theme toggle, and `+ New Goal`.
- **Hero Spirit Greeting**: Shows personalized greeting, commitment ratios ("You've kept 3 of 6 commitments this week"), daily completion %, consistency score, and quick `[💬 Talk to Spirit]` trigger.
- **Goal Cards**: Shows progress circle, status badges (`✦ SURGING`), category tags (`Learning`, `Health`), current vs target metrics, deadline countdowns, focus sprint buttons, and inline quick-increment buttons (`[+10]`, `[+1]`).
- **Right Intelligence Sidebar**:
  - `TODAY'S FOCUS`: Total sprint time (`2h 30m`), target completion, and smooth deep-work spline waveform.
  - `WEEKLY RHYTHM`: 7-day momentum bar chart showing daily pacing (`+14% Pace`).
  - `RECENT ACTIVITY`: Real-time chronological audit trail of logged increments and sprint completions.

### Surface 2: The Hardware Dynamic Island (`dynamic-island-desktop.png`)
- Snaps directly beneath the MacBook camera notch.
- Expands from a compact `200px` pill to a `640px × 146px` solid obsidian HUD on hover.
- 3-column architecture: Contextual card (`Beacon` / `Focus` / `Media`), 7-day calendar strip with Solar Amber today pill, and circular overall progress ring.

### Surface 3: The Menu Bar Hub (`menubar-hub.png`)
- Tray popover accessible with a single click from the macOS system menu bar.
- Glanceable summary (e.g. `13% Complete • 6 active • 5 logged today`).
- Allows 1-click progress logging across all active goals without taking over your display or interrupting full-screen applications.

### Surface 4: The Command Engine HUD (`command-engine.png`)
- Spotlight / Raycast-style floating keyboard palette.
- Instant fuzzy search across all goals, habits, and focus modes.
- Natural command ergonomics: `+1 [name]`, `new [name]`, keyboard selection with arrow keys (`↑↓`) and `↵ Enter` to increment.

### Surface 5: The Beacon Spirit AI Companion (`spirit-companion-chat.png`)
- Conversational companion interface powered by Google Gemini with multi-tier automatic failover.
- Features quick-action spell pills (`25m Focus Sprint`, `Create Gym Habit (4x/wk)`, `Check Momentum Rhythm`, `Log +2 LeetCode`).
- Real-time word-by-word streaming with human speech pauses.

---

## 3. Visual World & Design Tokens

### The Hardware Aesthetic
Beacon rejects flat corporate styling and generic utility design in favor of **Apple-grade hardware glassmorphism**:
- **Notch Chassis**: Solid True Obsidian Black (`#07080B`), 0% transparency, with deep drop shadow `0 24px 60px rgba(0,0,0,0.85)` and subtle top hairline perimeter bevel (`1px solid rgba(255,255,255,0.16)`).
- **Semantic Lighting**:
  - **Solar Amber (`#FF7A00`)**: Primary brand energy, goal momentum, streak flames, overall circular progress ring.
  - **Ice Cyan (`#38BDF8`)**: Deep focus sprints, Pomodoro countdowns, technical accuracy.
  - **Emerald Green (`#10B981`)**: Checkmarks, completed streaks, active system indicators.
  - **Royal Violet (`#C084FC`)**: Global media player (Apple Music & Spotify) and Spirit AI companion.

---

## 4. The 6 Goal Paradigms (Engineered for Real Humans)

| Paradigm | Psychology & Use Case | Key Engine Attributes | Notch HUD Representation |
|---|---|---|---|
| **1. Habit** | Daily/weekly automatic routines (Gym, meditation) | Streak engine, frequency target (e.g. 4x/wk), freeze days | Glowing flame icon, cadence progress pill |
| **2. Accumulative** | Measurable volume (500 LeetCode problems, 100 cold emails) | Target value, current counter, unit string | Interactive `[+10]` increment button in notch |
| **3. Deadline** | Hard ship dates (Launch SaaS app, file taxes) | Target timestamp, burn-down velocity, time remaining | Real-time countdown timer & pacing indicator |
| **4. Milestone** | Multi-phase complex projects | Sequential checklist items with % completion | Phase progress bar & chime on sub-task clearance |
| **5. Duration** | Time in the zone (1,000 deep work hours) | Minutes/hours tracked, link to FocusManager | Direct sync with active focus sprint timer |
| **6. Avoidance** | Quitting addictions or distractions (No sugar, clean days) | Relapse counter, clean days streak, triggers | Clean day counter with restart verification modal |

---

## 5. Beacon Spirit AI Companion Engine

### Architecture
- **Single Abstraction Layer**: App communicates with `AIOrchestrator`, which supports local and cloud LLM providers without vendor lock-in.
- **High-Demand Failover Cascade**:
  `gemini-3.5-flash` (Primary, sub-second latency ~930ms)  
  ➔ `gemini-3-flash-preview`  
  ➔ `gemini-flash-latest`  
  ➔ `gemini-3.1-flash-lite`  
  *Transparently recovers from HTTP 503, 429, or 500 errors.*
- **Google Gemini 2.5/3 `thoughtSignature` Preservation**:
  Turn 1 candidate `parts` (containing Google thought signatures) are strictly forwarded into Turn 2's model role payload to prevent `HTTP 400 Invalid Argument` errors.
- **Local Action Synthesis Fallback**:
  If Turn 1 executes tools successfully (e.g., timer started, goal created) but Turn 2 encounters upstream rate limits, `AIOrchestrator` generates a crisp local response (`Boom! Started 25m focus sprint on "LeetCode". Ready to crush it! ✦`) rather than showing an error.
- **Claude / ChatGPT Pacing Streamer**:
  Simulates natural speech pacing on the client:
  - Base token speed: `38ms`
  - Sentence breaks (`.` `!` `?`): `135ms`
  - Clause breaks (`,` `;` `:`): `75ms`
  - Animated blinking star cursor (`✦`). Action confirmation pills appear *after* speech completes.

---

## 6. macOS System Integration & Performance

- **Global Hotkey (`⌘⇧B`)**: Electron global shortcut triggers immediate overlay toggle without task switching.
- **Zero Battery Drain**:
  - Window rendering throttles to 0 FPS when collapsed.
  - Idle CPU usage sits at **0.1%**.
  - Total memory footprint: **~45 MB** (vs 450 MB in Slack/Notion).
- **SQLite WAL Local Persistence**:
  - Synchronous disk writes with Write-Ahead Logging (`PRAGMA journal_mode=WAL;`).
  - Zero cloud latency, 100% offline and crash-resilient.

---

## 7. Business, Pricing & Razorpay Gateway

### Positioning
- **Target URL**: `https://beacon.tarunya.me`
- **Model**: Paid software (Anti-subscription philosophy).

### Pricing Tiers
1. **Free Community Trial**: $0 (Download DMG, 3 active goals, full notch simulator).
2. **Pioneer Lifetime License (Hero Offer)**:
   - **Price**: **$29 USD** or **₹2,499 INR** (One-time payment).
   - **Features**: Unlimited goals across all 6 paradigms, lifetime updates, offline AI companion engine, commercial rights on up to 3 personal Macs, VIP Discord access.
3. **Annual Pass**: $19/year (₹1,499/year).

### Razorpay Integration Details
- Uses official Razorpay Standard Checkout SDK (`https://checkout.razorpay.com/v1/checkout.js`).
- Supports Indian UPI (Google Pay, PhonePe, Paytm), International Cards (Visa, Mastercard, Amex), NetBanking, and Apple Pay.
- Automated sandbox test simulator included in the checkout modal so flows can be tested end-to-end without live credit cards.
- On payment success: Instant license key generation (`BCN-LIFE-XXXX-XXXX-XXXX`), confetti celebration, and direct Universal DMG download links.
- 14-Day no-questions-asked refund policy.

---

## 8. File Tree Reference

```
/Users/tarunyakesh/Desktop/Beacon - WebBranding/
├── dist/                          # Production static build (<80 kB gzipped)
├── public/
│   ├── assets/
│   │   ├── dashboard-full.png     # Surface 1: Full Main Dashboard
│   │   ├── dynamic-island-desktop.png # Surface 2: Hardware Dynamic Island on Desktop
│   │   ├── menubar-hub.png        # Surface 3: Menu Bar Popover Hub
│   │   ├── command-engine.png     # Surface 4: Spotlight Command Engine
│   │   └── spirit-companion-chat.png # Surface 5: Spirit AI Companion Modal
│   ├── logo.png                   # High-res master icon
│   ├── robots.txt                 # Search engine crawler permissions
│   └── sitemap.xml                # SEO sitemap
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Sticky glass header with currency switcher
│   │   ├── HeroSection.tsx        # High-impact title, DMG download, hardware pills
│   │   ├── IslandSimulator.tsx    # Playable interactive MacBook Notch HUD
│   │   ├── AppScreenshotsGallery.tsx # Interactive real macOS app gallery
│   │   ├── FeatureGrid.tsx        # The 6 Goal Paradigms & architecture cards
│   │   ├── SpiritShowcase.tsx     # Beacon Spirit pet companion & spell simulator
│   │   ├── TechSpecs.tsx          # 0.1% CPU, 45MB RAM, <16ms latency benchmarks
│   │   ├── PricingSection.tsx     # Lifetime Pioneer & Annual plan cards
│   │   ├── RazorpayModal.tsx      # Razorpay payment modal with Sandbox toggle
│   │   ├── LicenseSuccessModal.tsx# Confetti celebration & license key delivery
│   │   ├── FAQSection.tsx         # Common buyer questions and refund policy
│   │   └── Footer.tsx             # Credits, links, live status pill
│   ├── services/
│   │   └── razorpay.ts            # Razorpay checkout bridge & license key generator
│   ├── styles/
│   │   ├── tokens.css             # Obsidian, Solar Amber, Cyan, Purple tokens
│   │   └── global.css             # Glass panels, animations, typography
│   └── types/
│       └── index.ts               # TypeScript interfaces
├── BEACON_CONTEXT.md              # Complete Master Product & Architecture Reference
└── README.md                      # Vercel & Cloudflare Pages deployment instructions
```
