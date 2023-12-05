/**
 * terminal/sftp/serial class
 */

import Pty from './pty.js'
import { isEmpty } from 'lodash-es'
import { TerminalBase } from './session-base.js'

class TerminalTelnet extends TerminalBase {
  async init () {
    this.port = new Pty()
    if (this.isTest) {
      this.kill()
      return true
    }
    self.sessions[this.initOptions.sessionId] = {
      id: this.initOptions.sessionId,
      sftps: {},
      terminals: {
        [this.pid]: this
      }
    }
  }

  resize (cols, rows) {
  }

  on (event, cb) {
  }

  write (data) {
    try {
      this.port.write(data)
      if (this.sessionLogger) {
        this.sessionLogger.write(data)
      }
    } catch (e) {
      log.error(e)
    }
  }

  kill () {
    this.channel && this.channel.end()
    if (this.sessionLogger) {
      this.sessionLogger.destroy()
    }
    const inst = self.sessions[
      this.initOptions.sessionId
    ]
    if (!inst) {
      return
    }
    delete inst.terminals[this.pid]
    if (
      isEmpty(inst.terminals)
    ) {
      delete self.sessions[
        this.initOptions.sessionId
      ]
    }
  }
}

export const terminalTelnet = function (initOptions, ws) {
  const term = new TerminalTelnet(initOptions, ws)
  term.init()
  return term
}

/**
 * test ssh connection
 * @param {object} options
 */
export const testConnectionTelnet = (options) => {
  return true
}
