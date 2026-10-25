import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const MANIFEST = ".obsidian-to-quartz-workspace.json"
const TOKEN = "{{folder_name}}"
const OMIT = new Set([".git", ".obsidian", ".quartz", "node_modules"])
const INVALID_NAME = /[\\/:*?"<>|\x00-\x1f]/
const RESERVED_NAME = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i

function validName(value, tokenAllowed) {
  if (typeof value !== "string" || !value.endsWith(".md")) return false
  const name = value.slice(0, -3)
  const count = name.split(TOKEN).length - 1
  return Boolean(
    name &&
    name !== "." &&
    name !== ".." &&
    !INVALID_NAME.test(name) &&
    !RESERVED_NAME.test(name.replace(TOKEN, "folder")) &&
    !/[. ]$/.test(name) &&
    (tokenAllowed ? count <= 1 : count === 0),
  )
}

async function manifestFor(source) {
  let raw
  try {
    raw = await fs.readFile(path.join(source, MANIFEST), "utf8")
  } catch (error) {
    if (error?.code === "ENOENT")
      return { contract: "book-structure/v2", globalNote: "index.md", localNotePattern: "index.md" }
    throw error
  }
  const value = JSON.parse(raw)
  if (
    value?.contract !== "book-structure/v2" ||
    !validName(value.globalNote, false) ||
    !validName(value.localNotePattern, true)
  ) {
    throw new Error(`${MANIFEST} has an unsupported or invalid book-structure convention`)
  }
  return value
}

async function inventory(source) {
  const files = []
  const folders = []
  async function visit(directory, relative = "") {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (OMIT.has(entry.name) || entry.name === MANIFEST) continue
      const child = relative ? `${relative}/${entry.name}` : entry.name
      const absolute = path.join(directory, entry.name)
      if (entry.isSymbolicLink())
        throw new Error(`Staging does not follow symbolic links: ${child}`)
      if (entry.isDirectory()) {
        folders.push(child)
        await visit(absolute, child)
      } else if (entry.isFile()) files.push(child)
    }
  }
  await visit(source)
  return { files, folders }
}

function makeRenames(files, folders, convention) {
  const existing = new Map(files.map((file) => [file.toLowerCase(), file]))
  const renames = new Map()
  const collisions = new Set()
  const desired = new Set()
  function queue(from, to) {
    const source = existing.get(from.toLowerCase())
    if (!source || source === to) return
    const target = to.toLowerCase()
    if (existing.has(target) || desired.has(target)) {
      collisions.add(to)
      return
    }
    desired.add(target)
    renames.set(source, to)
  }
  queue(convention.globalNote, "index.md")
  for (const folder of folders) {
    const basename = path.posix.basename(folder)
    const local = convention.localNotePattern.replace(TOKEN, basename)
    queue(`${folder}/${local}`, `${folder}/index.md`)
  }
  if (collisions.size)
    throw new Error(`Settings-note routes already occupied: ${[...collisions].sort().join(", ")}`)
  return renames
}

function splitFragment(value) {
  const index = value.search(/[?#]/)
  return index < 0 ? [value, ""] : [value.slice(0, index), value.slice(index)]
}

function linkRewriter(renames) {
  const basenameIndex = new Map()
  for (const oldPath of renames.keys()) {
    const stem = path.posix.basename(oldPath, ".md")
    basenameIndex.set(stem, [...(basenameIndex.get(stem) ?? []), oldPath])
  }
  function rewriteWiki(inner) {
    const aliasAt = inner.indexOf("|")
    const address = aliasAt < 0 ? inner : inner.slice(0, aliasAt)
    const alias = aliasAt < 0 ? "" : inner.slice(aliasAt)
    const [base, fragment] = splitFragment(address)
    if (!base) return inner
    const candidate = base.endsWith(".md") ? base : `${base}.md`
    let from = renames.has(candidate) ? candidate : undefined
    if (!from && !base.includes("/")) {
      const matches = basenameIndex.get(base.replace(/\.md$/, "")) ?? []
      if (matches.length > 1)
        throw new Error(`Ambiguous settings-note link [[${inner}]]: ${matches.join(", ")}`)
      from = matches[0]
    }
    const mapped = from ? renames.get(from) : undefined
    return mapped ? `${mapped.slice(0, -3)}${fragment}${alias}` : inner
  }
  function rewriteMarkdown(target, current) {
    const [base, fragment] = splitFragment(target)
    if (!base || base.startsWith("#") || /^[a-z][\w+.-]*:/i.test(base)) return target
    let decoded
    try {
      decoded = decodeURIComponent(base)
    } catch {
      return target
    }
    const absolute = decoded.startsWith("/")
    const relative = path.posix.normalize(path.posix.join(path.posix.dirname(current), decoded))
    const root = path.posix.normalize(decoded.replace(/^\//, ""))
    const choices = absolute ? [root] : [...new Set([relative, root])]
    const matches = choices
      .flatMap((choice) => [choice, `${choice}.md`])
      .filter((choice) => renames.has(choice))
    if (new Set(matches).size > 1)
      throw new Error(`Ambiguous settings-note link ${target} in ${current}`)
    const mapped = renames.get(matches[0])
    if (!mapped) return target
    return `${absolute ? "/" : ""}${encodeURI(mapped)}${fragment}`
  }
  return function rewrite(text, current) {
    let fence = null
    return text
      .split(/(\r?\n)/)
      .map((line) => {
        if (line === "\n" || line === "\r\n") return line
        const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
        if (marker) {
          if (!fence) fence = marker[0]
          else if (fence === marker[0]) fence = null
          return line
        }
        if (fence) return line
        return line
          .split(/(`+[^`]*`+)/g)
          .map((part) => {
            if (part.startsWith("`") && part.endsWith("`")) return part
            return part
              .replace(/\[\[([^\]]+)\]\]/g, (_, inner) => `[[${rewriteWiki(inner)}]]`)
              .replace(/\]\(([^\s)]+)\)/g, (_, target) => `](${rewriteMarkdown(target, current)})`)
          })
          .join("")
      })
      .join("")
  }
}

export async function stageBookStructure(sourceArg, destinationArg) {
  const source = path.resolve(sourceArg)
  const destination = path.resolve(destinationArg)
  if (
    source === destination ||
    destination.startsWith(`${source}${path.sep}`) ||
    source.startsWith(`${destination}${path.sep}`)
  ) {
    throw new Error("Staging directory must be separate from the source vault")
  }
  if (
    await fs.stat(destination).then(
      () => true,
      () => false,
    )
  ) {
    throw new Error(`Staging directory already exists: ${destination}`)
  }
  const convention = await manifestFor(source)
  const { files, folders } = await inventory(source)
  const renames = makeRenames(files, folders, convention)
  const rewrite = linkRewriter(renames)
  const markdown = new Map()
  for (const file of files.filter((name) => name.endsWith(".md"))) {
    const original = await fs.readFile(path.join(source, ...file.split("/")), "utf8")
    markdown.set(file, rewrite(original, file))
  }
  try {
    await fs.cp(source, destination, {
      recursive: true,
      filter: (entry) =>
        entry === source || (!OMIT.has(path.basename(entry)) && path.basename(entry) !== MANIFEST),
    })
    for (const [file, content] of markdown) {
      const target = path.join(destination, ...file.split("/"))
      const original = await fs.readFile(target, "utf8")
      if (original !== content) await fs.writeFile(target, content)
    }
    for (const [from, to] of renames) {
      await fs.rename(
        path.join(destination, ...from.split("/")),
        path.join(destination, ...to.split("/")),
      )
    }
  } catch (error) {
    await fs.rm(destination, { recursive: true, force: true })
    throw error
  }
  return { convention, renames: Object.fromEntries(renames), staged: destination }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [source, destination] = process.argv.slice(2)
  if (!source || !destination) {
    console.error("Usage: node scripts/stage-book-structure.mjs <source-vault> <new-staging-dir>")
    process.exitCode = 2
  } else {
    stageBookStructure(source, destination)
      .then((result) => {
        console.log(JSON.stringify(result))
      })
      .catch((error) => {
        console.error(error instanceof Error ? error.message : String(error))
        process.exitCode = 1
      })
  }
}
