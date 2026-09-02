---
name: react-desktop-performance
description: >
  Use when writing, optimizing, or refactoring React 19 desktop components in Beacon —
  focusing on 60fps fluid animations, glassmorphism tokens, custom SVG progress rings,
  keyboard navigation ergonomics, and zero-jank micro-interactions.
---

# Beacon — React Desktop Performance & Design System

Beacon’s interface is designed as an ultra-fast, premium macOS desktop companion.
Renderers must maintain high frame rates, instant feedback under 2 seconds, and seamless dark glass aesthetics.

---

## Core Principles

1. **Sub-2-Second Action Flow**:
   - All user actions (click `+1`, trigger shortcut, toggle milestone) must render optimism immediately.
2. **Mac Glassmorphism Tokens**:
   - Never use solid opaque backgrounds or browser-default styles.
   - Use design system tokens from `apps/renderer/src/styles/tokens.css`.
3. **SVG & Canvas over Heavy DOM**:
   - Use lightweight SVG for progress rings and charts (`GoalProgressRing.tsx`).

---

## Design System Tokens

| Token | Value | Purpose |
|---|---|---|
| `var(--bg-glass)` | `rgba(18, 18, 24, 0.85)` | Main surface background |
| `var(--bg-glass-card)` | `rgba(255, 255, 255, 0.04)` | Card surface |
| `var(--border-subtle)` | `rgba(255, 255, 255, 0.08)` | Outer hairline borders |
| `var(--accent-glow)` | `rgba(52, 211, 153, 0.25)` | Focus and active aura |
| `var(--font-system)` | `-apple-system, BlinkMacSystemFont, 'SF Pro'` | Native macOS typography |

---

## Performance Patterns

### 1. Zero-Jank SVG Progress Ring
Use SVG with `strokeDashoffset` and CSS transitions for continuous 60fps animations:

```tsx
export const GoalProgressRing: React.FC<{
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
}> = ({ progress, size = 36, strokeWidth = 3.5, color = '#34d399' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circumference - clamped * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
        style={{
          transition: 'stroke-dashoffset 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </svg>
  );
};
```

### 2. Micro-Interactions & Keyboard Accessibility
- Every interactive element must support `:hover`, `:active`, and keyboard `:focus-visible`.
- Use spring-like scale transforms (`transform: scale(0.98)` on active) for tactile feedback.

```css
.btn-quick-increment {
  transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-quick-increment:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}
.btn-quick-increment:active {
  transform: scale(0.96);
}
```

---

## Common Pitfalls

1. **Avoid Layout Thrashing**:
   - Animate `transform` and `opacity` only; never animate `height`, `width`, or `top` directly on high-frequency loops.
2. **Icon Consistency**:
   - Use Lucide semantic icons (`lucide-react`) at consistent stroke widths (1.5–1.75).
   - Never use raw emojis in production desktop UI.
3. **No Window Scrollbar Flicker**:
   - Set `overflow: hidden` on Island and Tray Popover surfaces; use custom thin scrollbars on Main App only.
