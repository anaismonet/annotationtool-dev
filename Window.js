const {BrowserWindow} = require('electron')


// default window settings
const defaultProps = {
    width: 700,
    height: 800,
    show: false,
    
    // update for electron V5+
    webPreferences: {
      nodeIntegration: true
    }
  }
  
  class Window extends BrowserWindow {
    constructor ({ file, ...windowSettings }) {
      // calls new BrowserWindow with these props
      super({ ...defaultProps, ...windowSettings })
  
      // load the html and open devtools
      this.loadFile(file)
      // this.webContents.openDevTools()
  
      // gracefully show when ready to prevent flickering
      this.once('ready-to-show', () => {
        this.show()
      })
    }
  }
  
  module.exports = Window


/*
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
   
}
*/