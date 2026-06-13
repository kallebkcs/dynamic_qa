const { app, BrowserWindow } = require('electron');
const path = require('path')

process.env.DB_PATH = path.join(app.getPath('userData'), 'database.sqlite');;
require('./src/index.js'); 

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL('http://localhost:3000'); 
  mainWindow.setMenu(null);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});