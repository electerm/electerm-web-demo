/**
 * Iframe control bridge (Option B)
 *
 * Lets a parent window drive this store through postMessage. This is the
 * cross-origin-safe alternative to reaching into `iframe.contentWindow.store`
 * directly (which the Same-Origin Policy blocks when parent and iframe differ).
 *
 * Protocol:
 *   parent -> iframe : { source: 'parent-control', type: 'ping' }
 *                      { source: 'parent-control', method, args, id }
 *   iframe  -> parent: { source: 'demo-control', type: 'ready' }
 *                      { source: 'demo-control', id, ok, result|error }
 */

import { useEffect } from 'react'

// safeOrigin is injected by the server-rendered template (window.et.safeOrigin),
// which build/bin/build-pug.js derives from the data passed to the pug views.
// It steers which parent origins may drive this store:
//   '*'              -> allow ANY parent origin (local dev / demo)
//   '*.electerm.org' -> allow electerm.org and any of its subdomains (prod build)
// Falls back to '*' so a dev server that doesn't emit it still works.
const safeOrigin = window.et.safeOrigin || '*'

function isAllowed (origin) {
  // Allow any origin in dev / demo mode.
  if (safeOrigin === '*') {
    return true
  }
  // Production: only the configured host(s) may control the store.
  if (!origin || origin === 'null') {
    return false
  }
  let hostname
  try {
    hostname = new URL(origin).hostname
  } catch (e) {
    return false
  }
  // Treat each entry as a host suffix: '*.electerm.org' permits both the apex
  // (electerm.org) and any subdomain (*.electerm.org), while rejecting
  // look-alikes like 'evilelecterm.org' or 'electerm.org.evil.com'.
  return String(safeOrigin)
    .split(/[\s,]+/)
    .filter(Boolean)
    .some(pattern => {
      const base = pattern.replace(/^\*\./, '')
      return hostname === base || hostname.endsWith('.' + base)
    })
}

export default function IframeControlBridge () {
  useEffect(() => {
    function onMessage (e) {
      const msg = e.data
      if (!msg || msg.source !== 'parent-control') {
        return
      }
      if (!isAllowed(e.origin)) {
        return
      }
      // Parent is probing for readiness -> reply so it can enable controls.
      if (msg.type === 'ping') {
        e.source?.postMessage(
          { source: 'demo-control', type: 'ready' },
          e.origin
        )
        return
      }
      if (!msg.method) {
        return
      }
      const store = window.store
      if (!store) {
        return
      }
      const fn = store[msg.method]
      if (typeof fn !== 'function') {
        e.source?.postMessage(
          {
            source: 'demo-control',
            id: msg.id,
            ok: false,
            error: `store has no method: ${msg.method}`
          },
          e.origin
        )
        return
      }
      try {
        const result = fn.apply(store, msg.args || [])
        e.source?.postMessage(
          { source: 'demo-control', id: msg.id, ok: true, result },
          e.origin
        )
      } catch (err) {
        e.source?.postMessage(
          {
            source: 'demo-control',
            id: msg.id,
            ok: false,
            error: String(err)
          },
          e.origin
        )
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return null
}
