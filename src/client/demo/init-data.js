import data from './init-data.json'
import defaultConfig from '../electerm-react/common/default-setting'

export default {
  ...data,
  config: {
    ...data.config,
    ...defaultConfig
  }
}
