// VS Code's integrated terminal sets ELECTRON_RUN_AS_NODE=1 in its env, which is
// inherited by child processes. Electron's native bootstrap checks for the mere
// presence of that var (not its value) to decide whether to run as plain Node
// instead of booting the real Electron runtime — so `electron.app` ends up
// undefined. Deleting the key (not just blanking it) before spawning is the only
// way to actually unset it for the child process tree.
delete process.env.ELECTRON_RUN_AS_NODE

const { spawn } = require('child_process')

const subcommand = process.argv[2]
const child = spawn(`electron-vite ${subcommand}`, {
  stdio: 'inherit',
  shell: true,
  env: process.env
})

child.on('exit', (code) => process.exit(code ?? 0))
