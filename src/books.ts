import type { QuartzPluginData } from "@quartz-community/types"

import { panelValues } from "./panel"
import { parseCanonicalSlug } from "./slug"

type PluginFile = QuartzPluginData & Record<string, unknown>

export interface BookInventoryOptions {
  descriptionFallback: string
  sort: "alphabetical" | "docCount" | "date"
  tagCount: number
}

export interface BookEntry {
  segment: string
  title: string
  description: string
  docCount: number
  tags: string[]
  date: number
  panel: unknown
}

interface BookAccumulator {
  segment: string
  docCount: number
  date: number
  metadata?: PluginFile
}

const maximumDateTimestamp = 8_640_000_000_000_000

function isRecord(value: unknown): value is Record<string, unknown> {
  try {
    return typeof value === "object" && value !== null && !Array.isArray(value)
  } catch {
    return false
  }
}

function ownValue(record: Record<string, unknown>, key: string): unknown {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key)
    return descriptor && "value" in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

function isPhysical(file: PluginFile): boolean {
  const filePath = ownValue(file, "filePath")
  return typeof filePath === "string" && filePath.length > 0
}

function hasOwnDataProperty(value: unknown, key: string): boolean {
  try {
    if (!isRecord(value)) return false
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor !== undefined && "value" in descriptor
  } catch {
    return false
  }
}

function safeStringArray(value: unknown, limit: number): string[] {
  try {
    if (!Array.isArray(value)) return []
    const values: string[] = []
    const length = Math.min(value.length, limit)
    for (let index = 0; index < length; index += 1) {
      let item: unknown
      try {
        item = value[index]
      } catch {
        continue
      }
      if (typeof item === "string") values.push(item)
    }
    return values
  } catch {
    return []
  }
}

function isSupportedDateTimestamp(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value) <= maximumDateTimestamp
}

function toTimestamp(value: unknown): number | undefined {
  try {
    if (value instanceof Date) {
      const timestamp = Date.prototype.getTime.call(value)
      return isSupportedDateTimestamp(timestamp) ? timestamp : undefined
    }
  } catch {
    return undefined
  }
  if (typeof value === "number" && isSupportedDateTimestamp(value)) return value
  if (typeof value === "string") {
    const parsed = Date.parse(value)
    return isSupportedDateTimestamp(parsed) ? parsed : undefined
  }
  return undefined
}

function getFileTimestamp(file: PluginFile): number {
  const rawFrontmatter = ownValue(file, "frontmatter")
  const rawDates = ownValue(file, "dates")
  const frontmatter: Record<string, unknown> = isRecord(rawFrontmatter) ? rawFrontmatter : {}
  const dates: Record<string, unknown> = isRecord(rawDates) ? rawDates : {}
  const candidates = [
    ownValue(dates, "modified"),
    ownValue(dates, "created"),
    ownValue(dates, "published"),
    ownValue(file, "modified"),
    ownValue(file, "updated"),
    ownValue(file, "created"),
    ownValue(file, "date"),
    ownValue(frontmatter, "modified"),
    ownValue(frontmatter, "updated"),
    ownValue(frontmatter, "created"),
    ownValue(frontmatter, "published"),
    ownValue(frontmatter, "date"),
  ]

  for (const candidate of candidates) {
    const timestamp = toTimestamp(candidate)
    if (timestamp !== undefined) return timestamp
  }
  return Number.NEGATIVE_INFINITY
}

function humanizeSegment(segment: string): string {
  const text = segment.replace(/-/g, " ")
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1)
}

function compareTitle(a: BookEntry, b: BookEntry): number {
  const leftTitle = a.title.toLowerCase()
  const rightTitle = b.title.toLowerCase()
  if (leftTitle < rightTitle) return -1
  if (leftTitle > rightTitle) return 1
  if (a.title < b.title) return -1
  if (a.title > b.title) return 1
  return a.segment < b.segment ? -1 : a.segment > b.segment ? 1 : 0
}

/**
 * Aggregate the physical book inventory in one pass over `allFiles`.
 * Virtual entries are consulted only as proof that a landing destination exists.
 */
export function collectBooks(allFiles: PluginFile[], options: BookInventoryOptions): BookEntry[] {
  const destinations = new Set<string>()
  const physicalSlugs = new Set<string>()
  const books = new Map<string, BookAccumulator>()

  for (const file of allFiles) {
    const parsed = parseCanonicalSlug(ownValue(file, "slug"))
    if (!parsed) continue
    const { slug, parts } = parsed
    if (parts.length < 2) continue

    const segment = parts[0]
    if (!segment || segment === "tags") continue

    const physical = isPhysical(file)
    const listed = ownValue(file, "unlisted") !== true
    const isBookIndex = parts.length === 2 && parts[1] === "index"
    const syntheticIndex =
      !physical && (hasOwnDataProperty(file, "canvasData") || hasOwnDataProperty(file, "basesData"))

    if (isBookIndex && listed && !syntheticIndex) {
      // A listed physical index is explicit. A listed virtual index is the generated route.
      destinations.add(segment)
    }

    if (!physical || !listed || physicalSlugs.has(slug)) continue
    physicalSlugs.add(slug)

    let book = books.get(segment)
    if (!book) {
      book = { segment, docCount: 0, date: Number.NEGATIVE_INFINITY }
      books.set(segment, book)
    }

    if (slug !== `${segment}/index`) book.docCount += 1
    book.date = Math.max(book.date, getFileTimestamp(file))
    if (isBookIndex && !book.metadata) book.metadata = file
  }

  const entries: BookEntry[] = []
  for (const book of books.values()) {
    if (!destinations.has(book.segment)) continue

    const rawFrontmatter = book.metadata ? ownValue(book.metadata, "frontmatter") : undefined
    const frontmatter = isRecord(rawFrontmatter) ? rawFrontmatter : {}
    const rawTitle = ownValue(frontmatter, "title")
    const rawDescription = ownValue(frontmatter, "description")
    const rawTags = ownValue(frontmatter, "tags")

    entries.push({
      segment: book.segment,
      title: typeof rawTitle === "string" ? rawTitle : humanizeSegment(book.segment),
      description:
        typeof rawDescription === "string" ? rawDescription : options.descriptionFallback,
      docCount: book.docCount,
      tags: safeStringArray(rawTags, options.tagCount),
      date: book.date,
      panel: panelValues(ownValue(frontmatter, "panel")),
    })
  }

  if (options.sort === "docCount") {
    entries.sort((a, b) => b.docCount - a.docCount || compareTitle(a, b))
  } else if (options.sort === "date") {
    entries.sort((a, b) => b.date - a.date || compareTitle(a, b))
  } else {
    entries.sort(compareTitle)
  }

  return entries
}
