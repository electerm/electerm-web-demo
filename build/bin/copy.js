/**
 * copy the things vite does not build: statics and the electerm-icons set
 *
 * Every copy here has to be idempotent. `cp -r src dst` copies src *into* dst
 * when dst already exists, so copying `node_modules/electerm-icons/icons` onto
 * `public/icons` gave `public/icons/icons/*.svg` on the second build and every
 * `extIconPath` url (`/icons/<name>.svg`) 404'd. Directory targets are
 * therefore emptied before they are filled, and statics are copied entry by
 * entry.
 *
 * Difference from upstream electerm-web: this build has no server side, so
 * there is no `dist/` and no pug views. The vite output and the statics both
 * land in `public/`, so statics are copied into the root of it (per entry —
 * `public/` itself must never be emptied) while icons own `public/icons`
 * alone and can be cleared.
 */
import { basename, resolve } from 'path'
import {
  cpSync,
  mkdirSync,
  readdirSync,
  rmSync
} from 'fs'
import { cwd } from './build-common.js'

const out = resolve(cwd, 'public')
const statics = resolve(cwd, 'src/client/statics')

const dirCopies = [
  // served at /icons/<name>.svg, target is ours alone, so clearing it is safe
  {
    from: resolve(cwd, 'node_modules/electerm-icons/icons'),
    to: resolve(out, 'icons')
  }
]

for (const { from, to } of dirCopies) {
  rmSync(to, {
    recursive: true,
    force: true
  })
  cpSync(from, to, {
    recursive: true
  })
}

mkdirSync(out, {
  recursive: true
})
for (const name of readdirSync(statics)) {
  cpSync(resolve(statics, name), resolve(out, basename(name)), {
    recursive: true
  })
}
