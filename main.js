const path = require('path')
const { app, ipcMain} = require('electron')

const Window = require('./Window')
const DataStore = require('./DataStore')
const fs = require('fs')

// DataStore stocke le texte à annoter dans un fichier JSON
const textData = new DataStore({ name: 'TextMain' })

// DataStructure contient l'annotation
// const DataStructure = new DataStore([{ 'text ' : '', 'type' :''}])
const DataStructure = new DataStore()

require('electron-reload')(__dirname)

function main () {

    // Création de la fenêtre principale
    let mainWindow = new Window({
      file: path.join(__dirname,'index.html')
    })

    // Fenêtre secondaire qui va nous permettre d'écrire le texte à annoter
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

  // Fenêtre secondaire qui va nous permettre d'ajouter l'annotation
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
  // Lorsque le main process reçoit 'add-text' il ajoute txt dans le fichier JSON textData
  // puis envoie ce fichier à un renderer process (cf ann_menu.js)
  ipcMain.on('add-text', (event, txt) => {
      const updatedText = textData.addinputText(txt).inputs
      console.log(updatedText)
      console.log(mainWindow.send('inputstoPrint', updatedText))
      //console.log(mainWindow.send('inputstoPrint', txt))
      console.log(DataStructure.addText(txt).text)
  })

  // clear-txt from txt list window
  // Supprime le contenu de textData
  ipcMain.on('clear-txt', (event) => {
    textData.clear()
    DataStructure.clear()
  })

  /* ANNOTATION */  
  ipcMain.on('add-annotation', (event, annotation ) => {
    console.log(DataStructure.addType(annotation).type)
    console.log(DataStructure)
  })

  
  ipcMain.on('json', (event) => {
    let data = JSON.stringify(DataStructure);

    fs.writeFile('structure.json', data, (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });

  console.log('This is after the write call');

  })

}  

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
