# Contributing to Beacon

Thank you for your interest in **Beacon**. 

Beacon is a proprietary, source-available macOS goal and progress operating layer created and maintained by **Tarunya K** ([@TarunyaProgrammer](https://github.com/TarunyaProgrammer)). To ensure the highest level of software quality, security, and architectural integrity, all contributions are subject to the governance described below.

---

## 1. Contributor Agreement

By submitting a Pull Request, issue, patch, code snippet, documentation, or suggestion to the Beacon project, you explicitly agree that:

1. **Intellectual Property Assignment**: You assign and transfer all right, title, interest, and intellectual property in and to your contribution to **Tarunya K**.
2. **Originality Guarantee**: You warrant that all submitted code is your own original work and does not infringe upon third-party copyrights, patents, or trade secrets. Code adapted from copyleft licenses (e.g. GPL) is strictly prohibited.
3. **Monetization & Licensing**: The project owner retains the exclusive right to commercialize, distribute, and license the codebase in any form without compensation obligations.

---

## 2. Contribution Workflow

> [!IMPORTANT]
> **Do not open unsolicited large Pull Requests without prior discussion.**

- **Feature Proposals**: Open an **Issue / RFC** describing the proposed feature, user flow, UX mockup, and architectural changes *before* writing code.
- **Bug Fixes**: Open an issue detailing reproduction steps, macOS version, hardware architecture (Apple Silicon / Intel), and relevant logs.

---

## 3. Engineering & Code Quality Standards

All submissions must adhere to the following standards:

### Architecture & Tech Stack
- **Runtime**: Electron 34+, Node.js 22+
- **Language**: TypeScript 5.8+ with strict type checking enabled (`noImplicitAny`, `strictNullChecks`).
- **UI Framework**: React 19 + Vite 6.
- **Persistence**: SQLite via `better-sqlite3` with Write-Ahead Logging (WAL) and idempotent schema migrations.
- **Pure Core**: `packages/core/` and `packages/database/` must never import DOM, Electron, or React libraries.
- **Context Isolation**: Always maintain `contextIsolation: true` and `nodeIntegration: false` in Electron windows.

### Testing & Verification
- **Automated Tests**: Every new feature or bug fix in `packages/core/` or `packages/database/` must include comprehensive Vitest unit tests.
- **Verification Commands**:
  ```bash
  npm test           # Run Vitest test suite
  npx tsc --noEmit   # Strict TypeScript type check
  npm run build      # Verify production build compilation
  ```

---

## 4. Git & PR Guidelines

1. **Branch Naming**:
   - `feat/<short-description>`
   - `fix/<short-description>`
   - `docs/<short-description>`
2. **Commit Hygiene**:
   - Use Conventional Commits (e.g., `feat(core): add streak rest day evaluation`, `fix(ui): adjust island pill hover bounds`).
   - Clean, rebased branch history with no merge commits (`git rebase main`).

---

## 5. Security Reporting

If you discover a security vulnerability or sensitive data issue in Beacon, **do not open a public issue**. Please report it privately to **Tarunya K** via GitHub Security Advisories.
