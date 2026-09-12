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
    remoteMonitorBarEnabled: true,
    // Demo: open the fake SSH bookmark on startup instead of a blank local
    // terminal, so the monitor bar + info panel have a live session.
    // Must live here (not init-data.json) because ...defaultConfig above
    // would overwrite a JSON value with its own onStartSessions: [].
    onStartSessions: ['demo-ssh']
  }
}
