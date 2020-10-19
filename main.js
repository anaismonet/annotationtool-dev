const path = require('path')
const { app, ipcMain } = require('electron')

const DataJson = require('./DataJson')
const Window = require('./Window')
const DataStore = require('./DataStore')
const fs = require('fs')


// Permet de sauvegarde notre json le bon dossier
app.setPath("userData", __dirname + "/config")

// DataStore stocke le texte à annoter dans un fichier JSON
const textData = new DataStore({ name: 'TextMain' })

// DataStructure contient l'annotation
const DataStructure = new DataJson({ name: 'DataStruct' })

const config = require('./config/DataStruct.json')

function main() {

  // Création de la fenêtre principale
  let mainWindow = new Window({
    file: path.join(__dirname, 'index.html'),
    backgroundcolor: "#818181"
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
        width: 450,
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
        width: 300,
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

  //Refresh le texte
  ipcMain.on('maj', (event) => {
    mainWindow.send('inputstoPrint', textData.inputs)
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


// add-txt ajoute le texte venant du fichier
ipcMain.on('add-txt', (event, data) => {
  mainWindow.send('inputstoPrint', textData.addinputText(data).inputs)
  DataStructure.addText(data).text
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

  ipcMain.on('text-selection', (event, txt) => {

    /* Une fois qu'on a reçu l'annotation de annotation_spec.js */
    ipcMain.on('text-selection-annotation', (event, annotation) => {
      console.log('icpmain in ipcmain')
      console.log(txt)
      console.log(annotation)

      const updatedText = DataStructure.addText(txt).inputs
      console.log(updatedText)
      console.log(DataStructure.addType(annotation).type)

      // Ajouter l'objet JSON dans un fichier sauvegarde dans config
      fs.readFile('./config/DataStruct.json', 'utf8', (err, jsonString) => {
        if (err) {
          console.log("File read failed:", err)
          return
        }
        const jsonString2 = JSON.parse(jsonString);
        console.log('jsonString2')
        console.log(jsonString2)

        /* 
        Appelle la fonction pour l'annotation spécifique qui fera le nouvel objet
        {"text": TextMain.inputs[0], 
        "type" : "", (on met un type vide pour savoir qu'on annote spécifiquement lors de la recherche d'objets dans DataStorage)
        "entities": [(B1,E1,annotation),...,(Bn,En,annotation)]} avec n le nombre d'occurences de txt dans textMain
        Pour trouver B et E, on parse tout text en cherchant txt
        */
        openJsonAddAnnSpec('./config/DataStorage.json', jsonString2)
      })

    })
  })

  /* ANNOTATION DE TOUT LE TEXTE */
  ipcMain.on('add-annotation', (event, annotation) => {
    console.log(DataStructure.addType(annotation).type)

    // Ajouter l'objet JSON dans un fichier sauvegarde dans config
    fs.readFile('./config/DataStruct.json', 'utf8', (err, jsonString) => {
      if (err) {
        console.log("File read failed:", err)
        return
      }
      const jsonString2 = JSON.parse(jsonString);
      console.log('jsonString2')
      console.log(jsonString2)

      openJsonAdd('./config/DataStorage.json', jsonString2)
    })
  })
  /* Fonction qui ouvre DataStorage pour ajouter les annotations */

  function openJsonAdd(filename, jsonString2) {
    // Ouvre DataStorage.json qui va contenir toutes les annotations
    fs.open(filename, 'r+', function (err, fd) {

      if (err) {
        // Si n'existe pas, il est crée avec le contenu '[]'
        fs.writeFile(filename, '[]', 'utf8', function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log("DataStorage.json successfully created")
            addObjectJson(filename, jsonString2)
          }
        });

      } else {
        // Il faudra laisser la possibilité de recharger le travail précédent
        console.log("DataStorage.json already exists")
        addObjectJson(filename, jsonString2)
      }
    });

  }

  /* Fonction qui ajoute les objets JSON concernant l'annotation de tout le texte dans DataStorage.json */

  function addObjectJson(filename, jsonString2) {
    // Ouvre filename en écriture + lecture
    fs.readFile(filename, 'utf8', function (err, data) {
      if (err) {
        console.log(err)
      } else {
        console.log('data addObjectJson')
        console.log(data)
        console.log(JSON.parse(data))
        const file = JSON.parse(data);

        file.push(jsonString2);

        const json = JSON.stringify(file);
        console.log('json addObjectJson')
        console.log(json)

        fs.writeFile(filename, json, 'utf8', function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('Data written to file')
          }
        });
      }
    });
  };

  /* Écriture du json avec annotation spécifique */
  function openJsonAddAnnSpec(filename, jsonString2) {
    // Ouvre DataStorage.json qui va contenir toutes les annotations
    fs.open(filename, 'r+', function (err, fd) {

      if (err) {
        // Si n'existe pas, il est crée avec le contenu '[]'
        fs.writeFile(filename, '[]', 'utf8', function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log("DataStorage.json successfully created")
            addObjectJsonAnnSpec(filename, jsonString2)
          }
        });

      } else {
        // Il faudra laisser la possibilité de recharger le travail précédent
        console.log("DataStorage.json already exists")
        addObjectJsonAnnSpec(filename, jsonString2)
      }
    });

  }

  /* Ajoute les objets JSON concernant les annotations spécifiques dans DataStorage.json */
  function addObjectJsonAnnSpec(filename, jsonAnnSpec) {

    /* fonctionLucas est à faire */
    list_positions = recherche(jsonAnnSpec['text'],jsonAnnSpec['type']);
    console.log("list_positions");
    console.log(list_positions);

    console.log("list_positions");
    console.log(list_positions);

    // Ouvre filename en écriture + lecture
    fs.readFile(filename, 'utf8', function (err, data) {
      if (err) {
        console.log(err)
      } else {
        /* On récupère le contenu de filename */
        console.log('data addObjectJsonAnnSpec')
        console.log(data)

        console.log(JSON.parse(data))
        const file = JSON.parse(data);

        /* On ajoute au contenu de filename l'objet JSON qui concerne l'annotation spécifique */
        var objet = {"text" : textData.getinputs()[0], "type" : "", "entities" : list_positions };
        console.log(objet)
        file.push(objet);

        /* Écriture dans DataStorage.json */
        const json = JSON.stringify(file);
        console.log('json addObjectJsonAnnSpec')
        console.log(json)

        fs.writeFile(filename, json, 'utf8', function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('Data written to file')
          }
        });
      }
    });
  };

  /*
  function fonctionLucas(partieToAnn, category){
    list_positions = [["B1","E1",category, partieToAnn],["B","E",category, partieToAnn]];
    return list_positions
  }
  */

  function recherche(motachercher, categorie) {
    var textentier = textData.getinputs()[0];
    var taille = motachercher.length;
    const txt = textentier.split(' ');
    const mot = motachercher.split(' ');
    const nbtext = txt.length;
    const nbmot = mot.length;
    var a = 0;
    var posi = 0;
    var matrice = [];
    for (let i = 0; i < nbtext; i++) {
        var début = 0;
        var end = 0;
        var add = 0;
        var n = 0;
        var j = 0;
        while (j < nbmot) {
            var virg = mot[j].toLowerCase().concat(',')
            var point = mot[j].toLowerCase().concat('.')
            if (i + j < nbtext) {
                if (mot[j].toLowerCase() == txt[i + j].toLowerCase()) {
                    n++
                    j++
                }
                else if (virg == txt[i + j].toLowerCase() || point == txt[i + j].toLowerCase()) {
                    n++
                    j++
                    add++
                }
                else {
                    j = nbtext
                }
            }
            else {
                j = nbtext
            }
        }
        if (n == nbmot) {
            a++
            début = posi
            end = posi + taille + add - 1
            var tab = [début, end, categorie]
            matrice.push(tab)
        }
        posi = posi + txt[i].length + 1
        console.log(posi)
    }
    return matrice
}

  ipcMain.on('json', (event) => {

    fs.readFile('./config/DataStorage.json', 'utf8', (err, jsonString) => {
      if (err) {
        console.log("File read failed:", err)
      }
      else {
        /* Ouvrir DataStruct.json pour récupérer le texte qu'on stocke dans textToAnn  */
        fs.readFile('./config/DataStruct.json','utf8', (err, textToAnn) => {
          if (err){
            console.log("DataStruct failed to read",err)
          }
          else{
            console.log('tentative de téléchargement')

            /* Parsing de DataStorage.json fichier de sauvegarde de toutes les annotations et le texte leur étant associé */
            const contentDataStorage = JSON.parse(jsonString);
            console.log(contentDataStorage);
            
            /* On récupère le texte à annoter qui est dans TextMain.json */
            console.log("textToAnn");
            var textToAnn = textData.getinputs()[0];
            console.log(textToAnn);

            var jsonToDownload = [];
            var entities = [];
            var type = [];

            /* Recherche de toutes les annotations liées au texte */
            for(var i = 0; i< contentDataStorage.length ; i++){
              var found = 0;

              if (textToAnn.localeCompare(contentDataStorage[i]['text']) == 0){
            
                /* Si Annotation spécifique, on sait que type est vide */
                if( contentDataStorage[i]['type'] == ''){
                  entities = entities.concat(contentDataStorage[i]['entities']);
                }
                /* Sinon */
                else{
                  /* Vérification pour éviter les doublons dans type */
                  if(type.length == 0){
                    type.push(contentDataStorage[i]['type']);
                  }
                  else {
                    for(var j = 0; j < type.length; j++){
                      if(type[j].localeCompare(contentDataStorage[i]['type']) == 0){
                        found = 1;
                      }
                    }
                    if(found == 0){
                      type.push(contentDataStorage[i]['type']);
                    }
                  }
                
                }
              };
              

            };
            var objet = {"text" : textToAnn, "entities" : entities, "type" : type};
            jsonToDownload.push(objet);

            console.log('Objet final');
            console.log(jsonToDownload);

            /* Écriture de DataStructure.json qui est le fichier téléchargé par l'utilisateur */
            const json = JSON.stringify(jsonToDownload)
            console.log(json)

            fs.writeFile('DataStructure.json', json, (err) => {
              if (err) {
                alert("An error ocurred creating the file " + err.message)
              }
              else {
                console.log("Fichier écrit")
              }
            });
          }
        })
      }
    })
  });

  mainWindow.on('uncaughtException', function (error) {
    // Handle the error
    console.log(error)
  })

}

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
