/**
 * Fake spice-client for electerm-web-demo.
 * Real spice-client pulls in spice-html5 and needs a live SPICE server.
 * Stub the small surface used by spice-session.jsx.
 */

export class SpiceMainConn {
  start () {}
  stop () {}
  destroy () {}
}

export function sendCtrlAltDel () {}

export default {
  SpiceMainConn,
  sendCtrlAltDel
}
