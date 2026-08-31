# Contributing to Beacon

Thank you for your interest in **Beacon**. 

Beacon is a proprietary, source-available project created and maintained by **Tarunya K** ([@TarunyaProgrammer](https://github.com/TarunyaProgrammer)). To ensure the highest level of software quality, security, and architectural integrity, all contributions are subject to the strict rules and governance described below.

---

## 1. Strict Contributor License Agreement (CLA)

By submitting a Pull Request, issue, patch, code snippet, documentation, or suggestion to the Beacon project, you explicitly and irrevocably agree that:

1. **Assignment of Intellectual Property**: You assign and transfer all right, title, interest, and intellectual property in and to your contribution (including all patent, copyright, trade secret, and other proprietary rights) to **Tarunya K**.
2. **Royalty-Free & Perpetual**: The project owner has the exclusive, royalty-free, perpetual, worldwide right to use, modify, distribute, sublicense, monetize, commercialize, or relicence the submitted contribution in any form without any payment, compensation, or attribution obligation to you.
3. **Originality Guarantee**: You warrant that all submitted code is 100% your own original work and does not infringe upon any third-party copyright, trade secret, patent, or proprietary license. Code copied or adapted from GPL, non-permissive open-source projects, or proprietary codebases is **strictly prohibited**.

---

## 2. Mandatory Pre-Approval Protocol

> [!IMPORTANT]
> **Do not open unsolicited large Pull Requests without prior approval.**

- **Feature Proposals**: You must open an **Issue / RFC** describing the proposed feature, user value, UI design mockup, and architectural changes *before* writing any code.
- **Scope Alignment**: Only PRs tied to pre-approved issues by the maintainer (`@TarunyaProgrammer`) will be reviewed. Unsolicited major PRs will be closed immediately.
- **Bug Fixes**: Open an issue detailing reproduction steps, macOS version, hardware architecture (Apple Silicon / Intel), and logs before submitting a PR.

---

## 3. Engineering & Code Quality Standards

All submissions must meet the following uncompromising engineering standards:

### Language & Concurrency
- **Swift 6**: Must compile cleanly under Swift 6 language mode with strict concurrency checking enabled. Zero concurrency warnings or data race violations are permitted.
- **No Force Unwrapping**: Avoid force unwrapping (`!`) and unsafe pointer operations unless interacting with low-level C bridges with exhaustive defensive guards.
- **Memory Safety**: No strong reference cycles in closures, notification observers, or async tasks (`[weak self]` or isolated `@MainActor` state required).

### Architecture & Conventions
- **App Architecture**: Respect the 3-layer architecture (UI -> Core State -> Low-level System/Window Adapters).
- **Widget System**: Widgets must conform strictly to `PerchWidget` / `WidgetLayout` protocols without mutating shared state outside `AppState`.
- **Naming & Domain Integrity**:
  - Logger identifiers and Keychain keys must follow `com.perch.*` reverse-DNS naming.
  - Type names within the core module should not carry redundant module prefixes.

### Testing & Verification
- **Unit Tests Required**: Every new feature or bug fix must include comprehensive unit tests in `perchTests`.
- **Pass All Tests**: `just test` (or `xcodebuild -scheme perch -configuration Debug test`) must pass 100% with zero failures.
- **Code Formatting**: Code must be strictly formatted with `swift-format`:
  ```bash
  just format
  just lint
  ```

---

## 4. Git & Pull Request Guidelines

1. **Branch Naming**:
   - `feature/<issue-number>-<short-description>`
   - `fix/<issue-number>-<short-description>`
   - `docs/<short-description>`
2. **Commit Hygiene**:
   - Atomic, descriptive commit messages following Conventional Commits (e.g., `feat(ui): add waveform visualizer smoothing`, `fix(nowplaying): resolve spotify metadata race condition`).
   - Clean, rebased branch history with no dirty merge commits (`git rebase main`).
3. **PR Description**:
   - Link the approved Issue number (`Fixes #123` or `Resolves #456`).
   - Include before/after screenshots or screen recordings for all UI changes.
   - List explicit manual test steps performed on macOS.

---

## 5. Security & Vulnerability Reporting

If you discover a security vulnerability or sensitive data leak in Beacon, **do not open a public issue**. 

Please report vulnerabilities privately to the maintainer via GitHub Security Advisories or by contacting **Tarunya K** directly. We will investigate and respond promptly.

---

## 6. Code of Conduct

We expect all contributors to maintain professional, respectful, and constructive communication at all times. Toxic behavior, harassment, or bad-faith discussions will result in immediate repository bans.
