// copy the renderer's client source into src/client/electerm-react, where the
// vite config and the stylus imports expect it.
//
// Uses node:fs rather than shelljs: its `rm -rf` here fails with ENOTEMPTY and
// its `cp -r` took minutes for ~600 files, and a failed rm made the following
// cp nest the copy one level deeper (src/client/electerm-react/client/...).
// rmSync/cpSync are both idempotent and fast.
import { rmSync, cpSync } from 'node:fs'
import { resolve } from 'node:path'

const cwd = process.cwd()
const src = resolve(cwd, 'node_modules/@electerm/electerm-react/client')
const dest = resolve(cwd, 'src/client/electerm-react')

console.log('install required modules')

rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })

console.log('done install required modules')
