import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import htmlPurge from 'vite-plugin-purgecss'
import { cwd, version } from './common.js'
import { resolve } from 'path'
import def from './def.js'
import commonjs from 'vite-plugin-commonjs'
// import externalGlobals from 'rollup-plugin-external-globals'

function buildInput () {
  return {
    electerm: resolve(cwd, 'src/client/entry-web/index.jsx'),
    basic: resolve(cwd, 'src/client/entry-web/basic.js'),
    worker: resolve(cwd, 'src/client/entry-web/worker.js')
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // htmlPurge(),
    commonjs(),
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
        manualChunks: {
          react: ['react'],
          'react-dom': ['react-dom'],
          'lodash-es': ['lodash-es'],
          antd: ['antd'],
          '@ant-design/icons': ['@ant-design/icons'],
          xterm: [
            'xterm',
            'xterm-addon-attach',
            'xterm-addon-canvas',
            'xterm-addon-fit',
            'xterm-addon-ligatures',
            'xterm-addon-search',
            'xterm-addon-unicode11',
            'xterm-addon-web-links',
            'xterm-addon-webgl'
          ],
          '@electerm/electerm-themes': ['@electerm/electerm-themes'],
          trzsz: ['trzsz'],
          manate: ['manate'],
          'zmodem.js': ['zmodem.js']
        },
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
      events: 'eventemitter3'
    }
  }
})
