/**
 * terminal/sftp/serial class
 */
import { TerminalBase } from './session-base.js'
import log from '../common/log.js'
import Pty from './pty.js'
// const { MockBinding } = require('@serialport/binding-mock')
// MockBinding.createPort('/dev/ROBOT', { echo: true, record: true })

class TerminalSerial extends TerminalBase {
  init () {
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

  resize () {

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
    if (this.sessionLogger) {
      this.sessionLogger.destroy()
    }
    this.port && this.port.isOpen && this.port.close()
    delete this.port
    this.onEndConn()
  }
}

export async function terminalSerial (initOptions, ws) {
  const term = new TerminalSerial(initOptions, ws)
  term.init()
  return term
}

/**
 * test ssh connection
 * @param {object} options
 */
export function testConnectionSerial () {
  return true
}
