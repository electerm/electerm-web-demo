export const css = `.highlight {
  color: #ef476f;
}
.context-menu {
  position: absolute;
  width: 280px;
  background: #000;
  box-shadow: 0px 0px 3px 3px rgba(0,0,0,0.35);
  padding: 10px 0;
  z-index: 999;
  -webkit-app-region: no-drag;
  color: #ddd;
}
.context-menu.scroll .context-menu-inner {
  overflow-x: hidden;
  overflow-y: scroll;
}
.context-item {
  -webkit-app-region: no-drag;
  position: relative;
  color: #ddd;
  height: 28px;
  line-height: 28px;
  padding: 0 16px;
}
.context-item:hover {
  background: #000;
  color: #eee;
  cursor: pointer;
}
.context-item.disabled {
  color: rgba(221,221,221,0.85);
}
.context-item.disabled:hover {
  color: #777;
  background: #333;
  cursor: not-allowed;
}
.context-sub-text {
  position: absolute;
  right: 16px;
  top: 0;
  opacity: 0.65;
}
.context-menu hr {
  margin: 0;
  border: none;
  border-bottom: 1px solid #2e3338;
}
.sub-context-menu {
  display: none;
  width: 200px;
  position: absolute;
  left: 100%;
  top: 0;
  background: #000;
  box-shadow: 0px 0px 3px 3px rgba(20,19,20,0.35);
  max-height: 300px;
  overflow-y: scroll;
}
.with-sub-menu:hover .sub-context-menu {
  display: block;
}
.sub-context-menu-item {
  cursor: pointer;
  padding: 10px 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.sub-context-menu-item:hover,
.sub-context-menu-item.active {
  background-color: #08c;
  color: #fff;
}
.bookmarks-sub-context-menu {
  width: 380px;
  padding: 20px 10px 10px 20px;
}
.menu-control {
  width: 28px;
  height: 28px;
  border-radius: 30px;
  color: #ddd;
  font-size: 16px;
  text-align: center;
  display: inline-block;
  line-height: 28px;
  cursor: pointer;
  opacity: 0.6;
}
.menu-control:hover {
  opacity: 1;
}
.is-main .menu-control img {
  border: 1px solid #888;
  border-radius: 28px;
  background: #000;
}
.main-footer {
  background: #141314;
  height: 36px;
  position: absolute;
  left: 43px;
  right: 0;
  bottom: 0;
  color: #ddd;
  z-index: 200;
}
.pinned .main-footer,
.pinned .qm-wrap-tooltip {
  left: 343px;
}
.terminal-footer-unit {
  margin-left: 10px;
  line-height: 34px;
}
.terminal-footer-unit textarea.ant-input {
  min-height: 26px;
  height: 26px;
  margin-bottom: -2px;
  resize: none;
}
.terminal-footer-unit textarea.ant-input::-webkit-scrollbar {
  width: 0;
}
.terminal-footer-info {
  margin-right: 10px;
  line-height: 39px;
}
.upgrade-panel {
  position: fixed;
  right: 10px;
  bottom: 10px;
  z-index: 9999;
  background: #141314;
  color: #ddd;
  box-shadow: 0px 0px 5px 5px rgba(20,19,20,0.25);
  padding: 0;
  width: 440px;
}
.close-upgrade-panel {
  position: absolute;
  right: 5px;
  top: 8px;
}
.close-upgrade-panel:hover {
  color: #06d6a0;
}
.upgrade-panel-title {
  border-bottom: 1px solid #000;
}
.common-err-desc:hover {
  text-overflow: clip;
  overflow-x: hidden;
  white-space: pre;
  max-height: 300px;
  overflow: scroll;
}
.error-wrapper {
  background: #2e3338;
  height: 100%;
  position: fixed;
  color: #ddd;
}
.init-wrap,
.loading-data {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #2e3338;
}
.loading-data {
  text-align: center;
  font-size: 30px;
  color: #ddd;
  padding: 50px;
  z-index: 210;
}
.loading-data .ant-tag {
  border-radius: 3px;
  padding: 4px;
  font-size: 14px;
}
.qm-wrap-tooltip {
  background: #141314;
  position: absolute;
  left: 43px;
  right: 0;
  color: #ddd;
  z-index: 200;
  height: auto;
  bottom: 36px;
  background: rgba(0,0,0,0.9);
}
.type-tab-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: #888;
  display: none;
}
.type-tab {
  display: inline-block;
  vertical-align: middle;
  line-height: 30px;
  color: #888;
  padding: 0 20px 0 0;
  margin-right: 0px;
  font-size: 14px;
  cursor: pointer;
}
.type-tab:hover,
.type-tab.active {
  color: #ddd;
}
.type-tab.active .type-tab-line {
  display: inline-block;
}
.is-transporting .type-tab.sftp .type-tab-line {
  display: inline-block;
  background: linear-gradient(to right, #06d6a0 0%, #141314 25%, #ef476f 50%, #08c 75%, #06d6a0 100%);
  animation: rotate 60s infinite linear;
}
.spliter {
  color: #ddd;
  font-size: 16px;
}
.spliter:hover {
  color: #fff;
}
.no-sessions {
  background: #000;
  text-align: center;
  padding: 50px 0;
}
.list-item-edit,
.list-item-apply,
.list-item-remove {
  display: none;
  width: 24px;
  line-height: 35px;
  text-align: center;
}
.item-list-unit {
  display: flex;
  position: relative;
  margin-bottom: 1px;
  cursor: pointer;
  line-height: 1.8;
}
.item-list-unit cu,
.item-list-unit.active {
  background: #08c;
  color: #fff;
}
.item-list-unit.current {
  font-weight: bold;
}
.item-list-unit:hover {
  background: #005f8f;
  color: #fff;
}
.item-list-unit:hover .list-item-apply,
.item-list-unit:hover .list-item-edit,
.item-list-unit:hover .list-item-remove {
  display: block;
}
.setting-wrap {
  color: #ddd;
}
.close-setting-wrap {
  position: absolute;
  left: 20px;
  top: 70px;
  font-size: 16px;
  color: #ddd;
  cursor: pointer;
  z-index: 889;
}
.close-setting-wrap:hover {
  color: #ddd;
}
.sync-control-link {
  color: #08c;
}
.sync-control-link:hover {
  color: #fff;
}
.sftp-item {
  position: relative;
  z-index: 3;
  padding: 0;
  line-height: 26px;
  height: 32px;
  user-select: none;
  margin-bottom: 4px;
}
.sftp-item:nth-child(even) .sftp-file-prop {
  background: #141314;
}
.sftp-item:hover .sftp-file-prop {
  background-color: #08c;
  color: #fff;
}
.sftp-item.selected .sftp-file-prop {
  background-color: #005f8f;
  color: #fff;
}
.sftp-history {
  position: absolute;
  left: 0;
  top: 100%;
  right: 0;
  z-index: 30;
  box-shadow: none;
  border: none;
  height: 0;
  background: #141314;
  overflow: hidden;
  border-radius: 3px;
}
.sftp-history.focused {
  height: auto;
  border: 1px solid #000;
  box-shadow: 0px 0px 3px 3px rgba(20,19,20,0.05);
}
.sftp-history-item {
  padding: 5px 10px;
  cursor: pointer;
  border-bottom: 1px solid #08c;
}
.sftp-history-item:hover {
  background: #000;
}
.sftp-status-success {
  color: #06d6a0;
}
.sftp-status-exception {
  color: #ef476f;
}
.sftp-status-active {
  color: #08c;
}
.sftp-sort-btn {
  color: #ddd;
}
.sftp-sort-btn.active {
  font-weight: bold;
  color: #fff;
}
.sftp-file-prop {
  height: 32px;
  line-height: 30px;
  position: absolute;
  left: 0;
  width: 100px;
  padding: 0 5px;
  background: #141314;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  pointer-events: none;
  cursor: default;
  z-index: 4;
  color: #ddd;
}
.sftp-file-prop:last-child {
  right: 0 !important;
  width: auto !important;
}
.sftp-header-item {
  height: 28px;
  line-height: 25px;
  position: absolute;
  left: 0;
  width: 100px;
  border: 1px solid #141314;
  border-right: none;
  padding: 0 5px;
  background: #141314;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #ddd;
}
.sftp-header-item:last-child {
  border-right: 1px solid #141314;
  right: 0 !important;
  width: auto !important;
}
.sftp-header-item.desc {
  background: linear-gradient(to bottom, #000 0%, #2e3338 100%);
}
.sftp-header-item.asc {
  background: linear-gradient(to bottom, #2e3338 0%, #000 100%);
}
.sftp-item.sftp-dragover .sftp-file-prop {
  background: #08c !important;
  color: #fff !important;
}
.sftp-item.sftp-dragover-multi:after,
.sftp-item.sftp-dragover-multi:before {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 100%;
  height: 100%;
  background: #2e3338;
  content: '';
  z-index: -1;
}
.sftp-item.sftp-dragover-multi:after {
  left: 4px;
  top: 4px;
}
.sftp-panel {
  background: #141314;
  color: #ddd;
}
.file-list ::-webkit-scrollbar-thumb {
  background-color: #08c !important;
}
.transfer-tag {
  color: #ddd;
  border-radius: 2px;
  padding: 0 2px;
}
.transfer-status-init {
  color: #08c;
}
.transfer-status-started {
  color: #06d6a0;
}
.transfer-status-error {
  color: #ef476f;
}
.transports-wrap {
  position: absolute;
  left: 60px;
  top: 3px;
  right: 60px;
  height: 36px;
  color: #ddd;
}
.transports-circle-wrap {
  text-align: center;
  position: relative;
  z-index: 10;
}
.transports-dd {
  position: absolute;
  left: 0;
  right: 0;
  overflow-y: scroll;
  z-index: 11;
  background: #141314;
  box-shadow: 0px 0px 3px 3px rgba(20,19,20,0.5);
}
.transports-title {
  border-bottom: 1px solid #08c;
  padding: 10px 15px;
}
.sftp-transport {
  display: flex;
  padding: 8px 5px;
}
.sftp-transport:hover {
  background: #000;
}
.sftp-transport .transfer-control-icon:hover {
  color: #08c;
}
.transports-count {
  color: #ddd;
}
.morph-shape {
  background: linear-gradient(45deg, #08c 0%, #06d6a0 100%);
  animation: morph 8s ease-in-out infinite;
  border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
  transition: all 1s ease-in-out;
  z-index: 5;
}
.info-modal .ant-modal-header {
  border: none;
}
.info-modal .ant-modal-body {
  padding: 52px;
  padding-top: 0;
}
.sidebar-panel {
  position: absolute;
  left: 43px;
  top: 46px;
  bottom: 36px;
  z-index: 200;
  width: 0;
  overflow-y: scroll;
  background: #2e3338;
  color: #ddd;
}
.sidebar-panel .item-list-unit:hover .list-item-remove {
  display: none !important;
}
.sidebar {
  position: absolute;
  left: 0;
  top: 0;
  width: 36px;
  z-index: 100;
  bottom: 0;
  background: #000;
  box-shadow: 0px 0px 3px 3px rgba(20,19,20,0.1);
}
.sidebar .item-list {
  padding-right: 0;
}
.control-icon-text {
  color: #ddd;
}
.control-icon-text:hover {
  color: #fff;
}
.control-icon-wrap {
  padding: 14px 0;
  text-align: center;
}
.control-icon-wrap.active .control-icon {
  color: #fff;
}
.control-icon-wrap .control-icon {
  color: #888;
  cursor: pointer;
}
.control-icon-wrap .control-icon:hover {
  color: #fff;
}
.sidebar-list .pinned {
  color: #06d6a0;
}
.sidebar-list .pinned:hover {
  color: #06d6a0;
}
.btns {
  background: #000;
  border-color: #08c;
}
.btns .open-about-icon {
  color: #888;
}
.btns .open-about-icon:hover {
  color: #fff;
}
.btns .upgrade-icon {
  color: #06d6a0;
}
.close-info-modal {
  cursor: pointer;
}
.close-info-modal:hover {
  color: #fff;
}
.tabs {
  position: relative;
  height: 45px;
  overflow: hidden;
  background: #000;
}
.tab {
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  position: relative;
  min-width: 100px;
  max-width: 200px;
  line-height: 36px;
  margin: 10px 1px 0 0;
  border-radius: 3px 3px 0 0;
  background: #000;
  text-align: center;
  color: #888;
}
.tab.tab-last {
  margin-right: 5px;
}
.tab .tab-reload,
.tab .tab-close {
  display: none;
}
.tab.active {
  color: #ddd;
  background: #141314;
}
.tab:hover .tab-close {
  display: block;
}
.tab.dragover-tab::after {
  position: absolute;
  content: '';
  left: -2px;
  top: 0;
  width: 1px;
  border: 1px dashed #888;
  height: 36px;
}
.tab.error .tab-reload {
  display: inline-block;
  color: #fff;
}
.tab-terminal-feed,
.tab-traffic,
.tab-status {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 5px;
  height: 5px;
  border-radius: 5px;
  background-color: #888;
}
.tab-terminal-feed.success,
.tab-traffic.success,
.tab-status.success {
  background-color: #06d6a0;
}
.tab-terminal-feed.error,
.tab-traffic.error,
.tab-status.error {
  background-color: #ef476f;
}
.tab-terminal-feed.processing,
.tab-traffic.processing,
.tab-status.processing {
  background-color: #08c;
}
.tab-traffic {
  display: none;
  left: 10px;
  width: 5px;
  border-radius: 0;
  background-color: #06d6a0;
}
.tab-terminal-feed {
  display: none;
  left: 20px;
  border-radius: 0;
  color: #06d6a0;
  background: none;
  font-size: 8px;
  left: 2px;
  top: 24px;
}
.tab-close {
  position: absolute;
  right: 5px;
  cursor: pointer;
  top: 50%;
  margin-top: -8px;
  background: #888;
  border-radius: 100%;
  color: #ddd;
  height: 16px;
  width: 16px;
  text-align: center;
  line-height: 16px;
  font-size: 10px;
}
.tab-close:hover {
  color: #fff;
}
.tabs-add-btn {
  display: inline-block;
  vertical-align: middle;
  margin: 10px 3px 0 3px;
  -webkit-app-region: no-drag;
  color: #ddd;
}
.tabs-add-btn:hover {
  color: #fff;
}
.tabs-extra {
  position: absolute;
  height: 20px;
  top: 14px;
  right: 96px;
  line-height: 20px;
  z-index: 20;
  -webkit-app-region: no-drag;
}
.tabs-extra .tabs-dd-icon {
  color: #ddd;
  font-size: 12px;
}
.tabs-extra .tabs-add-btn {
  margin-top: 0;
}
.window-controls {
  position: absolute;
  right: 0;
  -webkit-app-region: no-drag;
  top: 0;
  z-index: 200;
  border-radius: 0 0 3px 3px;
  padding: 0;
  background: #2e3338;
}
.window-control-box {
  display: inline-block;
  padding: 5px 10px;
  color: #ddd;
  -webkit-app-region: no-drag;
}
.window-control-box:hover {
  color: #08c;
  cursor: pointer;
}
.window-control-box:hover .icon-maximize {
  border-color: #08c;
}
.icon-maximize {
  width: 10px;
  height: 7px;
  border: 1px solid #ddd;
  cursor: pointer;
}
.icon-maximize.is-max {
  height: 6px;
  position: relative;
}
.icon-maximize.is-max:before {
  position: absolute;
  content: '';
  left: -3px;
  top: 3px;
  width: 8px;
  height: 4px;
  border: 1px solid #ddd;
  border-top: none;
  border-right: none;
}
.control-icon:hover {
  color: #fff;
}
.tab-scroll-icon {
  color: #888;
}
.tab-scroll-icon:hover {
  color: #ddd;
}
.window-controls .window-control-minimize:hover,
.window-controls .window-control-maximize:hover {
  background: #000;
}
.window-controls .window-control-close:hover {
  background: #ef476f;
}
.terminal-info-icon {
  color: #888;
}
.terminal-info-icon:hover {
  color: #ddd;
}
.info-panel-wrap {
  position: fixed;
  right: 0;
  top: 100px;
  bottom: 0;
  width: 500px;
  background: #141314;
  color: #ddd;
  box-shadow: 0px 3px 3px 3px rgba(20,19,20,0.25);
  z-index: 100;
  overflow-y: scroll;
  opacity: 0.9;
}
.terminal-info-section {
  padding: 10px 0;
}
.terminal-info-act,
.terminal-info-disk,
.terminal-info-network {
  max-height: 260px;
  overflow-y: scroll;
}
.theme-item.current {
  border-left: 3px solid #06d6a0;
}
.term-search-opt-icon {
  margin: 0 3px;
  color: #fff;
  font-size: 15px;
}
.term-search-opt-icon:hover {
  color: #ddd;
}
.term-search-opt-icon.term-search-on {
  background: #333;
  color: #aaa;
}
.terms-box {
  background: #141314;
  position: relative;
}
.terminal-control {
  background: #141314;
  line-height: 32px;
  padding: 0 10px;
}
.term-wrap {
  background: #141314;
  position: absolute;
}
.vertical .term-wrap.not-first-term {
  border-top: 1px solid #2e3338;
}
.horizontal .term-wrap.not-first-term {
  border-left: 1px solid #2e3338;
}
.terminal-not-active .xterm-text-layer {
  opacity: 0.74;
}
.terminal-normal-buffer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  background: #141314;
  color: #ddd;
  box-shadow: 0px 3px 3px 0px rgba(221,221,221,0.25);
  z-index: 66;
  padding-bottom: 32px;
}
.terminal-normal-buffer-close {
  cursor: pointer;
  font-size: 14px;
  color: #ddd;
}
.terminal-normal-buffer-close:hover {
  color: #fff;
}
.terminal-normal-buffer-footer {
  position: absolute;
  left: 0;
  top: calc(100% - 32px);
  width: 100%;
  height: 32px;
  line-height: 32px;
  box-shadow: 0px -3px 3px 0px rgba(221,221,221,0.25);
  background: #2e3338;
}
.zmodem-transfer {
  position: absolute;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  background: rgba(0,0,0,0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 20px 180px 20px 20px;
}
body {
  color: #ddd;
  overflow: hidden;
  background: rgba(20,19,20,0.3);
  font-size: 12px;
  line-height: 1.5715;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-variant: tabular-nums;
}
::-webkit-scrollbar {
  background: rgba(20,19,20,0.5);
  width: 7px;
}
::-webkit-scrollbar-thumb {
  background-color: #08c;
  outline: none;
}
a {
  color: #08c;
}
.dialog-file-item {
  padding: 6px 10px;
}
.dialog-file-item:hover {
  background-color: #08c;
  color: #fff;
}
.dialog-file-item.selected {
  background-color: #005f8f;
  color: #fff;
}
@-moz-keyframes morph {
  0% {
    border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
    background: linear-gradient(45deg, #08c 0%, #06d6a0 100%);
  }
  50% {
    border-radius: 30% 60% 70% 40%/50% 60% 30% 60%;
    background: linear-gradient(45deg, #141314 0%, #06d6a0 100%);
  }
  100% {
    border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
    background: linear-gradient(45deg, #08c 0%, #06d6a0 100%);
  }
}
@-webkit-keyframes morph {
  0% {
    border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
    background: linear-gradient(45deg, #08c 0%, #06d6a0 100%);
  }
  50% {
    border-radius: 30% 60% 70% 40%/50% 60% 30% 60%;
    background: linear-gradient(45deg, #141314 0%, #06d6a0 100%);
  }
  100% {
    border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
    background: linear-gradient(45deg, #08c 0%, #06d6a0 100%);
  }
}
@-o-keyframes morph {
  0% {
    border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
    background: linear-gradient(45deg, #08c 0%, #06d6a0 100%);
  }
  50% {
    border-radius: 30% 60% 70% 40%/50% 60% 30% 60%;
    background: linear-gradient(45deg, #141314 0%, #06d6a0 100%);
  }
  100% {
    border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
    background: linear-gradient(45deg, #08c 0%, #06d6a0 100%);
  }
}
@keyframes morph {
  0% {
    border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
    background: linear-gradient(45deg, #08c 0%, #06d6a0 100%);
  }
  50% {
    border-radius: 30% 60% 70% 40%/50% 60% 30% 60%;
    background: linear-gradient(45deg, #141314 0%, #06d6a0 100%);
  }
  100% {
    border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
    background: linear-gradient(45deg, #08c 0%, #06d6a0 100%);
  }
}
`
