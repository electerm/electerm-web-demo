/**
 * central state store powered by manate - https://github.com/tylerlong/manate
 */

import { manage } from 'manate'
import initState from '../electerm-react/store/init-state'
import { StateStore } from '../electerm-react/store/store.js'
import { settingMap } from '../electerm-react/common/constants'
import { defaultTheme } from '../electerm-react/common/theme-defaults'

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
}

const store = manage(new Store())

window.store = store
export default store
