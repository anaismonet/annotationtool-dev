'use strict'

const { ipcRenderer } = require('electron')

document.getElementById('InputText').addEventListener('submit', (evt) => {
  
  // prevent default refresh functionality of forms
  evt.preventDefault()

  // input on the form
  const input = evt.target[0]
  
  // send todo to main process
  ipcRenderer.send('add-text', input.value)
  alert("Envoyé")
  // reset input
  input.value = ''
})
