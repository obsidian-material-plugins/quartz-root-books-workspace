import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execFileSync } from "node:child_process"

const packageRoot = process.cwd()
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "quartz-root-books-workspace-pack-"))
const resolvedTemporaryParent = fs.realpathSync(os.tmpdir())

function junction(target, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  try {
    fs.symlinkSync(target, destination, process.platform === "win32" ? "junction" : "dir")
  } catch (error) {
    if (error.code !== "EPERM") throw error
    fs.cpSync(target, destination, { recursive: true })
  }
}

try {
  const npmCli = process.env.npm_execpath
  if (!npmCli) throw new Error("npm_execpath is unavailable; run this check through npm")

  const packOutput = execFileSync(
    process.execPath,
    [npmCli, "pack", "--json", "--pack-destination", temporaryRoot],
    { cwd: packageRoot, encoding: "utf8" },
  )
  const [packResult] = JSON.parse(packOutput)
  if (!packResult?.filename || !Array.isArray(packResult.files)) {
    throw new Error("npm pack did not return the expected file manifest")
  }

  const packedPaths = new Set(packResult.files.map((file) => file.path))
  for (const required of [
    "dist/index.js",
    "dist/index.d.ts",
    "dist/types.js",
    "dist/types.d.ts",
    "dist/components/index.js",
    "dist/components/index.d.ts",
    "scripts/stage-book-structure.mjs",
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
    "README.md",
    "CHANGELOG.md",
    "package.json",
  ]) {
    if (!packedPaths.has(required)) throw new Error(`packed artifact is missing ${required}`)
  }

  const extractionRoot = path.join(temporaryRoot, "extract")
  fs.mkdirSync(extractionRoot)
  execFileSync("tar", ["-xf", packResult.filename, "-C", "extract"], {
    cwd: temporaryRoot,
    stdio: "inherit",
  })

  const modulesRoot = path.join(temporaryRoot, "node_modules")
  const installedPackage = path.join(
    modulesRoot,
    "@obsidian-material-plugins",
    "quartz-root-books-workspace",
  )
  fs.mkdirSync(path.dirname(installedPackage), { recursive: true })
  fs.renameSync(path.join(extractionRoot, "package"), installedPackage)

  const packedPackageJson = JSON.parse(
    fs.readFileSync(path.join(installedPackage, "package.json"), "utf8"),
  )
  if (packedPackageJson.name !== "@obsidian-material-plugins/quartz-root-books-workspace") {
    throw new Error(
      "packed package name must equal @obsidian-material-plugins/quartz-root-books-workspace",
    )
  }
  const expectedPluginDependencies = ["@quartz-community/folder-page"]
  if (
    JSON.stringify(packedPackageJson.quartz?.dependencies) !==
    JSON.stringify(expectedPluginDependencies)
  ) {
    throw new Error(
      `packed manifest dependencies must equal ${JSON.stringify(expectedPluginDependencies)}`,
    )
  }

  junction(path.join(packageRoot, "node_modules", "preact"), path.join(modulesRoot, "preact"))
  junction(
    path.join(packageRoot, "node_modules", "@quartz-community", "types"),
    path.join(modulesRoot, "@quartz-community", "types"),
  )

  const runtimeConsumer = path.join(temporaryRoot, "consumer.mjs")
  fs.writeFileSync(
    runtimeConsumer,
    `
      const root = await import("@obsidian-material-plugins/quartz-root-books-workspace")
      const components = await import("@obsidian-material-plugins/quartz-root-books-workspace/components")
      await import("@obsidian-material-plugins/quartz-root-books-workspace/types")
      const staging = await import("@obsidian-material-plugins/quartz-root-books-workspace/staging")
      if (typeof staging.stageBookStructure !== "function") throw new Error("missing staging adapter")
      if (typeof root.RootIndexPanels !== "function") throw new Error("missing root component")
      if (typeof root.RootIndexPanelsPage !== "function") throw new Error("missing Page Type")
      if (typeof root.RootIndexSidebar !== "function") throw new Error("missing root sidebar")
      if (typeof components.RootIndexPanels !== "function") throw new Error("missing component entry")
      if (typeof components.RootIndexSidebar !== "function") {
        throw new Error("missing component sidebar entry")
      }
      if (typeof root.RootIndexPanels().afterDOMLoaded !== "string") {
        throw new Error("built panel inline script is unavailable")
      }
      const sidebar = root.RootIndexSidebar()
      if (typeof sidebar.css !== "string" || !sidebar.css.includes(".rip-sidebar")) {
        throw new Error("built sidebar stylesheet is unavailable")
      }
      if (typeof sidebar.afterDOMLoaded !== "string") {
        throw new Error("built sidebar inline script is unavailable")
      }
    `,
  )
  execFileSync(process.execPath, [runtimeConsumer], { cwd: temporaryRoot, stdio: "inherit" })

  const typeConsumer = path.join(temporaryRoot, "consumer.ts")
  fs.writeFileSync(
    typeConsumer,
    `
      import type {
        PanelIconComponent,
        RootIndexPanelsOptions,
        RootIndexPanelsPageOptions,
        RootIndexSidebarOptions,
      } from "@obsidian-material-plugins/quartz-root-books-workspace"
      import type {
        PanelIconComponent as ComponentIcon,
        RootIndexPanelsOptions as ComponentOptions,
        RootIndexSidebarOptions as ComponentSidebarOptions,
      } from "@obsidian-material-plugins/quartz-root-books-workspace/components"
      import type {
        PanelIconComponent as TypesIcon,
        RootIndexPanelsOptions as TypesOptions,
        RootIndexSidebarOptions as TypesSidebarOptions,
      } from "@obsidian-material-plugins/quartz-root-books-workspace/types"

      declare const icon: PanelIconComponent
      const options = {
        defaultIcon: "lucide:book-open",
        defaultAccent: "#123456",
      } satisfies RootIndexPanelsOptions
      const pageOptions: RootIndexPanelsPageOptions = options
      const sidebarOptions: RootIndexSidebarOptions = options
      const componentOptions: ComponentOptions = options
      const componentSidebarOptions: ComponentSidebarOptions = options
      const typesOptions: TypesOptions = options
      const typesSidebarOptions: TypesSidebarOptions = options
      const componentIcon: ComponentIcon = icon
      const typesIcon: TypesIcon = icon
      void [
        pageOptions,
        sidebarOptions,
        componentOptions,
        componentSidebarOptions,
        typesOptions,
        typesSidebarOptions,
        componentIcon,
        typesIcon,
      ]
    `,
  )
  const typeConfig = path.join(temporaryRoot, "tsconfig.json")
  fs.writeFileSync(
    typeConfig,
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        files: ["consumer.ts"],
      },
      null,
      2,
    ),
  )
  execFileSync(
    process.execPath,
    [path.join(packageRoot, "node_modules", "typescript", "bin", "tsc"), "-p", typeConfig],
    { cwd: temporaryRoot, stdio: "inherit" },
  )

  console.log("packed package runtime, exports, declarations, and allowlist verified")
} finally {
  const resolvedTarget = path.resolve(temporaryRoot)
  const allowedPrefix = `${resolvedTemporaryParent}${path.sep}`
  if (!resolvedTarget.startsWith(allowedPrefix) || path.basename(resolvedTarget).length < 20) {
    throw new Error(`refusing to remove unexpected temporary path: ${resolvedTarget}`)
  }
  fs.rmSync(resolvedTarget, { recursive: true, force: true })
}
