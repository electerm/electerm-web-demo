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

Web demo of [electerm](https://github.com/electerm/electerm) app, running in browser.

Visit: [https://demo.electerm.org](https://demo.electerm.org)

Open-sourced terminal/ssh/sftp/telnet/serialport/RDP/VNC/Spice/ftp client(linux, mac, win).

## Related projects/sites

- [electerm](https://github.com/electerm/electerm): The main desktop app (Electron-based)
- [electerm.org](https://electerm.org): Homepage, downloads, videos, etc
- [electerm-web](https://github.com/electerm/electerm-web): Web app version running in browser(including mobile device)
- [electerm-web-docker](https://github.com/electerm/electerm-web-docker): Docker image for electerm-web
- [electerm online](https://cloud.electerm.org): Public free online electerm app
- [electerm demo](https://demo.electerm.org): Online demo of electerm
- [electerm deb repo](https://repos.electerm.org/deb): Debian repo of electerm
- [electerm rpm repo](https://repos.electerm.org/rpm): RPM repo of electerm
- [electerm-locales](https://github.com/electerm/electerm-locales): Language/i18n files for electerm

<div align="center">
  <img src="https://github.com/electerm/electerm-resource/raw/master/static/images/electerm.gif", alt="" />
</div>

## Features

- Works as a terminal/file manager or ssh/sftp/ftp/telnet/serialport/RDP/VNC/Spice client
- Support Window 7+(X64/ARM64), Mac OS 10.15+(x64/arm64), Linux(x64/arm64/Loong64), even old Linux with glibc 2.17+ like UOS/Kylin/Ubuntu 18.04 etc
- Global hotkey to toggle window visibility (similar to guake, default is `ctrl + 2`)
- Multi platform(linux, mac, win)
- 🇺🇸 🇨🇳 🇧🇷 🇷🇺 🇪🇸 🇫🇷 🇹🇷 🇭🇰 🇯🇵 🇸🇦 🇩🇪 🇰🇷 🇮🇩 🇵🇱 Multi-language support([electerm-locales](https://github.com/electerm/electerm-locales), contributions/fixes welcome)
- Double click to directly edit (small) remote files.
- Auth with publicKey + password.
- Support Zmodem(rz, sz).
- Support ssh tunnel.
- Support [Trzsz](https://github.com/trzsz/trzsz)(trz/tsz), similar to rz/sz, and compatible with tmux.
- Transparent window(Mac, win).
- Terminal background image.
- Global/session proxy.
- Quick commands
- UI/terminal theme
- Sync bookmarks/themes/quick commands to github/gitee secret gist/webdav/custom server/electerm cloud
- Quick input to one or all terminals.
- AI assistant integration (supporting [DeepSeek](https://www.deepseek.com), OpenAI, and any other AI APIs) to help with command suggestions, script writing, and explaining selected terminal content, create bookmarks
- MCP (Model Context Protocol) widget for AI assistants and external tools integration - see [MCP Widget Usage Guide](https://github.com/electerm/electerm/wiki/MCP-Widget-Usage-Guide)
- Deep link support: Open connections with URLs like `telnet://192.168.2.31:34554` or `ssh://user@host:22` - see [Deep link support wiki](https://github.com/electerm/electerm/wiki/Deep-link-support)
- Command line usage: check [wiki](https://github.com/electerm/electerm/wiki/Command-line-usage)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run b

# Run tests
npm run lint
```

## Deployment

This project can be deployed to Cloudflare Pages for fast, global distribution.

### Quick Deploy

```bash
# Deploy to Cloudflare Pages
npm run cf:deploy
```

### Setup Instructions

1. **Install Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Deploy**:

   ```bash
   npm run cf:deploy
   ```

### Automatic Deployment

The repository includes GitHub Actions for automatic deployment on push to main branch. Set up these secrets in your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Known issues

[https://github.com/electerm/electerm/wiki/Know-issues](https://github.com/electerm/electerm/wiki/Know-issues)

## Troubleshoot

[https://github.com/electerm/electerm/wiki/Troubleshoot](https://github.com/electerm/electerm/wiki/Troubleshoot)

## Discussion

[![Discord](https://img.shields.io/badge/Discord-Join-blue?logo=discord)](https://discord.gg/855W7g8EVd)

[Discussion board](https://github.com/electerm/electerm-web/discussions)

![electerm-wechat-group-qr.jpg](https://electerm.org/electerm-wechat-group-qr.jpg)

## Support

Would love to hear from you, please tell me what you think, [submit an issue](https://github.com/electerm/electerm-web/issues), [Start a new discussion](https://github.com/electerm/electerm-web/discussions/new), [create/fix language files](https://github.com/electerm/electerm-locales) or create pull requests, all welcome.

## Sponsor this project

github sponsor

[https://github.com/sponsors/electerm](https://github.com/sponsors/electerm)

kofi

[https://ko-fi.com/zhaoxudong](https://ko-fi.com/zhaoxudong)

wechat donate

[![wechat donate](https://electerm.org/electerm-wechat-donate.png)](https://github.com/electerm)

## Video guide

- [https://electerm.org/videos](https://electerm.org/videos)

## Change log

Visit [Releases](https://github.com/electerm/electerm-web/releases).

## Contact author

[zxdong@gmail.com](mailto:zxdong@gmail.com)

## License

MIT
