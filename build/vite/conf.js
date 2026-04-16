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
    outDir: resolve(cwd, 'public'),
    rollupOptions: {
      input: buildInput(),
      // external: [
      //   'react',
      //   'react-dom'
      // ],
      output: {
        inlineDynamicImports: false,
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
      '@novnc/novnc/core/rfb.js': resolve(fakePath, 'novnc.js'),
      'zmodem-ts/dist/zsentry.js': resolve(fakePath, 'zmodem.js'),
      '@novnc/novnc/core/rfb': resolve(cwd, 'src/client/web-components/empty.js'),
      'ironrdp-wasm': resolve(cwd, 'src/client/web-components/empty.js'),
      'spice-client': resolve(cwd, 'src/client/web-components/empty.js')
    }
  }
})
