'use strict'

const {dialog} = require('electron').remote
const fs = require('fs')
const { ipcRenderer } = require('electron')
var path = require('path')
const { allowedNodeEnvironmentFlags } = require('process')

document.getElementById('Refresh').addEventListener('click', () => {
  ipcRenderer.send('maj')
})

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

    // Lorsque l'on clique sur AddtxtBtn le renderer process envoie au main process add-txt
// qui permet d'importer du texte
document.getElementById('AddtxtBtn').addEventListener('click', () => {
  dialog.showOpenDialog((fileNames) => {
    if(fileNames === undefined){
      console.log('No file was selected')
    }else {
      var filePath = String(fileNames)
      var ext = path.extname(filePath)
      if (ext == '.txt'){
        fs.readFile(fileNames[0], 'utf-8', (err, data) => {
          if (err){
            console.log('cannot read file', err)
          }else{
            ipcRenderer.send('add-txt', data)
          }
        })
      }else if( ext == '.json'){
        fs.readFile(fileNames[0], 'utf-8', (err, data) => {
          if (err){
            console.log('cannot read file', err)
          }else{
            const obj = data.split('{')
            for (var i = 1; i<obj.length; i++){
              const text = obj[i].split('\"text\"')
              const txt = text[1].split('\"')
              ipcRenderer.send('add-txt', txt[1])
            }
          }
        })
      }else if (ext == '.csv'){
        fs.readFile(fileNames[0], 'utf-8', (err, data) => {
          if (err){
            console.log('cannot read file', err)
          }else{
            const obj = data.split('\n')
            var ind = 0
            const index = obj[0].split(',')
            for (var j = 0; j<index.length; j++){
              if (index[j] == 'text'){
                ind = j;
              }
            }
            for (var i = 1; i<obj.length-1; i++){
              const text = obj[i].split(',')
              ipcRenderer.send('add-txt', text[ind])
            }
          }
        })
      }
    }
  })
})



// Quand ce renderer process reçoit inputstoPrint
// il va ajouter le contenu du JSON file dans la page html ann_menu.html
// dans la balise id=Inputtxt
ipcRenderer.on('inputstoPrint', (event, txt) => {
      // get the Inputtxt id=Inputtxt
      const Inputtxt = document.getElementById('Inputtxt')

      // create html string
      const txtItems = txt.reduce((html, text) => {
        html += `<a id="input" class="input-txt" onclick="changeClass(this);">${text}</a>`
        return html
      }, '')

      // set list html to the txtitems
      Inputtxt.innerHTML = txtItems

    })

ipcRenderer.on('toClear', (event) => {
    var list1 = document.getElementsByClassName("input-txt");
    var list2 = document.getElementsByClassName('input-txt-toggle');
    var list = list1.concat(list2);

    for(var i = list.length-1; i=>0; i--){
      list[i].parentElement.removeChild(list[i]);
    }
  })

ipcRenderer.on('annAddList', (event, txt,annotation, num ) => {
  //var txtList = "(" +  txt.concat(',',annotation) + ")"
  var div = document.createElement('div');
  var ann = annotation;
  var AnnNode = document.createTextNode(ann)
  div.appendChild(AnnNode);
  var txtList = txt + ":";
  var textarea = document.createElement('textarea');
  textarea.id = "Mytextarea";

  var a = document.createElement('a');
  var li = document.createElement('li');
  var button = document.createElement('button');
  var ex = 'X';
  button.className = 'ex';
  
  button.appendChild(document.createTextNode(ex));

  var buttonModify = document.createElement('button');
  var modify = 'Modifier';
  buttonModify.className = 'modifier';
  
  buttonModify.appendChild(document.createTextNode(modify));

  var buttonConfirmer = document.createElement('button');
  var confirmer = 'Ok';
  buttonConfirmer.appendChild(document.createTextNode(confirmer));
  buttonConfirmer.className = 'confirmer';

  a.appendChild(document.createTextNode(txtList));
  a.appendChild(div);

  a.appendChild(button);
  a.appendChild(buttonModify);
  li.appendChild(a);

  document.getElementById('annList').appendChild(li);
  

  button.onclick = function() { 
    
    li.removeChild(a);
    

    fs.readFile('./config/DataStorage.json','utf8', (err,content) => {
      if (err) {
        alert("An error ocurred creating the file " + err.message)
      }else {
        const contentJson = JSON.parse(content);

        fs.readFile('./config/TextMain.json','utf8', (err,inputs) => {
          if (err){
            alert("An error ocurred opening the file " + err.message)
          }else{
            const inputsJson = JSON.parse(inputs);
            const textAnnote = inputsJson['inputs'][num];
            
            if (txt.search("Annotation du texte") != -1 || txt.search("Annotation Objet") != -1){
              //alert("within search")
              for(var i = 0; i < contentJson.length; i ++){
                var elem = contentJson[i];
               
                if (elem['text'].localeCompare(textAnnote)==0 && elem['type'].localeCompare(annotation)==0){
                  contentJson.splice(i,1);
               
                }
              }  

            }else { 
              //alert('within not search')
              //alert(contentJson.length)
              for(var i = 0; i < contentJson.length; i ++){
                var elem = contentJson[i];
                
                if (elem['text'].localeCompare(textAnnote)==0 && elem['entities'][0][2].localeCompare(annotation)==0){
                  contentJson.splice(i,1);
                  //alert('trouvé');
                }
              }
            }
            var newContent = JSON.stringify(contentJson);

            fs.writeFile('./config/DataStorage.json', newContent, (err) => {
              if (err) {
                alert("An error ocurred creating the file " + err.message);
              } else{
                alert('Suppresion réussie');
              }
            })
            
          }

        })
        
      }
    })
    
   };

  
  buttonModify.onclick = function() { 
    a.removeChild(div);
    a.removeChild(button);
    a.removeChild(buttonModify);
    a.appendChild(textarea);
    a.appendChild(button);
    a.appendChild(buttonConfirmer);
  };

  buttonConfirmer.onclick = function(){
    var oldAnn = div.childNodes[0].nodeValue;
    alert(oldAnn);
    div.removeChild(AnnNode);
    var ann = document.getElementById("Mytextarea").value;
    AnnNode = document.createTextNode(ann);
    div.appendChild(AnnNode);
    a.removeChild(textarea);
    a.removeChild(button);
    a.removeChild(buttonConfirmer);
    a.appendChild(div);
    a.appendChild(button);
    a.appendChild(buttonModify);

    fs.readFile('./config/DataStorage.json','utf8', (err,content) => {
      if (err) {
        alert("An error ocurred creating the file " + err.message)
      }else {
        const contentJson = JSON.parse(content);

        fs.readFile('./config/TextMain.json','utf8', (err,inputs) => {
          if (err){
            alert("An error ocurred opening the file " + err.message)
          }else{
            const inputsJson = JSON.parse(inputs);
            const textAnnote = inputsJson['inputs'][num];
            
            if (txt.search("Annotation du texte") != -1 || txt.search("Annotation Objet") != -1){
              for(var i = 0; i < contentJson.length; i ++){
                var elem = contentJson[i];
               
                if (elem['text'].localeCompare(textAnnote)==0 && elem['type'].localeCompare(oldAnn)==0){
                  contentJson.splice(i,1);
                  contentJson.push({"text": textAnnote, "type": ann});
                  //alert('trouvé')
                }
              }  
            }else { 
              for(var i = 0; i < contentJson.length; i ++){
                var elem = contentJson[i];
                if (elem['text'].localeCompare(textAnnote)==0 && elem['entities'][0][2].localeCompare(oldAnn)==0){
                  var range =  elem['entities'][0];
                  contentJson.splice(i,1);
                  contentJson.push({"text": textAnnote, "type":"", "entities": [[range[0],range[1],ann]]});
                  //alert('trouvé');
                }
              }
            }
            var newContent = JSON.stringify(contentJson);

            fs.writeFile('./config/DataStorage.json', newContent, (err) => {
              if (err) {
                alert("An error ocurred creating the file " + err.message);
              } else{
                alert('Modification réussie');
              }
            })
            
          }

        })
        
      }
    })

  };


})


