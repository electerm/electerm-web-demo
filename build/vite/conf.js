import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import htmlPurge from 'vite-plugin-purgecss'
import { cwd, version } from './common.js'
import { resolve, join } from 'path'
import def from './def.js'
import commonjs from 'vite-plugin-commonjs'
import {
  readdirSync,
  statSync
} from 'fs'
import { filesize } from 'filesize'
// import externalGlobals from 'rollup-plugin-external-globals'

function getDirSize (dirPath) {
  let size = 0
  const files = readdirSync(dirPath, { withFileTypes: true })
  for (const file of files) {
    const fullPath = join(dirPath, file.name)
    if (file.isDirectory()) {
      size += getDirSize(fullPath)
    } else {
      size += statSync(fullPath).size
    }
  }
  return size
}

function showTotalSizePlugin () {
  return {
    name: 'show-total-size',
    closeBundle: {
      sequential: true,
      order: 'post',
      handler () {
        const outDir = resolve(cwd, 'public')
        try {
          const totalSize = getDirSize(outDir)
          console.log(`\n\x1b[32m✨ Total assets size: ${filesize(totalSize)}\x1b[0m\n`)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
}

const manualChunks = (id) => {
  if (id.includes('node_modules')) {
    if (id.match(/node_modules\/(react|react-dom|scheduler)\//) ||
      id.includes('object-assign') ||
      id.includes('loose-envify')) {
      return 'react-vendor'
    }
    if (
      id.includes('react-delta-hooks') ||
      id.includes('react-markdown')
    ) {
      return 'react-utils'
    }
    if (id.includes('lodash-es')) {
      return 'lodash-es'
    }
    if (id.includes('dayjs')) {
      return 'dayjs'
    }
    if (id.includes('@ant-design/icons')) {
      return 'ant-icons'
    }
    if (id.includes('@ant-design') || id.includes('@rc-component') || id.includes('classnames') || id.includes('@ctrl/tinycolor')) {
      return 'react-vendor'
    }
    if (id.includes('antd')) {
      return 'antd'
    }
    if (id.includes('@xterm')) {
      return 'xterm'
    }
    if (id.includes('manate')) {
      return 'manate'
    }
    if (id.includes('zmodem-ts')) {
      return 'zmodem-ts'
    }
    if (id.includes('electerm-icons')) {
      return 'electerm-icons'
    }
    if (id.includes('@novnc/novnc')) {
      return 'novnc'
    }
    if (id.includes('ironrdp-wasm')) {
      return 'ironrdp-wasm'
    }
    if (id.includes('spice-client')) {
      return 'spice'
    }
    // Combine rest of node_modules into one chunk
    return 'vendor'
  }
}

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
    commonjs(),
    // externalGlobals({
    //   react: 'React',
    //   'react-dom': 'ReactDOM'
    // }),
    react({ include: /\.(mdx|js|jsx|ts|tsx|mjs)$/ }),
    showTotalSizePlugin()
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
  css: {
    codeSplit: false
  },
  root: resolve(cwd),
  build: {
    emptyOutDir: false,
    outDir: resolve(cwd, 'public'),
    rollupOptions: {
      input: buildInput(),
      // external: [
      //   'react',
      //   'react-dom'
      // ],
      output: {
        manualChunks,
        inlineDynamicImports: false,
        format: 'esm',
        entryFileNames: `js/[name]-${version}.js`,
        chunkFileNames: `chunk/[name]-${version}-[hash].js`,
        assetFileNames: chunkInfo => {
          const { name } = chunkInfo
          return name.endsWith('.css')
            ? `css/${version}-${name}`
            : `images/${name}`
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
