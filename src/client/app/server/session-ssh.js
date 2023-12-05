/**
 * terminal/sftp/serial class
 */

import log from '../common/log.js'
import Pty from './pty.js'
import { TerminalBase } from './session-base.js'
import { commonExtends } from './session-common.js'
import {
  session
} from './remote-common.js'

class TerminalSshBase extends TerminalBase {
  init () {
    const {
      isTest,
      initOptions
    } = this
    const { sessionId } = initOptions
    this.channel = new Pty()
    if (isTest || !sessionId || !self.sessions[sessionId]) {
      this.remoteInitProcess()
    } else {
      this.remoteInitTerminal()
    }
    return this
  }

  async remoteInitProcess () {
    const {
      initOptions,
      shellOpts
    } = this
    self.sessions[initOptions.sessionId] = {
      conn: this.conn,
      id: initOptions.sessionId,
      shellOpts,
      sftps: {},
      terminals: {
        [this.pid]: this
      }
    }
  }

  remoteInitTerminal () {
    const {
      initOptions
    } = this
    const connInst = session(initOptions.sessionId)
    if (initOptions.enableSsh === false) {
      return this
    }
    connInst.terminals[this.pid] = this
  }

  endConns () {
    this.conn && this.conn.end && this.conn.end()
    while (this.conns && this.conns.length) {
      const conn = this.conns.shift()
      conn && conn.end()
    }
  }

  resize (cols, rows) {

  }

  on (event, cb) {

  }

  write (data) {
    try {
      this.channel.write(data)
      if (this.sessionLogger) {
        this.sessionLogger.write(data)
      }
    } catch (e) {
      log.error(e)
    }
  }

  kill () {
    if (this.sessionLogger) {
      this.sessionLogger.destroy()
    }
    this.channel && this.channel.end()
    delete this.channel
    this.onEndConn()
  }
}

const TerminalSsh = commonExtends(TerminalSshBase)

export const terminalSsh = function (initOptions, ws) {
  return (new TerminalSsh(initOptions, ws)).init()
}

/**
 * test ssh connection
 * @param {object} options
 */
export const testConnectionSsh = () => {
  return true
}
