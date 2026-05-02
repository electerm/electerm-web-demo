import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { cwd } from './build-common.js'

const today = new Date().toISOString().split('T')[0]
const baseUrl = 'https://electerm-demo.html5beta.com'

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

const outPath = resolve(cwd, 'public/sitemap.xml')
writeFileSync(outPath, sitemap, 'utf8')
console.log(`Generated sitemap.xml with date ${today}`)
