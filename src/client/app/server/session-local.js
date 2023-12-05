/**
 * terminal/sftp/serial class
 */
import Pty from './pty.js'
import log from '../common/log.js'
import {
  isWin
} from '../../demo/runtime-constants.js'
import { TerminalBase } from './session-base.js'

class TerminalLocal extends TerminalBase {
  init () {
    const {
      termType
    } = this.initOptions

    this.term = new Pty()
    this.term.termType = termType
    const { sessionId } = this.initOptions
    self.sessions[sessionId] = {
      id: sessionId,
      sftps: {},
      terminals: {
        [this.pid]: this
      }
    }
    return this
  }

  resize (cols, rows) {
    this.term.resize(cols, rows)
  }

  on (event, cb) {
    this.term.on(event, cb)
  }

  write (data) {
    try {
      this.term.write(data)
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
    if (!isWin) {
      this.term && this.term.kill()
    }
    this.onEndConn()
  }
}

export const terminalLocal = function (initOptions, ws) {
  return (new TerminalLocal(initOptions, ws)).init()
}

/**
 * test ssh connection
 * @param {object} options
 */
export const testConnectionLocal = (initOptions) => {
  return true
}
