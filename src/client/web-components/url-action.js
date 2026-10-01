/**
 * URL-driven demo control: #act=<base64>
 *
 * Lets any demo URL drive the app, e.g.
 *   https://demo.electerm.org/#act=<base64(JSON)>
 *
 * Payload shapes (all supported, single or batched):
 *   { "method": "setLayout", "args": ["c2"] }
 *   { "action": "setLayout", "args": ["c2"] }          // alias
 *   { "action": "setLayout", "params": ["c2"] }        // alias
 *   { "setLayout": "c2" }                              // shorthand: key = store method
 *   { "setConfig": { "language": "zh_cn" } }           // shorthand, non-array value = single arg
 *   [ {...}, {...} ]                                   // batch array
 *   { "actions": [{...}, {...}], "clearHash": true }   // batch object
 *
 * Common demo recipes (encode with encodeDemoAction / window.et.encodeDemoAction):
 *   open bookmark:      { "method": "onSelectBookmark", "args": ["demo-ssh"] }
 *   open many:          { "method": "openBookmarks", "args": [["demo-ssh"]] }
 *   create bookmark:    { "method": "addItem", "args": [{ "id": "tmp1", "title": "tmp", "host": "1.2.3.4", "username": "root" }, "bookmarks"] }
 *   change layout:      { "method": "setLayout", "args": ["c2"] }
 *   open AI chat:       { "method": "handleOpenAIPanel", "args": [] }
 *   toggle info panel:  { "method": "toggleInfoPanel", "args": [] }
 *   change any data:    { "method": "storeAssign", "args": [{ "rightPanelVisible": true }] }
 *   change config:      { "method": "setConfig", "args": [{ "theme": "defaultLight" }] }
 *   batch:              { "actions": [{ "method": "setLayout", "args": ["c2"] }, { "method": "handleOpenAIPanel", "args": [] }] }
 *   hacker echo:        { "method": "echoToTerminal", "args": ["hello hacker"] }
 *   hacker typing:      { "method": "typeInTerminal", "args": ["whoami", { "cps": 60, "enter": true }] }
 *                       { "method": "typeInTerminal", "args": ["ls", { "mode": "input", "enter": true }] }
 *   clear/stop typing:  { "method": "clearTerminal", "args": [] } / { "method": "stopTyping", "args": [] }
 *
 * Full LLM-oriented docs live in src/client/statics/ai.txt (served as /ai.txt).
 *
 * Any window.store method works (see src/client/electerm-react/store/*.js),
 * so this covers bookmarks, tabs, layout, AI chat, themes, config, everything.
 */

function b64EncodeUtf8 (str) {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(unescape(encodeURIComponent(str)))
  }
  // node / test fallback
  return Buffer.from(str, 'utf8').toString('base64')
}

function b64DecodeUtf8 (b64) {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return decodeURIComponent(escape(window.atob(b64)))
  }
  return Buffer.from(b64, 'base64').toString('utf8')
}

export function encodeDemoAction (obj) {
  const json = JSON.stringify(obj)
  return b64EncodeUtf8(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function decodeDemoAction (str = '') {
  let s = String(str || '').trim()
  if (!s) {
    throw new Error('empty act')
  }
  // allow pasting a full URL / hash fragment by accident
  const m = s.match(/[#?&]act=([^&#]*)/)
  if (m) {
    s = m[1]
  }
  try {
    s = decodeURIComponent(s)
  } catch (e) {
    // not URI-encoded, keep as is
  }
  // url-safe -> standard
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  // restore padding
  const pad = s.length % 4
  if (pad) {
    s += '='.repeat(4 - pad)
  }
  let json = ''
  try {
    json = b64DecodeUtf8(s)
  } catch (e) {
    // fallback: maybe it was plain (non-base64) JSON for debuggability
    throw new Error('invalid base64 act: ' + e.message)
  }
  try {
    return JSON.parse(json)
  } catch (e) {
    throw new Error('act is not JSON: ' + e.message)
  }
}

export function buildDemoUrl (obj, base) {
  const act = encodeDemoAction(obj)
  const b = base || (typeof window !== 'undefined' ? window.location.href.split('#')[0] : '')
  return `${b}#act=${act}`
}

// { setLayout: 'c2' } -> { method: 'setLayout', args: ['c2'] }
// { setLayout: ['c2'] } -> { method: 'setLayout', args: ['c2'] }
function fromShorthand (obj) {
  const keys = Object.keys(obj)
  const reserved = new Set(['method', 'action', 'args', 'params', 'actions', 'actionList', 'list', 'delay', 'wait', 'waitBefore', 'clearHash', 'clear'])
  const actionKeys = keys.filter(k => !reserved.has(k))
  if (actionKeys.length === 1) {
    const method = actionKeys[0]
    const v = obj[method]
    const args = Array.isArray(v) && obj.args === undefined && obj.params === undefined
      ? v
      : [v]
    return {
      method,
      args,
      delay: obj.delay ?? obj.wait ?? obj.waitBefore ?? 0
    }
  }
  return null
}

function normalizeOne (item) {
  if (!item || typeof item !== 'object') {
    throw new Error('each action must be an object')
  }
  const delay = item.delay ?? item.wait ?? item.waitBefore ?? 0
  if (typeof item.method === 'string' && item.method) {
    const args = item.args !== undefined ? item.args : (item.params !== undefined ? item.params : [])
    return {
      method: item.method,
      args: Array.isArray(args) ? args : [args],
      delay
    }
  }
  if (typeof item.action === 'string' && item.action) {
    // guard: { actions: [...] } handled by caller, not here
    const args = item.args !== undefined ? item.args : (item.params !== undefined ? item.params : [])
    return {
      method: item.action,
      args: Array.isArray(args) ? args : [args],
      delay
    }
  }
  const short = fromShorthand(item)
  if (short) {
    return short
  }
  throw new Error('invalid action, need {method,args} or {action,args} or {storeMethod: args}: ' + JSON.stringify(item).slice(0, 200))
}

export function normalizeDemoActions (payload) {
  let list = payload
  let clearHash = false
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (Array.isArray(payload.actions)) {
      clearHash = !!(payload.clearHash ?? payload.clear)
      list = payload.actions
    } else if (Array.isArray(payload.actionList)) {
      clearHash = !!(payload.clearHash ?? payload.clear)
      list = payload.actionList
    } else if (Array.isArray(payload.list)) {
      clearHash = !!(payload.clearHash ?? payload.clear)
      list = payload.list
    } else {
      clearHash = !!(payload.clearHash ?? payload.clear)
      // single action object (strip clear flags before normalizing)
      const single = { ...payload }
      delete single.clearHash
      delete single.clear
      // { actions: singleObject }? already handled. Otherwise one call.
      if (single.method || single.action || Object.keys(single).length) {
        list = [single]
      } else {
        throw new Error('empty action')
      }
    }
  }
  if (!Array.isArray(list)) {
    throw new Error('action payload must be an object or array')
  }
  return {
    actions: list.map(normalizeOne),
    clearHash
  }
}

export function getActFromLocation (loc) {
  const l = loc || (typeof window !== 'undefined' ? window.location : null)
  if (!l) {
    return ''
  }
  // hash first: #act=..., #/act=..., #foo=1&act=...
  const hash = String(l.hash || '')
  if (hash) {
    const h = hash.replace(/^#\/?/, '')
    try {
      const params = new URLSearchParams(h)
      const v = params.get('act') || params.get('action')
      if (v) {
        return v
      }
    } catch (e) {
      // fall through to regex
    }
    const m = hash.match(/act=([^&#]*)/)
    if (m) {
      return m[1]
    }
  }
  // fallback: ?act=... query param
  try {
    const sp = new URLSearchParams(String(l.search || ''))
    const v = sp.get('act') || sp.get('action')
    if (v) {
      return v
    }
  } catch (e) {
    // ignore
  }
  return ''
}

function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function runStoreMethod (method, args = []) {
  const store = typeof window !== 'undefined' ? window.store : globalThis.store
  if (!store) {
    throw new Error('store not ready')
  }
  const fn = store[method]
  if (typeof fn !== 'function') {
    throw new Error(`store has no method: ${method}`)
  }
  const res = await fn.apply(store, args || [])
  return res
}

export async function runDemoActions (payload, opts = {}) {
  const { actions, clearHash } = normalizeDemoActions(payload)
  const results = []
  for (const a of actions) {
    if (a.delay && Number(a.delay) > 0) {
      await wait(Number(a.delay))
    }
    try {
      const result = await runStoreMethod(a.method, a.args)
      results.push({ method: a.method, ok: true, result })
      if (!opts.silent && typeof console !== 'undefined') {
        console.log(`[demo-act] ${a.method} ok`, a.args)
      }
    } catch (err) {
      const msg = String((err && err.message) || err)
      results.push({ method: a.method, ok: false, error: msg })
      if (typeof console !== 'undefined') {
        console.log(`[demo-act] ${a.method} failed:`, err)
      }
      if (!opts.continueOnError) {
        // keep going? For demo links, running the rest is usually what you
        // want even if one step fails, so continue by default unless asked.
      }
    }
  }
  if (clearHash && typeof window !== 'undefined') {
    try {
      const url = window.location.href.split('#')[0]
      window.history.replaceState(null, '', url)
    } catch (e) {
      // ignore
    }
  }
  if (typeof window !== 'undefined') {
    window.__demoActionResult = results
    try {
      window.dispatchEvent(new CustomEvent('demo-action-done', { detail: results }))
    } catch (e) {
      // ignore
    }
  }
  return results
}

export async function runActFromString (actStr, opts = {}) {
  const payload = decodeDemoAction(actStr)
  return runDemoActions(payload, opts)
}

export function exposeDemoActionHelpers () {
  if (typeof window === 'undefined') {
    return
  }
  window.et = window.et || {}
  window.et.encodeDemoAction = encodeDemoAction
  window.et.decodeDemoAction = decodeDemoAction
  window.et.buildDemoUrl = buildDemoUrl
  window.et.runDemoAction = runDemoActions
  window.et.runActFromString = runActFromString
}
