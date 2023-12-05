/**
 * central state store powered by manate - https://github.com/tylerlong/manate
 */

import { manage } from 'manate'
import initState from '../electerm-react/store/init-state'
import { StateStore } from '../electerm-react/store/index.js'

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
}

const store = manage(new Store())

window.store = store
export default store
