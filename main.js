const path = require('path')
const { app, ipcMain} = require('electron')

const DataJson = require('./DataJson')
const Window = require('./Window')
const DataStore = require('./DataStore')
const fs = require('fs')


// Permet de sauvegarde notre json le bon dossier
app.setPath("userData", __dirname + "/config")

// DataStore stocke le texte à annoter dans un fichier JSON
const textData = new DataStore({ name : 'TextMain' })

// DataStructure contient l'annotation
const DataStructure = new DataJson({ name : 'DataStruct'})

const config = require('./config/DataStruct.json')

function main () {

    // Création de la fenêtre principale
    let mainWindow = new Window({
      file: path.join(__dirname,'index.html'),
      backgroundcolor : "#818181"
    })

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })
    mainWindow.once('show', () => {
      mainWindow.webContents.send('inputstoPrint', textData.inputs)
    })

    /*
    // if the render process crashes, reload the window
    mainWindow.webContents.on('crashed', () => {
      mainWindow.destroy();
      main();
    });
    */

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

      addWin.once('ready-to-show', () => {
        addWin.show()
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

    annWin.once('ready-to-show', () => {
      annWin.show()
    })
    // cleanup
    annWin.on('closed', () => {
      annWin = null
    })
    }
  })


  /* Fenêtre annotation spécifique */
  let annSpecWin 

  ipcMain.on('add-ann-specifique-window', () => {
    console.log('add-ann-specifique-window')
    // if annWin does not already exist
    if (!addWin && !annWin) {
      // create a new  window
      annSpecWin = new Window({
        file: path.join('src', 'annotation_spec.html'),
        width: 200,
        height: 200,
        // close with the main window
        parent: mainWindow
      })
  
      annSpecWin.once('ready-to-show', () => {
        annSpecWin.show()
      })
      // cleanup
      annSpecWin.on('closed', () => {
        annSpecWin = null
      })
      }
  })

  // add-text from ann_type_win
  // Lorsque le main process reçoit 'add-text' il ajoute txt dans le fichier JSON textData
  // puis envoie ce fichier à un renderer process (cf ann_menu.js)

  ipcMain.on('add-text', (event, txt) => {
    const updatedText = textData.addinputText(txt).inputs
    console.log(updatedText)
    console.log(DataStructure.addText(txt).text)
    console.log(mainWindow.send('inputstoPrint', updatedText))
  })

  // clear-txt from txt list window
  // Supprime le contenu de textData
  ipcMain.on('clear-txt', (event) => {
    textData.deleteText()
    const updatedText = textData.getinputs()
    DataStructure.clear()
    mainWindow.send('toClear')
  })

  /* ANNOTATION SPECIFIQUE */
 
  ipcMain.on('text-selection',(event,txt) => {

    /* Une fois qu'on a reçu l'annotation de annotation_spec.js */
    ipcMain.on('text-selection-annotation',(event,annotation) => {
      console.log('icpmain in ipcmain')
      console.log(txt)
      console.log(annotation)
    })
  })

  /* ANNOTATION DE TOUT LE TEXTE */
  ipcMain.on('add-annotation', (event, annotation ) => {
    console.log(DataStructure.addType(annotation).type)
    // Ajouter l'objet JSON dans un fichier sauvegarde dans config 
    
  })

  ipcMain.on('json', (event) => {

    fs.readFile('./config/DataStruct.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("File read failed:", err)
          return
      }
      const jsonString2 = JSON.parse(jsonString);
      var content = "[]"
      fs.writeFile('DataStructure.json', content, (err) => {
        if(err){
            alert("An error ocurred creating the file "+ err.message)
        }
        else {
          fs.readFile('DataStructure.json', 'utf8', function (err, data) {
            if (err) {
                console.log(err)
            } else {
                const file = JSON.parse(data);
                file.push(jsonString2);
                const json = JSON.stringify(file);

                fs.writeFile('DataStructure.json', json, 'utf8', function(err){
                     if(err){
                           console.log(err);
                     } else {
                           console.log('Data written to file')
                     }});
            }
         });
        }
      });
    })
  })

  mainWindow.on('uncaughtException', function (error) {
    // Handle the error
    console.log(error)
  })

}


app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
