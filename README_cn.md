<h1 align="center" style="padding-top: 60px;padding-bottom: 40px;">
    <a href="https://electerm.org">
        <img src="https://github.com/electerm/electerm-resource/raw/master/static/images/electerm.png", alt="" />
    </a>
</h1>

# electerm-web-demo [![Tweet](https://badgers.space/badge/Tweet/Tweet/social)](https://twitter.com/intent/tweet?text=Open%20sourced%20terminal%2Fssh%2Fsftp%20client(linux%2C%20mac%2C%20win)&url=https%3A%2F%2Fgithub.com%2Felecterm%2Felecterm&hashtags=electerm,ssh,terminal,sftp)

[![GitHub version](https://badgers.space/github/release/electerm/electerm?corner_radius=m)](https://github.com/electerm/electerm/releases)
[![license](https://img.shields.io/github/license/electerm/electerm)](https://github.com/electerm/electerm/blob/master/LICENSE)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Get it from the Snap Store](https://img.shields.io/badge/Snap-Store-green)](https://snapcraft.io/electerm)
[![Get it from the Microsoft Store](https://img.shields.io/badge/Microsoft-Store-blue)](https://www.microsoft.com/store/apps/9NCN7272GTFF)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/electerm?label=Sponsors)](https://github.com/sponsors/electerm)
[![Powered by manate](https://img.shields.io/badge/Powered%20by-manate-blue)](https://github.com/tylerlong/manate)
[![Discord](https://img.shields.io/badge/Discord-Join-blue?logo=discord)](https://discord.gg/855W7g8EVd)
[![star](https://atomgit.com/electerm/electerm/star/badge.svg)](https://atomgit.com/electerm/electerm)

[![English](https://img.shields.io/badge/English-EN-blue)](README.md) [![中文](https://img.shields.io/badge/中文-Chinese-blue)](README_cn.md)

[electerm](https://github.com/electerm/electerm) 的 Web 演示版本，在浏览器中运行。

访问地址：[https://demo.electerm.org](https://demo.electerm.org)

开源终端/ssh/telnet/serialport/RDP/VNC/Spice/sftp/ftp 客户端（linux, mac, win）。

## 相关项目/站点

- [electerm](https://github.com/electerm/electerm)：主桌面应用（基于 Electron）
- [electerm.org](https://electerm.org)：主页、下载、视频等
- [electerm-web](https://github.com/electerm/electerm-web)：运行于浏览器（支持移动设备）的 web app 版本
- [electerm-web-docker](https://github.com/electerm/electerm-web-docker)：electerm-web 的 docker 镜像
- [electerm online](https://cloud.electerm.org)：公共免费在线 electerm 应用
- [electerm demo](https://demo.electerm.org)：在线演示
- [electerm deb repo](https://repos.electerm.org/deb)：Debian 软件源
- [electerm rpm repo](https://repos.electerm.org/rpm)：RPM 软件源
- [electerm-locales](https://github.com/electerm/electerm-locales)：多语言/国际化文件

<div align="center">
  <img src="https://github.com/electerm/electerm-resource/raw/master/static/images/electerm.gif", alt="" />
</div>

## 功能特性

- 支持作为 ssh、telnet、serialport、RDP、VNC、Spice 客户端，本地和远程文件管理，sftp/ftp 文件传输，以及作为本地终端使用
- 支持 Window 7+(X64/ARM64)、Mac OS 10.15+(x64/arm64)、Linux(x64/arm64/Loong64)，以及 glibc 2.17+ 的 Linux 如 UOS/Kylin/Ubuntu 18.04 等
- 全局快捷键切换隐藏显示窗口（类似 guake，默认快捷键 `ctrl + 2`）
- 多平台支持（linux, mac, win）
- 🇺🇸 🇨🇳 🇧🇷 🇷🇺 🇪🇸 🇫🇷 🇹🇷 🇭🇰 🇯🇵 🇸🇦 🇩🇪 🇰🇷 🇮🇩 🇵🇱 多国语言支持（[electerm-locales](https://github.com/electerm/electerm-locales)，欢迎提交代码）
- 双击直接编辑远程文件
- 支持密码或密钥登录
- 支持 Zmodem（rz, sz）
- 支持 ssh 隧道
- 支持 [Trzsz](https://github.com/trzsz/trzsz)（trz/tsz），类似 rz/sz，兼容 tmux
- 支持透明窗口（Mac, win）
- 支持设置终端背景图片
- 支持代理服务器
- 支持预设快捷命令
- 支持主题
- 支持同步书签等数据到 github/gitee 私人 gist、webdav/custom server/electerm cloud
- 支持快速输入命令到一个或多个终端
- AI 助手集成（支持 [DeepSeek](https://www.deepseek.com)、OpenAI 等 AI API），协助命令建议、脚本编写、解释所选终端内容、创建书签
- MCP (Model Context Protocol) 组件，用于 AI 助手和外部工具集成 - 详见 [MCP Widget Usage Guide](https://github.com/electerm/electerm/wiki/MCP-Widget-Usage-Guide)
- 深度链接支持：使用 `telnet://192.168.2.31:34554` 或 `ssh://user@host:22` 等 URL 打开连接 - 详见 [深度链接支持 wiki](https://github.com/electerm/electerm/wiki/Deep-link-support)
- 命令行使用：请参阅 [wiki](https://github.com/electerm/electerm/wiki/Command-line-usage)

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 生产构建
npm run b

# 运行测试
npm run lint
```

## 部署

本项目可部署到 Cloudflare Pages，实现快速全球分发。

### 快速部署

```bash
# 部署到 Cloudflare Pages
npm run cf:deploy
```

### 配置步骤

1. **安装 Wrangler CLI**：

   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**：

   ```bash
   wrangler login
   ```

3. **部署**：

   ```bash
   npm run cf:deploy
   ```

### 自动部署

仓库包含 GitHub Actions，可在推送到 main 分支时自动部署。请在 GitHub 仓库中设置以下 secrets：

- `CLOUDFLARE_API_TOKEN`：你的 Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`：你的 Cloudflare 账户 ID

## 已知问题

[https://github.com/electerm/electerm/wiki/Know-issues](https://github.com/electerm/electerm/wiki/Know-issues)

## 疑难解答

[https://github.com/electerm/electerm/wiki/Troubleshoot](https://github.com/electerm/electerm/wiki/Troubleshoot)

## 讨论区

[![Discord](https://img.shields.io/badge/Discord-Join-blue?logo=discord)](https://discord.gg/855W7g8EVd)

[Discussion board](https://github.com/electerm/electerm-web/discussions)

![electerm-wechat-group-qr.jpg](https://electerm.org/electerm-wechat-group-qr.jpg)

## 支持

欢迎[提交问题/建议](https://github.com/electerm/electerm-web/issues)、[展开讨论](https://github.com/electerm/electerm-web/discussions/new)、[修复或创建语言文件](https://github.com/electerm/electerm-locales)或贡献代码。

## 赞助项目

github sponsor

[https://github.com/sponsors/electerm](https://github.com/sponsors/electerm)

kofi

[https://ko-fi.com/zhaoxudong](https://ko-fi.com/zhaoxudong)

微信赞赏码

[![wechat donate](https://electerm.org/electerm-wechat-donate.png)](https://github.com/electerm)

## 使用视频

- [https://electerm.org/videos](https://electerm.org/videos)

## 变更历史

访问 [Releases](https://github.com/electerm/electerm-web/releases)。

## 联系作者

[zxdong@gmail.com](mailto:zxdong@gmail.com)

## 许可证

MIT
