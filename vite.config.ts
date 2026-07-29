import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// 真实后端地址（联调）。dev 时把 /sqx_fast/** 反向代理到此，避免浏览器跨域(CORS)。
// 可用环境变量 VITE_DEV_PROXY_TARGET 覆盖；生产构建走相对 /sqx_fast（同域）或由 VITE_API_BASE 指定。
const DEV_API_TARGET = process.env.VITE_DEV_PROXY_TARGET || 'https://www.testshort.top'

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // dev 反向代理：前端请求相对 /sqx_fast/** → 真实后端，规避跨域；联调即开即用。
  // host: true 监听 0.0.0.0，本机 IP 可访问（手机/同网设备联调）。
  server: {
    host: true,
    proxy: {
      '/sqx_fast': {
        target: DEV_API_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
