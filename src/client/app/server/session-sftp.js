/**
 * terminal/sftp/serial class
 */
import {
  readRemoteFile,
  writeRemoteFile
} from './sftp-file.js'
import { commonExtends } from './session-common.js'
import { TerminalBase } from './session-base.js'

class SftpBase extends TerminalBase {
  connect (initOptions) {
    return this.remoteInitSftp(initOptions)
  }

  remoteInitSftp (initOptions) {
    this.transfers = {}
    const connInst = self.sessions[initOptions.sessionId]
    const {
      conn
    } = connInst
    this.client = conn
    connInst.sftps[this.pid] = this
    return 'ok'
  }

  kill () {
    const keys = Object.keys(this.transfers || {})
    for (const k of keys) {
      const jj = this.transfers[k]
      jj && jj.destroy && jj.destroy()
      delete this.transfers[k]
    }
    this.sftp && this.sftp.end()
    delete this.sftp
    this.onEndConn()
  }

  /**
   * getHomeDir
   *
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * only support linux / mac
   * @return {Promise}
   */
  getHomeDir () {
    return ('/home/electerm')
  }

  /**
   * rmdir
   *
   * @param {String} remotePath
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * only support rm -rf
   * @return {Promise}
   */
  rmdir (remotePath) {
    return (true)
  }

  /**
   * touch a file
   *
   * @param {String} remotePath
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise}
   */
  touch (remotePath) {
    return (true)
  }

  /**
   * cp
   *
   * @param {String} from
   * @param {String} to
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise}
   */
  cp (from, to) {
    return (true)
  }

  /**
   * list remote directory
   *
   * @param {String} remotePath
   * @return {Promise} list
   */
  list (remotePath) {
    const fakeList = [
      {
        filename: 'tmp',
        longname: 'drwxr-xr-x  2 root root 4096 Nov 25 20:17 tmp',
        attrs: {
          size: 4096,
          mtime: 1637854620,
          atime: 1637854620,
          uid: 0,
          gid: 0,
          mode: 16877
        }
      },
      {
        filename: 'dev',
        longname: 'drwxr-xr-x  2 root root 4096 Nov 25 20:17 dev',
        attrs: {
          size: 4096,
          mtime: 1637854620,
          atime: 1637854620,
          uid: 0,
          gid: 0,
          mode: 16877
        }
      },
      {
        filename: 'a.js',
        longname: '-rw-r--r--  1 root root 1024 Nov 25 20:17 a.js',
        attrs: {
          size: 1024,
          mtime: 1637854620,
          atime: 1637854620,
          uid: 0,
          gid: 0,
          mode: 33188
        }
      }
    ]
    const reg = /-/g
    const all = fakeList.map(item => {
      const {
        filename,
        longname,
        attrs: {
          size, mtime, atime, uid, gid, mode
        }
      } = item
      // from https://github.com/jyu213/ssh2-sftp-client/blob/master/src/index.js
      return {
        type: longname.substr(0, 1),
        name: filename,
        size,
        modifyTime: mtime * 1000,
        accessTime: atime * 1000,
        mode,
        rights: {
          user: longname.substr(1, 3).replace(reg, ''),
          group: longname.substr(4, 3).replace(reg, ''),
          other: longname.substr(7, 3).replace(reg, '')
        },
        owner: uid,
        group: gid
      }
    })
    return (all)
  }

  mkdir (remotePath, options = {}) {
    return (true)
  }

  stat (remotePath) {
    // Create a fake stat object with the desired properties
    const fakeStat = {
      mode: 0,
      uid: 0,
      gid: 0,
      size: 0,
      atime: 0,
      mtime: 0,
      isDirectory: false
    }

    // Check if the remotePath matches any of the fake files/folders
    switch (remotePath) {
      case remotePath.includes('dev'):
        // Set the fake stat properties for the Documents folder
        fakeStat.mode = 16877
        fakeStat.uid = 0
        fakeStat.gid = 0
        fakeStat.size = 4096
        fakeStat.atime = 1637854620
        fakeStat.mtime = 1637854620
        fakeStat.isDirectory = true
        break
      case remotePath.includes('tmp'):
        // Set the fake stat properties for the Downloads folder
        fakeStat.mode = 16877
        fakeStat.uid = 0
        fakeStat.gid = 0
        fakeStat.size = 4096
        fakeStat.atime = 1637854620
        fakeStat.mtime = 1637854620
        fakeStat.isDirectory = true
        break
      case remotePath.includes('a.js'):
        // Set the fake stat properties for the a.jpg file
        fakeStat.mode = 33188
        fakeStat.uid = 0
        fakeStat.gid = 0
        fakeStat.size = 1024
        fakeStat.atime = 1637854620
        fakeStat.mtime = 1637854620
        fakeStat.isDirectory = false
        break
      default:
        // Reject the promise with an error message
        break
    }
    return (fakeStat)
  }

  /**
   * readlink
   *
   * @param {String} remotePath
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise} target
   */
  readlink (remotePath) {
    return (remotePath)
  }

  /**
   * realpath
   *
   * @param {String} remotePath
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise} target
   */
  realpath (remotePath) {
    return (remotePath)
  }

  /**
   * lstat
   *
   * @param {String} remotePath
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise} stat
   *  stats.isDirectory()
      stats.isFile()
      stats.isBlockDevice()
      stats.isCharacterDevice()
      stats.isSymbolicLink()
      stats.isFIFO()
      stats.isSocket()
   */
  lstat (remotePath) {
    return this.state(remotePath)
  }

  /**
   * chmod
   *
   * @param {String} remotePath
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise}
   */
  chmod (remotePath, mode) {
    return (remotePath)
  }

  /**
   * rename
   *
   * @param {String} remotePath
   * @param {String} remotePathNew
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise}
   */
  rename (remotePath, remotePathNew) {
    return (remotePath)
  }

  /**
   * rm delete single file
   *
   * @param {String} remotePath
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise}
   */
  rm (remotePath) {
    return (remotePath)
  }

  /**
   * readFile single file
   *
   * @param {String} remotePath
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise}
   */
  readFile (remotePath) {
    return readRemoteFile(this.sftp, remotePath)
  }

  /**
   * writeFile single file
   *
   * @param {String} remotePath
   * https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md
   * @return {Promise}
   */
  writeFile (remotePath, str, mode) {
    return writeRemoteFile(this.sftp, remotePath, str, mode)
  }
  // end
}

export const Sftp = commonExtends(SftpBase)
