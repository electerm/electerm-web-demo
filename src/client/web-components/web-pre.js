import * as path from './path.js'
import '../demo/fs.js'
import * as constants from '../demo/runtime-constants.js'

const {
  ipcOnEvent,
  ipcOffEvent,
  runGlobalAsync,
  getZoomFactor,
  setZoomFactor,
  runSync
} = window.api

window.log = window.console
window.log.warning = console.warn
window.pre = {
  extIconPath: window.et.extIconPath || '/icons/',
  homeOrTmp: '/home/electerm',
  fsFunctions: [
    'readdirOnly',
    'readdirAndFiles',
    'run',
    'runWinCmd',
    'access',
    'statAsync',
    'lstatAsync',
    'cp',
    'mv',
    'mkdir',
    'touch',
    'chmod',
    'rename',
    'unlink',
    'rmrf',
    'readdirAsync',
    'readFile',
    'readFileAsBase64',
    'writeFile',
    'openFile',
    'zipFolder',
    'unzipFile',
    'readCustom',
    'exists',
    'readdir',
    'mkdir',
    'realpath',
    'statCustom',
    'openCustom',
    'closeCustom',
    'writeCustom',
    'getFolderSize'
  ],
  osInfoData: {
    os: 'Linux',
    osArch: 'x64'
  },
  ...constants,
  sep: '/',
  versions: {
    node: '18'
  },
  env: {
    demo: true
  },
  resolve: (...args) => {
    return path.resolve(...args.map(d => d || ''))
  },
  transferKeys: [
    'pause',
    'resume',
    'destroy'
  ],
  osInfo: () => ([]),
  readClipboard: () => {
    return window.et.clipboard || ''
  },

  writeClipboard: str => {
    window.et.clipboard = str
  },
  showItemInFolder: (href) => runSync('showItemInFolder', href),
  ipcOnEvent,
  ipcOffEvent,
  getZoomFactor,
  setZoomFactor,
  openExternal: (url) => {
    window.open(url, '_blank')
  },
  runSync,
  runGlobalAsync
}

window.reqs = {
  path,
  fs: window.fs
}

function require (name) {
  return window.reqs[name]
}

require.resolve = name => name

window.require = require
