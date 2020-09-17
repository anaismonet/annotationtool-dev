'use strict'

const { ipcRenderer } = require('electron')

// Lorsque l'on clique sur DownloadBtn le renderer process envoie au main process json (cf main.js)
document.getElementById('DownloadBtn').addEventListener('click', () => {
  alert('JSON téléchargé')
  ipcRenderer.send('json')
})

// Lorsque l'on clique sur clearBtn le renderer process envoie au main process clear-txt (cf main.js)
document.getElementById('clearBtn').addEventListener('click', () => {
    alert("Texte effacé")
    ipcRenderer.send('clear-txt')
  })

// Lorsque l'on clique sur AnnoterBtn le renderer process envoie au main process add-ann-window
// qui sera la fenêtre pour annoter
document.getElementById('AnnoterBtn').addEventListener('click', () => {
    ipcRenderer.send('add-ann-window')
  })

/* Annotation d'une partie de texte */
document.getElementById('AnnoterPartBtn').addEventListener('click', () => {
  
  console.log(ipcRenderer.send('add-ann-specifique-window'))

  })

// Lorsque l'on clique sur AnnoterBtn le renderer process envoie au main process add-window
// qui sera la fenêtre pour écrire notre texte
document.getElementById('WriteBtn').addEventListener('click', () => {
  ipcRenderer.send('add-window')
})

// Quand ce renderer process reçoit inputstoPrint
// il va ajouter le contenu du JSON file dans la page html ann_menu.html
// dans la balise id=Inputtxt
ipcRenderer.on('inputstoPrint', (event, txt) => {
      // get the Inputtxt id=Inputtxt
      const Inputtxt = document.getElementById('Inputtxt')

      // create html string
      const txtItems = txt.reduce((html, text) => {
        html += `<a id="input" class="input-txt">${text}</a>`

        return html
      }, '')

      // set list html to the txtitems
      Inputtxt.innerHTML = txtItems

    })

ipcRenderer.on('toClear', (event) => {
    var list = document.getElementsByClassName("input-txt");
    console.log(list)
    for(var i = list.length-1; i=>0; i--){
      list[i].parentElement.removeChild(list[i]);
    }
  })
