/**
 * communication between webview and app
 * run functions in seprate process, avoid using electron.remote directly
 */

import { Sftp } from './session-sftp.js'
import {
  sftp,
  transfer,
  onDestroySftp,
  onDestroyTransfer
} from './remote-common.js'
import { Transfer } from './transfer.js'
import fs from './fs.js'
import fetch from './fetch.js'
import sync from './sync.js'
import {
  createTerm,
  testTerm,
  resize,
  runCmd,
  toggleTerminalLog,
  toggleTerminalLogTimestamp
} from './terminal-api.js'
import { runSync } from '../../demo/run-sync.js'

self.upgradeInsts = {}

// for remote sessions
self.sessions = {}

export default function initWs (ws, data) {
  const { url } = ws
  const promote = 'electerm demo terminal $ '
  if (url.includes('/terminals/')) {
    if (data.includes('\r')) {
      let nd = (ws.cache || '') + data
      if (nd.trim() === 'ls') {
        nd += `\r\n\r\nDownlods\r\nDocuments\r\na.jpg\r\n\r\n${promote}`
      } else if (!nd.trim()) {
        nd += `\r\n${promote}`
      } else {
        nd += `\r\nOnly support ls command\r\n${promote}`
      }
      ws.cache = ''
      ws._send(nd, false)
    } else {
      ws.cache = (ws.cache || '') + data
    }
    return
  }

  const msg = data.data ? JSON.parse(data.data) : JSON.parse(data || '{}')
  // console.log('msg', msg, msg.id)
  // sftp function
  if (url.includes('/sftp/')) {
    const { action } = msg
    if (action === 'sftp-new') {
      const { id, sessionId } = msg
      sftp(id, sessionId, new Sftp({
        uid: id,
        sessionId,
        type: 'sftp'
      }))
    } else if (action === 'sftp-func') {
      const { id, args, func, sessionId } = msg
      const uid = func + ':' + id
      const inst = sftp(id, sessionId)
      if (inst) {
        const data = inst[func](...args)
        ws.send({
          id: uid,
          data
        }, false)
      }
    } else if (action === 'sftp-destroy') {
      const { id, sessionId } = msg
      ws.close()
      onDestroySftp(id, sessionId)
    }
    // end
  }

  // transfer function
  if (url.includes('/transfer/')) {
    const { action } = msg

    if (action === 'transfer-new') {
      const { sftpId, id, sessionId } = msg
      const opts = Object.assign({}, msg, {
        sftp: sftp(sftpId, sessionId).sftp,
        sftpId,
        sessionId,
        ws
      })
      transfer(id, sftpId, sessionId, new Transfer(opts))
    } else if (action === 'transfer-func') {
      const { id, func, args, sftpId, sessionId } = msg
      if (func === 'destroy') {
        return onDestroyTransfer(id, sftpId, sessionId)
      }
      transfer(id, sftpId, sessionId)[func](...args)
    }
    // end
  }

  // upgrade todo

  // common functions
  if (url.includes('/common/')) {
    const { action } = msg
    if (action === 'fetch') {
      fetch(ws, msg)
    } else if (action === 'sync') {
      sync(ws, msg)
    } else if (action === 'fs') {
      fs(ws, msg)
    } else if (action === 'create-terminal') {
      createTerm(ws, msg)
    } else if (action === 'test-terminal') {
      testTerm(ws, msg)
    } else if (action === 'resize-terminal') {
      resize(ws, msg)
    } else if (action === 'toggle-terminal-log') {
      toggleTerminalLog(ws, msg)
    } else if (action === 'toggle-terminal-log-timestamp') {
      toggleTerminalLogTimestamp(ws, msg)
    } else if (action === 'run-cmd') {
      runCmd(ws, msg)
    } else if (action === 'runSync') {
      runSync(ws, msg)
    }
  }
  // end
}
