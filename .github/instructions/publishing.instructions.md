---
name: Branch and publishing workflow
description: Feature branches, commit identity, validation, pull requests, cleanup, and release boundaries
applyTo: "**"
---

# Branch and publishing workflow

## Permanent branch model

`main` is the single long-lived branch and contains the complete repository:
code, package files, generated distribution, human documentation, GitHub
workflows, agent instructions, reusable prompts, and technical references.

Never implement a feature, fix, or maintenance change directly on `main`. Start
from the current remote `main` and create one temporary feature branch for one
coherent task.

Use a descriptive branch name such as:

```text
feature/<short-description>
fix/<short-description>
docs/<short-description>
agent/<short-description>
```

Only one feature branch may be active at a time unless the user explicitly
authorizes parallel work. Finish and merge the current branch before beginning
another task to reduce stale bases and merge conflicts.

## Starting work

1. inspect status, current branch, remotes, and untracked or ignored files;
2. preserve unrelated local work;
3. fetch the remote;
4. update local `main` with a fast-forward-only operation;
5. create the feature branch from the updated `main`; and
6. confirm the new branch before editing.

Do not repurpose an old merged branch or branch from a stale feature branch.

## Commit identity

Before creating or pushing any commit, configure and verify the repository-local
identity:

```bash
git config user.name VingGit
git config user.email 61470249+VingGit@users.noreply.github.com
```

Inspect the author and committer on resulting commits. Do not rewrite unrelated
existing history solely to change old identity metadata.

## Commit discipline

Before committing, inspect branch, status, working diff, staged diff, diff-stat,
ignored files, generated artifacts, and possible secrets. Stage explicit paths
when unrelated work exists.

Create coherent commits whose messages explain the change. Keep incidental bug,
security, reliability, or documentation fixes separate when they are not
inseparable from the requested work.

Keep all affected surfaces synchronized in the same feature branch:

- source and tests;
- public types and package metadata;
- generated `dist/` output;
- human `README.md` and `CHANGELOG.md` when behavior changes; and
- `.github` instructions, prompts, or references when repository contracts or
  recurring workflows change.

## Formatting and validation

Before every push:

1. run Prettier in write mode over the repository;
2. review formatting changes and ensure they belong to the task;
3. rerun the repository formatting check;
4. run the checks required by
   [the verification contract](./verification.instructions.md); and
5. verify generated `dist/` and packed-package expectations when applicable.

A push must not be used as the first formatting check. Do not rely on CI to
discover avoidable whitespace or Markdown-formatting failures.

## Pull request and merge

Push the feature branch to its matching remote branch and open a pull request
targeting `main`. The pull request must describe:

- what changed;
- why it changed;
- user or maintainer impact;
- incidental fixes included;
- documentation and changelog updates; and
- validation performed.

Do not merge until required checks pass and review concerns are resolved. Use
the repository's configured merge method; do not force-push `main` or bypass
required protections.

After merge:

1. switch to `main`;
2. fetch and fast-forward local `main`;
3. delete the merged feature branch locally;
4. delete the merged feature branch from the remote;
5. prune stale remote-tracking refs; and
6. verify that work ends on clean, current `main`.

## Independent fixes

When a requested task reveals a clear in-scope bug, security risk, reliability
problem, or documentation error, an agent may fix it without waiting for a
separate request when the correction is low-risk and verifiable.

Record the fix appropriately:

- tests for regressions;
- `CHANGELOG.md` for user-visible effects;
- the canonical instruction file for durable repository contracts; and
- `reference/implementation-history.md` only for unique point-in-time evidence
  worth preserving.

Do not expand this permission into speculative refactoring, unrelated dependency
upgrades, version changes, releases, or architectural redesign.

## Release boundary

A feature-branch push or merged pull request does not authorize a version bump,
tag, GitHub release, npm publication, marketplace submission, or push to the
parent Quartz repository. Those actions always require separate user
authorization.

Quartz Root Books Workspace releases independently. Compatibility with its
Obsidian counterpart and optional sorting provider follows the declared
`book-structure/v2`, `book-appearance/v2`, and `navigation-sorting/v1`
contracts rather than matching package versions. Release tags equal the package
version without a leading `v`.
