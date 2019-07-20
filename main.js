//JAM Launcher
//Here we go!

// Finish Packaging:
// https://youtu.be/kN1Czs0m1SU?t=2930

// Create Electron and file objects
const electron = require('electron')
const url = require('url');
const path = require('path');
const Store = require('electron-store')

// Pull Required structures from electron
const {app, BrowserWindow, Menu, ipcMain} = electron;
const store = new Store();

// Define View Constants
let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){

  // create new
  mainWindow = new BrowserWindow({
    webPreferences: { // SEC RISK: this and below line may open to csx attacks
      nodeIntegration: true
    }
  });

  //load html
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
  }));

  console.log(store.get('list'));

  // Quit app when main window closed
  mainWindow.on('closed',function(){
    app.quit();
  });

  // build menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // insert Menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle CreateAdd Window
function createAddWindow(){
  // Create new item Window

  addWindow = new BrowserWindow({
    width: 600,
    height: 400,
    title:'Add Item',
    webPreferences: {
      nodeIntegration: true, // SEC RISK: this line may open to csx attacks
      autoHideMenuBar: true
    }
  });

  // Load html into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addwindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  //Garbage Collection - free window assignment once closed
  addWindow.on('close', function(){
    addWindow = null;
  });
}

// Catch Item Add from addwindow.html
ipcMain.on('item:newItem', function(e, profileID, itemText){
  console.log(profileID, itemText); // REMOVE
  storeLocation = "list." + profileID + ".text"
  console.log(storeLocation)
  store.set(storeLocation, itemText);
  console.log(store.get(storeLocation));
  mainWindow.webContents.send('item:add', itemText); // Send to index.html
  addWindow.close(); // close new item window
});

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
        label: 'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear')
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
