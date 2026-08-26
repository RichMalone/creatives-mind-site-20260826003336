const { app, BrowserWindow } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

function startAppServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const requestedPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
      const filePath = path.join(__dirname, requestedPath);

      if (!filePath.startsWith(__dirname)) {
        response.writeHead(404);
        response.end();
        return;
      }

      fs.createReadStream(filePath)
        .on('error', () => {
          response.writeHead(404);
          response.end();
        })
        .pipe(response);
    });

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function createWindow() {
  const appServer = await startAppServer();
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#0b0d10',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.loadURL(`http://127.0.0.1:${appServer.port}/`);
  window.on('closed', () => appServer.server.close());
}

app.whenReady().then(() => {
  createWindow().catch((error) => console.error('Could not start Creative\'s Mind:', error));
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow().catch((error) => console.error('Could not restart Creative\'s Mind:', error));
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
