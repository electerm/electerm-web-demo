/**
 * UrlActionBridge — run demo actions from the URL hash.
 *
 *   /#act=<base64(JSON)>
 *
 * Any change to the hash re-runs, so demo links / recordings can drive:
 * bookmarks, tabs, layout, AI chat, themes, config — anything that is a
 * window.store method, plus storeAssign/setConfig for raw state.
 *
 * See url-action.js for the full payload protocol + recipes.
 */

import { useEffect } from 'react'
import {
  getActFromLocation,
  runActFromString,
  exposeDemoActionHelpers
} from './url-action'

function waitForStore (timeout = 20000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    function check () {
      const store = window.store
      // configLoaded flips true after initData + openInitSessions
      // (bookmarks loaded, startup tabs opened). Running earlier would e.g.
      // open bookmarks that do not exist yet or get overwritten.
      if (store && store.configLoaded) {
        resolve(store)
        return
      }
      if (Date.now() - start > timeout) {
        // still run against whatever store exists: setConfig/storeAssign
        // work even before data load, better than dropping the action
        if (store) {
          resolve(store)
          return
        }
        reject(new Error('store not ready'))
        return
      }
      setTimeout(check, 200)
    }
    check()
  })
}

export default function UrlActionBridge () {
  useEffect(() => {
    exposeDemoActionHelpers()
    let lastAct = null
    let disposed = false

    async function runIfNeeded (reason) {
      const act = getActFromLocation()
      if (!act || act === lastAct) {
        return
      }
      lastAct = act
      try {
        await waitForStore()
        if (disposed) {
          return
        }
        await runActFromString(act)
      } catch (err) {
        console.log(`[demo-act] failed on ${reason}:`, err)
      }
    }

    // initial load (after store exists)
    runIfNeeded('load')
    // every url change: #act=... assignments, back/forward, paste
    const onHashChange = () => runIfNeeded('hashchange')
    window.addEventListener('hashchange', onHashChange)
    // expose manual re-run for the same-hash case (hashchange does not fire
    // when the value is identical) and for console use
    window.et = window.et || {}
    window.et.rerunDemoAction = () => {
      lastAct = null
      return runIfNeeded('manual')
    }
    return () => {
      disposed = true
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  return null
}
