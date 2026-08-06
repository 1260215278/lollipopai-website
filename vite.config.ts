import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { prerenderPlugin } from './scripts/prerender-plugin'


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
  // 部署路径。默认根路径 '/'(绝对)，可保证任意深层路由(如 /distribution/enroll)
  // 刷新直访时，/assets/*.js 始终指向站点根，不会被相对路径 ./assets 误解析成
  // /distribution/assets/ 而 404 导致黑屏。子路径部署(如 /lollipop/)请设 VITE_BASE=/lollipop/。
  base: process.env.VITE_BASE || '/',
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // SSG 预渲染：为所有已知路由生成带 SEO meta + JSON-LD 的静态 HTML
    prerenderPlugin(),
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

  // 生产构建：禁用 sourceMap 防止源码路径泄漏（审计报告 P1-5）
  build: {
    sourcemap: false,
    // 生成 .vite/manifest.json，把「源码资源路径 → 打包后 /assets/ 文件」做权威映射。
    // 预渲染插件据此把 SSR 渲染出的 dev 图片 URL（/src/imports/X.png 或 /@fs/.../X.png）
    // 精确重写为生产可用的 /assets/X-<hash>.png，避免 hash 剥离失败（括号/连字符文件名）。
    manifest: true,
    // 拆包策略：将大型 vendor 拆成独立 chunk，利用浏览器缓存
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React 核心 — 首屏必需，但拆出后可被 Service Worker / CDN 缓存
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // react-router — 所有页面共用
          if (id.includes('node_modules/react-router/') ||
              id.includes('node_modules/@remix-run/router/')) {
            return 'vendor-router';
          }
          // Framer Motion 动画库 — ~150KB，大部分页面用到
          if (id.includes('node_modules/motion/') ||
              id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion';
          }
          // Lucide 图标库 — ~80KB，全站使用
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-lucide';
          }
          // QRCode — 仅 DownloadPage 用到，~30KB
          if (id.includes('node_modules/qrcode.react/') ||
              id.includes('node_modules/qr-code-generator/')) {
            return 'vendor-qrcode';
          }
          // Radix UI 组件 — ~60KB，分发后台使用
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-radix';
          }
          // MUI — 仅在分发后台某些组件中引用
          if (id.includes('node_modules/@mui/') ||
              id.includes('node_modules/@emotion/')) {
            return 'vendor-mui';
          }
          // 分发后台子应用 — 登录后才需要，首屏完全不需要
          if (id.includes('/src/app/distribution/')) {
            return 'app-distribution';
          }
          // 独立页面（非首页）— 登录、创作者主页、法律文档等
          if (id.includes('/src/app/pages/LoginPage') ||
              id.includes('/src/app/pages/ForgotPasswordPage') ||
              id.includes('/src/app/pages/CreatorProfilePage') ||
              id.includes('/src/app/pages/LegalDocumentPage')) {
            return 'app-pages';
          }
          // 其他 node_modules 归入通用 vendor
          if (id.includes('node_modules/')) {
            return 'vendor-common';
          }
        },
      },
    },
  },
})
