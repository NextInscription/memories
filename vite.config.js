import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true, // 可以也可以是 'build', 'dev', 或者 false
        global: true,
        process: true,
      },
      // Whether to polyfill specific Node.js modules.
      protocolImports: true,
    }),
  ],
  assetsInclude: ['**/*.wasm'],
  server: {
    fs: {
      strict: false,
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    exclude: ['@shelby-protocol/clay-codes'],
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // 保留某些类属性，避免破坏Web3 SDK
        keep_classnames: false,
        keep_fnames: false,
      },
      format: {
        // 保留某些注释（如果SDK需要）
        comments: false,
      },
    },
  },
})
