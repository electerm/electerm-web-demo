import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import htmlPurge from 'vite-plugin-purgecss'
import { cwd, version } from './common.js'
import { resolve } from 'path'
import def from './def.js'

function buildInput () {
  return {
    electerm: resolve(cwd, 'src/client/entry-web/electerm.jsx'),
    basic: resolve(cwd, 'src/client/entry-web/basic.js'),
    worker: resolve(cwd, 'src/client/entry-web/worker.js')
  }
}
const fakePath = resolve(cwd, 'build/vite/fake-libs')
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // htmlPurge(),
    // externalGlobals({
    //   react: 'React',
    //   'react-dom': 'ReactDOM'
    // }),
    react({ include: /\.(mdx|js|jsx|ts|tsx|mjs)$/ })
  ],
  // optimizeDeps: {
  //   esbuildOptions: {
  //     loader: {
  //       '.js': 'jsx'
  //     }
  //   }
  // },
  define: def,
  publicDir: false,
  legacy: {
    inconsistentCjsInterop: true
  },
  root: resolve(cwd),
  build: {
    emptyOutDir: false,
    cssCodeSplit: false,
    codeSplitting: false,
    outDir: resolve(cwd, 'public'),
    rollupOptions: {
      input: buildInput(),
      // external: [
      //   'react',
      //   'react-dom'
      // ],
      output: {
        format: 'esm',
        entryFileNames: `js/[name]-${version}.js`,
        chunkFileNames: `chunk/[name]-${version}-[hash].js`,
        assetFileNames: chunkInfo => {
          const { name } = chunkInfo
          if (/\.(png|jpe?g|gif|svg|webp|ico|bmp)$/i.test(name)) {
            return `images/${name}`
          } else if (name && name.endsWith('.css')) {
            return `css/style-${version}[extname]`
          } else {
            return 'assets/[name]-[hash][extname]'
          }
        },
        dir: resolve(cwd, 'public')
      }
    }
  },
  resolve: {
    alias: {
      '@xterm/addon-image': resolve(fakePath, 'xterm-addon.js'),
      '@xterm/addon-ligatures': resolve(fakePath, 'xterm-addon.js'),
      // '@xterm/addon-unicode11': resolve(fakePath, 'xterm-addon.js'),
      '@xterm/addon-webgl': resolve(fakePath, 'xterm-addon.js'),
      'react-markdown': resolve(fakePath, 'react-markdown.jsx'),
      // Demo has no real RDP/VNC/SPICE server, use tiny fake libs so the
      // real heavy clients (noVNC ~800KB, ironrdp WASM several MB,
      // spice-html5) are never bundled. The session components are
      // lazy-loaded, so these fakes keep those chunks tiny too.
      // Must alias both the bare specifier (used by dynamic import()) and
      // the deep core path.
      '@novnc/novnc': resolve(fakePath, 'novnc-entry.js'),
      '@novnc/novnc/core/rfb.js': resolve(fakePath, 'novnc.js'),
      '@novnc/novnc/core/rfb': resolve(fakePath, 'novnc.js'),
      'ironrdp-wasm': resolve(fakePath, 'ironrdp-wasm.js'),
      'spice-client': resolve(fakePath, 'spice-client.js'),
      'zmodem-ts/dist/zsentry.js': resolve(fakePath, 'zmodem.js')
    }
  }
})
