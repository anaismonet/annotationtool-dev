'use strict'

const { ipcRenderer } = require('electron')

// delete txt by its text value ( used below in event listener)
const deleteTxt = (e) => {
    ipcRenderer.send('delete-txt', e.target.textContent)
  }

  // clear add todo window button
document.getElementById('clearBtn').addEventListener('click', () => {
    ipcRenderer.send('clear-txt')
  })
  

// create add todo window button
document.getElementById('AnnoterBtn').addEventListener('click', () => {
  ipcRenderer.send('add-ann-window')
})

// on receive txt
ipcRenderer.on('inputstoPrint', (event, txt) => {
      // get the Inputtxt ul
      const Inputtxt = document.getElementById('Inputtxt')
      
      // create html string
      const txtItems = txt.reduce((html, text) => {
        html += `<a class="input-txt">${text}</a>`
    
        return html
      }, '')
    
      // set list html to the todo items
      Inputtxt.innerHTML = txtItems

      // add click handlers to delete the clicked todo
        Inputtxt.querySelectorAll('.input-txt').forEach(item => {
        item.addEventListener('click', deleteTxt)
  })
    })
