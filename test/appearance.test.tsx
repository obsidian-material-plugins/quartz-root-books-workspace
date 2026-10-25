import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import type { RootIndexPanelsOptions } from "../src/types"
import { countOccurrences, physicalFile, renderPanels } from "./helpers"

function bookFiles(panel?: unknown) {
  return [physicalFile("alpha/index", { title: "Alpha", panel }), physicalFile("alpha/note")]
}

function renderAppearance(panel?: unknown, options?: RootIndexPanelsOptions | unknown): string {
  return renderPanels(bookFiles(panel), options)
}

function appearancePanel(html: string): string {
  const libraryStart = html.indexOf('id="rip-books"')
  const start = html.indexOf('<a href="./alpha/"', libraryStart)
  const end = html.indexOf("</a>", start)
  return start >= 0 && end > start ? html.slice(start, end + 4) : ""
}

const layouts = ["cards", "list"] as const
const styleSource = readFileSync(
  new URL("../src/components/styles/panels.scss", import.meta.url),
  "utf8",
)

describe.each(layouts)("portable appearance contract (%s)", (layout) => {
  it("reads the v2 literal block scalar", () => {
    const html = renderPanels(bookFiles('icon: lucide:terminal\naccent: "#1A2B3C"\n'), { layout })
    expect(html).toContain('data-rip-icon="lucide:terminal"')
    expect(html).toContain("--rip-panel-accent: #1a2b3c")
  })

  it("falls back when a panel proxy has been revoked", () => {
    const { proxy, revoke } = Proxy.revocable({}, {})
    revoke()
    expect(renderAppearance(proxy, { layout })).toContain('data-rip-icon="lucide:book-open"')
  })

  it("uses the portable Lucide fallback and a theme-neutral accent", () => {
    const html = renderPanels(bookFiles(), { layout })

    expect(html).toContain('data-rip-icon="lucide:book-open"')
    expect(html).toContain('data-rip-lucide-icon="book-open"')
    expect(html).not.toContain("data-rip-accent")
    expect(html).not.toContain("--rip-panel-accent")
  })

  it("uses direct Lucide and six-digit hex metadata for one book only", () => {
    const html = renderPanels(
      [
        physicalFile("alpha/index", {
          title: "Alpha",
          panel: { icon: "lucide:terminal", accent: "#1A2B3C" },
        }),
        physicalFile("alpha/page"),
        physicalFile("beta/index", { title: "Beta" }),
        physicalFile("beta/page"),
      ],
      { layout },
    )

    expect(countOccurrences(html, 'data-rip-icon="lucide:terminal"')).toBe(2)
    expect(countOccurrences(html, 'data-rip-accent="direct"')).toBe(2)
    expect(countOccurrences(html, "--rip-panel-accent: #1a2b3c")).toBe(2)
    expect(countOccurrences(html, 'data-rip-icon="lucide:book-open"')).toBe(2)
  })

  it("keeps the decorative icon inert and the title as the only link name", () => {
    const panel = appearancePanel(renderAppearance({ icon: "lucide:library-big" }, { layout }))

    expect(countOccurrences(panel, "<a ")).toBe(1)
    expect(countOccurrences(panel, "</a>")).toBe(1)
    expect(panel).toContain('aria-labelledby="rip-book-0-title"')
    expect(panel).toContain('id="rip-book-0-title">Alpha</span>')
    expect(panel).toContain('<span class="rip-panel-icon" aria-hidden="true" inert>')
    expect(panel).toContain('aria-hidden="true" data-rip-lucide-icon="library-big"')
    expect(panel).not.toContain("tabindex")
    expect(panel).not.toContain("<button")
  })
})

describe("portable icon validation", () => {
  it("accepts only lucide:<lowercase-kebab-name>", () => {
    expect(renderAppearance({ icon: " lucide:refresh-cw " })).toContain(
      'data-rip-icon="lucide:refresh-cw"',
    )
    for (const icon of ["refresh-cw", "lucide:RefreshCw", "lucide:refresh_cw", 17]) {
      expect(renderAppearance({ icon })).toContain('data-rip-icon="lucide:book-open"')
    }
  })

  it("ignores accessor properties without invoking authored code", () => {
    let getterCalls = 0
    const panel = Object.defineProperty({}, "icon", {
      enumerable: true,
      get() {
        getterCalls += 1
        return "lucide:terminal"
      },
    })

    expect(renderAppearance(panel)).toContain('data-rip-icon="lucide:book-open"')
    expect(getterCalls).toBe(0)
  })
})

describe("direct accent validation", () => {
  it.each(["#a1b2c3", "#A1B2C3"])("accepts the six-digit accent %s", (accent) => {
    const html = renderAppearance({ accent })
    expect(html).toContain('data-rip-accent="direct"')
    expect(html).toContain("--rip-panel-accent: #a1b2c3")
  })

  it("supports a direct default while keeping theme as the neutral fallback", () => {
    expect(renderAppearance(undefined, { defaultAccent: "#123456" })).toContain(
      "--rip-panel-accent: #123456",
    )
    for (const defaultAccent of ["theme", "red", "var(--secondary)", "#abc"]) {
      const panel = appearancePanel(renderAppearance(undefined, { defaultAccent }))
      expect(panel).not.toContain("data-rip-accent")
      expect(panel).not.toContain("--rip-panel-accent")
    }
  })

  it.each([
    "#abc",
    "#abcdef12",
    "red",
    "transparent",
    "var(--secondary)",
    "url(https://example.com/x)",
    "#fff;outline:none",
    "#12345",
    "\u0000#ffffff",
  ])("rejects out-of-contract accent %j", (accent) => {
    const panel = appearancePanel(renderAppearance({ accent }))
    expect(panel).not.toContain("data-rip-accent")
    expect(panel).not.toContain("--rip-panel-accent")
    expect(panel).not.toContain(accent)
  })
})

describe("appearance style contract", () => {
  it("keeps persistent list accents and forced-color fallbacks", () => {
    expect(styleSource).toMatch(
      /\.rip-list-link[\s\S]*?&\[data-rip-accent\][\s\S]*?border-inline-start-color:\s*var\(--rip-panel-accent\)/,
    )
    expect(styleSource).toMatch(
      /forced-colors:\s*active[\s\S]*?\.rip \.rip-list-link\[data-rip-accent\][\s\S]*?border-inline-start-color:\s*LinkText/,
    )
  })

  it("keeps the reduced-motion and forced-color card treatment", () => {
    expect(styleSource).toContain("ellipse 120% 80% at 50% 0%")
    expect(styleSource).toMatch(
      /prefers-reduced-motion:\s*reduce[\s\S]*?\.rip \.rip-card-link::before/,
    )
    expect(styleSource).toMatch(
      /forced-colors:\s*active[\s\S]*?\.rip \.rip-card-link::before[\s\S]*?display:\s*none/,
    )
  })
})
