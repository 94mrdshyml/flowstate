// One-off asset generation: rasterizes the 3 tray-icon states from the approved
// design brief (idle ring / running partial-arc ring / paused ring+bars, on the
// brief's dark chip) into PNGs under resources/tray/. Re-run via
// `bun run generate-tray-icons` if the brief's tray icon art ever changes.
import { app, BrowserWindow } from 'electron'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'resources', 'tray')

const SIZE = 64
const CHIP_BG = '#2d2b2b'
const RING = '#f8f4f4'
const RING_DIM = 'rgba(248,244,244,0.3)'
const ACCENT = '#ff9783'

const STATES = ['idle', 'running', 'paused']

function svgFor(state) {
  const inner =
    state === 'idle'
      ? `<circle cx="12" cy="12" r="8" stroke="${RING}" stroke-width="2" fill="none"/>`
      : state === 'running'
        ? `<g transform="rotate(-90 12 12)">
             <circle cx="12" cy="12" r="8" stroke="${RING_DIM}" stroke-width="2" fill="none"/>
             <circle cx="12" cy="12" r="8" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="50.2" stroke-dashoffset="20"/>
           </g>`
        : `<circle cx="12" cy="12" r="8" stroke="${RING}" stroke-width="2" fill="none"/>
           <path d="M10 9v6M14 9v6" stroke="${RING}" stroke-width="2" stroke-linecap="round"/>`

  return `<!doctype html><html><head><style>
    html, body { margin: 0; padding: 0; }
    .chip { width: ${SIZE}px; height: ${SIZE}px; background: ${CHIP_BG}; display: flex; align-items: center; justify-content: center; }
    svg { width: 28px; height: 28px; }
  </style></head><body>
    <div class="chip"><svg viewBox="0 0 24 24">${inner}</svg></div>
  </body></html>`
}

async function main() {
  await app.whenReady()
  await mkdir(outDir, { recursive: true })

  const win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    show: false,
    webPreferences: { offscreen: true }
  })

  for (const state of STATES) {
    const paintPromise = new Promise((resolve) => {
      win.webContents.once('paint', (_event, _dirty, image) => resolve(image))
    })
    await win.loadURL(`data:text/html,${encodeURIComponent(svgFor(state))}`)
    const image = await paintPromise
    await writeFile(path.join(outDir, `tray-${state}.png`), image.toPNG())
    console.log(`wrote resources/tray/tray-${state}.png`)
  }

  win.destroy()
  app.quit()
}

main()
