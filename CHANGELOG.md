# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Read `book-appearance/v2` literal panel blocks while continuing to accept
  existing v1 panel mappings.
- Stage `book-structure/v2` global and local settings-note filenames as
  canonical `index.md` build inputs, with collision and link checks that preserve
  relative destinations, aliases, fragments, titles, and fenced code.
- Cache configured Quartz plugin checkouts by the host lockfiles in CI; keep
  the configured-host installation and integration checks.

## [0.14.1] - 2026-10-22

### Changed

- Publish releases through npm trusted publishing with GitHub OIDC instead of a long-lived automation token.

## [0.14.0] - 2026-10-22

### Changed

- Moved to the `obsidian-material-plugins` organization as
  `@obsidian-material-plugins/quartz-root-books-workspace`.
- Replaced package-version lockstep with explicit `book-structure/v1`,
  `book-appearance/v1`, and optional `navigation-sorting/v1` declarations.
- Use only the provider-neutral `navigation-sorting/v1` service symbol.
- Exercise host integration against the published Quartz Community packages instead of rebuilding their Git repositories during each fixture run.

## [0.13.1] - 2026-10-19

### Changed

- Coordinate the `0.13.1` ecosystem release with Custom File Explorer Sorting
  Support's targeted article-navigation popovers. Root Index Panels behavior
  and the shared sorting-service contract are unchanged.

## [0.13.0] - 2026-10-19

### Changed

- Coordinate the `0.13.0` ecosystem release with Custom File Explorer Sorting
  Support's intentional-backlink preservation, native Quartz previews, and
  Finnish article-navigation labels. Root Index Panels behavior and the shared
  sorting-service contract are unchanged.

## [0.12.0] - 2026-10-18

### Changed

- Coordinate the `0.12.0` ecosystem release with Custom File Explorer Sorting
  Support's Quartz Backlinks ordering and optional Article Navigator cards.
  Root Index Panels behavior and the sorting-service contract are unchanged.

## [0.11.0] - 2026-10-12

### Changed

- Coordinate the `0.11.0` ecosystem release with Root Books Toolkit's new
  plugin-health dashboard and declarative selected-setting watches. Root Index
  Panels behavior and the portable book appearance contract are unchanged.

## [0.10.0] - 2026-10-12

### Removed

- Remove the `excludeDirs` option. Configure Markdown visibility through Quartz
  `ignorePatterns` so the root panels and other navigation surfaces share one
  content policy.

## [0.9.3] - 2026-10-04

### Changed

- Coordinate the `0.9.3` ecosystem release with folder-page directory sorting
  in Custom File Explorer Sorting Support. Root Index Panels behavior is unchanged.

## [0.9.2] - 2026-10-03

### Changed

- Coordinate the `0.9.2` ecosystem release with the Obsidian plugin's new
  Root Books Toolkit display name. The shared metadata contract is unchanged.

## [0.9.1] - 2026-10-03

### Changed

- Coordinate the corrective `0.9.1` ecosystem release after Root Books
  Workspace moved to a fresh repository for its new Obsidian plugin ID.

## [0.9.0] - 2026-10-02

### Changed

- Adopt the shared Root Books appearance contract: `panel.icon` now accepts only
  `lucide:<lowercase-kebab-name>` and `panel.accent` only direct six-digit hex.
- Remove named accent, unprefixed built-in icon, and TypeScript icon registries
  so Quartz and Obsidian read identical portable metadata.
- Coordinate version `0.9.0` with Root Books Workspace and Custom File Explorer
  Sorting Support.

## [0.8.0] - 2026-09-30

### Changed

- Update `lucide-preact` from 1.48.0 to 1.49.0 and advance the plugin minor release.

### Added

- Honor the optional Custom File Explorer Sorting Support service in the book switcher, root notes,
  and every nested sidebar folder without adding a package dependency.

### Removed

- Remove opt-in folder-local filename sorting and return sidebar files to the normal title-based
  ordering. The `quartz-sorting-direction` frontmatter key is no longer read by this plugin.

## [0.7.0] - 2026-09-25

### Changed

- Update `lucide-preact` from 1.47.0 to 1.48.0 and advance the plugin minor release.

## [0.6.0] - 2026-09-24

### Changed

- Update `lucide-preact` from 1.46.0 to 1.47.0 and advance the plugin minor release.

### Added

- Add opt-in folder-local sidebar filename sorting through
  `quartz-sorting-direction: ascending|descending` on physical `index.md` files, with strict
  `DD.MM.YYYY`/`HH-MM` parsing, deterministic natural filename ordering, same-date time grouping,
  and non-inherited folder scope.

### Fixed

- Update Vitest and override its shared esbuild toolchain to patched releases, removing known
  development-dependency vulnerabilities.

## [0.5.0] - 2026-09-15

### Changed

- Update `lucide-preact` from 1.45.0 to 1.46.0 and advance the plugin minor release.

## [0.4.0] - 2026-09-12

### Changed

- Update `lucide-preact` from 1.44.0 to 1.45.0 and advance the plugin minor release.

## [0.3.1] - 2026-09-11

### Added

- Add `notebook-pen` to the bundled Lucide icon aliases.

### Fixed

- Detect the actual installed `lucide-preact` version before `icon:add` mutates generated files, and tell maintainers to run `npm ci` when `node_modules` is stale or missing.
- Make icon generation/checking reject a stale local Lucide install instead of reporting the version declared in `package.json` as though it were the installed version.

## [0.3.0] - 2026-09-11

### Added

- Add `user-group` to the bundled Lucide icon aliases.
- Add a daily GitHub Actions maintenance job that updates `lucide-preact` to the latest npm release, regenerates and verifies the package, runs the Quartz integration suites, advances the plugin minor version, tags it, and dispatches the npm/GitHub release pipeline.

### Changed

- Update `lucide-preact` from 1.25.0 to 1.44.0 and treat Lucide dependency updates as a minor plugin release.
- Follow only the current Lucide Preact `icon.node` representation instead of retaining a compatibility path for the older `iconNode` wrapper.
- Improve `npm run icon:add -- <name>` diagnostics when the repository's installed Lucide release is older than the current npm release.

## [0.2.2] - 2026-09-11

### Added

- Add `file-question-mark` to the bundled Lucide icon aliases.

### Fixed

- Make `npm run icon:add -- <name>` invoke npm through npm's JavaScript CLI so the helper works on Windows instead of failing with `spawnSync npm.cmd EINVAL`.
- Make packed-package verification extract its tarball using paths relative to the temporary working directory so GNU tar under Git Bash does not interpret a Windows drive letter as a remote host.

## [0.2.1] - 2026-09-11

### Changed

- Publish future releases from the personal npm scope `@vinggit/root-index-panels` and use the npm-published `@quartz-community/folder-page` dependency source.
- Make built-in icon generation insensitive to LF versus CRLF working-tree line endings so checks behave consistently on Windows.

## [0.2.0] - 2026-09-11

### Added

- Allow any icon from the plugin's pinned Lucide release to be selected directly with
  `panel.icon: "lucide:<name>"`, without a plugin pull request.
- Add a manifest-driven built-in icon registry and `npm run icon:add -- <name>` helper that verifies
  Lucide exports, regenerates code and documentation, formats changes, and runs package checks.

- Add a latest-edited three-book preview, localized edit dates, and deterministic reader-controlled
  library sorting.
- Add dedicated root/book home marks and independent folder disclosure buttons with active-path
  indicators.

### Changed

- Keep the book selector directly visible at every width, make Explorer independently collapsible,
  close it on compact non-landing destinations regardless of navigation source without changing page
  scroll, and leave it open for root/book landings, desktop, and Canvas navigation.
- Declare `github:quartz-community/folder-page` as a required Quartz-plugin prerequisite and reject
  builds where its configuration entry is missing.
- Rename the primary root action to “Explore library” and keep it visibly highlighted with a
  theme-compatible hover treatment.
- Give books without authored icon metadata a theme-colored open-book mark in the root library and
  book switcher.
- Constrain current note and folder backgrounds and rails to the selected row instead of the whole
  sidebar tree.
- Prioritize book terminology and the book collection throughout the root page and sidebar.
- Open book and nested-folder landing pages from their navigation rows while keeping their
  `index.md` notes out of the visible navigation tree.
- Scope selected note, folder, hidden active-path, and home-mark treatments to each book's accent.
- Consolidate repository agent instructions, reusable prompts, and technical references under
  `.github` on `main`.
- Replace the permanent agent-development branch and cherry-pick workflow with temporary feature
  branches and pull requests.
- Require human-only README content, repository-local noreply commit identity, Prettier before every
  push, synchronized documentation and generated artifacts, and deletion of merged feature branches.
- Apply the repository's Prettier rules to the consolidated agent documentation.

### Fixed

- Prevent the selected book's custom accent from recoloring root and theme-default entries in the book
  switcher; each entry now uses its own accent or the host theme color.

### Removed

- Remove the bottom return-to-library action and the redundant latest-preview explanatory sentence.
- Remove the obsolete branch-sync, filtered-diff, and automatic main-sync workflows.

## [0.1.1] - 2026-07-19

### Fixed

- Contain Canvas sidebar drawer to prevent layout overflow.
- Declare path utility peer dependency.
- Normalize committed source maps.

### Added

- Multi-book navigation shell with sidebar component.
- Book landing page panels.
- Canvas and Bases navigation integration.

[unreleased]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.14.0...HEAD
[0.14.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.13.1...0.14.0
[0.13.1]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.13.0...0.13.1
[0.13.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.12.0...0.13.0
[0.12.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.11.0...0.12.0
[0.11.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.10.0...0.11.0
[0.10.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.9.3...0.10.0
[0.9.3]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.9.2...0.9.3
[0.9.2]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.9.1...0.9.2
[0.9.1]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/0.9.0...0.9.1
[0.9.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.8.0...0.9.0
[0.8.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/releases/tag/v0.2.0
[0.1.1]: https://github.com/obsidian-material-plugins/quartz-root-books-workspace/releases/tag/v0.1.1
