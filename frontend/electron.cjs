const { app, BrowserWindow, shell, dialog } = require('electron')
const { spawn, execSync } = require('child_process')
const path = require('path')
const http = require('http')

let mainWindow
let backendProcess
let backendReady = false

const BACKEND_PORT = 8899
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`

// ── Find Python in dev mode ──────────────────────────────────────────────────

function findPython() {
  for (const cmd of ['python', 'python3', 'py']) {
    try {
      const ver = execSync(`${cmd} --version`, { encoding: 'utf8', timeout: 5000 }).trim()
      if (ver.includes('Python 3')) return cmd
    } catch {}
  }
  return 'python'
}

// ── Start backend ────────────────────────────────────────────────────────────

function startBackend() {
  const isPackaged = app.isPackaged

  if (isPackaged) {
    const backendDir = path.join(process.resourcesPath, 'backend')
    const exe = path.join(backendDir, 'server.exe')
    console.log('[main] starting packaged backend:', exe)
    backendProcess = spawn(exe, [], {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
  } else {
    const backendDir = path.join(__dirname, '..', 'backend')
    const pythonCmd = findPython()
    console.log('[main] starting dev backend:', pythonCmd, 'server.py in', backendDir)
    backendProcess = spawn(pythonCmd, ['server.py'], {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    })
  }

  if (backendProcess.stdout) {
    backendProcess.stdout.on('data', (d) => console.log('[backend]', d.toString().trim()))
  }
  if (backendProcess.stderr) {
    backendProcess.stderr.on('data', (d) => console.error('[backend]', d.toString().trim()))
  }

  backendProcess.on('error', (err) => {
    console.error('[main] backend failed to start:', err.message)
  })

  backendProcess.on('exit', (code) => {
    console.log('[main] backend exited with code', code)
    backendProcess = null
    if (!app.isQuitting && mainWindow && !mainWindow.isDestroyed()) {
      dialog.showErrorBox(
        'Backend Stopped',
        `The backend process exited unexpectedly (code ${code}).\nThe app may not work correctly.`
      )
    }
  })
}

// ── Wait for backend to be ready ─────────────────────────────────────────────

function waitForBackend(timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    function check() {
      if (Date.now() - start > timeout) {
        return reject(new Error('Backend did not start within timeout'))
      }
      const req = http.get(`${BACKEND_URL}/api/system`, (res) => {
        if (res.statusCode === 200) {
          backendReady = true
          resolve()
        } else {
          setTimeout(check, 500)
        }
      })
      req.on('error', () => setTimeout(check, 500))
      req.setTimeout(2000, () => { req.destroy(); setTimeout(check, 500) })
    }
    check()
  })
}

// ── Create window ────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'public', 'icon.png'),
    backgroundColor: '#020617',
    show: false,
  })

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  } else {
    mainWindow.loadURL('http://localhost:5173')
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// ── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  if (process.env.NO_BACKEND !== 'true') {
    startBackend()
  }
  try {
    await waitForBackend()
    console.log('[main] backend is ready')
  } catch (err) {
    console.error('[main]', err.message)
  }
  createWindow()
})

app.on('before-quit', () => { app.isQuitting = true })

app.on('window-all-closed', () => {
  if (backendProcess) {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${backendProcess.pid} /T /F`, { stdio: 'ignore' })
      } else {
        backendProcess.kill('SIGTERM')
      }
    } catch {}
  }
  app.quit()
})
