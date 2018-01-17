const electron = require('electron')
console.log(require.resolve('electron'))
const app = electron.app
const path = require('path');
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

global.port = 5666;

app.on('ready', function() {
  app.server = require(path.join(__dirname, '/sheet/web.js'))();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    useContentSize: true,
    resizable: true,
  });
  mainWindow.loadURL('http://localhost:' + global.port);
  mainWindow.focus();

});