---
name: Plugin architecture
description: Canonical product, data, rendering, integration, and packaging contract
applyTo: "{src,test,scripts,types,dist}/**,package.json,package-lock.json,tsup.config.ts"
---

# Plugin architecture

This is the single technical contract for
`@obsidian-material-plugins/quartz-root-books-workspace`. Do not restate it
in task prompts; link here and update this file when the contract changes.

## Package topology

The plugin has two independent rendering roles:

```text
RootIndexPanelsPage (Page Type factory)
└── body: RootIndexPanels (public advanced component; not manifest-declared)

RootIndexSidebar (public left layout component)
└── the only entry in package.json#quartz.components
```

`RootIndexPanelsPage(options)` has priority `100`, matches only the existing physical regular slug
`index`, has no generator, and uses layout key `content` with Quartz's default frame. Its body
factory constructs `RootIndexPanels(options)`. The advanced component also guards against non-root
use.

The manifest retains `pageType` and `component` categories but declares exactly one component:
`RootIndexSidebar`, with `defaultPosition: "left"` and `defaultPriority: 40`. It declares exactly
`@quartz-community/folder-page` in `quartz.dependencies`. A fresh CLI add must create one
left-layout declaration. `RootIndexPanels` remains exported but absent from component discovery so the
installer cannot create a second body.

The Page Type performs no tree suppression or shared-data mutation. Root HAST, `toc`, `readingTime`,
and `text` remain available to independent Quartz components and emitters.

## Physical book model

`src/books.ts` collects books in one pass over `allFiles`:

1. Parse a canonical slug with at least two non-empty segments. Reject leading, trailing, doubled,
   dot-segment, slash/backslash, and other canonical-path anomalies. Reject `tags`; `index` is a
   valid first-level directory name. Content omitted by Quartz `ignorePatterns` never reaches the
   inventory.
2. A candidate requires a listed physical descendant: `filePath` must exist and top-level
   `unlisted !== true`. Deduplicate full physical slugs; first eligible occurrence wins.
3. A listed physical or FolderPage-generated `<segment>/index` may prove the logical destination.
   The required FolderPage plugin emits both physical and generated `/index` routes;
   Canvas/Bases-provenance records cannot prove a destination.
4. Emit only candidates with a destination. Use only a physical listed `<segment>/index` as the
   source of title, description, tags, and `panel` metadata.
5. Count listed physical descendants once, excluding the book's own index. Authored nested indexes
   count; virtual indexes do not.

Root notes, virtual-only pages, empty directories, and Canvas/Bases synthetic entries do not create
books. Preserve an authored title exactly. Humanize only a missing title by replacing hyphens with
spaces and uppercasing the first character.

For each physical file, accept the first valid date in this order:

1. `dates.modified`, `dates.created`, `dates.published`;
2. top-level `modified`, `updated`, `created`, `date`; and
3. frontmatter `modified`, `updated`, `created`, `published`, `date`.

Valid dates are `Date` objects, finite numbers within the ECMAScript Date range, and parseable
strings; epoch and pre-1970 values are valid. Date sorting uses the newest accepted timestamp in
the whole book. Undated books sort last. Count and date sorts descend, then use locale-independent
ties: lower-cased title, exact title, segment.

The root body and sidebar independently use the same collector and normalized inventory values.
Generated navigation leaves never flow back into book eligibility, ordering inputs, or counts.

## Root rendering

`RootIndexPanels` renders transformed root HAST through the public
`@quartz-community/utils/jsx` `htmlToJsx` API. Do not parse raw Markdown or use
`dangerouslySetInnerHTML`. A non-empty tree uses Quartz's standard
`.markdown-preview-view.markdown-rendered` wrapper and preserves safe string
`frontmatter.cssclasses`. A genuinely empty tree omits only that authored-content wrapper.

Body order is fixed:

1. `.rip-overview` statistics and a persistently highlighted, localized no-JavaScript
   `#rip-books` “Explore library” action when books exist;
2. `.rip-latest`, containing only its localized heading and at most the three newest books in
   deterministic date order;
3. authored root HAST without a trailing return action; and
4. `#rip-books`, containing the complete library or localized empty state.

The latest preview is independent from the complete-library order. The complete collection starts
in the configured `alphabetical`, `docCount`, or `date` order and may be reordered client-side by
newest date, oldest date, ascending title, or descending title. Sorting preserves every eligible
book and uses original index as the final stable tie.

Book count and total notes are rendered as separate label/value pairs. Total notes is a saturated
safe-integer sum. Last edited is the newest finite aggregate date and is omitted when unavailable.
Format dates in UTC with `cfg.locale`, falling back to `en-US`. Every available card/list date uses a
semantic `<time datetime="YYYY-MM-DD">`.

Core root links, cards, and authored content remain usable without JavaScript. The client script only
adds keyboard movement and full-library sorting, initializes on Quartz `nav`, and registers cleanup
only when listeners were installed.

## Sidebar inventory and state

`src/navigation.ts` is a separate view over `allFiles` and never changes `docCount`:

- The first listed physical exact `index` supplies the root selector title. Ignore accessors and use
  localized Home only as fallback.
- Root scope includes listed physical root notes and safe generated root Canvas/Base leaves with one
  segment, excluding index.
- Book scope applies when the current first segment exactly matches an eligible book. The book
  landing index is the dedicated home target and is not repeated in the visible tree.
- Every physical nested `index` supplies its containing folder's destination and authored title while
  remaining hidden from visible children. A generated FolderPage index may supply the same route.
- A generated Canvas/Base leaf is safe only when it is not unlisted, owns exactly one matching
  provenance marker, and has a canonical lower-case suffix. Physical collisions win.
- Deduplicate full slugs. Exclude unlisted data, reserved/excluded books, other books, and unsupported
  virtual records.
- Folders sort before leaves, followed by case-insensitive title, exact title, and stable key.
  Ordinary notes, Canvas, and Base use distinct icons. If the version-1 Custom File Explorer Sorting
  service is present, resolve it at model-build time and let a matched rule reorder or hide the root
  books, root notes, and each nested folder. The service is optional and structural: never add a
  package dependency, and retain the standalone order on absent, unmatched, invalid, or throwing
  results.

Cache the immutable model in a `WeakMap` by `allFiles` identity, sorting-service identity, and
normalized `descriptionFallback`, `sort`, and `tagCount`. A clean build/new
`allFiles` identity or a changed sorting-service instance is the invalidation boundary.

## Sidebar rendering and interaction

The sidebar server-renders one labelled `<nav>` with ordinary links and lists. The root/book control
stays directly visible at every viewport width; there is no outer responsive navigation shell. The
book switcher and scoped Explorer may use native `<details>/<summary>`; folder navigation must not.

The root/book control is split into:

- a compact home-mark anchor that opens the active root or book index; and
- an adjacent native book-switcher disclosure that changes scope.

The home mark has a descriptive accessible name, tooltip, visible focus, compact localized badge,
and exact-current rail. It becomes neutral when another note or folder in the same scope is active.

The Explorer owns an initially open server-rendered disclosure that remains available at every
viewport width. At `max-width: 800px`, initialization after every Quartz navigation closes Explorer
on default-frame destinations unless the exact-current home mark identifies a root or book landing.
This destination rule applies equally to Explorer, authored-content, Backlinks, direct-load, and
Back/Forward navigation. Ordinary primary Explorer activation also closes the source immediately.
Desktop, root/book landing, modified-key, current-page, and Canvas states remain open. Navigation
never changes the page scroll position or persists navigation intent in browser storage. An explicit
Explorer toggle remains independent of the Canvas drawer. The selector and all server-rendered
Explorer links remain usable without JavaScript.

Each folder renders a row anchor and a separate disclosure button. The row opens the real folder
index route. The button only toggles the already-rendered child list through `aria-expanded` and
`aria-controls`; it never changes the URL. A reader may collapse an ancestor of the current note
without navigation. Core row links and initially rendered hierarchy remain available without
JavaScript.

Top-level folders start open. Deeper folders open for the current ancestry and otherwise start
closed. A closed folder containing the active route receives an accent-tinted disclosure surface and
accented closed chevron. Open folders return to the normal expanded treatment. Nested ancestors must
behave consistently.

The switcher enhancement enforces one open selector, closes on selected link/outside pointer/Escape,
and restores focus. Folder buttons, switchers, and compact Explorer navigation initialize on Quartz
`nav`; every installed listener is removed through `window.addCleanup`. Do not register empty cleanup
callbacks when the component is absent.

## Scoped appearance

Resolve the selected book's validated accent once on the sidebar navigation region. Selected notes,
selected folders, active-path ancestors, and exact-current book home use that semantic accent. The
book home returns to neutral on descendant pages while its small badge retains the book accent. Root
home receives its rail only on root `index`; root notes use ordinary host/root accent behavior.

The disclosure control has no resting outline. Hover and `:focus-visible` provide restrained border
or outline cues compatible with Quartz tokens. Accent is never the only focus or current-state cue.
Current-state backgrounds and rails must be anchored to the interactive row itself; broad descendant
state selectors must not tint a containing folder or the full sidebar tree. The switcher menu resets
its inherited accent to the host `--secondary` token, after which each book entry may apply its own
validated accent. Root and theme-default entries must never inherit the selected book's custom accent.

The plugin is a layout/navigation component, not a theme. Use Quartz custom properties and semantic
hooks. Do not impose fonts, a global palette, or opaque site-wide surfaces.

## Host-shell ownership

Exactly five kinds of behavioral host selector are permitted:

1. default-frame `#quartz-body` grid containment gated by a direct
   `.left.sidebar > .rip-sidebar`;
2. direct-plugin mobile width/wrap containment;
3. separate default-frame and Canvas-frame direct Explorer-sibling replacement variants;
4. Canvas-frame containment gated by `.canvas-sidebar > .rip-sidebar`; and
5. default-frame eligible-book breadcrumb promotion hiding only the redundant first Home crumb.

`replaceExplorer: true` may hide only the stock Explorer directly beside this plugin in the default
or Canvas frame. JavaScript never mutates Explorer or Breadcrumbs. Never select, clear, hide, move,
or style `.right`, Graph, TOC, Backlinks, Search, PageTitle, Canvas stage/controls, or unrelated host
components.

## Paths, FolderPage, and hosting

Resolve panel, root, book, note, and valid folder destinations with public
`@quartz-community/utils/path` helpers relative to the current full slug. Never concatenate an
origin-relative route or duplicate a base path.

FolderPage is a required Quartz-plugin prerequisite. Quartz ContentPage excludes every slug ending
in `/index`; FolderPage emits book and nested-folder routes whether their source is a physical
`index.md` or a generated virtual page. The manifest dependency source is exactly
`@quartz-community/folder-page`. Missing configuration must fail Quartz dependency validation;
a disabled entry is unsupported even if the current host reports only a warning.

The generated public base path must match the final deployment URL. A custom domain served at `/`
must not retain a project subpath such as `/quartz-for-gitlab` in `data-basepath`, canonical URLs,
assets, or 404 navigation. Project-path hosting may retain that subpath only when the public URL also
contains it.

## Options and appearance security

Normalize public options defensively because direct TypeScript calls bypass manifest validation:

- `layout`: only `cards` or `list`, else `cards`;
- `sort`: only `alphabetical`, `docCount`, or `date`, else `alphabetical`;
- display flags and `replaceExplorer`: only booleans, else `true`;
- `tagCount`: floor finite values and clamp at zero, else `3`;
- `descriptionFallback`: preserve any string, including whitespace, else `""`;
- `defaultIcon`: only `lucide:<lowercase-kebab-name>`, else `lucide:book-open`; and
- `defaultAccent`: only `theme` or direct `#rrggbb`, else `theme`.

Book frontmatter shares `book-appearance/v2` with Obsidian to quartz workspace. The
canonical `panel: |` scalar contains `icon: lucide:<lowercase-kebab-name>` and
`accent: "#rrggbb"` lines. Continue reading the v1 `panel` mapping during
migration. Do not add named registries, unprefixed built-ins, custom component
aliases, CSS variables, short hex, or alpha hex. Construct the remote SVG URL only from a validated
Lucide name and the exact `lucide-preact` version in `package.json`; never accept an authored URL or
arbitrary CSS value. Unknown or malformed authored icons and accents fall back once to the
normalized defaults. Raw colors never enter selectors, classes, IDs, or data attributes.

Icons are inert, `aria-hidden`, non-interactive content with non-focusable SVG. Lucide icons
render as fixed-origin CSS masks backed by a version-pinned `lucide-static` SVG on jsDelivr so they
inherit the surrounding accent without inserting remote markup into the DOM. Each card/list row has
one whole-panel anchor.

## Localization and accessibility

Plugin-owned `en-US` and `fi-FI` catalogs cover book/note counts, edit dates, the Explore library
action, latest/all library labels, sorting, switcher, home marks, folder disclosure, Explorer, and
empty state.
Select locale per render and fall back to English. Do not import Quartz private locale catalogs or
hard-code reader-facing English in components.

Cards/list reflow to one column, preserve forced-color focus, and remove nonessential motion under
reduced-motion. The Explore library action, folder rows, disclosures, switchers, links, and sort
controls must remain keyboard accessible at zoom and mobile widths.

## Public API, build, and distribution

Public exports are:

- package root: `RootIndexPanelsPage`, `RootIndexPanels`, `RootIndexSidebar`, public option aliases,
  `PanelIconComponent`, and shared Quartz type re-exports;
- `./components`: both components, their option aliases, and `PanelIconComponent`; and
- `./types`: public option/icon types and shared Quartz types.

Do not export internal inventory, navigation-model, normalization, comparator, or resolver types only
for tests.

`tsup` produces ESM, declarations, and source maps for the root, `./types`, and `./components`. SCSS
and `.inline.ts` files become component resource strings. Normalize source-map embedded text to LF
for deterministic Windows/Linux output. Commit synchronized `dist/`; packed consumers must not need
source files or an ancestor checkout.
