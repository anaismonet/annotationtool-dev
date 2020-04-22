'use strict'

const Store = require('electron-store')

class DataStore extends Store {
  constructor (settings) {
    super(settings)

    // initialize with inputs or empty array
    this.inputs = this.get('inputs') || []
  }

  saveinputs () {
    // save inputs to JSON file
    this.set('inputs', this.inputs)

    // returning 'this' allows method chaining
    return this
  }

  getinputs () {
    // set object's inputs to inputs in JSON file
    this.inputs = this.get('inputs') || []
    return this
  }

  addinputText (inputText) {
    // merge the existing inputs with the new inputText
    this.inputs = [ ...this.inputs, inputText ]

    return this.saveinputs()
  }

  deleteTxt (txt) {
    // filter out the target txt
    this.inputs = this.inputs.filter(t => t !== txt)

    return this.saveinputs()
  }

  deleteAll(){
    this.inputs = this.clear()

    return this.saveinputs()
  }

}

module.exports = DataStore
