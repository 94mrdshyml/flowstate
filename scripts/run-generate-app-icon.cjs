// Same ELECTRON_RUN_AS_NODE fix as run-electron-vite.cjs — see that file's comment.
delete process.env.ELECTRON_RUN_AS_NODE

const { spawn } = require('child_process')

const child = spawn('electron scripts/generate-app-icon.mjs', {
  stdio: 'inherit',
  shell: true,
  env: process.env
})

child.on('exit', (code) => process.exit(code ?? 0))
