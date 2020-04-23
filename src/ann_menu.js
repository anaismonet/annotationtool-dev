'use strict'

const { ipcRenderer } = require('electron')

  // clear add todo window button
document.getElementById('clearBtn').addEventListener('click', () => {
    alert("All cleared")
    ipcRenderer.send('clear-txt')
  })
  
document.getElementById('AnnoterBtn').addEventListener('click', () => {
    ipcRenderer.send('add-ann-window')
  })

// create add todo window button
document.getElementById('WriteBtn').addEventListener('click', () => {
  ipcRenderer.send('add-window')
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

    })
