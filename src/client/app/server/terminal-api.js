/**
 * run cmd with terminal
 */

import { terminals } from './remote-common.js'
import { terminal, testConnection } from './session.js'

export function runCmd (ws, msg) {
  const { id, pid, sessionId, cmd } = msg
  const term = terminals(pid, sessionId)
  let txt = ''
  if (term) {
    txt = term.runCmd(cmd)
  }
  console.log('msg', msg)
  ws.send({
    id,
    data: txt
  }, false)
}

export function resize (ws, msg) {
  const { id, pid, sessionId, cols, rows } = msg
  const term = terminals(pid, sessionId)
  if (term) {
    term.resize(cols, rows)
  }
  ws.send({
    id,
    data: 'ok'
  }, false)
}

export function toggleTerminalLog (ws, msg) {
  const { id, pid, sessionId } = msg
  const term = terminals(pid, sessionId)
  if (term) {
    term.toggleTerminalLog()
  }
  ws.send({
    id,
    data: 'ok'
  }, false)
}

export function toggleTerminalLogTimestamp (ws, msg) {
  const { id, pid, sessionId } = msg
  const term = terminals(pid, sessionId)
  if (term) {
    term.toggleTerminalLogTimestamp()
  }
  ws.send({
    id,
    data: 'ok'
  }, false)
}

export function createTerm (ws, msg) {
  const { id, body } = msg
  const data = terminal(body, ws)
  ws.send({
    id,
    data: data.pid
  }, false)
}

export function testTerm (ws, msg) {
  const { id, body } = msg
  const data = testConnection(body)
  ws.send({
    id,
    data
  }, false)
}
