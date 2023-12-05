/**
 * fs in child process
 */

import { fs } from '../../demo/fs-fake.js'

export default function handleFs (ws, msg) {
  const { id, args, func } = msg
  const data = fs[func](...args)
  ws.send({
    id,
    data
  }, false)
}
