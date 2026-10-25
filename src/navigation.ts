import type { FullSlug, QuartzPluginData } from "@quartz-community/types"
import { isFullSlug, simplifySlug } from "@quartz-community/utils/path"

import { collectBooks } from "./books"
import { normalizeRootIndexPanelsOptions } from "./options"
import { panelValues } from "./panel"
import { parseCanonicalSlug } from "./slug"
import { getNavigationSortingService, sortWithNavigationService } from "./sorting"

type PluginFile = QuartzPluginData & Record<string, unknown>

export interface SidebarNavigationOptions {
  descriptionFallback?: unknown
  sort?: unknown
  tagCount?: unknown
}

export type SidebarDocumentKind = "note" | "canvas" | "base"

export interface SidebarDocumentNode {
  kind: SidebarDocumentKind
  key: string
  slug: FullSlug
  title: string
}

export interface SidebarFolderNode {
  kind: "folder"
  key: string
  segment: string
  title: string
  slug?: FullSlug
  children: readonly SidebarNavigationNode[]
}

export type SidebarNavigationNode = SidebarDocumentNode | SidebarFolderNode

export interface SidebarBook {
  segment: string
  slug: FullSlug
  title: string
  panel: unknown
  children: readonly SidebarNavigationNode[]
}

export interface SidebarNavigationModel {
  books: readonly SidebarBook[]
  rootTitle?: string
  rootNotes: readonly SidebarDocumentNode[]
}

export type SidebarNavigationScope =
  | { kind: "root"; book?: undefined; children: readonly SidebarDocumentNode[] }
  | { kind: "book"; book: SidebarBook; children: readonly SidebarNavigationNode[] }
  | { kind: "none"; book?: undefined; children: readonly [] }

export type SidebarLinkState = "current" | "ancestor" | undefined

interface MutableDocumentNode {
  kind: SidebarDocumentKind
  key: string
  slug: FullSlug
  title: string
}

interface MutableFolderNode {
  kind: "folder"
  key: string
  path: string
  segment: string
  title: string
  slug?: FullSlug
  children: Map<string, MutableNavigationNode>
}

type MutableNavigationNode = MutableDocumentNode | MutableFolderNode

const emptyChildren = Object.freeze([]) as readonly []
const emptyModel: SidebarNavigationModel = Object.freeze({
  books: Object.freeze([]),
  rootNotes: Object.freeze([]),
})
const noSortingService = Object.freeze({})
const modelCache = new WeakMap<object, Map<object, Map<string, SidebarNavigationModel>>>()

function ownDataValue(value: unknown, key: string): unknown {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor && "value" in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

function hasOwnDataProperty(value: unknown, key: string): boolean {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return false
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor !== undefined && "value" in descriptor
  } catch {
    return false
  }
}

function normalizeInventoryOptions(options: unknown) {
  try {
    const normalized = normalizeRootIndexPanelsOptions(options)
    return {
      descriptionFallback: normalized.descriptionFallback,
      sort: normalized.sort,
      tagCount: normalized.tagCount,
    }
  } catch {
    const normalized = normalizeRootIndexPanelsOptions()
    return {
      descriptionFallback: normalized.descriptionFallback,
      sort: normalized.sort,
      tagCount: normalized.tagCount,
    }
  }
}

function safeDateValue(value: unknown): string | number | Date | undefined {
  if (typeof value === "string" || (typeof value === "number" && Number.isFinite(value))) {
    return value
  }
  try {
    if (value instanceof Date) {
      const timestamp = Date.prototype.getTime.call(value)
      return Number.isFinite(timestamp) ? new Date(timestamp) : undefined
    }
  } catch {
    return undefined
  }
  return undefined
}

const dateKeys = ["modified", "updated", "created", "published", "date"] as const

function safeDateRecord(value: unknown): Record<string, string | number | Date> {
  const result: Record<string, string | number | Date> = {}
  for (const key of dateKeys) {
    const safeValue = safeDateValue(ownDataValue(value, key))
    if (safeValue !== undefined) {
      result[key] = safeValue
    }
  }
  return result
}

function safeFiles(value: unknown): PluginFile[] {
  try {
    if (!Array.isArray(value)) return []
  } catch {
    return []
  }

  const files: PluginFile[] = []
  let length = 0
  try {
    length = value.length
  } catch {
    return files
  }

  for (let index = 0; index < length; index += 1) {
    let file: unknown
    try {
      file = value[index]
    } catch {
      continue
    }
    if (typeof file === "object" && file !== null && !Array.isArray(file)) {
      files.push(file as PluginFile)
    }
  }
  return files
}

function parseSlug(file: PluginFile): { slug: FullSlug; parts: string[] } | undefined {
  return parseCanonicalSlug(ownDataValue(file, "slug"))
}

function isListedPhysical(file: PluginFile): boolean {
  return isPhysical(file) && ownDataValue(file, "unlisted") !== true
}

function isPhysical(file: PluginFile): boolean {
  const filePath = ownDataValue(file, "filePath")
  return typeof filePath === "string" && filePath.length > 0
}

function isSyntheticVirtualIndex(file: PluginFile): boolean {
  return (
    !isPhysical(file) &&
    (hasOwnDataProperty(file, "canvasData") || hasOwnDataProperty(file, "basesData"))
  )
}

function navigationDocumentKind(
  file: PluginFile,
  parsed: { slug: FullSlug; parts: string[] },
): SidebarDocumentKind | undefined {
  if (ownDataValue(file, "unlisted") === true) return undefined
  if (isPhysical(file)) return "note"

  const hasCanvasData = hasOwnDataProperty(file, "canvasData")
  const hasBasesData = hasOwnDataProperty(file, "basesData")
  if (hasCanvasData === hasBasesData) return undefined

  if (hasCanvasData && parsed.slug.endsWith(".canvas")) return "canvas"
  if (hasBasesData && parsed.slug.endsWith(".base")) return "base"
  return undefined
}

function humanizeSegment(segment: string): string {
  const text = segment.replace(/-/g, " ")
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1)
}

function fileTitle(file: PluginFile, fallbackSegment: string): string {
  const frontmatter = ownDataValue(file, "frontmatter")
  const title = ownDataValue(frontmatter, "title")
  return typeof title === "string" ? title : humanizeSegment(fallbackSegment)
}

function authoredTitle(file: PluginFile): string | undefined {
  const frontmatter = ownDataValue(file, "frontmatter")
  const title = ownDataValue(frontmatter, "title")
  return typeof title === "string" && title.trim().length > 0 ? title : undefined
}

function compareNodes(a: SidebarNavigationNode, b: SidebarNavigationNode): number {
  const leftIsFolder = a.kind === "folder"
  const rightIsFolder = b.kind === "folder"
  if (leftIsFolder !== rightIsFolder) return leftIsFolder ? -1 : 1
  const left = a.title.toLowerCase()
  const right = b.title.toLowerCase()
  if (left < right) return -1
  if (left > right) return 1
  if (a.title < b.title) return -1
  if (a.title > b.title) return 1
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
}

function inventoryFile(file: PluginFile): PluginFile | undefined {
  const parsed = parseSlug(file)
  if (!parsed) return undefined

  const filePath = ownDataValue(file, "filePath")
  const frontmatter = ownDataValue(file, "frontmatter")
  const dates = safeDateRecord(ownDataValue(file, "dates"))
  const topLevelDates = safeDateRecord(file)
  const frontmatterDates = safeDateRecord(frontmatter)
  return {
    slug: parsed.slug,
    ...(typeof filePath === "string" ? { filePath } : {}),
    ...(ownDataValue(file, "unlisted") === true ? { unlisted: true } : {}),
    ...(hasOwnDataProperty(file, "canvasData") ? { canvasData: true } : {}),
    ...(hasOwnDataProperty(file, "basesData") ? { basesData: true } : {}),
    ...(Object.keys(dates).length > 0 ? { dates } : {}),
    ...topLevelDates,
    frontmatter: {
      title: ownDataValue(frontmatter, "title"),
      panel: panelValues(ownDataValue(frontmatter, "panel")),
      ...frontmatterDates,
    },
  } as PluginFile
}

function ensureFolder(
  parent: Map<string, MutableNavigationNode>,
  segment: string,
  keyPrefix: string,
): MutableFolderNode {
  const key = `folder:${keyPrefix}/${segment}`
  const existing = parent.get(key)
  if (existing?.kind === "folder") return existing

  const folder: MutableFolderNode = {
    kind: "folder",
    key,
    path: `${keyPrefix}/${segment}`,
    segment,
    title: humanizeSegment(segment),
    children: new Map(),
  }
  parent.set(key, folder)
  return folder
}

function insertBookFile(
  root: Map<string, MutableNavigationNode>,
  bookSegment: string,
  relativeParts: string[],
  slug: FullSlug,
  file: PluginFile,
  kind: SidebarDocumentKind,
  folderDestinations: ReadonlyMap<FullSlug, PluginFile>,
): void {
  if (relativeParts.length === 0) return

  const isIndex = relativeParts.at(-1) === "index"
  const folderParts = relativeParts.slice(0, -1)
  let parent = root
  let keyPrefix = bookSegment
  let currentFolder: MutableFolderNode | undefined

  for (const segment of folderParts) {
    currentFolder = ensureFolder(parent, segment, keyPrefix)
    const destinationSlug = `${keyPrefix}/${segment}/index`
    if (isFullSlug(destinationSlug)) {
      const destination = folderDestinations.get(destinationSlug)
      if (destination) {
        currentFolder.slug = destinationSlug
        currentFolder.title = fileTitle(destination, segment)
      }
    }
    parent = currentFolder.children
    keyPrefix = `${keyPrefix}/${segment}`
  }

  if (isIndex) {
    if (!currentFolder) return
    currentFolder.slug = slug
    currentFolder.title = fileTitle(file, currentFolder.segment)
    return
  }

  const leafSegment = relativeParts.at(-1)
  if (!leafSegment) return
  const key = `document:${slug}`
  if (parent.has(key)) return
  parent.set(key, {
    kind,
    key,
    slug,
    title: fileTitle(file, leafSegment),
  })
}

function freezeNodes(
  nodes: Map<string, MutableNavigationNode>,
  folderPath: string,
  allFiles: unknown,
): readonly SidebarNavigationNode[] {
  const frozen = Array.from(nodes.values(), (node): SidebarNavigationNode => {
    if (node.kind !== "folder") return Object.freeze({ ...node })
    return Object.freeze({
      kind: node.kind,
      key: node.key,
      segment: node.segment,
      title: node.title,
      ...(node.slug ? { slug: node.slug } : {}),
      children: freezeNodes(node.children, node.path, allFiles),
    })
  })
  frozen.sort(compareNodes)
  const externallySorted = sortWithNavigationService(
    folderPath,
    frozen.map((node) => ({
      value: node,
      path: node.kind === "folder" ? node.key.slice("folder:".length) : node.slug,
      isFolder: node.kind === "folder",
    })),
    allFiles,
  )
  return Object.freeze(externallySorted ?? frozen)
}

/** Build the SSR navigation inventory from physical notes and safe Page Type leaves. */
export function buildSidebarNavigationModel(
  allFiles: unknown,
  options: SidebarNavigationOptions | unknown = undefined,
): SidebarNavigationModel {
  const files = safeFiles(allFiles)
  if (files.length === 0) return emptyModel
  const validFiles = files.filter((file) => parseSlug(file) !== undefined)
  if (validFiles.length === 0) return emptyModel

  const inventoryOptions = normalizeInventoryOptions(options)
  const inventoryFiles: PluginFile[] = []
  for (const file of validFiles) {
    const inventory = inventoryFile(file)
    if (inventory) inventoryFiles.push(inventory)
  }
  const books = collectBooks(inventoryFiles, inventoryOptions)
  const bookTrees = new Map(
    books.map((book) => [book.segment, new Map<string, MutableNavigationNode>()]),
  )
  const rootNotes: SidebarDocumentNode[] = []
  let rootTitle: string | undefined
  const seenSlugs = new Set<string>()
  const folderDestinations = new Map<FullSlug, PluginFile>()

  for (const file of validFiles) {
    const parsed = parseSlug(file)
    if (
      !parsed ||
      parsed.parts.length < 3 ||
      parsed.parts.at(-1) !== "index" ||
      ownDataValue(file, "unlisted") === true ||
      isSyntheticVirtualIndex(file) ||
      !bookTrees.has(parsed.parts[0]!) ||
      folderDestinations.has(parsed.slug)
    ) {
      continue
    }
    folderDestinations.set(parsed.slug, file)
  }

  const navigationFiles: Array<{
    file: PluginFile
    parsed: { slug: FullSlug; parts: string[] }
    kind: SidebarDocumentKind
  }> = []

  // Physical source records retain precedence when a generated record collides
  // with the same canonical slug. Virtual Page Type leaves never enter the
  // physical book inventory above or the folder-destination map.
  for (const file of validFiles) {
    const parsed = parseSlug(file)
    if (!parsed || !isListedPhysical(file)) continue
    navigationFiles.push({ file, parsed, kind: "note" })
  }
  for (const file of validFiles) {
    const parsed = parseSlug(file)
    if (!parsed || isPhysical(file)) continue
    const kind = navigationDocumentKind(file, parsed)
    if (kind && kind !== "note") navigationFiles.push({ file, parsed, kind })
  }

  for (const { file, parsed, kind } of navigationFiles) {
    if (!parsed || seenSlugs.has(parsed.slug)) continue
    seenSlugs.add(parsed.slug)

    if (parsed.parts.length === 1) {
      if (parsed.slug === "index") {
        rootTitle ??= authoredTitle(file)
        continue
      }
      rootNotes.push(
        Object.freeze({
          kind,
          key: `document:${parsed.slug}`,
          slug: parsed.slug,
          title: fileTitle(file, parsed.parts[0]!),
        }),
      )
      continue
    }

    const bookSegment = parsed.parts[0]
    const tree = bookSegment ? bookTrees.get(bookSegment) : undefined
    if (!tree || parsed.slug === `${bookSegment}/index`) continue
    insertBookFile(
      tree,
      bookSegment!,
      parsed.parts.slice(1),
      parsed.slug,
      file,
      kind,
      folderDestinations,
    )
  }

  rootNotes.sort(compareNodes)
  const sortedRootNotes =
    sortWithNavigationService(
      "/",
      rootNotes.map((node) => ({ value: node, path: node.slug, isFolder: false })),
      allFiles,
    ) ?? rootNotes
  const frozenBooks: SidebarBook[] = []
  for (const book of books) {
    const slug = `${book.segment}/index`
    if (!isFullSlug(slug)) continue
    frozenBooks.push(
      Object.freeze({
        segment: book.segment,
        slug,
        title: book.title,
        panel: book.panel,
        children: freezeNodes(bookTrees.get(book.segment) ?? new Map(), book.segment, allFiles),
      }),
    )
  }
  const sortedBooks =
    sortWithNavigationService(
      "/",
      frozenBooks.map((book) => ({ value: book, path: book.segment, isFolder: true })),
      allFiles,
    ) ?? frozenBooks

  return Object.freeze({
    books: Object.freeze(sortedBooks),
    ...(rootTitle ? { rootTitle } : {}),
    rootNotes: Object.freeze(sortedRootNotes),
  })
}

/** Cache the immutable model by `allFiles` identity and normalized scope options. */
export function getSidebarNavigationModel(
  allFiles: unknown,
  options: SidebarNavigationOptions | unknown = undefined,
): SidebarNavigationModel {
  try {
    if (!Array.isArray(allFiles)) return emptyModel
  } catch {
    return emptyModel
  }

  const inventoryOptions = normalizeInventoryOptions(options)
  const key = JSON.stringify(inventoryOptions)
  const sortingIdentity = getNavigationSortingService() ?? noSortingService
  let sortingVariants = modelCache.get(allFiles)
  if (!sortingVariants) {
    sortingVariants = new Map()
    modelCache.set(allFiles, sortingVariants)
  }
  let variants = sortingVariants.get(sortingIdentity)
  if (!variants) {
    variants = new Map()
    sortingVariants.set(sortingIdentity, variants)
  }
  const cached = variants.get(key)
  if (cached) return cached

  const model = buildSidebarNavigationModel(allFiles, inventoryOptions)
  variants.set(key, model)
  return model
}

function comparisonSlug(value: unknown): string | undefined {
  const parsed = parseCanonicalSlug(value)
  return parsed ? simplifySlug(parsed.slug).split("/").filter(Boolean).join("/") : undefined
}

export function getSidebarLinkState(target: unknown, current: unknown): SidebarLinkState {
  const targetSlug = comparisonSlug(target)
  const currentSlug = comparisonSlug(current)
  if (targetSlug === undefined || currentSlug === undefined) return undefined
  if (targetSlug === currentSlug) return "current"
  if (targetSlug.length > 0 && currentSlug.startsWith(`${targetSlug}/`)) return "ancestor"
  return undefined
}

/** Select root notes, one book hierarchy, or no scoped tree for the current route. */
export function selectSidebarNavigationScope(
  model: SidebarNavigationModel,
  currentSlug: unknown,
): SidebarNavigationScope {
  const parsed = parseCanonicalSlug(currentSlug)
  if (!parsed) {
    return { kind: "none", children: emptyChildren }
  }

  const parts = parsed.parts
  if (parts.length === 1) return { kind: "root", children: model.rootNotes }

  const segment = parts[0]
  const book = model.books.find((candidate) => candidate.segment === segment)
  return book
    ? { kind: "book", book, children: book.children }
    : { kind: "root", children: model.rootNotes }
}
