const path = require('path')
const { app, ipcMain} = require('electron')

const Window = require('./Window')
const DataStore = require('./DataStore')

const textData = new DataStore({ name: 'TextMain' })

require('electron-reload')(__dirname)

function main () {

    let mainWindow = new Window({
      file: path.join(__dirname,'index.html')
    })

    mainWindow.once('show', () => {
      mainWindow.webContents.send('inputstoPrint', textData.inputs)
    })

    let addWin
      // create add text window
    ipcMain.on('add-window', () => {
    // if addWin does not already exist
    if (!addWin) {
      // create a new window
      addWin = new Window({
        file: path.join('src', 'ann_type.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: mainWindow
      })

      // cleanup
      addWin.on('closed', () => {
        addWin = null
      })
    }
  })


  let annWin
    // create annotation window
  ipcMain.on('add-ann-window', () => {
  // if annWin does not already exist
  if (!addWin) {
    // create a new  window
    annWin = new Window({
      file: path.join('src', 'annotation.html'),
      width: 200,
      height: 200,
      // close with the main window
      parent: mainWindow
    })

    // cleanup
    annWin.on('closed', () => {
      annWin = null
    })
    }
  })

    // add-text from ann_type_win
  ipcMain.on('add-text', (event, txt) => {
      const updatedText = textData.addinputText(txt).inputs
      console.log(mainWindow.send('inputstoPrint', updatedText))
  })

  // clear-txt from txt list window
  ipcMain.on('clear-txt', (event) => {
    textData.clear()
  })


}  

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
