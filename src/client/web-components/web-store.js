/**
 * central state store powered by manate - https://github.com/tylerlong/manate
 */

import { manage } from 'manate'
import initState from '../electerm-react/store/init-state'
import { StateStore } from '../electerm-react/store/store.js'
import { settingMap } from '../electerm-react/common/constants'
import { defaultTheme } from '../electerm-react/common/theme-defaults'
import { refs } from '../electerm-react/components/common/ref'
import {
  echoToTerminalWith,
  clearTerminalWith,
  typeInTerminalWith,
  stopTypingWith
} from './terminal-echo.js'

// Id under which setThemeConfig() parks an ad-hoc palette so the rest of the
// app (which keys off store.config.theme) treats it like any built-in theme.
const CUSTOM_THEME_ID = 'custom'

class Store extends StateStore {
  constructor () {
    super()
    Object.assign(
      this,
      initState,
      {
        height: window.innerHeight
      }
    )
  }

  // Apply an arbitrary terminal + UI color palette. The given configs are
  // merged onto the built-in default theme (so partial configs still render),
  // then registered as a first-class theme entry and made active. This drives
  // the live terminal colors and UI theme exactly like picking a built-in
  // theme does, because getThemeConfig()/getUiThemeConfig() resolve the active
  // id against the same theme list. Exposed for the iframe control bridge.
  setThemeConfig (themeConfig = {}, uiThemeConfig = {}) {
    const store = window.store
    const base = defaultTheme()
    const merged = {
      id: CUSTOM_THEME_ID,
      name: 'Custom',
      themeConfig: Object.assign({}, base.themeConfig, themeConfig),
      uiThemeConfig: Object.assign({}, base.uiThemeConfig, uiThemeConfig)
    }
    const exists = store
      .getItems(settingMap.terminalThemes)
      .some(t => t.id === CUSTOM_THEME_ID)
    if (exists) {
      store.editItem(CUSTOM_THEME_ID, merged, settingMap.terminalThemes)
    } else {
      store.addItem(merged, settingMap.terminalThemes)
    }
    store.setConfig({ theme: CUSTOM_THEME_ID })
    return merged
  }

  // Return the currently active theme object ({ id, name, themeConfig,
  // uiThemeConfig }). Exposed for the iframe control bridge.
  getTheme () {
    const store = window.store
    const all = store.getSidebarList(settingMap.terminalThemes)
    return all.find(t => t.id === store.config.theme) ||
      { id: store.config.theme }
  }

  // Write text straight to the active terminal display (no execution).
  // echoToTerminal('hello') or echoToTerminal('hello', { tabId })
  // Logic lives in terminal-echo.js so node --test can cover it.
  getTerm (tabId) {
    const tid = tabId || window.store?.activeTabId
    return (tid && refs.get('term-' + tid)) || null
  }

  echoToTerminal (text = '', opts) {
    return echoToTerminalWith(
      { refsObj: refs, activeTabId: window.store?.activeTabId },
      text,
      opts
    )
  }

  clearTerminal (tabId) {
    return clearTerminalWith(
      { refsObj: refs, activeTabId: window.store?.activeTabId },
      tabId
    )
  }

  // Hacker-terminal typing effect in the current terminal.
  // typeInTerminal('whoami', { cps: 60, enter: true })
  //   cps: chars per second (default 120)
  //   enter: send Enter at the end so the fake shell executes it (default false)
  //   newline: append newline to display output (display mode only, default false)
  //   mode: 'display' writes to screen only, 'input' types into shell input
  //   tabId: target tab, defaults to active tab
  // A new call cancels a previous in-flight typing.
  // Logic lives in terminal-echo.js so node --test can cover it.
  async typeInTerminal (text = '', opts) {
    return typeInTerminalWith(
      { refsObj: refs, activeTabId: window.store?.activeTabId, state: this },
      text,
      opts
    )
  }

  stopTyping () {
    return stopTypingWith(this)
  }
}

const store = manage(new Store())

window.store = store
export default store
