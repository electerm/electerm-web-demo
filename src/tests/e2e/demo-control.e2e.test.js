import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  encodeDemoAction,
  decodeDemoAction,
  getActFromLocation,
  runActFromString
} from '../../../src/client/web-components/url-action.js'
import {
  echoToTerminalWith,
  typeInTerminalWith,
  clearTerminalWith
} from '../../../src/client/web-components/terminal-echo.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../..')
const read = (p) => readFileSync(resolve(root, p), 'utf8')

function mockTerminal () {
  const writes = []
  return {
    writes,
    term: {
      write (s) { writes.push(s) },
      focus () {}
    }
  }
}

// Build a fake window.store that mirrors what the real app exposes:
// generic demo methods + hacker-terminal methods delegating to terminal-echo.
function buildFakeApp () {
  const term = mockTerminal()
  const refsObj = { get: (k) => (k === 'term-active' ? { term: term.term } : null) }
  const layoutCalls = []
  const events = []
  const store = {
    activeTabId: 'active',
    configLoaded: true,
    async setLayout (v) {
      layoutCalls.push(v)
      return v
    },
    async handleOpenAIPanel () {
      layoutCalls.push('ai')
      return true
    },
    async storeAssign () { return true },
    async echoToTerminal (text, opts) {
      return echoToTerminalWith({ refsObj, activeTabId: 'active' }, text, opts)
    },
    async typeInTerminal (text, opts) {
      return typeInTerminalWith({ refsObj, activeTabId: 'active', state: store }, text, opts)
    },
    async clearTerminal (tabId) {
      return clearTerminalWith({ refsObj, activeTabId: 'active' }, tabId)
    }
  }
  const win = {
    store,
    location: { hash: '', search: '', href: 'https://demo.electerm.org/' },
    history: { replaceState: () => {} },
    dispatchEvent (e) { events.push(e) }
  }
  return { term, store, win, layoutCalls, events }
}

let prevWindow
let prevCustomEvent
beforeEach(() => {
  prevWindow = globalThis.window
  prevCustomEvent = globalThis.CustomEvent
  if (typeof globalThis.CustomEvent === 'undefined') {
    globalThis.CustomEvent = class CustomEvent {
      constructor (type, opts) {
        this.type = type
        this.detail = opts?.detail
      }
    }
  }
})
afterEach(() => {
  if (prevWindow === undefined) {
    delete globalThis.window
  } else {
    globalThis.window = prevWindow
  }
  if (prevCustomEvent === undefined) {
    delete globalThis.CustomEvent
  } else {
    globalThis.CustomEvent = prevCustomEvent
  }
})

describe('e2e: docs + wiring', () => {
  it('ai.txt documents the #act protocol for LLMs', () => {
    const txt = read('src/client/statics/ai.txt')
    for (const needle of [
      '#act=',
      'encodeDemoAction',
      'buildDemoUrl',
      'echoToTerminal',
      'typeInTerminal',
      'clearTerminal',
      'runQuickCommand',
      'parent-control',
      'onSelectBookmark',
      'setLayout'
    ]) {
      assert.ok(txt.includes(needle), `ai.txt missing: ${needle}`)
    }
  })

  it('web-main mounts UrlActionBridge', () => {
    const src = read('src/client/web-components/web-main.jsx')
    assert.ok(src.includes('UrlActionBridge'), 'UrlActionBridge not mounted')
    assert.ok(src.includes('<UrlActionBridge'), 'UrlActionBridge JSX missing')
  })

  it('web-store exposes hacker-terminal methods delegating to terminal-echo', () => {
    const src = read('src/client/web-components/web-store.js')
    for (const m of ['echoToTerminal', 'typeInTerminal', 'clearTerminal', 'stopTyping', 'getTerm']) {
      assert.ok(src.includes(m), `web-store missing ${m}`)
    }
    assert.ok(src.includes('terminal-echo.js'), 'web-store should use terminal-echo.js')
  })

  it('bridge waits for configLoaded and re-runs on hashchange', () => {
    const src = read('src/client/web-components/url-action-bridge.jsx')
    assert.ok(src.includes('configLoaded'), 'bridge should gate on configLoaded')
    assert.ok(src.includes('hashchange'), 'bridge should listen to hashchange')
    assert.ok(src.includes('rerunDemoAction'), 'bridge should expose rerunDemoAction')
  })
})

describe('e2e: full #act URL flow', () => {
  it('hash -> decode -> store call (change layout)', async () => {
    const { win, layoutCalls } = buildFakeApp()
    globalThis.window = win
    const act = encodeDemoAction({ method: 'setLayout', args: ['c2'] })
    win.location.hash = `#act=${act}`
    assert.equal(getActFromLocation(win.location), act)
    const results = await runActFromString(getActFromLocation(win.location), { silent: true })
    assert.equal(results[0].ok, true)
    assert.deepEqual(layoutCalls, ['c2'])
  })

  it('shorthand + batch: layout then AI panel, in order', async () => {
    const { win, layoutCalls } = buildFakeApp()
    globalThis.window = win
    const act = encodeDemoAction({
      actions: [{ setLayout: 'c2' }, { method: 'handleOpenAIPanel', args: [] }]
    })
    win.location.hash = `#act=${act}`
    const results = await runActFromString(getActFromLocation(win.location), { silent: true })
    assert.deepEqual(layoutCalls, ['c2', 'ai'])
    assert.ok(results.every(r => r.ok))
  })

  it('hacker terminal: echo then typed command with enter', async () => {
    const { win, term } = buildFakeApp()
    globalThis.window = win
    const act = encodeDemoAction({
      actions: [
        { method: 'echoToTerminal', args: ['hello hacker'] },
        { method: 'typeInTerminal', args: ['whoami', { cps: 100000, enter: true }] }
      ]
    })
    win.location.hash = `#act=${act}`
    const payload = decodeDemoAction(getActFromLocation(win.location))
    const results = await runActFromString(act, { silent: true })
    assert.equal(payload.actions.length, 2)
    assert.ok(results.every(r => r.ok))
    // echo writes whole string at once, typing writes char-by-char + CRLF for enter
    assert.ok(term.writes.includes('hello hacker'))
    for (const ch of 'whoami') {
      assert.ok(term.writes.includes(ch), `missing typed char ${ch}`)
    }
    assert.ok(term.writes.includes('\r\n'))
  })

  it('bridge dedupe: same hash does not re-run, new hash does', async () => {
    const { win, layoutCalls } = buildFakeApp()
    globalThis.window = win
    let lastAct = null
    let runs = 0
    async function runIfNeeded () {
      const act = getActFromLocation(win.location)
      if (!act || act === lastAct) {
        return
      }
      lastAct = act
      runs++
      await runActFromString(act, { silent: true })
    }
    const act1 = encodeDemoAction({ method: 'setLayout', args: ['c2'] })
    win.location.hash = `#act=${act1}`
    await runIfNeeded()
    await runIfNeeded() // same hash -> no-op
    assert.equal(runs, 1)
    const act2 = encodeDemoAction({ method: 'setLayout', args: ['c1'] })
    win.location.hash = `#act=${act2}`
    await runIfNeeded()
    assert.equal(runs, 2)
    assert.deepEqual(layoutCalls, ['c2', 'c1'])
  })

  it('unknown method reports ok:false without breaking batch', async () => {
    const { win, layoutCalls } = buildFakeApp()
    globalThis.window = win
    const results = await runActFromString(encodeDemoAction({
      actions: [
        { method: 'noSuchMethod', args: [] },
        { method: 'setLayout', args: ['c2'] }
      ]
    }), { silent: true })
    assert.equal(results[0].ok, false)
    assert.match(results[0].error, /no method/)
    assert.equal(results[1].ok, true)
    assert.deepEqual(layoutCalls, ['c2'])
  })
})
