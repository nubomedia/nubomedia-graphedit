/*
 * (C) Copyright 2016 NUBOMEDIA (http://www.nubomedia.eu)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
// Electron shell bootstrap script

"use strict";

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipc = require('electron').ipcMain;
var dialog = require('dialog');
var fs = require('fs');

// Report crashes to our server.
// const crashReporter = require('electron').crashReporter;
// crashReporter.start({
//   productName: 'Nubomedia Graph Editor',
//   companyName: 'Nubomedia Consortium',
//   submitURL: 'https://your-domain.com/url-to-submit',
//   autoSubmit: true
// });


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({minWidth: 400, minHeight: 400, icon: __dirname + '/images/nubomedia-logo.png'});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // -------------------
  // Custom commands
  // -------------------
  ipc.on('selectOpenProject', function(event, arg) {
    console.log('selectOpenProject: ', arg);
    var paths = dialog.showOpenDialog(mainWindow, {
      title:"Open Project",
      filters: [{ name: 'Project files', extensions: ['ngeprj'] },
                { name: 'All Files', extensions: ['*'] }],
      defaultPath: ".",
      properties: ['openFile']
    });
    event.returnValue = paths?paths[0]:null; // Protect from 'undefined' causing Electron error
  });

  ipc.on('selectSaveProject', function(event, arg) {
    console.log('selectSaveProject: ', arg);
    var path = dialog.showSaveDialog(mainWindow, {
      title:"Save Project as...",
      defaultPath: "./" + arg.replace(/ /g,"_") + ".ngeprj",
      filters: [{ name: 'Project files', extensions: ['ngeprj'] },
                { name: 'All Files', extensions: ['*'] }]
    });
    event.returnValue = path?path:null; // Protect from 'undefined' causing Electron error
  });

  ipc.on('readJSONFile', function(event, arg) {
    console.log('readJSONFile: ', arg);
    try {
      let v = fs.readFileSync(arg, "utf8");
      console.log("read: ", v);
      let d = JSON.parse(v);
      event.returnValue = d || {};
    } catch (e) {
      console.log('ERROR: ', e);
      event.returnValue = null;
    }
  });

  ipc.on('writeJSONFile', function(event, arg) {
    console.log('writeJSONFile: ', arg);
    try {
      fs.writeFileSync(arg.filename, JSON.stringify(arg.obj));
      event.returnValue = true;
    } catch (e) {
      console.log('ERROR: ', e);
      event.returnValue = false;
    }
  });

  // Open the devtools.
  //mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
