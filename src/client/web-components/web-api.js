// window preload
// import { message } from 'antd'
import data from '../demo/init-data.json'
import * as langMap from '@electerm/electerm-locales/esm/index.mjs'
import {
  funcs1,
  funcs2
} from '../demo/run-sync.js'
import { dbAction } from '../demo/db.js'
import { FakeWs } from '../demo/ws.js'
import { css } from '../demo/css.js'

window.WebSocket = FakeWs

window.api = {
  getZoomFactor: () => 1,
  setZoomFactor: (nl) => {
    // message.info('Set ZoomFactor not supported')
  },
  openDialog: (opts) => {
    return new Promise((resolve, reject) => {
      window.et.handleDialogEvent = (e) => {
        if (e?.data?.type === 'handleDialog') {
          window.removeEventListener('message', window.et.handleDialogEvent)
          delete window.et.handleDialogEvent
          resolve(e.data.data)
        } else if (e?.data?.type === 'closeDialog') {
          resolve(false)
        }
      }
      window.addEventListener('message', window.et.handleDialogEvent)
      window.postMessage({
        type: 'openDialog',
        data: opts
      }, '*')
    })
  },
  ipcOnEvent: (event, cb) => {

  },
  ipcOffEvent: (event, cb) => {

  },
  runGlobalAsync: async (func, ...args) => {
    if (func === 'initCommandLine') {
      try {
        const { init } = window.et.query
        return init ? JSON.parse(window.et.query.init) : null
      } catch (err) {
        console.log('initCommandLine error:', err)
      }
    } else if (func === 'setTitle') {
      document.title = args[0]
      return
    } else if (func === 'checkMigrate') {
      return Promise.resolve(false)
    } else if (func === 'openNewInstance') {
      return window.open(args[0], '_blank')
    } else if (func === 'closeApp') {
      return window.close()
    } else if (func === 'restart') {
      return window.location.reload()
    } else if (func === 'init') {
      return Promise.resolve({
        config: data.config,
        isPortable: true,
        langs: Object.keys(langMap).map(id => {
          return {
            id,
            ...langMap[id]
          }
        }),
        langMap
      })
    } else if (
      typeof funcs1[func] !== 'undefined'
    ) {
      return Promise.resolve(funcs1[func])
    } else if (
      typeof funcs2[func] !== 'undefined'
    ) {
      return Promise.resolve(args[0])
    } else if (func === 'dbAction') {
      return Promise.resolve(
        dbAction(...args)
      )
    } else if (func === 'toCss') {
      return Promise.resolve(
        css
      )
    } else if (func === 'fetch') {
      return Promise.resolve(
        'v0.0.0'
      )
    }
    return window.wsFetch({
      action: 'runSync',
      args,
      func
    })
  },
  runSync: (func, ...args) => {
    if (func === 'isMaximized') {
      return false
    } else if (func === 'isSecondInstance') {
      return false
    } else if (func === 'windowMove') {
      return false
    } else if (func === 'nodePtyCheck') {
      return true
    } else if (func === 'getLoadTime' || func === 'setLoadTime') {
      return 0
    } else if (
      typeof funcs1[func] !== 'undefined'
    ) {
      return Promise.resolve(funcs1[func])
    } else if (
      typeof funcs2[func] !== 'undefined'
    ) {
      return Promise.resolve(args[0])
    }
    return window.wsFetch({
      action: 'runSync',
      args,
      func
    })
  }
}
