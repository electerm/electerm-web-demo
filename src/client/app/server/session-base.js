/**
 * terminal/sftp/serial class
 */
import uid from '../common/uid.js'
import { isEmpty } from 'lodash-es'

export class TerminalBase {
  constructor (initOptions, ws, isTest) {
    this.type = initOptions.termType || initOptions.type
    this.pid = initOptions.uid || uid()
    this.initOptions = initOptions
    if (ws) {
      this.ws = ws
    }
    if (isTest) {
      this.isTest = isTest
    }
  }

  toggleTerminalLogTimestamp () {
    this.initOptions.addTimeStampToTermLog = !this.initOptions.addTimeStampToTermLog
  }

  toggleTerminalLog () {

  }

  onEndConn () {
    const inst = self.sessions[
      this.initOptions.sessionId
    ]
    if (!inst) {
      return
    }
    delete inst.sftps[this.pid]
    delete inst.terminals[this.pid]
    if (this.server && this.server.end) {
      this.server.end()
    }
    if (
      isEmpty(inst.sftps) &&
      isEmpty(inst.terminals)
    ) {
      this.endConns && this.endConns()
      delete self.sessions[
        this.initOptions.sessionId
      ]
    }
  }
}
