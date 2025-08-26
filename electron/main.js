const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let pythonProcess;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false
    },
    icon: path.join(__dirname, '../public/next.svg'),
    show: false
  });

  // Start Python backend server
  startPythonServer();

  // Wait for server to start, then load the app
  setTimeout(() => {
    // In development, load from Next.js dev server
    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:8000');
      mainWindow.webContents.openDevTools();
    } else {
      // In production, load from built files
      mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
    }
    
    mainWindow.show();
  }, 3000);

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startPythonServer() {
  const pythonScript = path.join(__dirname, '../backend/api_server.py');
  
  console.log('Starting Python server...');
  
  // Check if Python script exists
  if (!fs.existsSync(pythonScript)) {
    console.error('Python script not found:', pythonScript);
    return;
  }

  // Start Python process
  pythonProcess = spawn('python', [pythonScript], {
    cwd: path.join(__dirname, '../backend'),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });

  pythonProcess.on('error', (error) => {
    console.error('Failed to start Python process:', error);
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // Kill Python process
  if (pythonProcess) {
    pythonProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill Python process
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
