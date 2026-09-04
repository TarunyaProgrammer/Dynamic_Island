# Beacon Brand Identity Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Beacon's visual identity across all surfaces (macOS app icon, menu bar status item, in-app headers, dynamic island, and web landing page) to match the primary logo from `brand-identity.png`.

**Architecture:** Extract the master primary icon from `brand-identity.png` using transparent alpha masking and Apple HIG squircle geometry; compile native `.icns` mipmaps using macOS `iconutil`; update web and renderer static assets and `BeaconLogo` component; update the status bar template image in `TrayController.ts`; and add the dynamic island badge.

**Tech Stack:** macOS `iconutil`, Python 3 (Pillow), Electron, React 19, TypeScript, Vite.

---

### Task 1: Master Asset Extraction & Native macOS Icon Compilation

**Files:**
- Create/Run: `scripts/generate-brand-assets.py`
- Modify: `assets/Beacon.png`
- Modify: `assets/icon.icns`
- Modify: `assets/Beacon.icns`

- [ ] **Step 1: Write asset generation script**

Create `scripts/generate-brand-assets.py` to extract the master squircle from `brand-identity.png`, apply standard macOS squircle transparency, and generate all standard mipmap sizes.

```python
import os
import subprocess
from PIL import Image, ImageDraw

def main():
    src_path = "brand-identity.png"
    img = Image.open(src_path).convert("RGBA")
    
    # 1. Extract the Primary App Icon Squircle from brand-identity.png
    # Coordinates in brand-identity.png for the primary lockup icon
    # x: 848 to 976, y: 106 to 234 (128x128)
    crop = img.crop((848, 106, 976, 234))
    
    # Create high-res 1024x1024 master
    master = crop.resize((1024, 1024), Image.Resampling.LANCZOS)
    
    # Apply standard macOS squircle rounded corner mask
    # macOS squircle has corner radius ~ 22.37% of width = 229px
    mask = Image.new("L", (1024, 1024), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, 1024, 1024], radius=229, fill=255)
    
    master.putalpha(mask)
    os.makedirs("assets", exist_ok=True)
    master.save("assets/Beacon.png", "PNG")
    print("Saved assets/Beacon.png (1024x1024)")
    
    # 2. Generate macOS .iconset
    iconset_dir = "assets/Beacon.iconset"
    os.makedirs(iconset_dir, exist_ok=True)
    
    sizes = [
        ("icon_16x16.png", 16),
        ("icon_16x16@2x.png", 32),
        ("icon_32x32.png", 32),
        ("icon_32x32@2x.png", 64),
        ("icon_128x128.png", 128),
        ("icon_128x128@2x.png", 256),
        ("icon_256x256.png", 256),
        ("icon_256x256@2x.png", 512),
        ("icon_512x512.png", 512),
        ("icon_512x512@2x.png", 1024),
    ]
    
    for filename, sz in sizes:
        resized = master.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(os.path.join(iconset_dir, filename), "PNG")
        
    # 3. Compile .icns with iconutil
    subprocess.run(["iconutil", "-c", "icns", iconset_dir, "-o", "assets/icon.icns"], check=True)
    subprocess.run(["cp", "assets/icon.icns", "assets/Beacon.icns"], check=True)
    print("Successfully generated assets/icon.icns and assets/Beacon.icns")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run script and verify icon compilation**

Run: `python3 scripts/generate-brand-assets.py && file assets/icon.icns assets/Beacon.icns`
Expected: Output showing valid Mac OS X icon format.

- [ ] **Step 3: Commit native icon assets**

```bash
git add assets/ scripts/generate-brand-assets.py
git commit -m "feat(branding): extract primary logo and compile native macos icns bundles"
```

---

### Task 2: Web Marketing Static Brand Assets

**Files:**
- Modify: `apps/web/public/logo.png`
- Modify: `apps/web/public/favicon.ico`
- Modify: `apps/web/public/favicon.png`
- Modify: `apps/web/public/apple-touch-icon.png`

- [ ] **Step 1: Write web asset generation helper**

Extend `scripts/generate-brand-assets.py` to produce web favicons, apple touch icon, and web logo.

```python
    # 4. Generate Web Assets
    web_pub = "apps/web/public"
    os.makedirs(web_pub, exist_ok=True)
    
    # 512x512 logo.png
    master.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(web_pub, "logo.png"))
    # 180x180 apple-touch-icon.png
    master.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(web_pub, "apple-touch-icon.png"))
    # 32x32 favicon.png
    fav32 = master.resize((32, 32), Image.Resampling.LANCZOS)
    fav32.save(os.path.join(web_pub, "favicon.png"))
    # Multi-resolution favicon.ico (16, 32, 48)
    master.resize((48, 48), Image.Resampling.LANCZOS).save(
        os.path.join(web_pub, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)]
    )
```

- [ ] **Step 2: Run script and verify web public files**

Run: `python3 scripts/generate-brand-assets.py && ls -la apps/web/public/`
Expected: Updated `logo.png`, `favicon.ico`, `favicon.png`, `apple-touch-icon.png`.

- [ ] **Step 3: Commit web assets**

```bash
git add apps/web/public/ scripts/generate-brand-assets.py
git commit -m "feat(branding): update web marketing brand assets and favicons"
```

---

### Task 3: Desktop App Renderer Branding Assets & `BeaconLogo` Component

**Files:**
- Modify: `apps/renderer/public/logo.png`
- Modify: `apps/renderer/src/components/BeaconLogo.tsx`
- Modify: `apps/renderer/src/surfaces/DynamicIslandView.tsx`

- [ ] **Step 1: Copy primary logo to renderer public directory**

```bash
cp apps/web/public/logo.png apps/renderer/public/logo.png
```

- [ ] **Step 2: Update `apps/renderer/src/components/BeaconLogo.tsx`**

Ensure `BeaconLogo` renders cleanly with rounded squircle styling and proper aspect ratio.

```tsx
// apps/renderer/src/components/BeaconLogo.tsx
import React from 'react';

interface BeaconLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const BeaconLogo: React.FC<BeaconLogoProps> = ({ size = 18, className, style }) => {
  return (
    <img
      src="/logo.png"
      alt="Beacon Logo"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.22)}px`,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      draggable={false}
    />
  );
};
```

- [ ] **Step 3: Add subtle Beacon mark in `DynamicIslandView.tsx`**

In `apps/renderer/src/surfaces/DynamicIslandView.tsx`, add the compact Beacon logo mark on the left side of the notch header.

- [ ] **Step 4: Commit desktop renderer branding changes**

```bash
git add apps/renderer/public/logo.png apps/renderer/src/components/BeaconLogo.tsx apps/renderer/src/surfaces/DynamicIslandView.tsx
git commit -m "feat(branding): update renderer BeaconLogo and add dynamic island badge"
```

---

### Task 4: Native macOS Menu Bar Template Icon

**Files:**
- Modify: `apps/main/tray/TrayController.ts`

- [ ] **Step 1: Update `createDefaultIcon` in `TrayController.ts`**

Replace the circle with the crisp 16x16 vector silhouette of the "B" glyph matching the brand outline/monochrome variation.

```typescript
  private createDefaultIcon(): Electron.NativeImage {
    // 16x16 crisp monochrome vector template of the faceted Beacon "B" glyph
    const svg = `
      <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 2.5C3 1.95 3.45 1.5 4 1.5H8.2C10.6 1.5 12.5 3.1 12.5 5.2C12.5 6.4 11.8 7.4 10.7 8C12.1 8.6 13 9.7 13 11.1C13 13.3 11 14.5 8.4 14.5H4C3.45 14.5 3 14.05 3 13.5V2.5Z" fill="black" fill-rule="evenodd"/>
        <path d="M5 3.5V7.2H8C9.2 7.2 10.3 6.4 10.3 5.3C10.3 4.2 9.2 3.5 8 3.5H5ZM5 8.7V12.5H8.3C9.7 12.5 10.8 11.7 10.8 10.5C10.8 9.3 9.7 8.7 8.3 8.7H5Z" fill="white"/>
      </svg>
    `;
    const image = nativeImage.createFromBuffer(Buffer.from(svg), { scaleFactor: 2.0 });
    image.setTemplateImage(true); // Automatically adapts to macOS light/dark menu bar
    return image;
  }
```

- [ ] **Step 2: Commit menu bar tray icon**

```bash
git add apps/main/tray/TrayController.ts
git commit -m "feat(branding): update macOS menu bar tray icon with monochrome B template"
```

---

### Task 5: Web Landing Page Components & Dock Simulator

**Files:**
- Modify: `apps/web/src/components/Navbar.tsx`
- Modify: `apps/web/src/components/Footer.tsx`
- Modify: `apps/web/src/components/IslandSimulator.tsx`

- [ ] **Step 1: Verify and polish `Navbar.tsx` and `Footer.tsx`**

Ensure `apps/web/src/components/Navbar.tsx` and `Footer.tsx` render the new logo with `borderRadius: "6px"` and clean drop shadow.

- [ ] **Step 2: Update `IslandSimulator.tsx`**

Ensure the macOS dock simulator and simulated notch display the new primary logo.

- [ ] **Step 3: Commit web component polish**

```bash
git add apps/web/src/components/
git commit -m "feat(branding): polish web navbar, footer, and island simulator logos"
```

---

### Task 6: Full Verification & Build Checks

- [ ] **Step 1: Run TypeScript checks and production bundle**

Run: `npm run build`
Expected: `tsc --noEmit`, `build:preload`, and `vite build` all exit with code 0.

- [ ] **Step 2: Run test suite**

Run: `npm run test`
Expected: All tests pass.
