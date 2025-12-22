import { config as conf } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import copy from 'json-deep-copy'

conf()

export const cwd = process.cwd()
export const env = process.env
export const isProd = env.NODE_ENV === 'production'
export const isMac = env.PLATFORM === 'darwin'
export const isWin = env.PLATFORM === 'win32'
const packPath = resolve(cwd, 'package.json')
const packData = JSON.parse(readFileSync(packPath).toString())
delete packData.standard
delete packData.files
delete packData.engines
delete packData.type
delete packData.scripts
delete packData.main
export const pack = packData
export const version = pack.version
export const viewPath = resolve(cwd, 'src/client/views')
export const staticPaths = [
  {
    dir: resolve(cwd, 'src/client/statics'),
    path: '/'
  },
  {
    dir: resolve(cwd, 'node_modules/electerm-icons/icons'),
    path: '/icons'
  },
  {
    dir: resolve(cwd, 'node_modules/@electerm/electerm-resource/tray-icons'),
    path: '/images'
  },
  {
    dir: resolve(cwd, 'node_modules/@electerm/electerm-resource/res/imgs'),
    path: '/images'
  }
]

const devPort = env.DEV_PORT || 5580
const devHost = env.DEV_HOST || '127.0.0.1'
const h = `http://${devHost}:${devPort}`

export const base = () => {
  return {
    version: pack.version,
    isDev: !isProd,
    isWebApp: true,
    siteName: pack.name,
    isWin,
    isMac,
    packInfo: pack,
    home: '/home/electerm',
    server: h,
    cdn: h,
    query: {}
  }
}

export const viewData = (d = base()) => {
  return {
    ...d,
    _global: copy(d)
  }
}
