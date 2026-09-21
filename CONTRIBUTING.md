# Contributing to Beacon

Thanks for helping build Beacon — a quiet layer of motivation for macOS.

## Before you start

- Search existing issues before opening a new one.
- For substantial features or product changes, open a feature proposal first so we can agree on scope.
- Pick issues labeled `good first issue`, `help wanted`, or `swoc` if you are looking for a place to begin.

## Development setup

```bash
git clone https://github.com/TarunyaProgrammer/Dynamic_Island.git
cd Dynamic_Island
npm install
npm run dev
```

Beacon requires macOS, Node.js 22+, and npm 10+. The EventKit helper and production build are macOS-specific.

## Making a change

1. Fork the repository and create a branch such as `feat/goal-templates`, `fix/island-hover`, or `docs/setup-guide`.
2. Keep the change focused on one issue or improvement.
3. Follow the architecture boundaries: do not import Electron, DOM, or React into `packages/core` or `packages/database`; preserve `contextIsolation: true` and `nodeIntegration: false`.
4. Add or update Vitest coverage for domain and database behavior.
5. Run the relevant checks:

   ```bash
   npm test
   npm run build
   ```

6. Open a pull request using the provided template. Include screenshots or a short recording for renderer changes.

## Pull request expectations

- Use a clear, conventional commit message, for example `fix(island): preserve hover bounds`.
- Link the issue the pull request resolves when one exists.
- Do not include unrelated formatting changes or generated build output.
- Be respectful in review and respond to requested changes.

## License for contributions

By submitting a contribution, you agree that your contribution is your original work and that it may be distributed under the repository's [MIT License](LICENSE). You retain copyright in your contribution.

## Reporting security issues

Do not report security vulnerabilities in a public issue. Follow [SECURITY.md](SECURITY.md) instead.
