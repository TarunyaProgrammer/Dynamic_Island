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

## 2. Visual World & Design Tokens

### The Hardware Aesthetic
Beacon rejects flat corporate styling and generic utility design in favor of **Apple-grade hardware glassmorphism**:
- **Notch Chassis**: Solid True Obsidian Black (`#07080B`), 0% transparency, with deep drop shadow `0 24px 60px rgba(0,0,0,0.85)` and subtle top hairline perimeter bevel (`1px solid rgba(255,255,255,0.16)`).
- **Semantic Lighting**:
  - **Solar Amber (`#FF7A00`)**: Primary brand energy, goal momentum, streak flames, overall circular progress ring.
  - **Ice Cyan (`#38BDF8`)**: Deep focus sprints, Pomodoro countdowns, technical accuracy.
  - **Emerald Green (`#10B981`)**: Checkmarks, completed streaks, active system indicators.
  - **Royal Violet (`#C084FC`)**: Global media player (Apple Music & Spotify) and Spirit AI companion.

### Dynamic Island Dimensions & Physics
- **Collapsed Notch**: `200px × 32px` (Snaps directly behind the MacBook hardware notch bezel).
- **Expanded HUD**: `640px × 146px` (Custom spring easing `cubic-bezier(0.16, 1, 0.3, 1)` with 60fps GPU acceleration).
- **3-Column Layout**:
  - *Column 1 (Contextual Tab)*: Switches between `Beacon` (Primary goal with `[+10]` quick action), `Focus` (Running sprint timer with pause/play), and `Media` (Track title, artist, play/pause scrub).
  - *Column 2 (Rhythm & Streak)*: 7-day calendar strip with glowing Amber today badge (`#FF7A00`) and streak flame counter (`14d streak 🔥`).
  - *Column 3 (Overall Ring)*: Solar Amber circular SVG progress ring with bold percentage readout.

---

## 3. The 6 Goal Paradigms (Engineered for Real Humans)

| Paradigm | Psychology & Use Case | Key Engine Attributes | Notch HUD Representation |
|---|---|---|---|
| **1. Habit** | Daily/weekly automatic routines (Gym, meditation) | Streak engine, frequency target (e.g. 4x/wk), freeze days | Glowing flame icon, cadence progress pill |
| **2. Accumulative** | Measurable volume (500 LeetCode problems, 100 cold emails) | Target value, current counter, unit string | Interactive `[+10]` increment button in notch |
| **3. Deadline** | Hard ship dates (Launch SaaS app, file taxes) | Target timestamp, burn-down velocity, time remaining | Real-time countdown timer & pacing indicator |
| **4. Milestone** | Multi-phase complex projects | Sequential checklist items with % completion | Phase progress bar & chime on sub-task clearance |
| **5. Duration** | Time in the zone (1,000 deep work hours) | Minutes/hours tracked, link to FocusManager | Direct sync with active focus sprint timer |
| **6. Avoidance** | Quitting addictions or distractions (No sugar, clean days) | Relapse counter, clean days streak, triggers | Clean day counter with restart verification modal |

---

## 4. Beacon Spirit AI Companion Engine

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

## 5. macOS System Integration & Performance

- **Global Hotkey (`⌘⇧B`)**: Electron global shortcut triggers immediate overlay toggle without task switching.
- **Zero Battery Drain**:
  - Window rendering throttles to 0 FPS when collapsed.
  - Idle CPU usage sits at **0.1%**.
  - Total memory footprint: **~45 MB** (vs 450 MB in Slack/Notion).
- **SQLite WAL Local Persistence**:
  - Synchronous disk writes with Write-Ahead Logging (`PRAGMA journal_mode=WAL;`).
  - Zero cloud latency, 100% offline and crash-resilient.

---

## 6. Business, Pricing & Razorpay Gateway

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

## 7. Project & Repository Layout

```
/Users/tarunyakesh/Desktop/
├── Beacon - Starup/                  # Main macOS Native Desktop Application
│   ├── apps/
│   │   ├── main/                    # Electron Main Process (Window manager, global hotkeys, IPC)
│   │   ├── preload/                 # Preload contextBridge (Type-safe IPC APIs)
│   │   ├── renderer/                # React 19 UI (Notch HUD, Main Dashboard, Settings)
│   │   └── web/                     # Mirrored Marketing Website (Vite + React 19)
│   ├── packages/
│   │   ├── core/                    # Goal Engine, FocusManager, ActivityEngine, AI Orchestrator
│   │   └── database/                # SQLite WAL schema, DDL migrations, repositories
│   └── Logo.png                     # Master macOS App Icon Asset
│
└── Beacon - WebBranding/            # Standalone High-Traffic Marketing & Checkout Site (beacon.tarunya.me)
    ├── dist/                        # Production optimized static build (<80 kB gzipped)
    ├── public/                      # Favicons, logo, robots.txt, sitemap.xml
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx           # Glass header with currency toggle & Get Beacon CTA
    │   │   ├── HeroSection.tsx      # High-impact headline, DMG download pill, metrics
    │   │   ├── IslandSimulator.tsx  # Interactive MacBook Notch (Hover/click, tabs, [+10] problems)
    │   │   ├── FeatureGrid.tsx      # 6 Behavioral Paradigms & macOS integrations
    │   │   ├── SpiritShowcase.tsx   # Beacon Spirit pet mascot & interactive action spells
    │   │   ├── TechSpecs.tsx        # Benchmarks (0.1% CPU, 45MB RAM, <16ms latency)
    │   │   ├── PricingSection.tsx   # Tier cards (Lifetime Pioneer & Annual)
    │   │   ├── RazorpayModal.tsx    # Secure Razorpay checkout & test simulator
    │   │   ├── LicenseSuccessModal.tsx # Post-payment confetti, license key & DMG download
    │   │   ├── FAQSection.tsx       # Battery, non-notch Macs, and refund questions
    │   │   └── Footer.tsx           # Branding, credits to Tarunya Kesh, status pill
    │   ├── services/
    │   │   └── razorpay.ts          # Razorpay SDK bridge & cryptographical key generator
    │   └── styles/
    │       ├── tokens.css           # Hardware color tokens, glass shaders, spring easings
    │       └── global.css           # Reset, typography, animations
    ├── BEACON_CONTEXT.md            # This Master Document
    └── README.md                    # Deployment guide for Vercel / Cloudflare Pages
```
