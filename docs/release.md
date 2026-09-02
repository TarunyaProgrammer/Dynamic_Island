# Beacon — Release Workflow

Beacon desktop releases are automated via GitHub Actions using `electron-builder`.

---

## Automated Tag-Based Release

Releases are triggered by pushing a semver git tag:

```bash
# 1. Update version in package.json (e.g., 1.0.1)
npm version patch # or minor, major

# 2. Push commit and tag to GitHub
git push origin main --tags
```

The [Release Workflow](.github/workflows/release.yml) automatically:
1. Checks out the repository on `macos-latest`.
2. Installs clean dependencies with `npm ci`.
3. Runs the test suite (`npm test`).
4. Builds and packages the Universal macOS `.dmg` and `.zip` binaries via `electron-builder`.
5. Creates a GitHub Release with attached downloadable release assets.

---

## Local Packaging & Verification

To build and test release packages locally on macOS:

```bash
# Clean build and package standalone DMG to release/ directory
npm run package

# Or generate the unpacked application bundle for local inspection
npm run package:dir
```
