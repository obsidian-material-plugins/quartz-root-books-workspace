import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const roots: string[] = []
const script = path.resolve("scripts/stage-book-structure.mjs")

function fixture(): { source: string; staged: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "book-structure-v2-"))
  roots.push(root)
  const source = path.join(root, "source")
  fs.mkdirSync(path.join(source, "Research", "Nested"), { recursive: true })
  fs.writeFileSync(
    path.join(source, ".obsidian-to-quartz-workspace.json"),
    JSON.stringify({
      contract: "book-structure/v2",
      globalNote: "Overview.md",
      localNotePattern: "{{folder_name}}.md",
    }),
  )
  fs.writeFileSync(path.join(source, "Overview.md"), "---\ntitle: Home\n---\n# Home\n")
  fs.writeFileSync(
    path.join(source, "Research", "Research.md"),
    "---\ntitle: Research\n---\n# Book\n",
  )
  fs.writeFileSync(path.join(source, "Research", "Nested", "Nested.md"), "# Nested\n")
  fs.writeFileSync(
    path.join(source, "Research", "Nested", "Page.md"),
    "[[Overview|Home]] [[../Research#Part]] [Book](../Research.md#Part) [[Research/Nested/Nested#Heading]]\n" +
      '[Home](<../../Overview.md> "Home")\n[home]: ../../Overview.md "Home"\n' +
      "`[[Overview]]`\n```md\n[[Overview]]\n```\n````md\n```\n[[Overview]]\n````\n",
  )
  return { source, staged: path.join(root, "staged") }
}

function stage(source: string, staged: string) {
  return spawnSync(process.execPath, [script, source, staged], { encoding: "utf8" })
}

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

describe("book-structure/v2 staged input", () => {
  it("gives Quartz canonical index routes and rewrites resolved links", () => {
    const { source, staged } = fixture()
    const result = stage(source, staged)
    expect(result.status, result.stderr).toBe(0)
    expect(fs.existsSync(path.join(staged, "index.md"))).toBe(true)
    expect(fs.existsSync(path.join(staged, "Research", "index.md"))).toBe(true)
    expect(fs.existsSync(path.join(staged, "Research", "Nested", "index.md"))).toBe(true)
    expect(fs.existsSync(path.join(source, "Overview.md"))).toBe(true)
    const page = fs.readFileSync(path.join(staged, "Research", "Nested", "Page.md"), "utf8")
    expect(page).toContain("[[index|Home]]")
    expect(page).toContain("[[../index#Part]]")
    expect(page).toContain("[Book](../index.md#Part)")
    expect(page).toContain("[[Research/Nested/index#Heading]]")
    expect(page).toContain('[Home](<../../index.md> "Home")')
    expect(page).toContain('[home]: ../../index.md "Home"')
    expect(page).toContain("`[[Overview]]`")
    expect(page).toContain("```md\n[[Overview]]\n```")
    expect(page).toContain("````md\n```\n[[Overview]]\n````")
  })

  it("resolves Markdown links against the containing note before applying renames", () => {
    const { source, staged } = fixture()
    fs.writeFileSync(
      path.join(source, ".obsidian-to-quartz-workspace.json"),
      JSON.stringify({
        contract: "book-structure/v2",
        globalNote: "Overview.md",
        localNotePattern: "Overview.md",
      }),
    )
    fs.writeFileSync(path.join(source, "Research", "Overview.md"), "# Local\n")
    fs.writeFileSync(path.join(source, "Research", "Nested", "Page.md"), "# Nested page\n")
    fs.writeFileSync(
      path.join(source, "Research", "Page.md"),
      "[Local](./Overview.md) [Root](/Overview.md)\n",
    )
    const result = stage(source, staged)
    expect(result.status, result.stderr).toBe(0)
    const page = fs.readFileSync(path.join(staged, "Research", "Page.md"), "utf8")
    expect(page).toContain("[Local](./index.md)")
    expect(page).toContain("[Root](/index.md)")
  })

  it("allows a case-only rename of the selected settings note", () => {
    const { source, staged } = fixture()
    fs.renameSync(path.join(source, "Overview.md"), path.join(source, "Index.md"))
    fs.writeFileSync(
      path.join(source, ".obsidian-to-quartz-workspace.json"),
      JSON.stringify({
        contract: "book-structure/v2",
        globalNote: "Index.md",
        localNotePattern: "{{folder_name}}.md",
      }),
    )
    const result = stage(source, staged)
    expect(result.status, result.stderr).toBe(0)
    expect(fs.existsSync(path.join(staged, "index.md"))).toBe(true)
  })

  it("reports every occupied destination without touching source or staging", () => {
    const { source, staged } = fixture()
    fs.writeFileSync(path.join(source, "index.md"), "occupied")
    fs.writeFileSync(path.join(source, "Research", "index.md"), "occupied")
    const result = stage(source, staged)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain("index.md")
    expect(result.stderr).toContain("Research/index.md")
    expect(fs.existsSync(staged)).toBe(false)
    expect(fs.readFileSync(path.join(source, "Overview.md"), "utf8")).toContain("# Home")
  })
})
