# Beacon SWOC GitHub Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Beacon to an MIT-licensed, SWOC-ready open-source repository with clear contributor workflows and safe automated checks.

**Architecture:** Repository policy lives in version-controlled community-health files under the root and `.github/`; repository enforcement remains a documented GitHub dashboard configuration because GitHub rulesets cannot be committed to the repository. CI remains macOS-only to support the EventKit helper, while dependency and static-security checks run independently in GitHub Actions.

**Tech Stack:** Markdown, GitHub issue forms, GitHub Actions, Dependabot, CodeQL, npm, Vitest, TypeScript.

---

### Task 1: Replace proprietary legal terms with MIT contribution terms

**Files:**
- Modify: `LICENSE`
- Modify: `package.json:3-4,21`
- Modify: `CONTRIBUTING.md`
- Create: `CODE_OF_CONDUCT.md`
- Create: `SECURITY.md`

- [ ] **Step 1: Replace `LICENSE` with the canonical MIT license**

```text
MIT License

Copyright (c) 2026 Tarunya Kesharwani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Set package metadata to MIT**

Replace the `description` and `license` entries in `package.json` with:

```json
"description": "A quiet layer of motivation for macOS — your goals, always in sight.",
"license": "MIT",
```

- [ ] **Step 3: Rewrite `CONTRIBUTING.md` with this contributor workflow**

```markdown
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
```

- [ ] **Step 4: Add `CODE_OF_CONDUCT.md`**

```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, color, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our community include:

- Demonstrating empathy and kindness toward other people
- Being respectful of differing opinions, viewpoints, and experiences
- Giving and gracefully accepting constructive feedback
- Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience
- Focusing on what is best not just for us as individuals, but for the overall community

Examples of unacceptable behavior include:

- The use of sexualized language or imagery, and sexual attention or advances of any kind
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or email address, without their explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

Community leaders have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, and will communicate reasons for moderation decisions when appropriate.

## Scope

This Code of Conduct applies within all community spaces, and also applies when an individual is officially representing the community in public spaces. Examples of representing our community include using an official email address, posting via an official social media account, or acting as an appointed representative at an online or offline event.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainer, Tarunya Kesharwani, at https://github.com/TarunyaProgrammer. All complaints will be reviewed and investigated promptly and fairly.

All community leaders are obligated to respect the privacy and security of the reporter of any incident.

## Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines in determining the consequences for any action they deem in violation of this Code of Conduct:

### 1. Correction

**Community Impact**: Use of inappropriate language or other behavior deemed unprofessional or unwelcome in the community.

**Consequence**: A private, written warning from community leaders, providing clarity around the nature of the violation and an explanation of why the behavior was inappropriate. A public apology may be requested.

### 2. Warning

**Community Impact**: A violation through a single incident or series of actions.

**Consequence**: A warning with consequences for continued behavior. No interaction with the people involved, including unsolicited interaction with those enforcing the Code of Conduct, for a specified period of time. This includes avoiding interactions in community spaces as well as external channels like social media. Violating these terms may lead to a temporary or permanent ban.

### 3. Temporary Ban

**Community Impact**: A serious violation of community standards, including sustained inappropriate behavior.

**Consequence**: A temporary ban from any sort of interaction or public communication with the community for a specified period of time. No public or private interaction with the people involved, including unsolicited interaction with those enforcing the Code of Conduct, is allowed during this period. Violating these terms may lead to a permanent ban.

### 4. Permanent Ban

**Community Impact**: Demonstrating a pattern of violation of community standards, including sustained inappropriate behavior, harassment of an individual, or aggression toward or disparagement of classes of individuals.

**Consequence**: A permanent ban from any sort of public interaction within the community.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org), version 2.1, available at https://www.contributor-covenant.org/version/2/1/code_of_conduct.html.

Community Impact Guidelines were inspired by [Mozilla's code of conduct enforcement ladder](https://github.com/mozilla/diversity).

For answers to common questions about this code of conduct, see the FAQ at https://www.contributor-covenant.org/faq. Translations are available at https://www.contributor-covenant.org/translations.
```

- [ ] **Step 5: Add `SECURITY.md`**

```markdown
# Security Policy

## Supported Versions

Security fixes are applied to the latest version on the `main` branch.

## Reporting a Vulnerability

Please do not open a public issue for a suspected vulnerability.

Use [GitHub private vulnerability reporting](https://github.com/TarunyaProgrammer/Dynamic_Island/security/advisories/new). If that is unavailable, contact the maintainer privately at https://github.com/TarunyaProgrammer.

Include the affected version or commit, a clear description of the impact, reproducible steps or a proof of concept, and any suggested mitigation. Please avoid accessing data that does not belong to you or disrupting other users while researching.

We will acknowledge reports within seven days and work with you on a responsible disclosure timeline.
```

- [ ] **Step 6: Verify legal wording**

Run:

```bash
rg -n "proprietary|Intellectual Property Assignment|All Rights Reserved" LICENSE CONTRIBUTING.md README.md package.json
```

Expected: no proprietary or IP-assignment wording; the only permitted proprietary reference is none.

- [ ] **Step 7: Commit the legal conversion**

```bash
git add LICENSE package.json CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md
git commit -m "docs: adopt mit contribution policy"
```

### Task 2: Make the README a strong open-source landing page

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add open-source and CI badges immediately below the existing technology badges**

```markdown
[![CI](https://github.com/TarunyaProgrammer/Dynamic_Island/actions/workflows/ci.yml/badge.svg)](https://github.com/TarunyaProgrammer/Dynamic_Island/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-7C6CFF.svg)](CONTRIBUTING.md)
```

- [ ] **Step 2: Replace the final license section with the following community section**

```markdown
## Open Source & SWOC

Beacon is open source under the [MIT License](LICENSE) and welcomes contributors through SWOC and beyond. If you are new to the project, start with [`good first issue`](https://github.com/TarunyaProgrammer/Dynamic_Island/labels/good%20first%20issue) or [`swoc`](https://github.com/TarunyaProgrammer/Dynamic_Island/labels/swoc) issues.

Before contributing, read [CONTRIBUTING.md](CONTRIBUTING.md), check the [open issues](https://github.com/TarunyaProgrammer/Dynamic_Island/issues), and join [Discussions](https://github.com/TarunyaProgrammer/Dynamic_Island/discussions) for questions and ideas.

## Security

Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md). Do not open public issues for security reports.
```

- [ ] **Step 3: Keep the existing product sections and replace the old proprietary bullet in the closing section**

Ensure the closing copy reads:

```markdown
<div align="center">
  <sub>Created with care by <b>Tarunya K</b> • <a href="https://github.com/TarunyaProgrammer">@TarunyaProgrammer</a></sub>
</div>
```

- [ ] **Step 4: Check README links and formatting**

Run:

```bash
rg -n "proprietary|Contributing & License|License" README.md && git diff --check -- README.md
```

Expected: README only describes the MIT license and has no whitespace errors.

- [ ] **Step 5: Commit the landing-page update**

```bash
git add README.md
git commit -m "docs: welcome swoc contributors"
```

### Task 3: Add structured contribution intake and ownership rules

**Files:**
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/ISSUE_TEMPLATE/documentation.yml`
- Create: `.github/ISSUE_TEMPLATE/good_first_issue.yml`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/CODEOWNERS`
- Create: `.github/labels.yml`

- [ ] **Step 1: Create the issue chooser configuration**

```yaml
blank_issues_enabled: false
contact_links:
  - name: Questions and ideas
    url: https://github.com/TarunyaProgrammer/Dynamic_Island/discussions
    about: Please use Discussions for questions, support, and early-stage ideas.
  - name: Report a security vulnerability
    url: https://github.com/TarunyaProgrammer/Dynamic_Island/security/advisories/new
    about: Please report vulnerabilities privately.
```

- [ ] **Step 2: Create the four issue forms**

Create `.github/ISSUE_TEMPLATE/bug_report.yml`:

```yaml
name: Bug report
description: Report a reproducible problem in Beacon.
title: "[Bug]: "
labels: [bug]
body:
  - type: markdown
    attributes:
      value: Thanks for reporting a problem. Please do not include security vulnerabilities here.
  - type: textarea
    id: summary
    attributes:
      label: What happened?
      description: Describe the problem clearly and concisely.
    validations:
      required: true
  - type: textarea
    id: reproduce
    attributes:
      label: Steps to reproduce
      placeholder: |
        1. Open ...
        2. Click ...
        3. See ...
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Actual behavior
    validations:
      required: true
  - type: input
    id: macos
    attributes:
      label: macOS version
      placeholder: macOS 15.0
    validations:
      required: true
  - type: dropdown
    id: architecture
    attributes:
      label: Mac architecture
      options:
        - Apple Silicon
        - Intel
        - I do not know
    validations:
      required: true
  - type: textarea
    id: evidence
    attributes:
      label: Logs, screenshots, or screen recording
      description: Remove personal data before attaching files.
```

Create `.github/ISSUE_TEMPLATE/feature_request.yml`:

```yaml
name: Feature proposal
description: Propose a focused improvement to Beacon.
title: "[Feature]: "
labels: [enhancement]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem to solve
      description: Explain the user problem, not just the implementation idea.
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposed solution
      description: Describe the expected user flow and result.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives considered
    validations:
      required: true
  - type: textarea
    id: visuals
    attributes:
      label: Mockups or references
      description: Add sketches, screenshots, or links when the change affects the interface.
```

Create `.github/ISSUE_TEMPLATE/documentation.yml`:

```yaml
name: Documentation improvement
description: Report missing, unclear, or incorrect documentation.
title: "[Docs]: "
labels: [docs]
body:
  - type: input
    id: location
    attributes:
      label: Location
      description: Link to the file, heading, or page that needs work.
    validations:
      required: true
  - type: textarea
    id: problem
    attributes:
      label: What is missing or incorrect?
    validations:
      required: true
  - type: textarea
    id: suggestion
    attributes:
      label: Suggested improvement
    validations:
      required: true
  - type: textarea
    id: context
    attributes:
      label: Additional context
```

Create `.github/ISSUE_TEMPLATE/good_first_issue.yml`:

```yaml
name: New contributor task
description: Propose a scoped task suitable for a first contribution or SWOC participant.
title: "[Good first issue]: "
labels: [good first issue, swoc]
body:
  - type: textarea
    id: task
    attributes:
      label: Task summary
    validations:
      required: true
  - type: textarea
    id: files
    attributes:
      label: Suggested files or areas
    validations:
      required: true
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance criteria
      placeholder: |
        - [ ] ...
        - [ ] ...
    validations:
      required: true
  - type: input
    id: skills
    attributes:
      label: Skills or prerequisites
      placeholder: TypeScript, React, Electron, documentation, or none
    validations:
      required: true
  - type: dropdown
    id: mentor
    attributes:
      label: Maintainer guidance available
      options:
        - Yes
        - Limited
        - No
    validations:
      required: true
```

- [ ] **Step 3: Create the pull-request template**

```markdown
## Summary

Describe what changed and why.

Closes #

## Verification

- [ ] I ran `npm test`.
- [ ] I ran `npm run build`.
- [ ] I added or updated tests when behavior changed.
- [ ] I added screenshots or a recording for visible UI changes.
- [ ] I kept this pull request focused and removed unrelated changes.

## Notes for reviewers

List risks, follow-up work, or areas where review feedback is especially useful.
```

- [ ] **Step 4: Create `CODEOWNERS`**

```text
* @TarunyaProgrammer

/apps/main/ @TarunyaProgrammer
/apps/preload/ @TarunyaProgrammer
/packages/core/ @TarunyaProgrammer
/packages/database/ @TarunyaProgrammer
/shared/ipc-channels.ts @TarunyaProgrammer
/.github/ @TarunyaProgrammer
/scripts/ @TarunyaProgrammer
/build/ @TarunyaProgrammer
/package.json @TarunyaProgrammer
```

- [ ] **Step 5: Document the labels to create in GitHub**

```yaml
labels:
  - name: good first issue
    color: 7C6CFF
    description: A well-scoped task for a first contribution.
  - name: help wanted
    color: 2EA44F
    description: Maintainers welcome community help with this task.
  - name: swoc
    color: F9A825
    description: Suitable for Social Winter of Code contributors.
  - name: bug
    color: D73A4A
    description: Something is not working as intended.
  - name: enhancement
    color: A2EEEF
    description: A proposed product or engineering improvement.
  - name: docs
    color: 0075CA
    description: Documentation needs work.
  - name: 'area: ui'
    color: C5DEF5
    description: Renderer UI, interaction, or visual design.
  - name: 'area: core'
    color: 5319E7
    description: Domain logic and application services.
  - name: 'area: database'
    color: 1D76DB
    description: SQLite schema, migration, or repository code.
  - name: 'area: electron'
    color: 24292F
    description: Electron main process, preload, windows, or IPC.
  - name: 'priority: high'
    color: B60205
    description: Needs prompt maintainer attention.
  - name: 'priority: medium'
    color: FBCA04
    description: Important but not urgent.
  - name: 'priority: low'
    color: 0E8A16
    description: Useful improvement with no time pressure.
```

- [ ] **Step 6: Validate the templates**

Run:

```bash
find .github/ISSUE_TEMPLATE -type f -name '*.yml' -print | sort
git diff --check -- .github
```

Expected: `config.yml` plus four valid issue form files with no whitespace errors.

- [ ] **Step 7: Commit the community intake files**

```bash
git add .github/ISSUE_TEMPLATE .github/PULL_REQUEST_TEMPLATE.md .github/CODEOWNERS .github/labels.yml
git commit -m "docs: add contributor intake templates"
```

### Task 4: Harden and extend GitHub automation

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/release.yml`
- Create: `.github/dependabot.yml`
- Create: `.github/workflows/codeql.yml`

- [ ] **Step 1: Add explicit least-privilege permissions and job names to CI**

Set workflow-level permissions and separate the test/build commands into readable steps:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  test-and-build:
    name: Test and build (macOS)
    runs-on: macos-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test
      - name: Typecheck and build
        run: npm run build
```

- [ ] **Step 2: Restrict release permissions to the release job**

Move `permissions: contents: write` beneath the `release` job in `.github/workflows/release.yml`; leave its tag trigger, tests, packaging, and release assets unchanged.

- [ ] **Step 3: Create weekly Dependabot updates**

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    labels:
      - dependencies
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    labels:
      - dependencies
```

- [ ] **Step 4: Create CodeQL analysis for the TypeScript codebase**

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '30 3 * * 1'

permissions:
  contents: read
  security-events: write

jobs:
  analyze:
    name: Analyze (javascript-typescript)
    runs-on: macos-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
          build-mode: none
      - name: Analyze
        uses: github/codeql-action/analyze@v3
        with:
          category: /language:javascript-typescript
```

- [ ] **Step 5: Validate Actions configuration and project checks**

Run:

```bash
git diff --check -- .github
npm test
npm run build
```

Expected: no YAML whitespace errors; test and build pass, or failures are reported as unrelated pre-existing worktree failures.

- [ ] **Step 6: Commit the automation changes**

```bash
git add .github/workflows/ci.yml .github/workflows/release.yml .github/workflows/codeql.yml .github/dependabot.yml
git commit -m "ci: add open source safeguards"
```

### Task 5: Deliver GitHub dashboard configuration and validate the final repository state

**Files:**
- Create: `docs/github-maintainer-setup.md`

- [ ] **Step 1: Document the exact dashboard configuration**

Create `docs/github-maintainer-setup.md` with these ordered settings:

```markdown
# GitHub Maintainer Setup

## General

Set the repository to Public. Add the description "A quiet layer of motivation for macOS — your goals, always in sight.", website `https://beacon.tarunya.me`, and topics `electron`, `macos`, `typescript`, `react`, `productivity`, `opensource`, and `swoc`. Upload a social-preview image and enable Issues and Discussions.

## Security and analysis

Enable dependency graph, Dependabot alerts, Dependabot security updates, secret scanning, and private vulnerability reporting. Enable CodeQL default setup only if the repository CodeQL workflow is not used; do not run both configurations.

## Main ruleset

Create an active branch ruleset for the default branch `main`. Require pull requests, resolved conversations, status check `Test and build (macOS)`, squash merges, linear history, and block force pushes and deletions. Set the repository owner as a bypass actor for pull requests only. Require zero approvals while there is one maintainer; after adding a trusted maintainer, require one approving review and code-owner review.

## Pull requests

Allow squash merging only. Set the default squash commit title to the pull request title and the default message to the pull request body. Enable automatically delete head branches.

## Labels

Create the labels listed in `.github/labels.yml` before triaging SWOC issues.
```

- [ ] **Step 2: Run final repository-facing checks**

Run:

```bash
rg -n "proprietary|Intellectual Property Assignment|All Rights Reserved" LICENSE CONTRIBUTING.md README.md package.json || true
git diff --check
git status --short
```

Expected: no obsolete legal wording, no whitespace errors, and only intended GitHub-readiness files plus pre-existing user worktree changes.

- [ ] **Step 3: Commit the maintainer guide**

```bash
git add docs/github-maintainer-setup.md
git commit -m "docs: add github maintainer setup"
```

## Plan Self-Review

- Coverage: Tasks 1–2 convert the legal and public-facing project story; Task 3 creates contributor workflow and ownership files; Task 4 establishes CI, dependency, and code-scanning safety; Task 5 covers GitHub settings that cannot live in git.
- Placeholder scan: All required files, workflow contents, form fields, policy text, commands, labels, and expected validation outcomes are specified; no implementation placeholders remain.
- Type consistency: CI check is consistently named `Test and build (macOS)` and is the status check specified for the `main` ruleset.
