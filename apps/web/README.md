# Beacon Marketing Website (beacon.tarunya.me)

High-performance, modern startup marketing website for **Beacon** — The Intentional Dynamic Island & AI Companion for macOS.

## Features
- **Interactive MacBook Dynamic Island Hardware Simulator**: Visitors can hover to expand the physical notch, toggle Beacon/Focus/Media tabs, and increment live goal progress counters.
- **Beacon Spirit Pet & AI Spell Engine**: Interactive floating companion mascot with word-by-word streaming responses.
- **6 Behavioral Goal Paradigms**: Habit, Accumulative, Deadline, Milestone, Duration, Avoidance.
- **Secure Razorpay Gateway**: Pre-configured standard checkout supporting Cards, UPI, NetBanking, Apple Pay, with sandbox test mode.
- **Confetti License Generator**: Post-checkout celebration modal generating cryptographically styled license keys (`BCN-LIFE-XXXX-XXXX`) and direct universal macOS DMG download links.
- **Ultra-Lightweight Production Bundle**: Built with Vite 6 + React 19. Gzipped bundle < 80 kB. 100/100 Core Web Vitals.

## Deploying to beacon.tarunya.me

### Option A: Vercel (Recommended)
1. Push this folder or repo to GitHub.
2. In Vercel, import the project and configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Under **Settings -> Domains**, add:
   - `beacon.tarunya.me`
4. In your DNS manager (Cloudflare/Namecheap/Route53) for `tarunya.me`:
   - Type: `CNAME`
   - Name: `beacon`
   - Value: `cname.vercel-dns.com`

### Option B: Cloudflare Pages
1. In Cloudflare Dashboard -> Workers & Pages -> Create Application -> Pages.
2. Connect repository.
3. Build Settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add custom domain `beacon.tarunya.me` (Cloudflare automatically routes DNS with 0 configuration).

## Configuring Live Razorpay Keys
Open `src/services/razorpay.ts` and update:
```ts
export const RAZORPAY_CONFIG = {
  keyId: "rzp_live_YOUR_ACTUAL_KEY", // Replace with your live Razorpay Key ID
  currencyINR: "INR",
  currencyUSD: "USD",
};
```

## Local Development
```bash
npm install
npm run dev
```
Visit http://localhost:3000
