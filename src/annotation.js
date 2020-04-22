'use strict'

const {ipcRenderer} = require('electron')

// on receive txt
ipcRenderer.on('inputstoPrint', (event, txt) => {
  console.log('received')
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
