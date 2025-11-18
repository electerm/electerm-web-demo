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
  isSencondInstance: false
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
  ws.s({
    data,
    id
  })
}
