/** Read the v2 literal scalar and the v1 mapping during migration. */
export function panelValues(value: unknown): { icon: unknown; accent: unknown } | undefined {
  if (typeof value === "string") {
    const lines = value.replace(/\n$/, "").split("\n")
    if (lines.length !== 2) return undefined
    const parsed: Record<string, string> = {}
    for (const line of lines) {
      const match = /^(icon|accent): (.+)$/.exec(line)
      const key = match?.[1]
      const content = match?.[2]
      if (!key || !content || Object.hasOwn(parsed, key)) return undefined
      parsed[key] = content
    }
    const accent = parsed.accent
    if (!parsed.icon || !accent) return undefined
    const quoted = /^(["'])(#[0-9a-fA-F]{6})\1$/.exec(accent)
    return { icon: parsed.icon, accent: quoted ? quoted[2] : accent }
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined
  try {
    const icon = Object.getOwnPropertyDescriptor(value, "icon")
    const accent = Object.getOwnPropertyDescriptor(value, "accent")
    return {
      icon: icon && "value" in icon ? icon.value : undefined,
      accent: accent && "value" in accent ? accent.value : undefined,
    }
  } catch {
    return undefined
  }
}
