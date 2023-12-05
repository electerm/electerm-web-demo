import { resolve } from 'path'
import pkg from 'shelljs'
import { cwd } from './build-common.js'

const { cp } = pkg

const f1 = resolve(
  cwd,
  'src/client/statics/*'
)
const from0 = resolve(
  cwd,
  'node_modules/vscode-icons/icons'
)
const t1 = resolve(
  cwd,
  'public/'
)
const to2 = resolve(
  cwd,
  'public/icons'
)
const arr = [
  {
    from: f1,
    to: t1
  },
  {
    from: from0,
    to: to2
  }
]

for (const obj of arr) {
  const {
    file, from, to
  } = obj
  if (file) {
    cp(from, to)
  } else {
    cp('-r', from, to)
  }
}
