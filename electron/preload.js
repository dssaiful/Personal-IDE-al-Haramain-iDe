const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  windowMinimize: () => ipcRenderer.invoke('window:minimize'),
  windowMaximize: () => ipcRenderer.invoke('window:maximize'),
  windowClose: () => ipcRenderer.invoke('window:close'),
  
  readFile: (args) => ipcRenderer.invoke('ide:readFile', args),
  applyDiff: (args) => ipcRenderer.invoke('ide:applyDiff', args),
  
  send: (channel, payload) => ipcRenderer.send(channel, payload),
  on: (channel, listener) => {
    const validChannels = ['agent:statusSync', 'terminal:output'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => listener(...args));
    }
  }
});
