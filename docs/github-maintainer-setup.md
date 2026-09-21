# GitHub Maintainer Setup

These settings are configured in GitHub and cannot be enforced from repository files alone.

## General

Set the repository to **Public**. Add the description:

> A quiet layer of motivation for macOS — your goals, always in sight.

Set the website to `https://beacon.tarunya.me`, add the topics `electron`, `macos`, `typescript`, `react`, `productivity`, `opensource`, and `swoc`, and upload a social-preview image. Enable Issues and Discussions.

## Security and analysis

Enable the dependency graph, Dependabot alerts, Dependabot security updates, secret scanning, and private vulnerability reporting. This repository includes a CodeQL workflow, so do not also enable CodeQL default setup.

## Main ruleset

Create an active branch ruleset for the default branch `main` with these settings:

- Require a pull request before merging.
- Require conversation resolution.
- Require the `Test and build (macOS)` status check.
- Require squash merges and linear history.
- Block force pushes and branch deletion.
- Add the repository owner as a bypass actor for pull requests only.
- Require zero approvals while there is one maintainer. Once a second trusted maintainer joins, require one approval and code-owner review.

## Pull requests

Allow squash merging only. Set the default squash-commit title to the pull-request title and the default message to the pull-request body. Enable automatic deletion of head branches after merge.

## Labels

Create the labels in [`.github/labels.yml`](../.github/labels.yml) before triaging SWOC issues. GitHub issue forms reference `bug`, `enhancement`, `docs`, `good first issue`, and `swoc` by name.
