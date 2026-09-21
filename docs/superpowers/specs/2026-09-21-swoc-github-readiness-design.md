# Beacon SWOC GitHub Readiness Design

## Goal

Make Beacon a contributor-friendly MIT-licensed open-source repository that is ready for the Social Winter of Code (SWOC) program, without weakening the quality and security controls required by an Electron desktop application.

## Scope

This change converts the repository's published license and contributor terms, adds the standard GitHub community-health files, creates structured issue and pull-request intake, improves automated checks, and documents the GitHub dashboard configuration that cannot be versioned in the repository.

## Decisions

- Beacon will use the MIT License. This replaces the existing proprietary license and applies to project-owned source, documentation, and assets. Third-party dependencies retain their own licenses.
- Contributions are accepted under the MIT License. Contributors keep copyright in their work; submitting a pull request grants Beacon the right to distribute the contribution under MIT.
- GitHub issue forms will collect only information necessary to triage a bug, feature proposal, documentation improvement, or newcomer task.
- Pull requests will require a linked issue when applicable, testing details, and UI screenshots for visible renderer changes.
- `CODEOWNERS` routes changes to high-risk areas—Electron main/preload code, database/core domain code, workflows, and release configuration—to the maintainer.
- CI remains macOS-based because the project builds the EventKit helper. It will use explicit read-only default permissions and separately named test and build steps. The release workflow remains tag-only with only the `contents: write` permission it needs to publish release assets.
- Dependabot will check npm and GitHub Actions dependencies weekly. CodeQL will analyze TypeScript/JavaScript on pull requests, pushes to `main`, and a weekly schedule.

## Repository Files

- `LICENSE`: canonical MIT license text with the project copyright.
- `README.md`: open-source positioning, contributor entry points, project status, and SWOC welcome.
- `CONTRIBUTING.md`: lightweight contributor workflow, quality requirements, scope boundaries, and MIT contribution terms.
- `CODE_OF_CONDUCT.md`: Contributor Covenant-based behavioral expectations and maintainer contact route.
- `SECURITY.md`: private reporting route, supported versions, and disclosure expectations.
- `.github/ISSUE_TEMPLATE/*.yml`: bug, feature, documentation, and good-first-issue forms plus issue chooser configuration.
- `.github/PULL_REQUEST_TEMPLATE.md`: focused review checklist.
- `.github/CODEOWNERS`: maintainer review routing.
- `.github/dependabot.yml`: dependency update policy.
- `.github/workflows/codeql.yml`: TypeScript/JavaScript security analysis.
- `.github/labels.yml`: documented label taxonomy for manually creating labels through GitHub.

## GitHub Dashboard Configuration

The maintainer will configure the repository as public; add description, website, topics, and social preview; enable Issues, Discussions, dependency graph, Dependabot alerts and security updates, secret scanning, and private vulnerability reporting. A `main` ruleset will require pull requests, passing CI, resolved conversations, squash-only merges, linear history, no force pushes, and no branch deletions. While the maintainer works alone, zero approvals will be required. Once a second trusted maintainer is available, the ruleset will require one approval and code-owner review.

## Validation

- Confirm all published legal references say MIT and no contributor IP-assignment language remains.
- Validate workflow YAML and run `npm test` and `npm run build` locally when the codebase is otherwise healthy.
- Confirm the GitHub templates appear in the repository's new-issue and pull-request flows after pushing the changes.
