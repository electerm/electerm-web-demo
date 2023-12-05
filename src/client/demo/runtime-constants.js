import pack from '../../../package.json'
import { resolve } from '../web-components/path'
export const home = '/home/electerm'
export const sshKeysPath = resolve(
  home,
  '.ssh'
)
export const isWin = false
export const isMac = false
export const isLinux = true
export const isArm = false
export const iconPath = 'public/images/electerm-round-128x128.png'
export const extIconPath = '/icons/'
export const defaultUserName = 'default_user'
export const minWindowWidth = 590
export const minWindowHeight = 400
export const defaultLang = 'en_us'
export const tempDir = '/tmp'
export const homeOrtmp = '/home/electerm'
export const packInfo = pack
