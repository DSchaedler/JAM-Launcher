const { remote } = require('electron');
const { ipcRenderer } = remote;

let currWindow = remote.BrowserWindow.getFocusedWindow();

window.closeCurrentWindow = function(){
  currWindow.close();
}