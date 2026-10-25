---
name: Verification contract
description: Required unit, package, host, browser, accessibility, and release-boundary evidence
applyTo: "{src,test,scripts,types,dist}/**,package.json,package-lock.json,tsup.config.ts,README.md,.github/**/*.md"
---

# Verification contract

Select checks in proportion to the change, but do not treat a component snapshot or successful build
as proof of host composition, SPA/base-path routing, responsive behavior, or packaged consumption.

## Baseline and evidence

Before source edits, inspect scoped status/diffs, record plugin and parent Quartz revisions, run
`npm ci`, and capture relevant baseline checks. When host behavior matters, inspect current Quartz
docs/source/types and a clean rendered host before freezing the implementation decision.

After edits, record exact commands, results, revisions, pages, selectors, and pre-existing warnings.
Assertions must exercise intended and negative paths; absence of an observed failure is not proof.

## Focused data and option tests

Retain parameterized cards/list coverage for:

- listed-physical book eligibility, root-note exclusion, reserved/excluded namespaces, destination
  proof, metadata index selection, count rules, date sources/ranges, deterministic sorting,
  deduplication, and one-pass access;
- physical versus FolderPage, TagPage, Canvas, Bases, unlisted, duplicate, dotted, spaced, Unicode,
  malformed, leading/trailing/doubled/dot/backslash slug cases;
- exact runtime normalization for every option, shallow maps, own properties, accessors, inherited
  entries, revoked/throwing proxies, and soft failure;
- portable `lucide:<name>` validation and version-pinned CDN URL construction, direct six-digit hex
  accents, invalid/injection forms, no raw values in hooks, no cross-book appearance leakage, and
  theme-neutral defaults;
- per-render `en-US`, `fi-FI`, and unsupported-locale fallback; and
- large synthetic input that detects repeated full scans without timing-sensitive benchmarks.

For sidebar inventory, parameterize input order and duplicates. Assert:

- root/book context selection and authored-root fallback;
- book index excluded from visible children but retained as the dedicated home destination;
- physical and generated nested folder-index destinations, titles, and hidden index notes;
- selected versus exact-current state, active ancestry, and cache isolation;
- distinct note/Canvas/Base leaves and collision/provenance rejection; and
- required FolderPage-backed destinations and negative dependency validation when its config entry
  is absent.

## Server-rendered root component

Prove:

- `.rip-overview` is the first direct plugin-body child;
- the latest preview follows the overview and contains at most three books in deterministic newest
  order;
- authored HAST appears exactly once after the preview and before unique `#rip-books`;
- the localized Explore library action targets `#rip-books`, remains visibly highlighted at rest,
  and has hover/focus/reduced-motion/forced-color coverage;
- the latest section contains its heading without a redundant explanatory paragraph, and authored
  content has no trailing return action;
- the complete library contains every eligible book exactly once, independent of preview order;
- headings, links, callouts, tables, code, transclusion output, supported style/script nodes, and safe
  `cssclasses` survive public HAST conversion;
- an empty tree omits only the authored-content wrapper;
- `toc`, `readingTime`, `text`, `fileData`, and HAST inputs are not deleted or mutated;
- statistics, localized UTC dates, semantic `<time>`, no-date omission, empty state, and cards/list
  accessible names are exact; and
- every sort combination is deterministic, stable, and preserves all entries while leaving the
  latest preview untouched.
- optional Custom File Explorer Sorting service ordering and hiding at the root, book, and nested
  folder levels; unchanged standalone behavior when the service is absent, unmatched, invalid, or
  throws; and cache separation by service identity;

## Server-rendered sidebar component

Prove one labelled navigation region and:

- a compact root/book home anchor plus adjacent native book switcher;
- no outer responsive disclosure around the selector and Explorer;
- an initially open scoped Explorer disclosure whose summary remains available at every width;
- descriptive home accessible names/tooltips, localized badge, exact-current `aria-current`, and
  active/neutral transitions;
- exactly one selected switcher entry with localized hidden selected text;
- no visible book-index or nested-folder-index document entry;
- ordinary folder-row anchors targeting actual index routes;
- separate disclosure buttons with `aria-expanded`, `aria-controls`, no navigation, and no custom
  positive tab index;
- correct default open/closed states and nested active ancestry;
- current note preservation while an ancestor is collapsed;
- correct relative destinations under root, deep routes, and base-directory fixtures;
- safe decorative hooks, distinct note/Canvas/Base SVGs, Explorer opt-in emission, and valid
  zero/one/many/long-label states;
- scoped book accents on selected rows, exact-current home, and collapsed hidden active paths without
  cross-book leakage; and
- current backgrounds and rails stay inside the selected interactive row rather than applying to a
  containing folder or the full browser tree.

## CSS and inline scripts

Freeze the five permitted host-selector kinds and fail on additional host suppression:

1. exact default-frame/direct-plugin tablet/mobile grid containment;
2. exact direct-plugin mobile width/wrap containment and only its allowed properties;
3. exact default and Canvas direct Explorer sibling variants with true opt-in;
4. exact direct-plugin Canvas-frame border-box containment; and
5. exact default-frame book-scope breadcrumb rule hiding only the redundant non-only first element.

Host-shaped DOM/CSS checks must leave Search, PageTitle, toolbars, Graph, TOC, Backlinks, the right
slot, unrelated navigation, and custom frames untouched. Root breadcrumbs remain normal. JavaScript
may change only this plugin's `.rip-sidebar-explorer` disclosure for the compact navigation contract;
reject queries or rewrites of stock Explorer, Breadcrumbs, or right-side components.

Verify desktop/tablet/mobile display, independently closable Explorer state through wide resize, long
labels, switcher popup containment, per-entry accent isolation, print, forced colors, reduced motion,
and coarse pointers. Obsolete outer-shell controls must be absent. The switcher menu must reset the
selected book's inherited custom accent while preserving book-specific overrides. Freeze the card radial
gradient, bottom hairline, 300ms opacity, focus parity, two-pixel lift, and absence of the superseded
accent-border/title hover.

Panel and sidebar scripts must cover initial load, repeated Quartz `nav`, cleanup, navigation away and
back, multiple/zero matching components, no duplicate listeners, and no empty cleanup registration.
Panel navigation covers modified-key rejection and Arrow/Home/End boundaries. Sorting covers invalid
values and all four modes. Sidebar covers one-open switcher behavior, selected-link close, outside
pointer, Escape focus restoration, folder disclosure, active-ancestor collapse without navigation,
compact non-landing Explorer close on initial and repeated navigation from Explorer, authored links,
and Backlinks; immediate ordinary Explorer-source close; root/book landing and
desktop/current/modified/Canvas state preservation; absence of plugin-owned scroll positioning or
persistent navigation state; and cleanup.

## Manifest, API, distribution, and package

Assert:

- `Object.keys(packageJson.quartz.components)` is exactly `["RootIndexSidebar"]`;
- sidebar metadata/version/default left position/priority and boolean `replaceExplorer` schema/default
  are aligned;
- `packageJson.quartz.dependencies` is exactly
  `["@quartz-community/folder-page"]` in source and the packed artifact;
- no manifest entry registers `RootIndexPanels`, but built root, `./components`, and `./types` expose
  every documented runtime/type export;
- validators, declarations, source maps, side effects/resources, dependency graph, notices, CI,
  portable appearance tests, package allowlist, and committed `dist/` cover every changed output;
- every generated JavaScript entry has only intended externals, no accidentally bundled singleton,
  no unexpected bare runtime import, and no dependency source resolved from an ancestor; and
- `npm pack --dry-run` plus a temporary consumer import prove shipped resources and public types work
  without source files.

## Isolated Quartz integration

Use plugin-owned isolated runners or a temporary stock-shaped checkout. Do not rewrite the actual
parent's upstream files. Cover relevant combinations of:

- cards/list and `replaceExplorer` true/false;
- default and Canvas frames;
- SPA on/off;
- `en-US`, `fi-FI`, and unsupported locale;
- root, root note, book landing, ordinary/nested note, physical folder landing, FolderPage-generated
  landing, TagPage, Canvas, Bases, unlisted/encrypted control, and 404;
- FolderPage enabled for physical and generated indexes, plus a missing-dependency build that fails
  with the exact installation command; and
- root/deep routes below a base directory such as `/group/project/`.

Inspect generated HTML and resources, not only exit status. Require one sidebar and one root body,
overview/latest/authored-root/full-library order, exact scope/state/icons/links, retained root metadata,
existing destinations, base-path-safe resources, Graph in the default right slot, scoped Explorer
replacement, book-first/root-normal breadcrumbs, Canvas stage visibility, and no duplicate SPA
resources or browser errors.

For fresh CLI behavior, run stock local/packed add, inspect the one layout stanza and lock entry,
enable/build, assert one body/sidebar, remove cleanly, and after push repeat remote add/enable/build
against the exact commit. Never infer remote usability from a local cache overlay.

## Browser and accessibility review

For popup, card, breakpoint, folder disclosure, Canvas drawer, breadcrumb, or host-composition
changes, use a real browser at representative desktop (>1200px), tablet (800–1200px), and mobile
(<800px) widths. Require no plugin-induced horizontal overflow.

Verify:

- selector opening causes zero Explorer layout shift, stays within the viewport, disables covered
  underlay, and restores focus correctly;
- the selector remains directly visible at compact widths; every default-frame non-landing
  destination closes Explorer regardless of source without changing scroll, while root/book landing,
  desktop/current/modified states leave it open;
- Canvas destinations render Explorer open after direct loads and SPA navigation from any link;
- root → book → folder landing → nested note → collapse ancestor → other book → root preserves route,
  Back/Forward semantics, one component/listener set, and no console/network errors;
- keyboard, pointer, touch, no-JS, SPA, 200%/400% zoom, long labels, Unicode, light/dark, forced colors,
  reduced motion, and coarse pointers remain usable;
- selected home/neutral transitions and collapsed hidden active-path cues are visible without relying
  only on color;
- real Canvas/Base routes retain correct leaves and Canvas stage/controls at 1440, 801, 800, and
  mobile; and
- card computed styles match the decorative contract without replacing the focus cue.

## GitLab Pages and FolderPage diagnostic

When investigating non-root 404s:

1. inspect the deployed `public/` artifact for expected ordinary note `.html` files;
2. distinguish missing generated folder indexes from missing ordinary pages;
3. inspect `CNAME`, `data-basepath`, canonical URLs, asset paths, and the 404-page home link;
4. require the configured base path to match either custom-domain-root hosting or project-subpath
   hosting consistently; and
5. verify that FolderPage is configured and enabled before interpreting missing `/index` routes as a
   hosting failure.

FolderPage emits physical and generated folder indexes. The ordinary ContentPage emitter continues to
own non-index notes, while a root-only Page Type cannot explain already-generated ordinary `.html`
files becoming unreachable under an inconsistent public base path.

## Durable fixture and watch diagnostics

When the change touches host integration or content semantics, audit the persistent three-book lab
against its reference. Expected counts come from a clean render and physical/listed model, not raw
file counts or optimistic Canvas/Bases assumptions.

Rerun the add/change/delete watch diagnostic. Record stale watch behavior honestly, then stop the
watcher and prove a clean/full build corrects root panels, latest dates, overview, and sidebar
inventory. The known watch limitation is pre-approved; full-build defects are not.

## Command gate

The configured-host CI cache includes `.quartz/plugins/` and is keyed by the
host's Quartz and npm lockfiles. Keep the lockfile-aware install step after
cache restore so a miss still prepares the full integration host. Before the
cache, the 22 October 2026 PR run #308 spent about 3 minutes 45 seconds in
host preparation, including fresh installation/build of 45 plugins.

Use Prettier write mode only on changed files. Run the relevant subset while iterating, then the
complete gate for source, manifest, dependency, or distribution changes:

```bash
npm ci
npx prettier --write <changed-plugin-files>
npm run check
npm run build
npm run verify:dist
npm run verify:package
npm run test:integration
npm run test:watch-integration
npm pack --dry-run
git diff --check
```

`npm run format` checks formatting; it does not write fixes.
