/**
 * node fetch in server side
 */

export default async function wsFetchHandler (ws, msg) {
  const { id } = msg
  ws.send({
    data: 'v0.0.0',
    id
  }, false)
}
