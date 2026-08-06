// One-off asset generation: rasterizes the app icon (dark rounded-square chip +
// blocky "F" monogram, built from plain rects so it's font-independent) into
// build/icon.png and resources/icon.png. Re-run via `bun run generate-app-icon`
// if the brand mark ever changes. Mirrors scripts/generate-tray-icons.mjs.
import { app, BrowserWindow } from 'electron'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_PATHS = [
  path.join(__dirname, '..', 'build', 'icon.png'),
  path.join(__dirname, '..', 'resources', 'icon.png')
]

const SIZE = 1024
const CHIP_BG = '#201e1d'
const MONOGRAM = '#ec3013'
const STROKE = 3.4

const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="22" height="22" rx="5.5" fill="${CHIP_BG}"/>
  <rect x="7" y="5" width="${STROKE}" height="14" fill="${MONOGRAM}"/>
  <rect x="7" y="5" width="10" height="${STROKE}" fill="${MONOGRAM}"/>
  <rect x="7" y="10.5" width="7.5" height="${STROKE}" fill="${MONOGRAM}"/>
</svg>`

const html = `<!doctype html><html><head><style>
  html, body { margin: 0; padding: 0; background: transparent; }
  svg { width: ${SIZE}px; height: ${SIZE}px; display: block; }
</style></head><body>${svg}</body></html>`

async function main() {
  await app.whenReady()

  const win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    show: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: { offscreen: true }
  })

  const paintPromise = new Promise((resolve) => {
    win.webContents.once('paint', (_event, _dirty, image) => resolve(image))
  })
  await win.loadURL(`data:text/html,${encodeURIComponent(html)}`)
  const image = await paintPromise

  for (const outPath of OUT_PATHS) {
    await writeFile(outPath, image.toPNG())
    console.log(`wrote ${path.relative(path.join(__dirname, '..'), outPath)}`)
  }

  win.destroy()
  app.quit()
}

main()
