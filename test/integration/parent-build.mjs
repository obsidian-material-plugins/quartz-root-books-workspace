import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

const PLUGIN_NAME = "quartz-root-books-workspace"
const RETIRED_PLUGIN_NAME = "root-index-panels"
const WORKSPACE_PREFIX = "quartz-root-books-workspace-integration-"
const KEEP_WORKSPACE = process.env.RIP_KEEP_INTEGRATION === "1"
const BASE_PATH = "/group/project"
const BASE_URL = "gitlab.example/group/project"
const ROOT_SIDEBAR_LAYOUT = { position: "left", priority: 40 }

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const pluginRoot = path.resolve(scriptDirectory, "..", "..")
const outputDirectories = []
const linkedDirectories = new Set()
let workspace
let workspaceMarker

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function isQuartzRoot(candidate) {
  if (!candidate || !fs.existsSync(candidate)) return false

  const packagePath = path.join(candidate, "package.json")
  const bootstrapPath = path.join(candidate, "quartz", "bootstrap-cli.mjs")
  if (!fs.existsSync(packagePath) || !fs.existsSync(bootstrapPath)) return false

  try {
    return readJson(packagePath).name === "@jackyzha0/quartz"
  } catch {
    return false
  }
}

function locateQuartzRoot() {
  if (process.env.RIP_QUARTZ_ROOT) {
    const override = path.resolve(process.env.RIP_QUARTZ_ROOT)
    assert.ok(isQuartzRoot(override), `RIP_QUARTZ_ROOT is not a Quartz checkout: ${override}`)
    return override
  }

  let candidate = path.dirname(pluginRoot)
  while (candidate) {
    if (isQuartzRoot(candidate)) return candidate
    const parent = path.dirname(candidate)
    if (parent === candidate) break
    candidate = parent
  }

  throw new Error(
    "Could not locate the parent Quartz checkout. Set RIP_QUARTZ_ROOT to an explicit path.",
  )
}

const quartzRoot = locateQuartzRoot()
const requireFromQuartz = createRequire(path.join(quartzRoot, "package.json"))
const YAML = requireFromQuartz("yaml")

function assertInside(root, target, label = "path") {
  const relative = path.relative(path.resolve(root), path.resolve(target))
  assert.ok(
    relative !== "" &&
      !relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative),
    `${label} escaped its validated root: ${target}`,
  )
}

function validateWorkspaceForCleanup() {
  assert.ok(workspace, "temporary workspace was never created")
  const realTemp = fs.realpathSync(os.tmpdir())
  const realWorkspace = fs.realpathSync(workspace)
  const relative = path.relative(realTemp, realWorkspace)

  assert.ok(
    relative !== "" &&
      !relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative),
    `refusing to clean a path outside the system temp directory: ${realWorkspace}`,
  )
  assert.ok(
    path.basename(realWorkspace).startsWith(WORKSPACE_PREFIX),
    `refusing to clean an unexpected temporary directory: ${realWorkspace}`,
  )
  assert.equal(
    fs.readFileSync(path.join(realWorkspace, ".rip-integration-workspace"), "utf8"),
    workspaceMarker,
    "temporary workspace marker did not match",
  )
}

function writeWorkspaceFile(relativePath, contents) {
  const target = path.resolve(workspace, relativePath)
  assertInside(workspace, target, "fixture file")
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, contents)
  return target
}

function linkOrCopyDirectory(source, destination) {
  assert.ok(fs.statSync(source).isDirectory(), `directory source does not exist: ${source}`)
  assertInside(workspace, destination, "linked directory")
  fs.mkdirSync(path.dirname(destination), { recursive: true })

  try {
    fs.symlinkSync(source, destination, process.platform === "win32" ? "junction" : "dir")
    linkedDirectories.add(destination)
  } catch (error) {
    if (!error || !["EPERM", "EACCES", "EINVAL"].includes(error.code)) throw error
    fs.cpSync(source, destination, { recursive: true })
  }
}

function copyQuartzSource() {
  const source = path.join(quartzRoot, "quartz")
  const destination = path.join(workspace, "quartz")
  const ignoredCache = path.resolve(source, ".quartz-cache")

  fs.cpSync(source, destination, {
    recursive: true,
    filter: (candidate) => path.resolve(candidate) !== ignoredCache,
  })
}

function stageHost() {
  assert.equal(
    readJson(path.join(pluginRoot, "package.json")).name,
    "@obsidian-material-plugins/quartz-root-books-workspace",
  )
  assert.ok(
    fs.existsSync(path.join(pluginRoot, "dist", "index.js")),
    "build plugin dist/ before integration",
  )

  copyQuartzSource()
  linkOrCopyDirectory(path.join(quartzRoot, "node_modules"), path.join(workspace, "node_modules"))

  for (const fileName of ["package.json", "package-lock.json", "tsconfig.json", "globals.d.ts"]) {
    const source = path.join(quartzRoot, fileName)
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(workspace, fileName))
  }

  const parentPlugins = path.join(quartzRoot, ".quartz", "plugins")
  const stagedPlugins = path.join(workspace, ".quartz", "plugins")
  fs.mkdirSync(stagedPlugins, { recursive: true })

  for (const entry of fs.existsSync(parentPlugins)
    ? fs.readdirSync(parentPlugins, { withFileTypes: true })
    : []) {
    if (!entry.isDirectory() || entry.name === PLUGIN_NAME) continue
    linkOrCopyDirectory(path.join(parentPlugins, entry.name), path.join(stagedPlugins, entry.name))
  }

  // Begin with the local tree in the same cache slot as the remote pin. The CLI remove/add
  // sequence below must tear this down and recreate a genuine local-development install.
  linkOrCopyDirectory(pluginRoot, path.join(stagedPlugins, PLUGIN_NAME))
  const parentIndex = path.join(parentPlugins, "index.ts")
  if (fs.existsSync(parentIndex)) fs.copyFileSync(parentIndex, path.join(stagedPlugins, "index.ts"))

  fs.copyFileSync(
    path.join(quartzRoot, "quartz.lock.json"),
    path.join(workspace, "quartz.lock.json"),
  )
}

function assertMixedPreactBuiltInRender() {
  const mixedPluginRoot = path.join(workspace, "mixed-preact-plugin")
  const mixedPreactRoot = path.join(mixedPluginRoot, "node_modules", "preact")
  const hostPreactRoot = path.dirname(
    fs.realpathSync(requireFromQuartz.resolve("preact/package.json")),
  )

  fs.mkdirSync(mixedPluginRoot, { recursive: true })
  fs.cpSync(path.join(pluginRoot, "dist"), path.join(mixedPluginRoot, "dist"), {
    recursive: true,
  })
  fs.copyFileSync(path.join(pluginRoot, "package.json"), path.join(mixedPluginRoot, "package.json"))
  fs.mkdirSync(path.dirname(mixedPreactRoot), { recursive: true })
  fs.cpSync(hostPreactRoot, mixedPreactRoot, { recursive: true })

  assert.notEqual(
    fs.realpathSync(mixedPreactRoot),
    fs.realpathSync(hostPreactRoot),
    "mixed-runtime fixture must contain a physical second Preact copy",
  )

  const scriptPath = writeWorkspaceFile(
    "mixed-preact-render.mjs",
    `import { createRequire } from "node:module"
const hostRequire = createRequire(${JSON.stringify(path.join(quartzRoot, "package.json"))})
const renderModule = hostRequire("preact-render-to-string")
const render = renderModule.default ?? renderModule
const { RootIndexPanels } = await import(${JSON.stringify(pathToFileURL(path.join(mixedPluginRoot, "dist", "index.js")).href)})
const Component = RootIndexPanels({ defaultIcon: "lucide:book-open" })
const html = render(Component({
  ctx: {},
  externalResources: { css: [], js: [], additionalHead: [] },
  fileData: { slug: "index", filePath: "index.md", frontmatter: {} },
  cfg: { locale: "en-US" },
  children: [],
  tree: { type: "root", children: [] },
  allFiles: [
    { slug: "java/index", filePath: "java/index.md", frontmatter: { title: "Java" } },
    { slug: "java/note", filePath: "java/note.md", frontmatter: {} },
  ],
}))
if (!html.includes("data-rip-icon=\\"lucide:book-open\\"") || !html.includes("data-rip-lucide-icon")) {
  throw new Error("portable Lucide icon did not render through the host renderer")
}
`,
  )

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
    maxBuffer: 4 * 1024 * 1024,
    timeout: 30_000,
  })
  if (result.error || result.status !== 0) {
    throw new Error(
      `mixed-Preact built-in render failed\n${result.error?.stack ?? ""}\n` +
        `stdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
    )
  }
  process.stdout.write("✓ mixed-Preact built-in render\n")
}

const theme = {
  fontOrigin: "local",
  cdnCaching: true,
  typography: {
    header: "Arial",
    body: "Arial",
    code: "monospace",
  },
  colors: {
    lightMode: {
      light: "#faf8f8",
      lightgray: "#e5e5e5",
      gray: "#b8b8b8",
      darkgray: "#4e4e4e",
      dark: "#2b2b2b",
      secondary: "#284b63",
      tertiary: "#84a59d",
      highlight: "rgba(143, 159, 169, 0.15)",
      textHighlight: "#fff23688",
    },
    darkMode: {
      light: "#161618",
      lightgray: "#393639",
      gray: "#646464",
      darkgray: "#d4d4d4",
      dark: "#ebebec",
      secondary: "#7b97aa",
      tertiary: "#84a59d",
      highlight: "rgba(143, 159, 169, 0.15)",
      textHighlight: "#b3aa0288",
    },
  },
}

function communityPlugin(name, extra = {}) {
  return {
    source: `@quartz-community/${name}`,
    enabled: true,
    ...extra,
  }
}

function pluginEntries(rootSource, rootOptions, includeFolderPage = true) {
  const entries = [
    communityPlugin("note-properties", {
      order: 5,
      options: {
        includeAll: false,
        includedProperties: ["description", "tags", "aliases"],
        excludedProperties: [],
        hidePropertiesView: true,
        delimiters: "---",
        language: "yaml",
      },
    }),
    communityPlugin("unlisted-pages", { order: 45, options: {} }),
    communityPlugin("table-of-contents", {
      order: 50,
      options: {
        maxDepth: 3,
        minEntries: 1,
        showByDefault: true,
        collapseByDefault: false,
        layout: "modern",
      },
      layout: { position: "right", priority: 30 },
    }),
    communityPlugin("description", { order: 70 }),
    communityPlugin("content-index", {
      order: 50,
      options: { enableSiteMap: true, enableRSS: true },
    }),
    communityPlugin("canvas-page", { order: 50 }),
    communityPlugin("content-page", { order: 50 }),
    communityPlugin("folder-page", { order: 50 }),
    communityPlugin("tag-page", { order: 50 }),
    communityPlugin("page-title", {
      order: 50,
      layout: { position: "left", priority: 10 },
    }),
    communityPlugin("search", {
      order: 50,
      layout: { position: "left", priority: 20 },
    }),
    communityPlugin("darkmode", {
      order: 50,
      layout: { position: "left", priority: 30 },
    }),
    communityPlugin("explorer", {
      order: 50,
      layout: { position: "left", priority: 50 },
    }),
    communityPlugin("graph", {
      order: 50,
      layout: { position: "right", priority: 10 },
    }),
    communityPlugin("breadcrumbs", {
      order: 50,
      options: {
        spacerSymbol: "❯",
        rootName: "Home",
        resolveFrontmatterTitle: true,
        showCurrentPage: true,
      },
      layout: { position: "beforeBody", priority: 5, condition: "not-index" },
    }),
    communityPlugin("article-title", {
      order: 50,
      layout: { position: "beforeBody", priority: 10 },
    }),
    communityPlugin("content-meta", {
      order: 50,
      options: { showReadingTime: true, showComma: true },
      layout: { position: "beforeBody", priority: 20 },
    }),
    communityPlugin("tag-list", {
      order: 50,
      layout: { position: "beforeBody", priority: 30 },
    }),
    communityPlugin("footer", {
      order: 50,
      options: { links: {} },
    }),
    communityPlugin("bases-page", { order: 50, options: {} }),
    {
      source: rootSource,
      enabled: true,
      options: rootOptions,
      order: 50,
      layout: { ...ROOT_SIDEBAR_LAYOUT },
    },
  ]

  return includeFolderPage
    ? entries
    : entries.filter((entry) => entry.source !== "@quartz-community/folder-page")
}

function configuration({ locale, enableSPA }) {
  return {
    pageTitle: "Root Index Panels Integration",
    pageTitleSuffix: "",
    enableSPA,
    enablePopovers: false,
    analytics: null,
    locale,
    baseUrl: BASE_URL,
    ignorePatterns: [],
    theme,
  }
}

function writeConfig({ locale, enableSPA, rootSource, rootOptions, includeFolderPage = true }) {
  const config = {
    configuration: configuration({ locale, enableSPA }),
    plugins: pluginEntries(rootSource, rootOptions, includeFolderPage),
    layout: {
      groups: {},
      byPageType: {
        content: {},
        folder: {},
        tag: {},
      },
    },
  }

  writeWorkspaceFile(
    "quartz.config.yaml",
    `# yaml-language-server: $schema=./quartz/plugins/quartz-plugins.schema.json\n${YAML.stringify(config, { lineWidth: 120 })}`,
  )
}

function writeQuartzEntry(useTypeScriptOverride) {
  const override = useTypeScriptOverride
    ? `import * as ExternalPlugin from "./.quartz/plugins/index"\n\nExternalPlugin.RootIndexPanelsPage({\n  defaultIcon: "lucide:circle-dot",\n  defaultAccent: "#abcdef",\n})\n\n`
    : ""

  writeWorkspaceFile(
    "quartz.ts",
    `${override}import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"\n\nconst config = await loadQuartzConfig()\nexport default config\nexport const layout = await loadQuartzLayout()\n`,
  )
}

function runQuartz(args, label, timeout = 300_000) {
  const executable = path.join(workspace, "quartz", "bootstrap-cli.mjs")
  const result = spawnSync(process.execPath, [executable, ...args], {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
    maxBuffer: 16 * 1024 * 1024,
    timeout,
  })

  if (result.error || result.status !== 0) {
    throw new Error(
      `${label} failed${result.status === null ? "" : ` with exit code ${result.status}`}\n` +
        `${result.error ? `${result.error.stack ?? result.error}\n` : ""}` +
        `stdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
    )
  }

  process.stdout.write(`✓ ${label}\n`)
  return result
}

function runQuartzExpectFailure(args, label, expectedPatterns, timeout = 300_000) {
  const executable = path.join(workspace, "quartz", "bootstrap-cli.mjs")
  const result = spawnSync(process.execPath, [executable, ...args], {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
    maxBuffer: 16 * 1024 * 1024,
    timeout,
  })

  if (result.error) {
    throw new Error(`${label} could not run\n${result.error.stack ?? result.error}`)
  }
  if (result.status === 0) {
    throw new Error(
      `${label} unexpectedly succeeded\nstdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
    )
  }

  const combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`
  for (const pattern of expectedPatterns) {
    assert.match(
      combinedOutput,
      pattern,
      `${label} did not report ${pattern}\nstdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
    )
  }

  process.stdout.write(`✓ ${label}\n`)
  return result
}

function sourceName(source) {
  const value = typeof source === "string" ? source : (source?.name ?? source?.repo ?? "")
  const normalized = String(value).replaceAll("\\", "/").replace(/\/$/, "")
  return normalized.startsWith("github:")
    ? normalized.split("/").at(-1)
    : path.posix.basename(normalized)
}

function assertRootSidebarLayoutConfig(expectedEnabled, label) {
  const parsed = YAML.parse(fs.readFileSync(path.join(workspace, "quartz.config.yaml"), "utf8"))
  const rootEntries = parsed.plugins.filter((entry) => sourceName(entry.source) === PLUGIN_NAME)
  assert.equal(rootEntries.length, 1, `${label} must retain exactly one ${PLUGIN_NAME} entry`)
  assert.equal(rootEntries[0].enabled, expectedEnabled, `${label} plugin enabled state drifted`)
  assert.deepEqual(
    rootEntries[0].layout,
    ROOT_SIDEBAR_LAYOUT,
    `${label} must retain the RootIndexSidebar layout`,
  )
}

function exerciseFreshLocalInstall() {
  const remoteOptions = {
    layout: "cards",
    showDescription: true,
    showDocCount: true,
    showTags: true,
    tagCount: 3,
    sort: "alphabetical",
    descriptionFallback: "",
  }
  writeConfig({
    locale: "en-US",
    enableSPA: true,
    rootSource: "github:obsidian-material-plugins/quartz-root-books-workspace",
    rootOptions: remoteOptions,
  })
  writeQuartzEntry(false)

  runQuartz(
    ["plugin", "remove", RETIRED_PLUGIN_NAME, "--concurrency", "1"],
    "retired plugin remove",
  )
  runQuartz(["plugin", "remove", PLUGIN_NAME, "--concurrency", "1"], "fresh plugin remove")
  runQuartz(["plugin", "add", pluginRoot, "--concurrency", "1"], "fresh local plugin add")

  const addedConfig = YAML.parse(
    fs.readFileSync(path.join(workspace, "quartz.config.yaml"), "utf8"),
  )
  const rootEntries = addedConfig.plugins.filter(
    (entry) => sourceName(entry.source) === PLUGIN_NAME,
  )
  assert.equal(rootEntries.length, 1, "fresh add must create exactly one plugin config entry")
  assert.equal(
    rootEntries[0].enabled,
    false,
    "manifest defaultEnabled=false must survive fresh add",
  )
  assert.equal(
    rootEntries[0].options.replaceExplorer,
    true,
    "fresh add must preserve the sidebar's Explorer replacement default",
  )
  assert.deepEqual(
    rootEntries[0].layout,
    ROOT_SIDEBAR_LAYOUT,
    "fresh add must generate exactly one RootIndexSidebar left layout stanza",
  )

  const lock = readJson(path.join(workspace, "quartz.lock.json"))
  assert.equal(
    lock.plugins[RETIRED_PLUGIN_NAME],
    undefined,
    "fresh add must not retain the retired plugin lock entry",
  )
  assert.equal(
    lock.plugins[PLUGIN_NAME]?.commit,
    "local",
    "fresh add must record a local lock entry",
  )
  assert.equal(
    fs.realpathSync(lock.plugins[PLUGIN_NAME].resolved),
    fs.realpathSync(pluginRoot),
    "local lock entry must resolve to the working tree",
  )
  const installedCache = path.join(workspace, ".quartz", "plugins", PLUGIN_NAME)
  if (fs.lstatSync(installedCache).isSymbolicLink()) {
    assert.equal(
      fs.realpathSync(installedCache),
      fs.realpathSync(pluginRoot),
      "installed cache must point at the local working tree",
    )
  } else {
    assert.deepEqual(
      readJson(path.join(installedCache, "package.json")),
      readJson(path.join(pluginRoot, "package.json")),
      "copied local install must retain the working tree package",
    )
    assert.equal(
      fs.readFileSync(path.join(installedCache, "dist", "index.js"), "utf8"),
      fs.readFileSync(path.join(pluginRoot, "dist", "index.js"), "utf8"),
      "copied local install must retain the working tree build",
    )
  }
  assertRootSidebarLayoutConfig(false, "fresh local add")
}

function assertFolderPageDependencyFailure() {
  const localSource = pluginRoot.replaceAll("\\", "/")
  writeConfig({
    locale: "en-US",
    enableSPA: false,
    rootSource: localSource,
    rootOptions: {},
    includeFolderPage: false,
  })
  writeQuartzEntry(false)

  runQuartzExpectFailure(
    [
      "build",
      "--directory",
      "content",
      "--output",
      "public/missing-folder-page",
      "--baseDir",
      BASE_PATH,
      "--concurrency",
      "1",
    ],
    "missing FolderPage dependency rejected",
    [
      /requires "@quartz-community\/folder-page"/,
      /npx quartz plugin add @quartz-community\/folder-page/,
      /Plugin dependency validation failed/,
    ],
  )
}

const fixtureFiles = {
  "content/index.md": `---
title: Integration Root
---
# ROOT BODY SENTINEL

This authored prose must remain after the overview and before the panels. It is intentionally long
enough to produce a reading-time label in the host ContentMeta component when the root Page Type
renders.

## Root stale section one

More hidden root prose.

## Root stale section two

More hidden root prose.
`,
  "content/loose.md": `---
title: Loose root note
---
# Loose
`,
  "content/java.md": `---
title: WRONG ROOT JAVA METADATA
description: Wrong root-note description
tags: [wrong-root-tag]
---
# Metadata trap
`,
  "content/java/index.md": `---
title: iOS
description: Java authored description
tags: [jvm, language, trimmed]
modified: 2026-07-18
panel:
  icon: "lucide:coffee"
  accent: "#0f766e"
---
# Java index body
`,
  "content/java/topic.md": `---
title: Java Topic
tags: [topic-tag]
---
# TOPIC BODY SENTINEL

The regular content page must retain host frame components.

## Topic deep section

Topic details.
`,
  "content/java/integration-map.canvas": `{
  "nodes": [
    {
      "id": "integration-text",
      "type": "text",
      "text": "# Canvas fixture\\n\\nCANVAS PAGE TYPE SENTINEL",
      "x": 0,
      "y": 0,
      "width": 320,
      "height": 160
    }
  ],
  "edges": []
}
`,
  "content/java/integration-query.base": `filters:
  and:
    - file.ext == "md"
views:
  - type: table
    name: Java integration notes
    filters:
      and:
        - file.inFolder("java")
    order:
      - file.name
      - title
`,
  "content/java/nested/index.md": `---
title: Authored nested index
---
# Nested index
`,
  "content/java/nested/page.md": `---
title: Nested Java page
---
# Nested page
`,
  "content/java/private.md": `---
title: Hidden Java page
unlisted: true
tags: [secret]
---
# Hidden
`,
  "content/generated/one.md": `---
title: Generated folder note
---
# Generated
`,
  "content/git.md/guide.md": `---
title: Dotted directory guide
---
# Git dotted directory
`,
  "content/custom/index.md": `---
title: Custom Book
panel:
  icon: "lucide:circle-dot"
---
# Custom icon book
`,
  "content/safe/index.md": `---
title: Safe Direct
panel:
  accent: "#112233"
---
# Safe direct accent
`,
  "content/unsafe/index.md": `---
title: Unsafe
panel:
  icon: constructor
  accent: "#fff;outline:none"
---
# Invalid appearance
`,
  "content/hidden-only/secret.md": `---
title: Hidden-only note
unlisted: true
---
# Hidden only
`,
  "content/tags/manual.md": `---
title: Reserved tags note
---
# Reserved tags namespace
`,
}

function writeFixture() {
  for (const [relativePath, contents] of Object.entries(fixtureFiles)) {
    writeWorkspaceFile(relativePath, contents)
  }
}

function classCount(html, className) {
  let count = 0
  for (const match of html.matchAll(/\bclass="([^"]*)"/g)) {
    if (match[1].split(/\s+/).includes(className)) count += 1
  }
  return count
}

function librarySectionHtml(html) {
  const start = html.indexOf('<section id="rip-books"')
  const end = html.indexOf("</section>", start)
  assert.ok(start >= 0 && end > start, "missing complete root library section")
  return html.slice(start, end + "</section>".length)
}

function anchorForHref(html, href) {
  const library = librarySectionHtml(html)
  for (const match of library.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
    const openingTag = match[0].slice(0, match[0].indexOf(">") + 1)
    if (
      openingTag.includes(`href="${href}"`) &&
      /\bclass="[^"]*\brip-(?:card|list)-link\b/.test(openingTag)
    ) {
      return match[0]
    }
  }
  assert.fail(`missing complete-library panel link ${href}`)
}

function itemForHref(html, href) {
  const library = librarySectionHtml(html)
  for (const match of library.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/g)) {
    const openingTag = match[0].slice(0, match[0].indexOf(">") + 1)
    if (
      match[0].includes(`href="${href}"`) &&
      /\bclass="[^"]*\brip-(?:card|list-item)\b/.test(openingTag)
    ) {
      return match[0]
    }
  }
  assert.fail(`missing complete-library item for ${href}`)
}

function panelHrefs(html) {
  const library = librarySectionHtml(html)
  const hrefs = []
  for (const match of library.matchAll(/<a\b[^>]*>/g)) {
    if (!/\bclass="[^"]*\brip-(?:card|list)-link\b/.test(match[0])) continue
    const href = match[0].match(/\bhref="([^"]+)"/)?.[1]
    if (href) hrefs.push(href)
  }
  return hrefs
}

function sidebarHtml(html) {
  const match = html.match(
    /<nav\b(?=[^>]*\bclass="[^"]*\brip-sidebar\b[^"]*")[^>]*>[\s\S]*?<\/nav>/,
  )
  assert.ok(match, "missing RootIndexSidebar navigation")
  return match[0]
}

function sidebarScopeHtml(html) {
  const sidebar = sidebarHtml(html)
  const start = sidebar.indexOf('<section class="rip-sidebar-scope"')
  const end = sidebar.indexOf("</section>", start)
  assert.ok(start >= 0 && end > start, "missing RootIndexSidebar Explorer scope")
  return sidebar.slice(start, end + "</section>".length)
}

function sidebarSwitcherHtml(html) {
  const sidebar = sidebarHtml(html)
  const start = sidebar.indexOf('<details class="rip-sidebar-switcher"')
  const end = sidebar.indexOf('<section class="rip-sidebar-scope"', start)
  assert.ok(start >= 0, "missing RootIndexSidebar manual switcher")
  return sidebar.slice(start, end >= 0 ? end : undefined)
}

function assertResolvesBelowBase(href, pagePath, expectedPath, label) {
  const pageUrl = new URL(pagePath, `https://example.test${BASE_PATH}/`)
  const resolved = new URL(href, pageUrl)
  assert.equal(resolved.origin, "https://example.test", `${label} escaped the fixture origin`)
  assert.equal(resolved.pathname, `${BASE_PATH}${expectedPath}`, `${label} resolved incorrectly`)
}

function sidebarBookAnchorForHref(html, href) {
  const sidebar = sidebarHtml(html)
  for (const match of sidebar.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
    const openingTag = match[0].slice(0, match[0].indexOf(">") + 1)
    if (
      openingTag.includes(`href="${href}"`) &&
      /\bclass="[^"]*\brip-sidebar-book-link\b/.test(openingTag)
    ) {
      return match[0]
    }
  }
  assert.fail(`missing sidebar book link ${href}`)
}

function sidebarDocumentAnchorForHref(html, href) {
  const sidebar = sidebarHtml(html)
  for (const match of sidebar.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
    const openingTag = match[0].slice(0, match[0].indexOf(">") + 1)
    if (
      openingTag.includes(`href="${href}"`) &&
      /\bclass="[^"]*\brip-sidebar-note-link\b/.test(openingTag)
    ) {
      return match[0]
    }
  }
  assert.fail(`missing sidebar document link ${href}`)
}

function sidebarDocumentIconSvg(anchor, label) {
  const iconStart = anchor.indexOf('class="rip-sidebar-node-icon"')
  assert.ok(iconStart >= 0, `${label} lost its sidebar document icon`)
  const svg = anchor.slice(iconStart).match(/<svg\b[\s\S]*?<\/svg>/)?.[0]
  assert.ok(svg, `${label} did not render an SVG icon`)
  return svg
}

function breadcrumbHtml(html, label) {
  const match = html.match(
    /<nav\b(?=[^>]*\bclass="[^"]*\bbreadcrumb-container\b[^"]*")[^>]*>[\s\S]*?<\/nav>/,
  )
  assert.ok(match, `${label} lost its Breadcrumbs component`)
  return match[0]
}

function assertBookBreadcrumbSource(html, pagePath, currentTitle, label) {
  const breadcrumbs = breadcrumbHtml(html, label)
  const elements = [
    ...breadcrumbs.matchAll(/<div class="breadcrumb-element">[\s\S]*?<\/div>/g),
  ].map((match) => match[0])

  assert.ok(elements.length >= 3, `${label} breadcrumb ancestry is incomplete`)
  assert.match(elements[0], /<a href="\.\.\/">Home<\/a>/)
  assert.match(elements[1], /<a href="\.\.\/java\/">iOS<\/a>/)
  assert.match(elements.at(-1), new RegExp(`<a href(?:="")?>${currentTitle}</a>`))
  assertResolvesBelowBase("../java/", pagePath, "/java/", `${label} book breadcrumb`)
  return breadcrumbs
}

function assertRelativeSidebarLinks(html, label) {
  const sidebar = sidebarHtml(html)
  const hrefs = [...sidebar.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/g)].map((match) => match[1])
  assert.ok(hrefs.length >= 3, `${label} sidebar did not render enough navigation links`)

  for (const href of hrefs) {
    assert.ok(!href.startsWith("/"), `${label} sidebar emitted a root-absolute link: ${href}`)
    assert.ok(
      !href.includes(BASE_PATH),
      `${label} sidebar duplicated the configured base path: ${href}`,
    )
    assert.ok(!/^[a-z][a-z\d+.-]*:/i.test(href), `${label} sidebar emitted a URL: ${href}`)
  }

  return sidebar
}

function assertRightGraph(html, label) {
  const rightSidebarIndex = html.indexOf('class="right sidebar"')
  const graphIndex = html.indexOf('class="graph"', rightSidebarIndex)
  assert.ok(rightSidebarIndex >= 0, `${label} lost the right sidebar`)
  assert.ok(graphIndex > rightSidebarIndex, `${label} lost the right-side Graph`)
  assert.equal(classCount(html, "graph"), 1, `${label} must render Graph exactly once`)
}

function assertLeftCompanions(html, label) {
  for (const className of ["page-title", "search", "darkmode"]) {
    assert.equal(
      classCount(html, className),
      1,
      `${label} must retain exactly one left-side ${className} component`,
    )
  }
}

function emittedCss(outputRoot) {
  const contents = []
  const pending = [outputRoot]
  while (pending.length > 0) {
    const directory = pending.pop()
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const candidate = path.join(directory, entry.name)
      if (entry.isDirectory()) pending.push(candidate)
      else if (entry.isFile() && entry.name.endsWith(".css")) {
        contents.push(fs.readFileSync(candidate, "utf8"))
      }
    }
  }
  return contents.join("\n")
}

function normalizedCss(outputRoot) {
  return emittedCss(outputRoot)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, "")
    .replace(/["']/g, "")
}

function atRuleBodies(css, prelude) {
  const bodies = []
  const opening = `${prelude}{`
  let searchFrom = 0

  while (searchFrom < css.length) {
    const start = css.indexOf(opening, searchFrom)
    if (start === -1) break

    const openBrace = start + prelude.length
    let depth = 1
    let cursor = openBrace + 1
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === "{") depth += 1
      else if (css[cursor] === "}") depth -= 1
      cursor += 1
    }

    assert.equal(depth, 0, `emitted CSS left ${prelude} unclosed`)
    bodies.push(css.slice(openBrace + 1, cursor - 1))
    searchFrom = cursor
  }

  return bodies
}

function ruleBodies(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return [...css.matchAll(new RegExp(`${escapedSelector}\\{([^{}]*)\\}`, "g"))].map(
    (match) => match[1],
  )
}

function assertExplorerReplacementCss(outputRoot) {
  const css = normalizedCss(outputRoot)
  const selector = ".left.sidebar:has(>.rip-sidebar[data-rip-replace-explorer=true])>.explorer"
  const start = css.indexOf(selector)
  assert.notEqual(start, -1, "emitted CSS lost the scoped Explorer replacement selector")
  const end = css.indexOf("}", start)
  assert.ok(end > start, "emitted Explorer replacement rule was not closed")
  assert.match(
    css.slice(start, end + 1),
    /display:none!important/,
    "emitted Explorer replacement rule must hide the stock Explorer",
  )
}

function assertCanvasExplorerReplacementCss(outputRoot) {
  const css = normalizedCss(outputRoot)
  const selector =
    ".page[data-frame=canvas]>#quartz-body>.center.canvas-frame>.canvas-sidebar:has(>.rip-sidebar[data-rip-replace-explorer=true])>.explorer"
  const rules = ruleBodies(css, selector)
  assert.ok(
    rules.some((body) => body.includes("display:none!important")),
    "emitted CSS lost the direct, opt-in Canvas Explorer replacement rule",
  )
}

function assertCanvasFrameContainmentCss(outputRoot) {
  const css = normalizedCss(outputRoot)
  const selector =
    ".page[data-frame=canvas]>#quartz-body>.center.canvas-frame:has(>.canvas-sidebar>.rip-sidebar)"
  const selectorStart = css.indexOf(selector)
  assert.notEqual(
    selectorStart,
    -1,
    "emitted CSS lost the plugin-gated CanvasFrame containment selector",
  )
  const declarationStart = css.indexOf("{", selectorStart)
  const declarationEnd = css.indexOf("}", declarationStart)
  assert.ok(declarationStart > selectorStart && declarationEnd > declarationStart)
  assert.ok(
    css.slice(declarationStart + 1, declarationEnd).includes("box-sizing:border-box"),
    "emitted CanvasFrame containment rule lost border-box sizing",
  )
}

function assertBookBreadcrumbCss(outputRoot) {
  const css = normalizedCss(outputRoot)
  const selector =
    ".page[data-frame=default]:has(>#quartz-body>.left.sidebar>.rip-sidebar[data-rip-scope=book])>#quartz-body>.center>.page-header>.popover-hint>.breadcrumb-container>.breadcrumb-element:first-child:not(:only-child)"
  const rules = ruleBodies(css, selector)
  assert.ok(
    rules.some((body) => body.includes("display:none")),
    "emitted CSS lost the book-scoped redundant root-breadcrumb suppression",
  )
}

function assertResponsiveContainmentCss(outputRoot) {
  const css = normalizedCss(outputRoot)
  const frameSelector =
    ".page[data-frame=default]:has(>#quartz-body>.left.sidebar>.rip-sidebar)>#quartz-body"
  const leftSelector = ".left.sidebar:has(>.rip-sidebar)"
  const explorerSummarySelector = ".rip-sidebar-scope-title"
  const tabletMedia = "@media(min-width:800px)and(max-width:1200px)"
  const mobileMedia = "@media(max-width:800px)"

  const tabletRules = atRuleBodies(css, tabletMedia).flatMap((body) =>
    ruleBodies(body, frameSelector),
  )
  assert.ok(
    tabletRules.some((body) => body.includes("grid-template-columns:minmax(0,20rem)minmax(0,1fr)")),
    "emitted CSS lost the scoped tablet default-frame containment rule",
  )

  const mobileBlocks = atRuleBodies(css, mobileMedia)
  const mobileFrameRules = mobileBlocks.flatMap((body) => ruleBodies(body, frameSelector))
  assert.ok(
    mobileFrameRules.some((body) => body.includes("grid-template-columns:minmax(0,1fr)!important")),
    "emitted CSS lost the scoped mobile default-frame containment rule",
  )

  const mobileLeftRules = mobileBlocks.flatMap((body) => ruleBodies(body, leftSelector))
  assert.ok(mobileLeftRules.length > 0, "emitted CSS lost the scoped mobile left-sidebar rule")
  for (const declaration of [
    "min-width:0",
    "width:100%",
    "max-width:100%",
    "flex-wrap:wrap",
    "overflow-wrap:anywhere",
  ]) {
    assert.ok(
      mobileLeftRules.some((body) => body.includes(declaration)),
      `emitted mobile left-sidebar rule lost ${declaration}`,
    )
  }

  const explorerSummaryRules = ruleBodies(css, explorerSummarySelector)
  assert.ok(
    explorerSummaryRules.some(
      (body) => body.includes("display:flex") && body.includes("min-height:2.75rem"),
    ),
    "emitted CSS lost the always-available Explorer disclosure summary",
  )
  assert.ok(!css.includes(".rip-sidebar-shell"), "emitted CSS retained the obsolete sidebar shell")
  assert.ok(!css.includes(".rip-sidebar-toggle"), "emitted CSS retained the obsolete mobile toggle")

  const pluginScopedSelectors = [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)]
    .map((match) => match[1])
    .filter((selector) => selector.includes(".rip-sidebar"))
  assert.ok(pluginScopedSelectors.length > 0, "emitted CSS lost all RootIndexSidebar selectors")
  for (const selector of pluginScopedSelectors) {
    for (const forbiddenTarget of [".right", ".graph", ".toc"]) {
      assert.ok(
        !selector.includes(forbiddenTarget),
        `RootIndexSidebar CSS must not target ${forbiddenTarget}: ${selector}`,
      )
    }
  }
}

function assertDesignCss(outputRoot) {
  const css = normalizedCss(outputRoot)
  const menuRules = ruleBodies(css, ".rip-sidebar-switcher-menu")
  assert.ok(
    menuRules.some(
      (body) =>
        body.includes("position:absolute") &&
        body.includes("z-index:20") &&
        (body.includes("top:calc(100%+0.35rem)") || body.includes("top:calc(100%+.35rem)")) &&
        body.includes("overflow:hidden"),
    ),
    "emitted switcher menu is no longer an overlay",
  )

  const hiddenScopeRules = ruleBodies(
    css,
    ".rip-sidebar-book-control:has(>.rip-sidebar-switcher[open])+.rip-sidebar-scope",
  )
  assert.ok(
    hiddenScopeRules.some(
      (body) => body.includes("visibility:hidden") && body.includes("pointer-events:none"),
    ),
    "open switcher must remove its covered Explorer from focus and pointer order",
  )

  assert.ok(
    css.includes("radial-gradient(ellipse120%80%at50%0%"),
    "emitted card CSS lost the Make radial glow",
  )
  assert.ok(
    css.includes("color-mix(insrgb,var(--rip-panel-accent,var(--secondary))8%,transparent)"),
    "emitted card CSS lost the per-book radial accent",
  )
  assert.ok(
    css.includes("color-mix(insrgb,var(--rip-panel-accent,var(--secondary))50%,transparent)"),
    "emitted card CSS lost the bottom accent hairline",
  )
}

function assertAssetReferencesResolve(htmlPath, outputRoot) {
  const html = fs.readFileSync(htmlPath, "utf8")
  const references = [...html.matchAll(/\b(?:href|src)="([^"]+\.(?:css|js)(?:\?[^"#]*)?)"/g)].map(
    (match) => match[1],
  )
  assert.ok(references.length >= 3, `expected CSS and JS assets in ${htmlPath}`)

  for (const reference of references) {
    if (/^(?:https?:)?\/\//.test(reference)) continue
    const cleanReference = decodeURIComponent(reference.split("?")[0])
    const resolved = path.resolve(path.dirname(htmlPath), cleanReference)
    const relative = path.relative(outputRoot, resolved)
    assert.ok(
      relative === "" ||
        (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)),
      `asset reference escapes build output: ${reference} in ${htmlPath}`,
    )
    assert.ok(
      fs.existsSync(resolved),
      `asset reference does not resolve: ${reference} in ${htmlPath}`,
    )
  }
}

function assertCommonRoot(outputRoot, expectedCountText, expectedUpdated, expectedLabels) {
  const rootPath = path.join(outputRoot, "index.html")
  const rootHtml = fs.readFileSync(rootPath, "utf8")
  const headHtml = rootHtml.slice(rootHtml.indexOf("<head>"), rootHtml.indexOf("</head>") + 7)
  const bodyHtml = rootHtml.slice(rootHtml.indexOf("<body"), rootHtml.indexOf("</body>") + 7)
  const expectedHrefs = [
    "./custom/",
    "./generated/",
    "./git.md/",
    "./java/",
    "./safe/",
    "./unsafe/",
  ]

  assert.equal(classCount(rootHtml, "rip"), 1, "root must render exactly one .rip body")
  assert.deepEqual(
    panelHrefs(rootHtml).sort(),
    expectedHrefs,
    "root panel inventory or canonical hrefs drifted",
  )
  assert.match(
    rootHtml,
    /data-basepath="\/group\/project"/,
    "configured base path must reach the host frame",
  )
  assert.equal(
    classCount(rootHtml, "breadcrumb-container"),
    0,
    "the not-index Breadcrumbs layout condition must keep the true root clear",
  )
  assert.equal(classCount(rootHtml, "rip-sidebar"), 1, "root must render one RootIndexSidebar")
  assert.equal(
    classCount(rootHtml, "explorer"),
    1,
    "stock Explorer must remain in root SSR for scoped CSS replacement",
  )
  const rootSidebar = assertRelativeSidebarLinks(rootHtml, "root")
  const rootSwitcher = sidebarSwitcherHtml(rootHtml)
  const rootScope = sidebarScopeHtml(rootHtml)
  assert.match(rootSidebar, /data-rip-replace-explorer="true"/)
  assert.match(rootSidebar, /data-rip-scope="root"/)
  assert.match(rootSwitcher, /class="rip-sidebar-switcher-label">Integration Root<\/span>/)
  assert.ok(
    rootSwitcher.includes(
      `<p class="rip-sidebar-switcher-heading">${expectedLabels.switchBook}</p>`,
    ),
    "book-switcher heading was not localized",
  )
  assert.match(rootSidebar, /class="rip-sidebar-home" href="\.\/" aria-current="page"/)
  assert.match(
    rootSwitcher,
    /class="rip-sidebar-home"[^>]*data-rip-selected="true"/,
    "root scope must be selected on the root page",
  )
  assert.match(rootSidebar, /class="rip-sidebar-book-link" href="\.\/java\/"/)
  assert.ok(
    rootScope.includes(`aria-label="${expectedLabels.explorer}"`),
    "Explorer label was not localized",
  )
  assert.ok(
    rootScope.includes(
      `<details class="rip-sidebar-explorer" open><summary class="rip-sidebar-scope-title"><h2>${expectedLabels.explorer}</h2></summary>`,
    ),
    "Explorer must own the independently collapsible native disclosure",
  )
  assert.doesNotMatch(
    rootSidebar,
    /rip-sidebar-(?:shell|toggle)/,
    "the obsolete whole-sidebar mobile disclosure returned",
  )
  assert.match(rootScope, /Loose root note/)
  assert.match(rootScope, /WRONG ROOT JAVA METADATA/)
  assert.doesNotMatch(rootScope, /Java Topic|Dotted directory guide/)
  assertResolvesBelowBase("./java/", "./", "/java/", "root Java manual link")
  assertLeftCompanions(rootHtml, "root")
  assertRightGraph(rootHtml, "root")
  assert.match(
    rootHtml,
    /<span class="rip-card-title"[^>]*>iOS<\/span>|<span class="rip-list-title"[^>]*>iOS<\/span>/,
  )
  assert.match(rootHtml, /Java authored description/)
  const directoriesStart = bodyHtml.indexOf('<section id="rip-books"')
  const directoriesEnd = bodyHtml.indexOf("</section>", directoriesStart)
  assert.ok(
    directoriesStart >= 0 && directoriesEnd > directoriesStart,
    "could not isolate the complete root library section",
  )
  const directoriesHtml = bodyHtml.slice(directoriesStart, directoriesEnd + 10)
  assert.doesNotMatch(
    directoriesHtml,
    /WRONG ROOT JAVA METADATA|Wrong root-note description|wrong-root-tag/,
  )
  assert.match(bodyHtml, /ROOT BODY SENTINEL/)
  assert.match(bodyHtml, /Root stale section one/)
  assert.match(
    bodyHtml,
    /<article class="[^"]*\brip\b[^"]*"><div class="rip-overview">/,
    "root overview must be the first direct child of the plugin body",
  )
  assert.ok(
    bodyHtml.indexOf('class="rip-overview"') < bodyHtml.indexOf('class="rip-latest"') &&
      bodyHtml.indexOf('class="rip-latest"') < bodyHtml.indexOf("ROOT BODY SENTINEL") &&
      bodyHtml.indexOf("ROOT BODY SENTINEL") < bodyHtml.indexOf('id="rip-books"'),
    "root order must be overview, latest preview, authored Markdown, then the complete library",
  )
  assert.match(
    headHtml,
    /ROOT BODY SENTINEL/,
    "authored root source should remain available to independent social/description emitters",
  )
  assert.doesNotMatch(
    rootHtml,
    /<undefined\b/,
    "fixture frame must not contain an undefined footer",
  )
  assert.equal(classCount(bodyHtml, "rip-root-content"), 1, "root authored content duplicated")
  assert.equal(classCount(bodyHtml, "rip-overview"), 1, "root overview must render once")
  assert.equal(classCount(bodyHtml, "rip-stats"), 1, "root statistics must render once")
  assert.equal(classCount(bodyHtml, "rip-stat"), 3, "root statistics inventory drifted")
  assert.equal(classCount(bodyHtml, "rip-browse-link"), 1, "root browse link must render once")
  assert.equal(
    classCount(bodyHtml, "rip-directories"),
    1,
    "complete root library section duplicated",
  )
  assert.match(bodyHtml, /class="rip-browse-link" href="#rip-books"/)
  assert.ok(
    bodyHtml.includes(`class="rip-browse-link" href="#rip-books">${expectedLabels.exploreLibrary}`),
    "root Explore library action was not localized",
  )
  assert.equal(classCount(bodyHtml, "rip-return-link"), 0, "obsolete return action rendered")
  const latestStart = bodyHtml.indexOf('<section class="rip-latest"')
  const latestEnd = bodyHtml.indexOf("</section>", latestStart)
  assert.ok(latestStart >= 0 && latestEnd > latestStart, "could not isolate latest section")
  const latestHeadingStart = bodyHtml.indexOf('<div class="rip-section-heading">', latestStart)
  const latestHeadingEnd = bodyHtml.indexOf("</div>", latestHeadingStart)
  assert.ok(
    latestHeadingStart >= latestStart && latestHeadingEnd > latestHeadingStart,
    "could not isolate latest section heading",
  )
  assert.doesNotMatch(
    bodyHtml.slice(latestHeadingStart, latestHeadingEnd + 6),
    /<p(?:\s|>)/,
    "latest heading retained its redundant explanatory paragraph",
  )
  assert.match(bodyHtml, /<dd>6<\/dd>/, "root book statistic drifted")
  assert.match(bodyHtml, /<dd>5<\/dd>/, "root total-note statistic drifted")
  assert.ok(
    bodyHtml.includes(`>${expectedUpdated}</time></dd>`),
    `root last-updated statistic drifted: ${expectedUpdated}`,
  )
  assert.equal(classCount(bodyHtml, "toc"), 1, "root authored Markdown lost its TOC")
  assert.equal(classCount(bodyHtml, "content-meta"), 1, "root authored Markdown lost ContentMeta")
  const rootMeta = bodyHtml.match(
    /<p\b(?=[^>]*class="[^"]*\bcontent-meta\b[^"]*")[^>]*>[\s\S]*?<\/p>/,
  )
  assert.ok(rootMeta, "root ContentMeta markup could not be isolated")
  assert.match(rootMeta[0], /<span>[^<]*\d+[^<]*<\/span>/, "root reading time disappeared")
  assert.doesNotMatch(rootHtml, /\.\/tags\/|\.\/hidden-only\/|\.\/loose\//)
  assert.doesNotMatch(rootHtml, /#fff;outline:none/)
  assert.match(itemForHref(rootHtml, "./java/"), /data-rip-icon="lucide:coffee"/)
  assert.match(itemForHref(rootHtml, "./java/"), /data-rip-accent="direct"/)
  assert.match(itemForHref(rootHtml, "./java/"), /--rip-panel-accent: #0f766e/)
  assert.match(itemForHref(rootHtml, "./safe/"), /data-rip-accent="direct"/)
  assert.match(itemForHref(rootHtml, "./safe/"), /--rip-panel-accent: #112233/)
  if (classCount(rootHtml, "rip--cards") === 1) {
    const libraryHtml = librarySectionHtml(rootHtml)
    assert.equal(classCount(rootHtml, "rip-grid"), 2, "latest and complete card grids must render")
    assert.equal(
      classCount(libraryHtml, "rip-card"),
      expectedHrefs.length,
      "complete card count drifted",
    )
    assert.ok(
      classCount(rootHtml, "rip-card") <= expectedHrefs.length + 3,
      "latest preview exceeded three cards",
    )
    assert.match(anchorForHref(rootHtml, "./java/"), /#jvm/)
    assert.match(anchorForHref(rootHtml, "./java/"), /#language/)
    assert.doesNotMatch(anchorForHref(rootHtml, "./java/"), /#trimmed|#secret/)
  } else {
    const libraryHtml = librarySectionHtml(rootHtml)
    assert.equal(classCount(rootHtml, "rip-list"), 2, "latest and complete lists must render")
    assert.equal(
      classCount(libraryHtml, "rip-list-item"),
      expectedHrefs.length,
      "complete list count drifted",
    )
    assert.equal(classCount(rootHtml, "rip-tags"), 0, "list layout must retain its tag-free markup")
  }

  for (const [href, text] of Object.entries(expectedCountText)) {
    assert.match(anchorForHref(rootHtml, href), new RegExp(text))
  }

  for (const segment of ["custom", "generated", "git.md", "java", "safe", "unsafe"]) {
    assert.ok(
      fs.existsSync(path.join(outputRoot, segment, "index.html")),
      `missing destination ${segment}/index.html`,
    )
  }
  assert.ok(
    fs.existsSync(path.join(outputRoot, "tags", "index.html")),
    "TagPage virtual index was not emitted",
  )
  assert.equal(
    classCount(fs.readFileSync(path.join(outputRoot, "tags", "index.html"), "utf8"), "rip"),
    0,
  )

  const topicPath = path.join(outputRoot, "java", "topic.html")
  const topicHtml = fs.readFileSync(topicPath, "utf8")
  assert.match(topicHtml, /TOPIC BODY SENTINEL/)
  assert.equal(classCount(topicHtml, "content-meta"), 1, "regular content page lost ContentMeta")
  assert.equal(classCount(topicHtml, "toc"), 1, "regular content page lost TableOfContents")
  assert.equal(classCount(topicHtml, "tags"), 1, "regular content page lost TagList")
  assert.match(topicHtml, /topic-tag/)
  assert.equal(classCount(topicHtml, "rip"), 0, "root Page Type leaked onto a non-root page")
  assert.equal(
    classCount(topicHtml, "rip-sidebar"),
    1,
    "regular book page must render one RootIndexSidebar",
  )
  assert.equal(
    classCount(topicHtml, "explorer"),
    1,
    "stock Explorer must remain in regular-page SSR for scoped CSS replacement",
  )
  const topicSidebar = assertRelativeSidebarLinks(topicHtml, "regular book page")
  const topicSwitcher = sidebarSwitcherHtml(topicHtml)
  const topicScope = sidebarScopeHtml(topicHtml)
  assert.match(topicSidebar, /data-rip-replace-explorer="true"/)
  assert.match(topicSidebar, /data-rip-scope="book"/)
  assert.match(topicSwitcher, /class="rip-sidebar-switcher-label">iOS<\/span>/)
  assert.match(topicSwitcher, /class="rip-sidebar-link-label">Integration Root<\/span>/)
  assert.match(topicSidebar, /class="rip-sidebar-home" href="\.\.\/"/)
  assert.match(
    topicSwitcher,
    /class="rip-sidebar-book-link" href="\.\.\/java\/"[^>]*data-rip-state="ancestor"[^>]*data-rip-selected="true"/,
  )
  assert.equal(
    classCount(topicSwitcher, "rip-sidebar-selected-check"),
    1,
    "book route must mark exactly one selected book",
  )
  assert.match(sidebarDocumentAnchorForHref(topicHtml, "../java/topic"), /aria-current="page"/)
  const topicDocument = sidebarDocumentAnchorForHref(topicHtml, "../java/topic")
  assert.match(topicDocument, /data-rip-node-kind="note"/)
  assert.match(topicDocument, /data-rip-state="current"/)
  assert.match(topicDocument, /data-rip-icon="note"[\s\S]*?<svg\b/)
  assert.doesNotMatch(topicScope, /rip-sidebar-book-overview-link|>Overview</)
  assert.ok(
    topicSidebar.includes(
      `class="rip-sidebar-home-mark" href="../java/" aria-label="${expectedLabels.bookHome}"`,
    ),
    "book home-mark label was not localized",
  )
  assert.doesNotMatch(
    topicSidebar.match(/<a\b[^>]*class="rip-sidebar-home-mark"[^>]*>/)?.[0] ?? "",
    /aria-current=/,
    "book home mark must be neutral on a descendant note",
  )
  const canvasDocument = sidebarDocumentAnchorForHref(topicHtml, "../java/integration-map.canvas")
  const baseDocument = sidebarDocumentAnchorForHref(topicHtml, "../java/integration-query.base")
  assert.match(canvasDocument, /data-rip-node-kind="canvas"/)
  assert.match(canvasDocument, /data-rip-icon="canvas"[\s\S]*?<svg\b/)
  assert.doesNotMatch(canvasDocument, /aria-current="page"/)
  assert.match(baseDocument, /data-rip-node-kind="base"/)
  assert.match(baseDocument, /data-rip-icon="base"[\s\S]*?<svg\b/)
  assert.doesNotMatch(baseDocument, /aria-current="page"/)
  const noteSvg = sidebarDocumentIconSvg(topicDocument, "ordinary note")
  const canvasSvg = sidebarDocumentIconSvg(canvasDocument, "Canvas page")
  const baseSvg = sidebarDocumentIconSvg(baseDocument, "Base page")
  assert.notEqual(canvasSvg, noteSvg, "Canvas and ordinary notes must not share an SVG glyph")
  assert.notEqual(baseSvg, noteSvg, "Base and ordinary notes must not share an SVG glyph")
  assert.notEqual(baseSvg, canvasSvg, "Base and Canvas pages must have distinct SVG glyphs")
  assert.match(
    topicScope,
    /class="rip-sidebar-folder" data-rip-open="true"[\s\S]*?class="rip-sidebar-folder-link" href="\.\.\/java\/nested\/"[\s\S]*?Authored nested index<\/span>/,
    "top-level nested folder must remain expanded and link to its landing page",
  )
  assert.match(
    topicScope,
    /class="rip-sidebar-disclosure" aria-expanded="true"[^>]*aria-controls="rip-sidebar-children-/,
    "nested folder must expose an independent disclosure control",
  )
  assert.match(
    sidebarDocumentAnchorForHref(topicHtml, "../java/nested/page"),
    /data-rip-node-kind="note"/,
  )
  assert.doesNotMatch(topicScope, /Dotted directory guide|Loose root note/)
  assertResolvesBelowBase("../java/", "java/topic", "/java/", "book home link")
  assertResolvesBelowBase("../java/topic", "java/topic", "/java/topic", "current book note link")
  assertResolvesBelowBase(
    "../java/integration-map.canvas",
    "java/topic",
    "/java/integration-map.canvas",
    "Canvas sidebar link",
  )
  assertResolvesBelowBase(
    "../java/integration-query.base",
    "java/topic",
    "/java/integration-query.base",
    "Base sidebar link",
  )
  assertBookBreadcrumbSource(topicHtml, "java/topic", "Java Topic", "regular book page")
  assertLeftCompanions(topicHtml, "regular book page")
  assertRightGraph(topicHtml, "regular book page")

  const canvasPath = path.join(outputRoot, "java", "integration-map.canvas.html")
  const canvasHtml = fs.readFileSync(canvasPath, "utf8")
  assert.match(canvasHtml, /<div id="quartz-root" class="page" data-frame="canvas">/)
  assert.match(canvasHtml, /CANVAS PAGE TYPE SENTINEL/)
  assert.equal(classCount(canvasHtml, "canvas-stage"), 1, "Canvas frame lost its stage")
  assert.equal(classCount(canvasHtml, "canvas-page"), 1, "Canvas Page Type body did not render")
  assert.equal(
    classCount(canvasHtml, "rip-sidebar"),
    1,
    "Canvas page must render one RootIndexSidebar",
  )
  assert.equal(
    classCount(canvasHtml, "explorer"),
    1,
    "stock Explorer must remain in Canvas SSR for scoped CSS replacement",
  )
  const canvasSidebar = assertRelativeSidebarLinks(canvasHtml, "Canvas page")
  const canvasScope = sidebarScopeHtml(canvasHtml)
  assert.match(canvasSidebar, /data-rip-replace-explorer="true"/)
  assert.match(canvasSidebar, /data-rip-scope="book"/)
  assert.match(canvasScope, /<details class="rip-sidebar-explorer" open>/)
  const currentCanvasDocument = sidebarDocumentAnchorForHref(
    canvasHtml,
    "../java/integration-map.canvas",
  )
  assert.match(currentCanvasDocument, /data-rip-node-kind="canvas"/)
  assert.match(currentCanvasDocument, /data-rip-icon="canvas"[\s\S]*?<svg\b/)
  assert.match(currentCanvasDocument, /aria-current="page"/)
  assert.match(currentCanvasDocument, /data-rip-state="current"/)
  assert.match(
    sidebarDocumentAnchorForHref(canvasHtml, "../java/integration-query.base"),
    /data-rip-node-kind="base"/,
  )
  assert.match(canvasScope, /integration-map/)
  assert.match(canvasScope, /integration-query/)
  const canvasAsideStart = canvasHtml.indexOf('<aside class="canvas-sidebar">')
  const canvasAsideEnd = canvasHtml.indexOf("</aside>", canvasAsideStart)
  const canvasPluginIndex = canvasHtml.indexOf('<nav class="rip-sidebar"', canvasAsideStart)
  const canvasExplorerIndex = canvasHtml.indexOf('<div class="explorer', canvasAsideStart)
  assert.ok(
    canvasAsideStart >= 0 &&
      canvasAsideEnd > canvasAsideStart &&
      canvasPluginIndex > canvasAsideStart &&
      canvasExplorerIndex > canvasPluginIndex &&
      canvasExplorerIndex < canvasAsideEnd,
    "Canvas SSR must retain the plugin sidebar followed by the stock Explorer in its left rail",
  )
  assertResolvesBelowBase(
    "../java/integration-map.canvas",
    "java/integration-map.canvas",
    "/java/integration-map.canvas",
    "current Canvas sidebar link",
  )
  assertLeftCompanions(canvasHtml, "Canvas page")

  const basePath = path.join(outputRoot, "java", "integration-query.base.html")
  const baseHtml = fs.readFileSync(basePath, "utf8")
  assert.match(baseHtml, /<div id="quartz-root" class="page" data-frame="default">/)
  assert.equal(classCount(baseHtml, "bases-page"), 1, "Bases Page Type body did not render")
  assert.match(baseHtml, /class="bases-view is-active"[^>]*data-view-type="table"/)
  assert.equal(classCount(baseHtml, "rip-sidebar"), 1, "Base page must render one RootIndexSidebar")
  assert.equal(
    classCount(baseHtml, "explorer"),
    1,
    "stock Explorer must remain in Base SSR for scoped CSS replacement",
  )
  const baseSidebar = assertRelativeSidebarLinks(baseHtml, "Base page")
  assert.match(baseSidebar, /data-rip-replace-explorer="true"/)
  assert.match(baseSidebar, /data-rip-scope="book"/)
  const currentBaseDocument = sidebarDocumentAnchorForHref(
    baseHtml,
    "../java/integration-query.base",
  )
  assert.match(currentBaseDocument, /data-rip-node-kind="base"/)
  assert.match(currentBaseDocument, /data-rip-icon="base"[\s\S]*?<svg\b/)
  assert.match(currentBaseDocument, /aria-current="page"/)
  assert.match(currentBaseDocument, /data-rip-state="current"/)
  assert.match(
    sidebarDocumentAnchorForHref(baseHtml, "../java/integration-map.canvas"),
    /data-rip-node-kind="canvas"/,
  )
  assertResolvesBelowBase(
    "../java/integration-query.base",
    "java/integration-query.base",
    "/java/integration-query.base",
    "current Base sidebar link",
  )
  assertLeftCompanions(baseHtml, "Base page")
  assertRightGraph(baseHtml, "Base page")

  const dottedPath = path.join(outputRoot, "git.md", "guide.html")
  const dottedHtml = fs.readFileSync(dottedPath, "utf8")
  const dottedSidebar = assertRelativeSidebarLinks(dottedHtml, "second book page")
  const dottedSwitcher = sidebarSwitcherHtml(dottedHtml)
  const dottedScope = sidebarScopeHtml(dottedHtml)
  assert.match(dottedSidebar, /data-rip-scope="book"/)
  assert.match(
    dottedSwitcher,
    /class="rip-sidebar-book-link" href="\.\.\/git\.md\/"[^>]*data-rip-state="ancestor"[^>]*data-rip-selected="true"/,
  )
  assert.match(sidebarDocumentAnchorForHref(dottedHtml, "../git.md/guide"), /aria-current="page"/)
  assert.match(
    sidebarDocumentAnchorForHref(dottedHtml, "../git.md/guide"),
    /data-rip-node-kind="note"/,
  )
  assert.match(dottedScope, /Dotted directory guide/)
  assert.doesNotMatch(dottedScope, /Java Topic|Loose root note/)
  assert.equal(classCount(dottedHtml, "rip"), 0, "root Page Type leaked onto a second book")
  assertLeftCompanions(dottedHtml, "second book page")
  assertRightGraph(dottedHtml, "second book page")
  assertResolvesBelowBase("../git.md/", "git.md/guide", "/git.md/", "second book home link")

  assertAssetReferencesResolve(rootPath, outputRoot)
  assertAssetReferencesResolve(topicPath, outputRoot)
  assertAssetReferencesResolve(canvasPath, outputRoot)
  assertAssetReferencesResolve(basePath, outputRoot)
  assertAssetReferencesResolve(dottedPath, outputRoot)
  assertExplorerReplacementCss(outputRoot)
  assertCanvasExplorerReplacementCss(outputRoot)
  assertCanvasFrameContainmentCss(outputRoot)
  assertBookBreadcrumbCss(outputRoot)
  assertResponsiveContainmentCss(outputRoot)
  assertDesignCss(outputRoot)
  const clientScripts = emittedJavaScript(outputRoot)
  assert.match(
    clientScripts,
    /rip-sidebar-switcher/,
    "sidebar dropdown enhancement was not emitted",
  )
  assert.match(clientScripts, /Escape/, "sidebar Escape light-dismiss behavior was not emitted")
  return rootHtml
}

function emittedJavaScript(outputRoot) {
  const contents = []
  const pending = [outputRoot]
  while (pending.length > 0) {
    const directory = pending.pop()
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const candidate = path.join(directory, entry.name)
      if (entry.isDirectory()) pending.push(candidate)
      else if (entry.isFile() && entry.name.endsWith(".js")) {
        contents.push(fs.readFileSync(candidate, "utf8"))
      }
    }
  }
  return contents.join("\n")
}

function buildVariant({ name, locale, enableSPA, rootOptions, typeScriptOverride, assertVariant }) {
  const localSource = pluginRoot.replaceAll("\\", "/")
  writeConfig({ locale, enableSPA, rootSource: localSource, rootOptions })
  writeQuartzEntry(typeScriptOverride)
  assertRootSidebarLayoutConfig(true, `${name} pre-build config`)

  const outputRoot = path.join(workspace, "public", name)
  assertInside(workspace, outputRoot, "build output")
  outputDirectories.push(outputRoot)
  runQuartz(
    [
      "build",
      "--directory",
      "content",
      "--output",
      path.relative(workspace, outputRoot),
      "--baseDir",
      BASE_PATH,
      "--concurrency",
      "1",
      "--verbose",
    ],
    `${name} Quartz build`,
  )
  assertRootSidebarLayoutConfig(true, `${name} post-build config`)
  assertVariant(outputRoot)
}

function runIntegration() {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), WORKSPACE_PREFIX))
  workspaceMarker = randomUUID()
  fs.writeFileSync(path.join(workspace, ".rip-integration-workspace"), workspaceMarker)

  stageHost()
  assertMixedPreactBuiltInRender()
  exerciseFreshLocalInstall()
  writeFixture()
  assertFolderPageDependencyFailure()

  buildVariant({
    name: "spa-en-us-yaml",
    locale: "en-US",
    enableSPA: true,
    typeScriptOverride: false,
    rootOptions: {
      layout: "cards",
      showDescription: true,
      showDocCount: true,
      showTags: true,
      tagCount: 2,
      sort: "alphabetical",
      descriptionFallback: "YAML fallback",
      defaultIcon: "lucide:book-open",
      defaultAccent: "#0f766e",
    },
    assertVariant(outputRoot) {
      const rootHtml = assertCommonRoot(
        outputRoot,
        {
          "./custom/": ">0 notes</span>",
          "./generated/": ">1 note</span>",
          "./git.md/": ">1 note</span>",
          "./java/": ">3 notes</span>",
        },
        "Jul 18, 2026",
        {
          switchBook: "Switch book",
          explorer: "Explorer",
          bookHome: "Open iOS home",
          exploreLibrary: "Explore library",
        },
      )
      assert.match(itemForHref(rootHtml, "./custom/"), /data-rip-icon="lucide:circle-dot"/)
      assert.match(
        sidebarBookAnchorForHref(rootHtml, "./custom/"),
        /data-rip-icon="lucide:circle-dot"/,
      )
      assert.match(itemForHref(rootHtml, "./unsafe/"), /data-rip-accent="direct"/)
      assert.match(emittedJavaScript(outputRoot), /route-announcer/)
    },
  })

  buildVariant({
    name: "no-spa-fi-ts",
    locale: "fi-FI",
    enableSPA: false,
    typeScriptOverride: true,
    rootOptions: {
      layout: "list",
      showDescription: true,
      showDocCount: true,
      showTags: true,
      tagCount: 2,
      sort: "alphabetical",
      descriptionFallback: "YAML fallback",
      defaultIcon: "lucide:terminal",
      defaultAccent: "theme",
    },
    assertVariant(outputRoot) {
      const rootHtml = assertCommonRoot(
        outputRoot,
        {
          "./custom/": "0 muistiinpanoa",
          "./generated/": "1 muistiinpano",
          "./git.md/": "1 muistiinpano",
          "./java/": "3 muistiinpanoa",
        },
        "18.7.2026",
        {
          switchBook: "Vaihda kirjaa",
          explorer: "Sisältöselain",
          bookHome: "Avaa kirjan iOS etusivu",
          exploreLibrary: "Selaa kirjastoa",
        },
      )
      const custom = itemForHref(rootHtml, "./custom/")
      assert.match(custom, /data-rip-icon="lucide:circle-dot"/)
      assert.match(custom, /data-rip-accent="direct"/)
      assert.match(custom, /--rip-panel-accent: #abcdef/)
      const customSidebar = sidebarBookAnchorForHref(rootHtml, "./custom/")
      assert.match(customSidebar, /data-rip-icon="lucide:circle-dot"/)
      assert.match(customSidebar, /data-rip-accent="direct"/)
      assert.match(customSidebar, /--rip-sidebar-accent: #abcdef/)
      assert.match(itemForHref(rootHtml, "./unsafe/"), /--rip-panel-accent: #abcdef/)
      const scripts = emittedJavaScript(outputRoot)
      assert.doesNotMatch(scripts, /route-announcer/)
      assert.match(scripts, /location\.assign/)
    },
  })

  buildVariant({
    name: "spa-en-gb-fallback-subpath",
    locale: "en-GB",
    enableSPA: true,
    typeScriptOverride: false,
    rootOptions: {
      layout: "cards",
      showDescription: true,
      showDocCount: true,
      showTags: true,
      tagCount: 2,
      sort: "alphabetical",
      descriptionFallback: "YAML fallback",
      defaultIcon: "lucide:book-open",
      defaultAccent: "theme",
    },
    assertVariant(outputRoot) {
      const rootHtml = assertCommonRoot(
        outputRoot,
        {
          "./custom/": ">0 notes</span>",
          "./generated/": ">1 note</span>",
          "./git.md/": ">1 note</span>",
          "./java/": ">3 notes</span>",
        },
        "18 Jul 2026",
        {
          switchBook: "Switch book",
          explorer: "Explorer",
          bookHome: "Open iOS home",
          exploreLibrary: "Explore library",
        },
      )
      assert.match(itemForHref(rootHtml, "./custom/"), /data-rip-icon="lucide:circle-dot"/)
      assert.match(
        sidebarBookAnchorForHref(rootHtml, "./custom/"),
        /data-rip-icon="lucide:circle-dot"/,
      )
      const unsafe = itemForHref(rootHtml, "./unsafe/")
      assert.doesNotMatch(unsafe, /data-rip-accent=|--rip-panel-accent/)
      assert.match(emittedJavaScript(outputRoot), /route-announcer/)
    },
  })

  process.stdout.write("✓ parent Quartz integration assertions passed\n")
}

try {
  runIntegration()
} catch (error) {
  process.exitCode = 1
  console.error(error?.stack ?? error)
} finally {
  if (workspace && KEEP_WORKSPACE) {
    console.log(`RIP_KEEP_INTEGRATION=1 preserved workspace: ${workspace}`)
    for (const output of outputDirectories) console.log(`Preserved output: ${output}`)
  } else if (workspace) {
    try {
      validateWorkspaceForCleanup()
      for (const linked of [...linkedDirectories].sort((a, b) => b.length - a.length)) {
        if (fs.existsSync(linked) && fs.lstatSync(linked).isSymbolicLink()) fs.unlinkSync(linked)
      }
      fs.rmSync(workspace, { recursive: true, force: true, maxRetries: 3 })
    } catch (cleanupError) {
      process.exitCode = 1
      console.error(`Integration workspace cleanup failed: ${cleanupError?.stack ?? cleanupError}`)
    }
  }
}
