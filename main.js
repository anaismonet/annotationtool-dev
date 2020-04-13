const path = require('path')
const { app, ipcMain} = require('electron')

const Window = require('./Window')

require('electron-reload')(__dirname)

function main () {

    let mainWindow = new Window({
      file: path.join(__dirname,'index.html')
    })

    let InputTextWin 

    // create InputText window
    ipcMain.on('InputText-window', () => {
    // if InputTextWin does not already exist
    if (!InputTextWin) {
      // create a new add todo window
      InputTextWin = new Window({
        file: path.join(__dirname, 'ann_type_win.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: mainWindow
      })

      // cleanup
      InputTextWin.on('closed', () => {
        InputTextWin = null
      })
    }
  })

}  


  


app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
