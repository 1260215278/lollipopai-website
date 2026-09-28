import { defineConfig, loadEnv } from 'vite'
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

export default defineConfig(({ mode }) => {
  // 加载 .env / .env.production 等环境变量，使 VITE_BASE 在配置阶段可用
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE || process.env.VITE_BASE || '/'

  return {
  // 部署路径。默认根路径 '/'(绝对)，可保证任意深层路由(如 /distribution/enroll)
  // 刷新直访时，/assets/*.js 始终指向站点根，不会被相对路径 ./assets 误解析成
  // /distribution/assets/ 而 404 导致黑屏。子路径部署(如 /lollipop/)请设 VITE_BASE=/lollipop/。
  base,
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
    // 拆包策略（2026-09-26 重构）
    //
    // ⚠️ 教训：manualChunks 是「强制归组」，不是「建议归组」。给某个 id 返回组名后，
    //    Rollup 会 ①把该模块锁进这个 chunk，②把「只被本 chunk 内部引用」的模块**吸收**进来。
    //    于是只要组内**存在任何一个入口静态可达的模块**，整个 chunk 就变成入口的静态依赖，
    //    Vite 会在**每一页**注入 <link rel="modulepreload"> —— 首屏被迫下载本来
    //    「登录后/进文章页才需要」的代码。而且它是静默的：构建成功、页面正常，
    //    只有抓 index.html 的 modulepreload 列表才看得出来。
    //
    //    实测踩坑记录（都是同一个病）：
    //      · app-distribution 组：吸收 components/ui/** → 785 KB 进首屏
    //      · app-pages 组：吸收 useNavItems.ts + distribution/entryNavigation.ts
    //        （因为 LoginPage 登录后要跳分发中心，也 import 了 entryNavigation）
    //        → 50 KB 进首屏，连带 login 的两张图
    //      · vendor-common catch-all（node_modules/**）：吸收 recharts + d3-* + lodash
    //        （只被后台的 ui/chart.tsx 用到）→ 992 KB 进首屏
    //
    //    所以：**只给「全站每一页都必然要用、且内容极稳定」的基础库建组**，
    //    其余一切（业务 src、node_modules）全部交回 Rollup 按「谁真正可达」默认分块。
    //    判据永远是：抓 dist/index.html 的 modulepreload 列表，逐条问「首屏真的需要吗」。
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React 核心 —— 每页必需，且几乎不随业务改动，独立成块最利于长缓存
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // react-router —— 同上，每页必需
          if (id.includes('node_modules/react-router/') ||
              id.includes('node_modules/@remix-run/router/')) {
            return 'vendor-router';
          }
          // Framer Motion —— 首屏 HeroSection 就在用，属于首屏关键路径。
          // ⚠️ 必须把 motion-dom / motion-utils 一并纳入：它们是 motion 的内部依赖，
          //    包名不含 "motion/"，漏掉会掉进默认分块并被 "node_modules 兜底" 规则连坐。
          if (id.includes('node_modules/motion/') ||
              id.includes('node_modules/motion-dom/') ||
              id.includes('node_modules/motion-utils/') ||
              id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion';
          }
          // 其余一律返回 undefined —— 交给 Rollup 默认分块（按可达性）。
          // 不要再加：
          //   · `if (id.includes('node_modules/')) return 'vendor-common'` 兜底
          //     → 会把 recharts/d3/lodash/xlsx 等「只有懒加载页才用」的库整体拖进首屏
          //   · 任何 `src/app/**` 目录级分组 → 见上方 app-distribution / app-pages 的坑
          return undefined;
        },
      },
    },
  },
  }
})
