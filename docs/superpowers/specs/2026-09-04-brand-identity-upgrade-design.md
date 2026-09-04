# Beacon Brand Identity & Logo Upgrade Specification

## 1. Overview & Objective

Upgrade Beacon's visual identity from the legacy 3D glass lantern icon to the new Apple-grade brand system established in `brand-identity.png`. 

The new identity centers on a geometric, faceted letter **"B"** glowing with morning solar amber light on a deep charcoal squircle background, paired with the philosophy *"Clarity Creates Progress"*.

### Core Principles
- **Aesthetic Excellence**: Native macOS Human Interface Guidelines (HIG) compliance with pixel-perfect squircle geometry, retina-sharp mipmaps, and high contrast.
- **Zero Core Alteration**: No alterations to business logic, IPC pipelines, SQLite databases, or goal execution flows.
- **Surface Uniformity**: Seamless brand consistency across Dock, Launchpad, Menu Bar, Dynamic Island, Desktop Popovers, and the Web Landing Page.

---

## 2. Design Tokens & Brand System

### Color Palette
- **Beacon Orange**: `#F97316` (Primary solar gradient transitioning from `#FF9D43` highlights to `#D94E06` deep amber)
- **Charcoal**: `#171717` (Deep background for squircle app icons and dark-mode surfaces)
- **Warm Gray**: `#6B7280` (Secondary typographic accents, borders, and subtle indicators)
- **Soft Cream**: `#FAF7F2` (Light mode backgrounds and high-contrast lockup backgrounds)

### Typography & Lockup
- **Typeface**: Inter / General Sans
- **Title**: `Beacon` (Tracking: `-0.02em`, Weight: `800`)
- **Subtitle / Tagline**: `CLARITY CREATES PROGRESS` (Uppercase, Tracking: `0.12em`, Weight: `600`, Color: `#6B7280`)

### Logo Variations
1. **Primary**: Faceted glowing amber "B" on deep charcoal squircle (Dock, Desktop Main, Web Navbar, Favicons).
2. **Monochrome Template**: High-contrast silhouette/stencil of the "B" (macOS Menu Bar Tray Icon).
3. **Light**: Faceted amber "B" on soft cream squircle (Light-mode marketing assets).
4. **Outline**: Clean hairline vector contour of the "B" (Minimalist wireframe and watermark applications).

---

## 3. Surface-by-Surface Implementation Specifications

### 3.1 Native macOS App & Dock Assets
- **Files**:
  - `assets/Beacon.png`: Master 1024x1024 RGBA PNG with transparent background.
  - `assets/icon.icns` & `assets/Beacon.icns`: Native macOS multi-resolution icon bundles.
- **Specification**:
  - Extract the squircle master icon directly from `brand-identity.png`.
  - Apply standard macOS app icon curvature radius.
  - Generate a 10-layer Apple `.iconset` containing:
    - `icon_16x16.png`, `icon_16x16@2x.png`
    - `icon_32x32.png`, `icon_32x32@2x.png`
    - `icon_128x128.png`, `icon_128x128@2x.png`
    - `icon_256x256.png`, `icon_256x256@2x.png`
    - `icon_512x512.png`, `icon_512x512@2x.png`
  - Compile the bundle using `/usr/bin/iconutil -c icns`.

### 3.2 macOS Menu Bar / Status Item
- **File**: `apps/main/tray/TrayController.ts`
- **Specification**:
  - Replace the legacy geometric circle-dot SVG with a crisp 16x16 vector template of the faceted "B" silhouette.
  - Set `image.setTemplateImage(true)` to enable native macOS automatic inversion for light wallpapers, dark mode, and high-contrast desktop spaces.

### 3.3 Desktop App Surfaces (Renderer)
- **Files**:
  - `apps/renderer/public/logo.png`: Replaced with the primary glowing squircle mark.
  - `apps/renderer/src/components/BeaconLogo.tsx`: Updated with vector SVG rendering for pixel-sharp scaling at 16px, 18px, and 24px, with fallback to high-DPI raster asset.
  - `apps/renderer/src/surfaces/MainAppView.tsx`: Displays the upgraded mark in the sidebar/window header.
  - `apps/renderer/src/surfaces/TrayPopoverView.tsx`: Displays the upgraded mark in the quick-access header.
  - `apps/renderer/src/surfaces/DynamicIslandView.tsx`: Displays the subtle "B" badge on the left side of the notch bar (matching the "MAC DYNAMIC ISLAND" mockup in `brand-identity.png`).

### 3.4 Web Marketing Landing Page
- **Files**:
  - `apps/web/public/logo.png`: Upgraded high-res primary squircle logo.
  - `apps/web/public/favicon.ico`: Regenerated 32x32 multi-resolution favicon.
  - `apps/web/public/favicon.png`: Crisp 32x32 PNG.
  - `apps/web/public/apple-touch-icon.png`: 180x180 iOS home screen icon.
  - `apps/web/src/components/Navbar.tsx`: Uses the new logo in the floating glass navigation pill.
  - `apps/web/src/components/Footer.tsx`: Uses the new logo in the brand description column.
  - `apps/web/src/components/IslandSimulator.tsx`: Renders the new app icon in the simulated macOS Dock and simulated notch.

---

## 4. Verification & Quality Gates

1. **Compilation & Type Check**:
   - `npm run build` must succeed with zero TypeScript or esbuild errors.
2. **Retina & Scaling Verification**:
   - Verify that icons render without subpixel blurriness at 16px, 24px, 32px, 64px, 128px, and 1024px.
3. **Menu Bar Contrast**:
   - Verify macOS menu bar template image adapts cleanly against both dark and light desktop wallpapers.
4. **App Packaging Check**:
   - Verify `electron-builder` correctly bundles `assets/icon.icns` without corrupting the `.app` bundle header.
