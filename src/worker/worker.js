/**
 * electerm web demo worker
 * - serves static assets from public/
 * - redirects old domain electerm-demo.html5beta.com to demo.electerm.org
 */

const redirectFrom = 'electerm-demo.html5beta.com'
const redirectTo = 'demo.electerm.org'

export default {
  async fetch (request, env) {
    const url = new URL(request.url)
    if (url.hostname === redirectFrom) {
      url.protocol = 'https:'
      url.host = redirectTo
      return Response.redirect(url.toString(), 301)
    }
    return env.ASSETS.fetch(request)
  }
}
