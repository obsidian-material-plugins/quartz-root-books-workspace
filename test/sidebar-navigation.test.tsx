import type { QuartzComponentProps } from "@quartz-community/types"
import render from "preact-render-to-string"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("../src/components/styles/sidebar.scss", () => ({ default: "sidebar-style" }))
vi.mock("../src/components/styles/sidebar-rework.scss", () => ({
  default: "sidebar-rework-style",
}))
vi.mock("../src/components/scripts/sidebar.inline.ts", () => ({ default: "sidebar-script" }))

import RootIndexSidebar, { type RootIndexSidebarOptions } from "../src/components/RootIndexSidebar"
import {
  buildSidebarNavigationModel,
  getSidebarLinkState,
  getSidebarNavigationModel,
  selectSidebarNavigationScope,
} from "../src/navigation"
import { NAVIGATION_SORTING_SERVICE_SYMBOL } from "../src/sorting"
import {
  componentProps,
  countOccurrences,
  physicalFile,
  virtualFile,
  type PluginFile,
} from "./helpers"

const navigationSortingSymbol = Symbol.for(NAVIGATION_SORTING_SERVICE_SYMBOL)

afterEach(() => {
  delete (globalThis as unknown as Record<symbol, unknown>)[navigationSortingSymbol]
})

function sidebarScope(html: string): string {
  const start = html.indexOf('<section class="rip-sidebar-scope"')
  const end = html.indexOf("</section>", start)
  return start >= 0 && end > start ? html.slice(start, end + "</section>".length) : ""
}

function switcherMenu(html: string): string {
  const start = html.indexOf('<div class="rip-sidebar-switcher-menu"')
  const end = html.indexOf('<section class="rip-sidebar-scope"', start)
  return start >= 0 ? html.slice(start, end >= 0 ? end : undefined) : ""
}

function sidebarIconSvg(html: string, kind: "note" | "canvas" | "base"): string {
  const marker = `data-rip-icon="${kind}"`
  const markerIndex = html.indexOf(marker)
  const svgStart = html.indexOf("<svg", markerIndex)
  const svgEnd = html.indexOf("</svg>", svgStart)
  return markerIndex >= 0 && svgStart >= 0 && svgEnd > svgStart
    ? html.slice(svgStart, svgEnd + "</svg>".length)
    : ""
}

function fixture(): PluginFile[] {
  return [
    physicalFile("index", { title: "Home" }),
    physicalFile("loose", { title: "Loose note" }),
    physicalFile("java", { title: "Java root note" }),
    physicalFile("java/index", {
      title: "Java",
      panel: 'icon: lucide:coffee\naccent: "#0f766e"\n',
    }),
    physicalFile("java/topic", { title: "Java Topic" }),
    physicalFile("java/setup/index", { title: "Setup" }),
    physicalFile("java/setup/install", { title: "Install" }),
    physicalFile("java/private", { title: "Private", unlisted: true }, { unlisted: true }),
    physicalFile("git/index", { title: "Git" }),
    physicalFile("git/topic", { title: "Git Topic" }),
    virtualFile("tags/index", { title: "Tags" }),
    physicalFile("tags/manual", { title: "Tags Manual" }),
  ]
}

function renderSidebar(
  slug: string,
  allFiles: PluginFile[],
  options?: RootIndexSidebarOptions,
  locale = "en-US",
  displayClass?: "mobile-only" | "desktop-only",
): string {
  const props = componentProps(slug, allFiles, locale) as QuartzComponentProps
  props.displayClass = displayClass
  const Sidebar = RootIndexSidebar(options)
  return render(Sidebar(props) as Parameters<typeof render>[0])
}

describe("sidebar navigation model", () => {
  it("separates root notes from alphabetized book-scoped hierarchies", () => {
    const model = buildSidebarNavigationModel(fixture())

    expect(model.rootNotes.map((note) => [note.title, note.slug])).toEqual([
      ["Java root note", "java"],
      ["Loose note", "loose"],
    ])
    expect(model.rootTitle).toBe("Home")
    expect(model.books.map((book) => book.title)).toEqual(["Git", "Java"])

    const java = model.books.find((book) => book.segment === "java")
    expect(java?.children.map((node) => [node.kind, node.title])).toEqual([
      ["folder", "Setup"],
      ["note", "Java Topic"],
    ])
    const setup = java?.children[0]
    expect(setup?.kind).toBe("folder")
    if (setup?.kind !== "folder") throw new Error("Expected Setup folder")
    expect(setup.slug).toBe("java/setup/index")
    expect(setup.children.map((node) => node.title)).toEqual(["Install"])
    expect(JSON.stringify(model)).not.toContain("Private")
    expect(JSON.stringify(model)).not.toContain("Tags Manual")
    expect(Object.isFrozen(model)).toBe(true)
    expect(Object.isFrozen(java?.children)).toBe(true)
  })

  it("ignores legacy filename-sorting frontmatter and orders files by title", () => {
    const model = buildSidebarNavigationModel([
      physicalFile("book/index", {
        title: "Book",
        "quartz-sorting-direction": "ascending",
      }),
      physicalFile("book/17.01.2026_zulu", { title: "Zulu" }),
      physicalFile("book/02.08.2026_alpha", { title: "Alpha" }),
    ])

    expect(model.books[0]?.children.map((node) => node.title)).toEqual(["Alpha", "Zulu"])
  })

  it("uses the first listed physical root title and omits unsafe or missing titles", () => {
    const rootTitle = Object.defineProperty({}, "title", {
      enumerable: true,
      get() {
        throw new Error("must not execute")
      },
    })
    const unsafeRoot = physicalFile("index")
    unsafeRoot.frontmatter = rootTitle as PluginFile["frontmatter"]

    expect(
      buildSidebarNavigationModel([
        virtualFile("index", { title: "Virtual root" }),
        physicalFile("index", { title: "Knowledge Base" }),
        physicalFile("index", { title: "Duplicate root" }),
      ]).rootTitle,
    ).toBe("Knowledge Base")
    expect(buildSidebarNavigationModel([unsafeRoot]).rootTitle).toBeUndefined()
    expect(
      buildSidebarNavigationModel([physicalFile("index", { title: "   " })]).rootTitle,
    ).toBeUndefined()
  })

  it("requires listed physical content and a physical or generated book destination", () => {
    const model = buildSidebarNavigationModel([
      physicalFile("generated/topic", { title: "Generated Topic" }),
      virtualFile("generated/index", { title: "Generated" }),
      virtualFile("virtual-only/index", { title: "Virtual only" }),
      physicalFile("hidden/index", { title: "Hidden", unlisted: true }, { unlisted: true }),
      physicalFile("hidden/topic", { title: "Secret", unlisted: true }, { unlisted: true }),
      physicalFile("canvas-book/topic", { title: "Canvas topic" }),
      virtualFile("canvas-book/index", {}, { canvasData: {} }),
      physicalFile("bases-book/topic", { title: "Bases topic" }),
      virtualFile("bases-book/index", {}, { basesData: {} }),
      { slug: "/invalid/index", filePath: "invalid.md" } as unknown as PluginFile,
    ])

    expect(model.books.map((book) => book.segment)).toEqual(["generated"])
    expect(model.books[0]?.children.map((node) => node.title)).toEqual(["Generated Topic"])
  })

  it("uses a generated nested index only to link a folder that has physical content", () => {
    const model = buildSidebarNavigationModel([
      physicalFile("book/index", { title: "Book" }),
      virtualFile("book/generated/index", { title: "Generated folder" }),
      physicalFile("book/generated/topic", { title: "Topic" }),
      virtualFile("book/empty/index", { title: "Empty generated folder" }),
    ])

    const generated = model.books[0]?.children[0]
    expect(generated?.kind).toBe("folder")
    if (generated?.kind !== "folder") throw new Error("Expected generated folder")
    expect(generated.title).toBe("Generated folder")
    expect(generated.slug).toBe("book/generated/index")
    expect(generated.children.map((node) => node.title)).toEqual(["Topic"])
    expect(JSON.stringify(model)).not.toContain("Empty generated folder")
  })

  it("rejects nested Canvas and Bases indexes as folder destinations", () => {
    const model = buildSidebarNavigationModel([
      physicalFile("book/index", { title: "Book" }),
      virtualFile("book/canvas/index", { title: "Canvas destination" }, { canvasData: {} }),
      physicalFile("book/canvas/topic", { title: "Canvas topic" }),
      virtualFile("book/bases/index", { title: "Bases destination" }, { basesData: {} }),
      physicalFile("book/bases/topic", { title: "Bases topic" }),
    ])

    const folders = model.books[0]?.children
    expect(folders?.map((node) => [node.kind, node.title])).toEqual([
      ["folder", "Bases"],
      ["folder", "Canvas"],
    ])
    for (const folder of folders ?? []) {
      expect(folder.kind).toBe("folder")
      if (folder.kind !== "folder") continue
      expect(folder.slug).toBeUndefined()
      expect(folder.children).toHaveLength(1)
    }
    expect(JSON.stringify(model)).not.toContain("destination")
  })

  it("groups typed virtual leaves without turning their folder into an Overview destination", () => {
    const model = buildSidebarNavigationModel([
      physicalFile("book/index", { title: "Book" }),
      virtualFile("book/visual/history.canvas", { title: "History" }, { canvasData: {} }),
      virtualFile("book/visual/catalog.base", { title: "Catalog" }, { basesData: {} }),
    ])

    const visual = model.books[0]?.children[0]
    expect(visual?.kind).toBe("folder")
    if (visual?.kind !== "folder") throw new Error("Expected Visual folder")
    expect(visual.slug).toBeUndefined()
    expect(visual.children.map((node) => [node.kind, node.title])).toEqual([
      ["base", "Catalog"],
      ["canvas", "History"],
    ])
  })

  it("includes safe Canvas and Bases leaves in root and eligible-book scopes", () => {
    const model = buildSidebarNavigationModel(
      [
        physicalFile("index", { title: "Home" }),
        virtualFile("root-map.canvas", { title: "Root map" }, { canvasData: {} }),
        virtualFile("root-table.base", { title: "Root table" }, { basesData: {} }),
        physicalFile("git-practice/index", { title: "Git Practice" }),
        physicalFile("git-practice/topic", { title: "Topic" }),
        virtualFile("git-practice/history.canvas", { title: "History" }, { canvasData: {} }),
        virtualFile("virtual-only/board.canvas", { title: "Virtual only" }, { canvasData: {} }),
        physicalFile("sql-pocketbook/index", { title: "SQL Pocketbook" }),
        physicalFile("sql-pocketbook/one", { title: "One" }),
        physicalFile("sql-pocketbook/two", { title: "Two" }),
        virtualFile(
          "sql-pocketbook/query-catalog.base",
          { title: "Query Catalog" },
          { basesData: {} },
        ),
      ],
      { sort: "docCount" },
    )

    expect(model.rootNotes.map((node) => [node.kind, node.title, node.slug])).toEqual([
      ["canvas", "Root map", "root-map.canvas"],
      ["base", "Root table", "root-table.base"],
    ])
    // Virtual leaves neither create books nor inflate the physical document-count order.
    expect(model.books.map((book) => book.segment)).toEqual(["sql-pocketbook", "git-practice"])
    expect(JSON.stringify(model)).not.toContain("Virtual only")

    const gitPractice = model.books.find((book) => book.segment === "git-practice")
    expect(gitPractice?.children.map((node) => [node.kind, node.title, node.slug])).toEqual([
      ["canvas", "History", "git-practice/history.canvas"],
      ["note", "Topic", "git-practice/topic"],
    ])
    const sqlPocketbook = model.books.find((book) => book.segment === "sql-pocketbook")
    expect(sqlPocketbook?.children.map((node) => [node.kind, node.title, node.slug])).toEqual([
      ["note", "One", "sql-pocketbook/one"],
      ["base", "Query Catalog", "sql-pocketbook/query-catalog.base"],
      ["note", "Two", "sql-pocketbook/two"],
    ])
  })

  it("rejects ambiguous or mismatched virtual markers and gives physical collisions precedence", () => {
    const inheritedCanvas = Object.assign(Object.create({ canvasData: {} }), {
      slug: "book/inherited.canvas",
      frontmatter: { title: "Inherited marker" },
    }) as PluginFile
    const accessorCanvas = virtualFile("book/accessor.canvas", { title: "Accessor marker" })
    Object.defineProperty(accessorCanvas, "canvasData", {
      enumerable: true,
      get() {
        throw new Error("must not execute")
      },
    })

    const model = buildSidebarNavigationModel([
      physicalFile("book/index", { title: "Book" }),
      virtualFile("book/collision.canvas", { title: "Generated collision" }, { canvasData: {} }),
      physicalFile("book/collision.canvas", { title: "Physical collision" }, { canvasData: {} }),
      physicalFile("book/source.base", { title: "Physical source" }, { basesData: {} }),
      virtualFile("book/both.canvas", { title: "Both" }, { canvasData: {}, basesData: {} }),
      virtualFile("book/wrong.base", { title: "Wrong Canvas" }, { canvasData: {} }),
      virtualFile("book/wrong.canvas", { title: "Wrong Base" }, { basesData: {} }),
      virtualFile("book/missing.canvas", { title: "Missing marker" }),
      virtualFile("book/upper.CANVAS", { title: "Uppercase" }, { canvasData: {} }),
      virtualFile("book/hidden.base", { title: "Hidden" }, { basesData: {}, unlisted: true }),
      inheritedCanvas,
      accessorCanvas,
    ])

    expect(model.books[0]?.children.map((node) => [node.kind, node.title])).toEqual([
      ["note", "Physical collision"],
      ["note", "Physical source"],
    ])
    expect(JSON.stringify(model)).not.toMatch(
      /Generated collision|Both|Wrong Canvas|Wrong Base|Missing marker|Uppercase|Hidden|Inherited marker|Accessor marker/,
    )
  })

  it("caches by allFiles identity without conflating supported option variants", () => {
    const files = fixture()
    const first = getSidebarNavigationModel(files)
    const second = getSidebarNavigationModel(files)
    const byCount = getSidebarNavigationModel(files, { sort: "docCount" })

    expect(second).toBe(first)
    expect(byCount).not.toBe(first)
    expect(byCount.books.map((book) => book.segment)).toEqual(["java", "git"])

    files.push(physicalFile("new/index", { title: "New" }))
    expect(getSidebarNavigationModel(files)).toBe(first)
    expect(getSidebarNavigationModel([...files]).books.map((book) => book.segment)).toEqual([
      "git",
      "java",
      "new",
    ])
  })

  it("keeps the book switcher in the configured panel order", () => {
    const files = [
      physicalFile("alpha/index", { title: "Alpha" }),
      physicalFile("alpha/one", {}, { dates: { modified: new Date("2024-01-01") } }),
      physicalFile("alpha/two"),
      physicalFile("beta/index", { title: "Beta" }),
      physicalFile("beta/one", {}, { dates: { modified: new Date("2026-01-01") } }),
    ]

    expect(buildSidebarNavigationModel(files).books.map((book) => book.title)).toEqual([
      "Alpha",
      "Beta",
    ])
    expect(
      buildSidebarNavigationModel(files, { sort: "docCount" }).books.map((book) => book.title),
    ).toEqual(["Alpha", "Beta"])
    expect(
      buildSidebarNavigationModel(files, { sort: "date" }).books.map((book) => book.title),
    ).toEqual(["Beta", "Alpha"])
  })

  it("uses an optional sorting service for books and every nested folder", () => {
    const files = fixture()
    ;(globalThis as unknown as Record<symbol, unknown>)[navigationSortingSymbol] = {
      apiVersion: 1,
      sort<T>(
        folderPath: string,
        items: ReadonlyArray<{ value: T; path: string; isFolder: boolean }>,
      ) {
        if (folderPath === "/") {
          return {
            matched: true,
            items: [...items]
              .sort((left, right) => right.path.localeCompare(left.path))
              .map((item) => item.value),
          }
        }
        if (folderPath === "java") {
          return {
            matched: true,
            items: [...items]
              .sort((left, right) => right.path.localeCompare(left.path))
              .map((item) => item.value),
          }
        }
        return { matched: false, items: items.map((item) => item.value) }
      },
    }

    const model = buildSidebarNavigationModel(files)
    expect(model.books.map((book) => book.segment)).toEqual(["java", "git"])
    expect(model.rootNotes.map((note) => note.slug)).toEqual(["loose", "java"])
    expect(model.books[0]?.children.map((node) => node.title)).toEqual(["Java Topic", "Setup"])
  })

  it("lets a sorting service hide navigation items and invalidates cached standalone models", () => {
    const files = fixture()
    const standalone = getSidebarNavigationModel(files)
    ;(globalThis as unknown as Record<symbol, unknown>)[navigationSortingSymbol] = {
      apiVersion: 1,
      sort<T>(
        folderPath: string,
        items: ReadonlyArray<{ value: T; path: string; isFolder: boolean }>,
      ) {
        return {
          matched: folderPath === "java",
          items: items.filter((item) => item.path !== "java/topic").map((item) => item.value),
        }
      },
    }

    const integrated = getSidebarNavigationModel(files)
    expect(integrated).not.toBe(standalone)
    expect(integrated.books.find((book) => book.segment === "java")?.children).toHaveLength(1)
    expect(JSON.stringify(integrated)).not.toContain("Java Topic")
  })

  it("selects Home or one known book and distinguishes ancestors", () => {
    const model = buildSidebarNavigationModel(fixture())

    expect(selectSidebarNavigationScope(model, "loose").kind).toBe("root")
    const bookScope = selectSidebarNavigationScope(model, "java/setup/install")
    expect(bookScope.kind).toBe("book")
    expect(bookScope.book?.segment).toBe("java")
    expect(selectSidebarNavigationScope(model, "tags/index").kind).toBe("root")
    expect(selectSidebarNavigationScope(model, "404").kind).toBe("root")
    expect(selectSidebarNavigationScope(model, "unknown/index").kind).toBe("root")
    expect(selectSidebarNavigationScope(model, "/invalid").kind).toBe("none")

    expect(getSidebarLinkState("java/setup/install", "java/setup/install")).toBe("current")
    expect(getSidebarLinkState("java/index", "java/setup/install")).toBe("ancestor")
    expect(getSidebarLinkState("git/index", "java/setup/install")).toBeUndefined()
    expect(getSidebarLinkState("index", "java/setup/install")).toBeUndefined()
  })

  it("ignores inherited fields, accessors, malformed exclusions, and duplicate slugs", () => {
    const inherited = Object.assign(
      Object.create({ slug: "inherited/index", filePath: "inherited/index.md" }),
      { frontmatter: { title: "Inherited" } },
    ) as PluginFile
    const throwing = Object.create(null) as PluginFile
    Object.defineProperty(throwing, "slug", {
      enumerable: true,
      get() {
        throw new Error("must not execute")
      },
    })
    Object.defineProperty(throwing, "filePath", { value: "throwing.md", enumerable: true })
    const revokedFrontmatter = Proxy.revocable<Record<string, unknown>>({}, {})
    revokedFrontmatter.revoke()
    const files = [
      inherited,
      throwing,
      {
        slug: "broken/topic",
        filePath: "broken/topic.md",
        frontmatter: revokedFrontmatter.proxy,
      } as PluginFile,
      physicalFile("safe/index", { title: "Safe" }),
      physicalFile("safe/topic", { title: "First" }),
      physicalFile("safe/topic", { title: "Duplicate" }),
    ]

    expect(() => buildSidebarNavigationModel(files)).not.toThrow()
    const model = buildSidebarNavigationModel(files)
    expect(model.books.map((book) => book.segment)).toEqual(["safe"])
    expect(model.books[0]?.children.map((node) => node.title)).toEqual(["First"])

    const revokedOptions = Proxy.revocable<Record<string, unknown>>({}, {})
    revokedOptions.revoke()
    expect(() => buildSidebarNavigationModel(files, revokedOptions.proxy)).not.toThrow()

    const revokedFiles = Proxy.revocable<PluginFile[]>([], {})
    revokedFiles.revoke()
    expect(getSidebarNavigationModel(revokedFiles.proxy)).toEqual({ books: [], rootNotes: [] })
  })
})

describe("RootIndexSidebar SSR", () => {
  it("renders native Home/book switching and only root physical notes on root routes", () => {
    const html = renderSidebar("index", fixture())
    const menu = switcherMenu(html)
    const scope = sidebarScope(html)

    expect(html).toContain('<nav class="rip-sidebar"')
    expect(html).toContain('aria-label="Book navigation"')
    expect(html).not.toContain('class="rip-sidebar-shell"')
    expect(html).not.toContain('class="rip-sidebar-toggle"')
    expect(html).toContain(
      '<section class="rip-sidebar-scope" aria-label="Explorer"><details class="rip-sidebar-explorer" open><summary class="rip-sidebar-scope-title"><h2>Explorer</h2></summary>',
    )
    expect(html).toMatch(/class="rip-sidebar-home" href="\.\/" aria-current="page"/)
    expect(html).toContain('<details class="rip-sidebar-switcher">')
    expect(html).toContain('<span class="rip-sidebar-switcher-label">Home</span>')
    expect(html).toContain('class="rip-sidebar-root-icon" aria-hidden="true" inert')
    expect(html).toContain('class="rip-sidebar-switcher-chevron" aria-hidden="true" inert')
    expect(menu).toContain('<p class="rip-sidebar-switcher-heading">Switch book</p>')
    expect(menu.indexOf('class="rip-sidebar-home-list"')).toBeLessThan(
      menu.indexOf('class="rip-sidebar-switcher-divider"'),
    )
    expect(menu.indexOf('class="rip-sidebar-switcher-divider"')).toBeLessThan(
      menu.indexOf('class="rip-sidebar-books"'),
    )
    expect(menu).toContain('data-rip-selected="true"')
    expect(menu).toContain('class="rip-sidebar-selected-check"')
    expect(countOccurrences(menu, 'class="rip-sidebar-selected-check"')).toBe(1)
    expect(menu).toContain('href="./java/"')
    expect(menu).toContain('href="./git/"')
    expect(scope).toContain('aria-label="Explorer"')
    expect(scope).toContain('href="./loose"')
    expect(scope).toContain("Java root note")
    expect(scope).not.toContain("Java Topic")
    expect(scope).not.toContain("Git Topic")
    expect(html).not.toContain("Private")
    expect(html).not.toContain('class="rip-sidebar-switcher" open')
  })

  it("renders only the current book tree with canonical links and active ancestors", () => {
    const html = renderSidebar("java/setup/install", fixture(), {
      defaultAccent: "#0f766e",
    })
    const menu = switcherMenu(html)
    const scope = sidebarScope(html)

    expect(html).toContain('data-rip-scope="book"')
    expect(html).toContain('<span class="rip-sidebar-switcher-label">Java</span>')
    expect(menu).toMatch(
      /class="rip-sidebar-book-link" href="\.\.\/\.\.\/java\/"[^>]*data-rip-state="ancestor"[^>]*data-rip-selected="true"/,
    )
    expect(menu).toContain('class="rip-sidebar-selected-check"')
    expect(menu).toContain(", selected book</span>")
    expect(html).toContain('data-rip-icon="lucide:coffee"')
    expect(html).toContain('data-rip-accent="direct"')
    expect(html).toContain("--rip-sidebar-accent: #0f766e")
    expect(scope).toMatch(
      /class="rip-sidebar-folder" data-rip-state="ancestor"[^>]*data-rip-open="true"/,
    )
    expect(scope).toMatch(
      /href="\.\.\/\.\.\/java\/setup\/install" aria-current="page" data-rip-state="current"/,
    )
    expect(scope).not.toContain("rip-sidebar-book-overview-link")
    expect(scope).not.toContain(">Overview<")
    expect(scope).toContain("Java Topic")
    expect(scope).toContain('class="rip-sidebar-node-icon" aria-hidden="true" inert')
    expect(scope).not.toContain("Git Topic")
    expect(scope).not.toContain("Loose note")
  })

  it("renders typed Canvas and Bases links with distinct semantic icons", () => {
    const files = [
      physicalFile("index", { title: "Home" }),
      physicalFile("git-practice/index", { title: "Git Practice" }),
      physicalFile("git-practice/topic", { title: "Topic" }),
      virtualFile("git-practice/history.canvas", { title: "History" }, { canvasData: {} }),
      physicalFile("sql-pocketbook/index", { title: "SQL Pocketbook" }),
      physicalFile("sql-pocketbook/topic", { title: "Topic" }),
      virtualFile(
        "sql-pocketbook/query-catalog.base",
        { title: "Query Catalog" },
        { basesData: {} },
      ),
    ]
    const canvasScope = sidebarScope(renderSidebar("git-practice/history.canvas", files))
    const baseScope = sidebarScope(renderSidebar("sql-pocketbook/query-catalog.base", files))

    expect(canvasScope).toContain('<details class="rip-sidebar-explorer" open>')
    expect(canvasScope).toMatch(
      /href="\.\.\/git-practice\/history\.canvas" aria-current="page" data-rip-state="current" data-rip-node-kind="canvas"/,
    )
    expect(baseScope).toMatch(
      /href="\.\.\/sql-pocketbook\/query-catalog\.base" aria-current="page" data-rip-state="current" data-rip-node-kind="base"/,
    )
    expect(canvasScope).toMatch(/href="\.\.\/git-practice\/topic" data-rip-node-kind="note"/)
    expect(canvasScope).toContain('data-rip-icon="canvas"')
    expect(baseScope).toContain('data-rip-icon="base"')
    expect(canvasScope).toContain('data-rip-icon="note"')

    const noteIcon = sidebarIconSvg(canvasScope, "note")
    const canvasIcon = sidebarIconSvg(canvasScope, "canvas")
    const baseIcon = sidebarIconSvg(baseScope, "base")
    expect(noteIcon).not.toBe("")
    expect(canvasIcon).not.toBe("")
    expect(baseIcon).not.toBe("")
    expect(new Set([noteIcon, canvasIcon, baseIcon]).size).toBe(3)
  })

  it("separates selected-book context from the exact current page", () => {
    const rootNote = renderSidebar("loose", fixture())
    const rootMenu = switcherMenu(rootNote)
    expect(rootMenu).toMatch(/class="rip-sidebar-home" href="\.\/" data-rip-selected="true"/)
    expect(rootMenu).not.toMatch(/class="rip-sidebar-home"[^>]*aria-current=/)

    const bookIndex = renderSidebar("java/index", fixture())
    const bookScope = sidebarScope(bookIndex)
    expect(bookIndex).toMatch(
      /class="rip-sidebar-home-mark" href="\.\.\/java\/"[^>]*aria-current="page" data-rip-state="current"/,
    )
    expect(bookScope).not.toContain("rip-sidebar-book-overview-link")
    expect(switcherMenu(bookIndex)).toMatch(
      /class="rip-sidebar-book-link" href="\.\.\/java\/" aria-current="page" data-rip-state="current" data-rip-selected="true"/,
    )
  })

  it("switches the Explorer inventory completely between books", () => {
    const javaScope = sidebarScope(renderSidebar("java/topic", fixture()))
    const gitScope = sidebarScope(renderSidebar("git/topic", fixture()))

    expect(javaScope).toContain("Java Topic")
    expect(javaScope).not.toContain("Git Topic")
    expect(gitScope).toContain("Git Topic")
    expect(gitScope).not.toContain("Java Topic")
    expect(gitScope).not.toContain("Loose note")
  })

  it("opens every top-level folder while keeping inactive nested folders collapsed", () => {
    const files = [
      physicalFile("index", { title: "Knowledge Base" }),
      physicalFile("book/index", { title: "Book" }),
      physicalFile("book/active/index", { title: "Active" }),
      physicalFile("book/active/current", { title: "Current" }),
      physicalFile("book/active/deep/index", { title: "Deep" }),
      physicalFile("book/active/deep/page", { title: "Deep page" }),
      physicalFile("book/inactive/index", { title: "Inactive" }),
      physicalFile("book/inactive/page", { title: "Inactive page" }),
    ]
    const scope = sidebarScope(renderSidebar("book/active/current", files))

    expect(scope).toMatch(
      /class="rip-sidebar-folder" data-rip-state="ancestor"[^>]*data-rip-open="true"[\s\S]*?Active<\/span>/,
    )
    expect(scope).toMatch(/class="rip-sidebar-folder" data-rip-open="true"[\s\S]*?Inactive<\/span>/)
    expect(scope).toMatch(
      /class="rip-sidebar-folder" data-rip-open="false"[\s\S]*?Deep<\/span>[\s\S]*?<ul[^>]* hidden>/,
    )
    expect(countOccurrences(scope, 'class="rip-sidebar-node-icon"')).toBeGreaterThan(4)
  })

  it("localizes labels, preserves display classes, and exposes Explorer opt-out", () => {
    const html = renderSidebar(
      "index",
      [
        physicalFile("index"),
        physicalFile("loose", { title: "Loose" }),
        physicalFile("book/index", { title: "Book" }),
        physicalFile("book/topic", { title: "Topic" }),
      ],
      { replaceExplorer: false },
      "fi-FI",
      "desktop-only",
    )

    expect(html).toContain('class="desktop-only rip-sidebar"')
    expect(html).toContain('aria-label="Kirjojen navigointi"')
    expect(html).not.toContain("data-rip-replace-explorer")
    expect(html).toContain(">Etusivu</span>")
    expect(html).not.toContain(">Kirjojen navigointi</summary>")
    expect(html).toContain(">Vaihda kirjaa</p>")
    expect(html).toContain('aria-label="Sisältöselain"')
    expect(html).toContain(">Sisältöselain</h2>")
  })

  it("escapes authored text and fails malformed appearance data softly", () => {
    const files = [
      physicalFile("index"),
      physicalFile("safe/index", {
        title: '<img src=x onerror="alert(1)">',
        panel: { icon: "constructor", accent: "#fff;display:none" },
      }),
      physicalFile("safe/topic", { title: "Topic" }),
    ]
    const html = renderSidebar("safe/topic", files, {
      defaultIcon: "lucide:book-open",
      defaultAccent: "#fff;display:none",
    })

    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;>")
    expect(html).not.toContain("<img src=x")
    expect(html).not.toContain("display:none")
    expect(html).not.toContain('data-rip-icon="constructor"')
  })

  it("attaches only the scoped stylesheet to the component", () => {
    const Sidebar = RootIndexSidebar()
    expect(Sidebar.css).toBe("sidebar-style\nsidebar-rework-style")
    expect(Sidebar.afterDOMLoaded).toBe("sidebar-script")
  })
})
