/**
 * Hacker-terminal helpers shared by web-store.js and tests.
 *
 * Pure + dependency-injected so `node --test` can exercise the real logic
 * without a browser / vite aliases:
 *   - toCRLF / option normalizers are pure
 *   - echo/clear/type take explicit deps ({ refsObj, getActiveTabId, state })
 * web-store.js thinly wraps them with window-bound deps.
 */

export function toCRLF (s) {
  return String(s ?? '').replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
}

export function normalizeEchoOpts (opts) {
  if (typeof opts === 'string') {
    return { tabId: opts }
  }
  return opts || {}
}

export function normalizeTypeOpts (opts) {
  if (typeof opts === 'number') {
    return { cps: opts }
  }
  return opts || {}
}

export function resolveTermWrapper (refsObj, activeTabId, tabId) {
  const tid = tabId || activeTabId
  if (!tid || !refsObj || typeof refsObj.get !== 'function') {
    return null
  }
  return refsObj.get('term-' + tid) || null
}

function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function echoToTerminalWith (deps, text = '', opts) {
  const { refsObj, activeTabId } = deps || {}
  const { tabId } = normalizeEchoOpts(opts)
  const wrapper = resolveTermWrapper(refsObj, activeTabId, tabId)
  const term = wrapper?.term
  if (!term || typeof term.write !== 'function') {
    throw new Error('no active terminal')
  }
  term.write(toCRLF(text))
  return true
}

export function clearTerminalWith (deps, tabId) {
  const { refsObj, activeTabId } = deps || {}
  const tid = typeof tabId === 'string' ? tabId : undefined
  const wrapper = resolveTermWrapper(refsObj, activeTabId, tid)
  const term = wrapper?.term
  if (!term || typeof term.write !== 'function') {
    throw new Error('no active terminal')
  }
  term.write('\x1b[2J\x1b[H')
  return true
}

export function stopTypingWith (state) {
  const st = state || {}
  st._typeToken = (st._typeToken || 0) + 1
  return true
}

export async function typeInTerminalWith (deps, text = '', opts) {
  const { refsObj, activeTabId, state } = deps || {}
  const o = normalizeTypeOpts(opts)
  const {
    tabId,
    cps = 120,
    enter = false,
    newline = false,
    mode = 'display'
  } = o
  const wrapper = resolveTermWrapper(refsObj, activeTabId, tabId)
  if (!wrapper) {
    throw new Error('no active terminal')
  }
  const str = String(text ?? '')
  const perChar = Math.max(0, Math.floor(1000 / Math.max(1, Number(cps) || 120)))
  const st = state || {}
  const token = (st._typeToken = (st._typeToken || 0) + 1)
  const cancelled = () => st._typeToken !== token
  if (mode === 'input') {
    const send = wrapper.attachAddon?._sendData?.bind(wrapper.attachAddon) ||
      wrapper.runQuickCommand?.bind(wrapper)
    if (!send) {
      throw new Error('terminal input not available')
    }
    for (const ch of str) {
      if (cancelled()) {
        return false
      }
      send(ch === '\n' ? '\r' : ch)
      if (perChar) {
        await delay(perChar)
      }
    }
    if (enter && !cancelled()) {
      send('\r')
    }
    if (typeof wrapper.term?.focus === 'function') {
      wrapper.term.focus()
    }
    return true
  }
  const term = wrapper.term
  if (!term || typeof term.write !== 'function') {
    throw new Error('no active terminal')
  }
  for (const ch of str) {
    if (cancelled()) {
      return false
    }
    term.write(toCRLF(ch))
    if (perChar) {
      await delay(perChar)
    }
  }
  if ((newline || enter) && !cancelled()) {
    term.write('\r\n')
  }
  return true
}
