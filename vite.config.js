import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath, URL } from 'node:url'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports, getPascalCaseRouteName } from 'unplugin-vue-router'
import Layouts from 'vite-plugin-vue-layouts'
import vuetify from 'vite-plugin-vuetify'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/',
  plugins: [
    // Vue Router
    VueRouter({
      importMode: 'async',
      getRouteName: routeNode =>
        getPascalCaseRouteName(routeNode).replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase(),
    }),

    // Vue core
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'swiper-container' || tag === 'swiper-slide',
        },
      },
    }),

    vueJsx(),
    VueDevTools(),

    // Vuetify plugin
    vuetify({
      styles: { configFile: 'src/assets/styles/variables/_vuetify.scss' },
    }),

    // Layouts plugin
    Layouts({ layoutsDirs: './src/layouts/' }),

    // Auto components import
    Components({
      dirs: ['src/@core/components', 'src/views/demos', 'src/components'],
      dts: true,
      resolvers: [
        name => (name === 'VueApexCharts' ? { name: 'default', from: 'vue3-apexcharts', as: 'VueApexCharts' } : undefined),
      ],
    }),

    // Auto imports
    AutoImport({
      imports: ['vue', VueRouterAutoImports, '@vueuse/core', '@vueuse/math', 'vue-i18n', 'pinia'],
      dirs: [
        './src/@core/utils',
        './src/@core/composable',
        './src/composables',
        './src/utils',
        './src/plugins/*/composables/*',
      ],
      vueTemplate: true,
      ignore: ['useCookies', 'useStorage'],
      eslintrc: { enabled: true, filepath: './.eslintrc-auto-import.json' },
    }),

    // i18n plugin
    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      include: [fileURLToPath(new URL('./src/plugins/i18n/locales/**', import.meta.url))],
    }),

    // SVG loader
    svgLoader(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
      '@images': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/assets/styles', import.meta.url)),
      '@themeConfig': fileURLToPath(new URL('./themeConfig.js', import.meta.url)),
      '@configured-variables': fileURLToPath(new URL('./src/assets/styles/variables/_template.scss', import.meta.url)),
      '@db': fileURLToPath(new URL('./src/plugins/fake-api/handlers', import.meta.url)),
      '@api-utils': fileURLToPath(new URL('./src/plugins/fake-api/utils', import.meta.url)),
    },
  },

  define: { 'process.env': {} },

  build: { chunkSizeWarningLimit: 5000 },

  optimizeDeps: {
    entries: ['./src/**/*.vue'],
  },
})
