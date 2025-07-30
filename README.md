<h1 align="center" style="padding-top: 60px;padding-bottom: 40px;">
    <a href="https://electerm.github.io/electerm">
        <img src="https://github.com/electerm/electerm-resource/raw/master/static/images/electerm.png", alt="" />
    </a>
</h1>

# electerm-web-demo [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Open%20sourced%20terminal%2Fssh%2Fsftp%20client(linux%2C%20mac%2C%20win)&url=https%3A%2F%2Fgithub.com%2Felecterm%2Felecterm&hashtags=electerm,ssh,terminal,sftp)

Web demo of [electerm app](https://github.com/electerm/electerm).

Visit: [https://electerm-demo.html5beta.com](https://electerm-demo.html5beta.com)

[![GitHub version](https://img.shields.io/github/release/electerm/electerm/all.svg)](https://github.com/electerm/electerm/releases)
[![license](https://img.shields.io/github/license/electerm/electerm.svg)](https://github.com/electerm/electerm-dev/blob/master/LICENSE)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Get it from the Snap Store](https://img.shields.io/badge/Snap-Store-green)](https://snapcraft.io/electerm)
[![Get it from the Microsoft Store](https://img.shields.io/badge/Microsoft-Store-blue)](https://www.microsoft.com/store/apps/9NCN7272GTFF)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/electerm?label=Sponsors)](https://github.com/sponsors/electerm)

Open-sourced terminal/ssh/telnet/serialport/sftp client(linux, mac, win).

<div align="center">
  <img src="https://github.com/electerm/electerm-resource/raw/master/static/images/electerm.gif", alt="" />
</div>

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

For detailed deployment instructions, see [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md).

## License

MIT
