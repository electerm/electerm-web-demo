/**
 * web worker
 */
import { FakeWs } from '../demo/ws.js'
self.insts = {}

function safeJSONParse (str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return str
  }
}

function createWs (
  type,
  id,
  sftpId = '',
  config
) {
  // init gloabl ws
  const { tokenElecterm } = config
  const wsUrl = `ws://localhost:8080/${type}/${id}?sftpId=${sftpId}&token=${tokenElecterm}`
  const ws = new FakeWs(wsUrl)
  ws.s = msg => {
    ws.send(JSON.stringify(msg))
  }
  ws.id = id
  ws.once = (callack, id) => {
    const func = (evt) => {
      const arg = safeJSONParse(evt.data)
      if (id === arg.id && arg.data) {
        callack(arg)
        ws.removeEventListener('message', func)
      }
    }
    ws.addEventListener('message', func)
  }
  ws.onclose = () => {
    if (ws.dup) {
      return
    }
    send({
      id: ws.id,
      action: 'close'
    })
    delete self.insts[ws.id]
  }
  return new Promise((resolve) => {
    ws.onopen = () => {
      if (self.insts[ws.id]) {
        ws.dup = true
        ws.close()
        resolve(null)
      } else {
        resolve(ws)
      }
    }
  })
}

function send (data) {
  self.postMessage(data)
}

async function onMsg (e) {
  const {
    id,
    wsId,
    args,
    action,
    type,
    persist,
    url
  } = e.data
  if (action === 'init-url') {
    self.currentUrl = url
    return false
  }
  if (action === 'create') {
    const inst = self.insts[id]
    if (inst instanceof FakeWs) {
      return send({
        action,
        id,
        persist
      }, '*')
    } else if (inst) {
      return false
    } else {
      const ws = await createWs(...args)
      if (ws) {
        self.insts[id] = ws
      }
    }
    send({
      action,
      persist,
      id
    }, '*')
  } else if (action === 'once') {
    const ws = self.insts[wsId]
    if (ws) {
      const cb = (data) => {
        send({
          id,
          wsId,
          data
        })
      }
      ws.once(cb, id)
    }
  } else if (action === 'close') {
    const ws = self.insts[wsId]
    if (ws) {
      ws.close()
    }
  } else if (action === 's') {
    const ws = self.insts[wsId]
    if (ws) {
      ws.s(...args)
    }
  } else if (action === 'addEventListener') {
    const ws = self.insts[wsId]
    if (ws) {
      ws.cb = (e) => {
        send({
          wsId,
          id,
          data: {
            data: e.data
          }
        })
      }
      ws.addEventListener(type, ws.cb)
    }
  } else if (action === 'removeEventListener') {
    const ws = self.insts[wsId]
    if (ws) {
      ws.removeEventListener(type, ws.cb)
      delete ws.cb
    }
  }
}

self.addEventListener('message', onMsg)
send({
  action: 'worker-init'
})
