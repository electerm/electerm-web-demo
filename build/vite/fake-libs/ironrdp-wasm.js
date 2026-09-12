/**
 * Fake ironrdp-wasm for electerm-web-demo.
 * Real ironrdp-wasm is several MB of WASM + glue and needs a live RDP server.
 * Provide the same named exports used by rdp-session.jsx as no-op stubs.
 */

async function fakeDefault () {
  return {}
}

export default fakeDefault

export function setup () {}

class StubBuilder {
  username () { return this }
  password () { return this }
  serverDomain () { return this }
  destination () { return this }
  proxyAddress () { return this }
  authToken () { return this }
  desktopSize () { return this }
  renderCanvas () { return this }
  extension () { return this }
  remoteClipboardChangedCallback () { return this }
  forceClipboardUpdateCallback () { return this }
  setCursorStyleCallbackContext () { return this }
  setCursorStyleCallback () { return this }
  async connect () {
    throw new Error('RDP is disabled in this web demo (no real server)')
  }
}

export class SessionBuilder extends StubBuilder {}
export class DesktopSize {
  constructor (width, height) {
    this.width = width
    this.height = height
  }
}
export class InputTransaction {
  addEvent () {}
}
export class DeviceEvent {
  static keyPressed () { return {} }
  static keyReleased () { return {} }
  static mouseMove () { return {} }
  static mouseButtonPressed () { return {} }
  static mouseButtonReleased () { return {} }
  static wheelRotations () { return {} }
}
export class Extension {
}
export class ClipboardData {
  isEmpty () { return true }
  items () { return [] }
  addText () {}
}
