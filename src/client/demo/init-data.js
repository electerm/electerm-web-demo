import data from './init-data.json'
import defaultConfig from '../electerm-react/common/default-setting'

export default {
  ...data,
  config: {
    ...data.config,
    ...defaultConfig,
    useSystemTitleBar: true,
    // Demo: show the remote monitor bar by default so visitors immediately
    // see the (faked) server info. Real default in default-setting.js stays
    // false; this demo-only override wins because it spreads last.
    remoteMonitorBarEnabled: true
  }
}
