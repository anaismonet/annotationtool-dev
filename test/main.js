//const {electron, app, BrowserWindow, Menu} = require('electron');
//const app = electron.app;
//const BrowserWindow = electron.BrowserWindow;
//const Menu = require('electron').remote.Menu;
/*
let mainWindow;

function createWindow () {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    icon : './gotshoes.png',
    title: 'mon application',
    maximized : false,
    center : true,
    movable : true,
    titleBarStyle : 'hidden'
  }); // on définit une taille pour notre fenêtre

  mainWindow.setProgressBar(2);
  mainWindow.loadURL(`file://${__dirname}/index.html`); // on doit charger un chemin absolu

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

}


  
  //document.getElementById('menu').addEventListener('contextmenu', (event) => {
    //event.preventDefault();
    const template = [
        {
            label: 'Ajouter aux favoris',
            click: () => {
                // TODO : ajouter aux favoris
                alert('Article bien ajouté aux favoris');
            }
        },
        {
            label: 'Partager',
            submenu: [
                {
                    label: 'Diaspora*',
                    icon: './gotshoes.png',
                    click: () => {
                        
                    }
                },
                {
                    label: 'GNU Social',
                    icon: './gotshoes.png',
                    click: () => {
                      
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup();

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
  */

  //BUILDING MENU
const {app, BrowserWindow, Menu, MenuItem} = require('electron')
const url = require('url')
const path = require('path')

/* External website */

//const {shell} = require('electron')

/*
const exLinksBtn = document.getElementById('open-ex-links')

exLinksBtn.addEventListener('click', (event) => {
  shell.openExternal('http://electron.atom.io')
})

/* Desktop App */
let win

function createWindow() {
   win = new BrowserWindow({width: 800, height: 600})
   win.loadURL(url.format ({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
   }))

   win.on('resize', updateReply)
   win.on('move', updateReply)
   win.on('close', () => { win = null })


   function updateReply () {
      const manageWindowReply = document.getElementById('manage-window-reply')
      const message = `Size: ${win.getSize()} Position: ${win.getPosition()}`
      manageWindowReply.innerText = message
    }
}

const template = [
   {
      label: 'Edit',
      submenu: [
         {
            role: 'undo'
         },
         {
            role: 'redo'
         },
         {
            type: 'separator'
         },
         {
            role: 'cut'
         },
         {
            role: 'copy'
         },
         {
            role: 'paste'
         }
      ]
   },
   
   {
      label: 'View',
      submenu: [
         {
            role: 'reload'
         },
         {
            role: 'toggledevtools'
         },
         {
            type: 'separator'
         },
         {
            role: 'resetzoom'
         },
         {
            role: 'zoomin'
         },
         {
            role: 'zoomout'
         },
         {
            type: 'separator'
         },
         {
            role: 'togglefullscreen'
         }
      ]
   },
   
   {
      role: 'window',
      submenu: [
         {
            role: 'minimize'
         },
         {
            role: 'close'
         }
      ]
   },
   
   {
      role: 'help',
      submenu: [
         {
            label: 'Learn More'
         }
      ]
   }
]

//win.excludedFromShownWindowsMenu = false

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
app.on('ready', createWindow)
