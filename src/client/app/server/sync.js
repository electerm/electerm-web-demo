/**
 * handle sync with github/gitee
 */

export default async function wsSyncHandler (ws, msg) {
  const { id } = msg
  ws.send({
    data: {},
    id
  }, false)
}
