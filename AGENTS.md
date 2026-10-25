# Repository agent instructions

## Scope and source of truth

- Read `.github/copilot-instructions.md` and the applicable files under
  `.github/instructions/` before editing.
- Keep all agent-only instructions, reusable prompts, and agent reference
  material inside `.github/`.
- `README.md` is written for human users. Do not put agent instructions, hidden
  workflow notes, or agent-specific process text in `README.md`, `CHANGELOG.md`,
  source files, or other human-facing documentation.

## README filename boundary

- `/README.md` is the canonical repository homepage and is strictly for human
  users and maintainers.
- `/.github/AGENT_README.md` is the agent customization index and is strictly
  for agents and maintainers working on agent configuration.
- These files are intentionally separate. Never rename
  `/.github/AGENT_README.md` to `/.github/README.md`, create another
  `/.github/README.md`, merge the two audiences, or replace the root README
  with agent-facing material.
- This naming avoids GitHub's unresolved README precedence bug, where
  `/.github/README.md` can be displayed on the repository homepage instead of
  `/README.md`: https://github.com/orgs/community/discussions/163997

## Branch workflow

- Never implement a feature directly on `main`.
- Create one temporary feature branch from the current `main` for each coherent
  feature, fix, or maintenance task.
- Work on only one feature branch at a time. Finish, merge, and delete it before
  starting another feature branch unless the user explicitly authorizes parallel
  work.
- Publish completed work through a pull request targeting `main`.
- After the pull request is merged, delete the feature branch both locally and
  on the remote.
- Do not reuse an old merged branch for unrelated work.

## Commits and identity

Before creating commits, configure and verify the repository-local identity:

```bash
git config user.name VingGit
git config user.email 61470249+VingGit@users.noreply.github.com
```

Inspect the resulting author and committer before pushing. Do not rewrite
unrelated history solely to change old identity metadata.

## Validation and publication

- Run Prettier before every push. Use the repository command that writes
  formatting changes, then rerun the formatting check.
- Run the checks required by
  `.github/instructions/verification.instructions.md` for the changed surfaces.
- Keep source, tests, generated `dist/`, public types, package metadata,
  `README.md`, `CHANGELOG.md`, and applicable `.github` instructions and prompts
  synchronized with the implemented behavior.
- Keep the optional Custom File Explorer Sorting service dependency-free. Resolve its versioned
  global symbol at render/model-build time, validate returned values, and preserve standalone
  ordering whenever the service is absent, unmatched, invalid, or throws.
- Inspect status, staged diff, generated artifacts, ignored files, secrets,
  branch name, and remote target immediately before committing and pushing.

## Root Books contracts

- Implement `book-structure/v2`, `book-appearance/v2`, and the optional
  `navigation-sorting/v1` capability from
  `obsidian-material-plugins/plugin-contracts`.
- Release independently from the Obsidian counterpart and sorting provider.
- Use release tags equal to the version without a leading `v`.
- Keep the portable appearance contract limited to `panel.icon` in
  `lucide:<kebab-name>` form and direct six-digit `panel.accent` values.
- Never put contributor machine paths, vault contents, account data, or
  credentials in instructions, fixtures, or documentation.

## Prompt and instruction maintenance

- Create and edit `.github/prompts/*.prompt.md`,
  `.github/instructions/*.instructions.md`, and
  `.github/copilot-instructions.md` according to the current documented
  practices of Visual Studio Code and GitHub Copilot.
- Give each instruction file narrow, accurate `applyTo` coverage and avoid
  duplicating the same rule across multiple files.
- Keep reusable prompt files task-oriented. Link to canonical instruction files
  instead of copying long product or process contracts into prompts.
- Update or remove stale instructions and references whenever repository
  behavior changes.

## Independent fixes

- When work reveals a clear bug, security risk, reliability defect, or
  documentation error within the repository's scope, agents may fix it without
  a separate explicit request when the fix is low-risk and can be verified.
- Keep incidental fixes in separate coherent commits when they are not
  inseparable from the requested change.
- Record user-visible changes in `CHANGELOG.md` and preserve durable technical
  findings in the appropriate `.github` instruction or reference file.
- Do not broaden the task into speculative refactoring, dependency upgrades,
  releases, or unrelated architectural changes without explicit authorization.
