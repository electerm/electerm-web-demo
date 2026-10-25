import data from './init-data'
import iterms from '@electerm/electerm-themes/dist/index.mjs'
import { dbAction } from './db'

export const funcs1 = {
  listSerialPorts: data.serials,
  loadSshConfig: [],
  listItermThemes: iterms,
  loadFontList: [],
  showItemInFolder: 1,
  watchFile: 1,
  unwatchFile: 1,
  checkDbUpgrade: 0,
  doUpgrade: 1,
  saveUserConfig: 1,
  setWindowSize: 1,
  getScreenSize: { width: 1920, height: 1080 },
  initCommandLine: 0,
  getLoadTime: 0,
  setLoadTime: 0,
  isMaximized: false,
  isSencondInstance: false,
  // user widgets need the desktop main process (a widget folder on disk, a
  // node process to run it), so a browser gets an empty list rather than a
  // rejection -- the widgets page then renders "nothing installed".
  listWidgets: [],
  importWidget: 0,
  deleteWidget: 1,
  runWidget: 1,
  stopWidget: 1,
  runWidgetFunc: 1,
  callWidgetFunc: 1,
  // macOS RDP with Control/Command swapped: only the desktop app has an app
  // menu whose accelerators would swallow the keys. Nothing to disable here,
  // the stub exists so the call is not an unknown function.
  setRdpSwapCtrlCmd: 1
}
export const funcs2 = {
  encryptAsync: 1,
  decryptAsync: 1,
  lookup: 1
}

export function runSync (ws, msg) {
  const {
    id,
    func,
    args = []
  } = msg
  let data
  try {
    if (
      typeof funcs1[func] !== 'undefined'
    ) {
      data = funcs1[func]
    } else if (
      typeof funcs2[func] !== 'undefined'
    ) {
      data = args[0]
    } else if (func === 'dbAction') {
      data = dbAction(...args)
    }
  } catch (err) {
    console.error('runSync error', func, args, err)
    // An Error instance does not survive JSON: it serialises to {} and the
    // renderer then rejects with "Error: undefined". Send the fields the
    // client actually reads. Always reply, or the renderer's promise is left
    // unsettled forever.
    return ws.s({
      error: {
        message: err && err.message ? err.message : String(err),
        stack: err && err.stack ? err.stack : ''
      },
      id
    })
  }
  ws.s({
    data,
    id
  })
}
