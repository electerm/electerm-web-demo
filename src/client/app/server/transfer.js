/**
 * transfer class
 */

import { throttle } from 'lodash-es'
import log from '../common/log.js'

export class Transfer {
  constructor ({
    remotePath,
    localPath,
    options = {},
    id,
    type = 'download',
    sftp,
    sftpId,
    sessionId,
    ws
  }) {
    this.id = id
    const isd = type === 'download'
    this.sftpId = sftpId
    this.sessionId = sessionId
    this.srcPath = isd ? remotePath : localPath
    this.dstPath = !isd ? remotePath : localPath
    this.pausing = false

    this.onData = throttle((count) => {
      ws.send({
        id: 'transfer:data:' + id,
        data: count
      }, false)
    }, 3000)

    this.ws = ws
    this.fastXfer(options, type)
  }

  fastXfer = () => {
    this.onEnd()
  }

  onEnd = (id = this.id, ws = this.ws) => {
    ws.send({
      id: 'transfer:end:' + id,
      data: null
    }, false)
  }

  onError = (err = '', id = this.id, ws = this.ws) => {
    if (!err) {
      return this.onEnd()
    }
    ws && ws.send({
      wid: 'transfer:err:' + id,
      error: {
        message: err.message,
        stack: err.stack
      }
    }, false)
  }

  pause = () => {
    this.pausing = true
  }

  resume = () => {
    this.pausing = false
  }

  destroy = () => {
    if (this.src && this.srcHandle) {
      this.src.close(this.srcHandle, log.error)
    }
    if (this.dst && this.dstHandle) {
      this.dst.close(this.dstHandle, log.error)
    }
    this.ws.close()
  }

  // end
}

export const transferKeys = [
  'pause',
  'resume',
  'destroy'
]
