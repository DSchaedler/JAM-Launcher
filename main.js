//JAM Launcher
//Here we go!

// Finish Packaging:
// https://youtu.be/kN1Czs0m1SU?t=2930

// Create Electron and file objects
const electron = require('electron')
const url = require('url');
const path = require('path');
const Store = require('electron-store')
const {download} = require('electron-dl')

// Pull Required structures from electron
const {app, BrowserWindow, Menu, ipcMain} = electron;
const store = new Store();

// Define View Constants
let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){

  // Create Main Application Window
  mainWindow = new BrowserWindow({
    webPreferences: { // SEC RISK: this and below line may open to csx attacks
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
  })); // Load index.html

  // Quit app when main window closed
  mainWindow.on('closed',function(){
    app.quit();
  });

  // Build Menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu); // insert Menu

  const fs = require('fs')

  fs.access("./cmpdl-1.2.jar", fs.F_OK, (err) => {
    if (err) {
      console.log(err)
      download(mainWindow, "https://github.com/Vazkii/CMPDL/releases/download/1.2/cmpdl-1.2.jar", {directory:"./"});
      return
    }
    return
  })
});

// Handle Create Add Window
function createAddWindow(){
  // Create new item Window
  addWindow = new BrowserWindow({
    width: 400,
    height: 400,
    title:'Add Item',
    webPreferences: {
      nodeIntegration: true, // SEC RISK: this line may open to csx attacks
      autoHideMenuBar: true
    }
  });
  addWindow.loadURL(url.format({  // Load addwindow.html
    pathname: path.join(__dirname, 'addwindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  //Garbage Collection - free window assignment once closed
  addWindow.on('close', function(){
    addWindow = null;
  });
}
// Handle Create Confirm Clear Window
function createConfirmClearWindow(){
  //Create Window to confirm Clearing Items
  confirmClearWindow = new BrowserWindow({
    width: 400,
    height: 100,
    title: "Confirm: Clear all Profiles?",
    webPreferences: {
      nodeIntegration: true,
      autoHideMenuBar: true
    }
  });
  confirmClearWindow.loadURL(url.format({ // Load confirmClearWindow.html
    pathname: path.join(__dirname, 'confirmClearWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Garbage Collection - free window once closed
  confirmClearWindow.on('close', function(){
    confirmClearWindow = null;
  });
}

// Catch Item Add from addwindow.html
ipcMain.on('item:newItem', function(e, profileID, itemText){
  storeLocation = "list." + profileID + ".text"
  store.set(storeLocation, itemText);
  loadCards();
  addWindow.close(); // close new item window
});

// Catch Clear Items from confirmClearWindow.html
ipcMain.on('clearItems:confirm', function(e){
  store.clear()
  loadCards();
  confirmClearWindow.close();
})

ipcMain.on('loadCards', function(e){
  loadCards();
})

ipcMain.on('invokeAddItem', function(e){
  createAddWindow();
})

ipcMain.on('invokeRemoveItem', function(e, profileID){
  storeLocation = "list." + profileID
  store.delete(storeLocation);
  loadCards();
})

function loadCards(){
  //Load Stored items from Memory
  mainWindow.webContents.send('item:clear');
  if (store.size > 0) {
    cardList = store.get('list');
    var x;
    for (x in cardList) {
      itemText = store.get('list.' + x + '.text')
      mainWindow.webContents.send('item:add', x, itemText);
    }
  }
}

// Create Menu Template
// accelerators are MacOS compatible
const mainMenuTemplate = [
  {
    label:'File',
    submenu:[
      {
        label: 'Add Item',
        accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
        click(){
          createAddWindow();
        }
      },
      {
        label: 'Load Data',
        click(){
          loadCards();
        }
      },
      {
        label: 'Clear Data',
        click(){
          createConfirmClearWindow();
        }
      },
      {
        label:'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q': 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

//if MACOS add empty object to menu
//allows file to be the first option, without sacrificing on other platforms
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

//add dev tools if not production
if(process.env.NODE_ENV !== "production"){
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu:[
      {
        label: "Toggle DevTools",
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: "reload" //Ctrl+R
      }
      ]
  });
}
