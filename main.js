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


    // add-text from ann_type_win
    ipcMain.on('add-text', (event, txt) => {
      const updatedText = textData.addinputText(txt).inputs
      
      mainWindow.send('inputs', updatedText)
  })

}  

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
