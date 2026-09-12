/**
 * Fake noVNC module for electerm-web-demo.
 * Real @novnc/novnc is ~1MB+ and requires a live VNC server.
 * Demo has no real server, so provide a tiny stub with the same
 * public shape (`RFB` default export) that immediately reports
 * disconnect / shows a demo notice instead of connecting.
 */

class FakeRFB {
  constructor (target, url, opts = {}) {
    this.target = target
    this.url = url
    this.opts = opts
    this._listeners = {}
    // Render a lightweight demo placeholder into the container
    try {
      if (target) {
        target.innerHTML = ''
        const div = document.createElement('div')
        div.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;min-height:200px;color:#888;font-size:14px;text-align:center;padding:40px 20px;'
        div.textContent = 'VNC demo is disabled in this web demo (no real server). Use SSH demo instead.'
        target.appendChild(div)
      }
    } catch (_) {}
    setTimeout(() => this._emit('disconnect', { detail: { clean: true } }), 50)
  }

  addEventListener (type, cb) {
    if (!this._listeners[type]) this._listeners[type] = []
    this._listeners[type].push(cb)
  }

  removeEventListener (type, cb) {
    const arr = this._listeners[type]
    if (!arr) return
    const i = arr.indexOf(cb)
    if (i !== -1) arr.splice(i, 1)
  }

  dispatchEvent (ev) {
    this._emit(ev.type, ev)
    return true
  }

  _emit (type, ev) {
    const arr = this._listeners[type] || []
    for (const cb of arr) {
      try { cb(ev) } catch (_) {}
    }
  }

  disconnect () {}
  sendCredentials () {}
  sendCtrlAltDel () {}
  clipboardPasteFrom () {}
  approveServer () {}
  focus () {}
  blur () {}
}

export default FakeRFB
export { FakeRFB as RFB }
