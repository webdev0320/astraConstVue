// vite.config.js
import { defineConfig } from "file:///C:/laragon/www/astraConstVue/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/laragon/www/astraConstVue/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/laragon/www/astraConstVue/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { fileURLToPath, URL } from "node:url";
import VueRouter from "file:///C:/laragon/www/astraConstVue/node_modules/unplugin-vue-router/dist/vite.mjs";
import { VueRouterAutoImports, getPascalCaseRouteName } from "file:///C:/laragon/www/astraConstVue/node_modules/unplugin-vue-router/dist/index.mjs";
import Layouts from "file:///C:/laragon/www/astraConstVue/node_modules/vite-plugin-vue-layouts/dist/index.mjs";
import vuetify from "file:///C:/laragon/www/astraConstVue/node_modules/vite-plugin-vuetify/dist/index.mjs";
import VueI18nPlugin from "file:///C:/laragon/www/astraConstVue/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import AutoImport from "file:///C:/laragon/www/astraConstVue/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///C:/laragon/www/astraConstVue/node_modules/unplugin-vue-components/dist/vite.js";
import svgLoader from "file:///C:/laragon/www/astraConstVue/node_modules/vite-svg-loader/index.js";
import VueDevTools from "file:///C:/laragon/www/astraConstVue/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/laragon/www/astraConstVue/vite.config.js";
var vite_config_default = defineConfig({
  base: "/",
  plugins: [
    // Vue Router
    VueRouter({
      importMode: "async",
      getRouteName: (routeNode) => getPascalCaseRouteName(routeNode).replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase()
    }),
    // Vue core
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === "swiper-container" || tag === "swiper-slide"
        }
      }
    }),
    vueJsx(),
    VueDevTools(),
    // Vuetify plugin
    vuetify({
      styles: { configFile: "src/assets/styles/variables/_vuetify.scss" }
    }),
    // Layouts plugin
    Layouts({ layoutsDirs: "./src/layouts/" }),
    // Auto components import
    Components({
      dirs: ["src/@core/components", "src/views/demos", "src/components"],
      dts: true,
      resolvers: [
        (name) => name === "VueApexCharts" ? { name: "default", from: "vue3-apexcharts", as: "VueApexCharts" } : void 0
      ]
    }),
    // Auto imports
    AutoImport({
      imports: ["vue", VueRouterAutoImports, "@vueuse/core", "@vueuse/math", "vue-i18n", "pinia"],
      dirs: [
        "./src/@core/utils",
        "./src/@core/composable",
        "./src/composables",
        "./src/utils",
        "./src/plugins/*/composables/*"
      ],
      vueTemplate: true,
      ignore: ["useCookies", "useStorage"],
      eslintrc: { enabled: true, filepath: "./.eslintrc-auto-import.json" }
    }),
    // i18n plugin
    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      include: [fileURLToPath(new URL("./src/plugins/i18n/locales/**", __vite_injected_original_import_meta_url))]
    }),
    // SVG loader
    svgLoader()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@core": fileURLToPath(new URL("./src/@core", __vite_injected_original_import_meta_url)),
      "@layouts": fileURLToPath(new URL("./src/@layouts", __vite_injected_original_import_meta_url)),
      "@images": fileURLToPath(new URL("./src/assets/images", __vite_injected_original_import_meta_url)),
      "@styles": fileURLToPath(new URL("./src/assets/styles", __vite_injected_original_import_meta_url)),
      "@themeConfig": fileURLToPath(new URL("./themeConfig.js", __vite_injected_original_import_meta_url)),
      "@configured-variables": fileURLToPath(new URL("./src/assets/styles/variables/_template.scss", __vite_injected_original_import_meta_url)),
      "@db": fileURLToPath(new URL("./src/plugins/fake-api/handlers", __vite_injected_original_import_meta_url)),
      "@api-utils": fileURLToPath(new URL("./src/plugins/fake-api/utils", __vite_injected_original_import_meta_url))
    }
  },
  define: { "process.env": {} },
  build: { chunkSizeWarningLimit: 5e3 },
  optimizeDeps: {
    entries: ["./src/**/*.vue"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxsYXJhZ29uXFxcXHd3d1xcXFxhc3RyYUNvbnN0VnVlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxsYXJhZ29uXFxcXHd3d1xcXFxhc3RyYUNvbnN0VnVlXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9sYXJhZ29uL3d3dy9hc3RyYUNvbnN0VnVlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcbmltcG9ydCBWdWVSb3V0ZXIgZnJvbSAndW5wbHVnaW4tdnVlLXJvdXRlci92aXRlJ1xyXG5pbXBvcnQgeyBWdWVSb3V0ZXJBdXRvSW1wb3J0cywgZ2V0UGFzY2FsQ2FzZVJvdXRlTmFtZSB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1yb3V0ZXInXHJcbmltcG9ydCBMYXlvdXRzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1sYXlvdXRzJ1xyXG5pbXBvcnQgdnVldGlmeSBmcm9tICd2aXRlLXBsdWdpbi12dWV0aWZ5J1xyXG5pbXBvcnQgVnVlSTE4blBsdWdpbiBmcm9tICdAaW50bGlmeS91bnBsdWdpbi12dWUtaTE4bi92aXRlJ1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQgc3ZnTG9hZGVyIGZyb20gJ3ZpdGUtc3ZnLWxvYWRlcidcclxuaW1wb3J0IFZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogJy8nLFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIC8vIFZ1ZSBSb3V0ZXJcclxuICAgIFZ1ZVJvdXRlcih7XHJcbiAgICAgIGltcG9ydE1vZGU6ICdhc3luYycsXHJcbiAgICAgIGdldFJvdXRlTmFtZTogcm91dGVOb2RlID0+XHJcbiAgICAgICAgZ2V0UGFzY2FsQ2FzZVJvdXRlTmFtZShyb3V0ZU5vZGUpLnJlcGxhY2UoLyhbYS16XFxkXSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCksXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBWdWUgY29yZVxyXG4gICAgdnVlKHtcclxuICAgICAgdGVtcGxhdGU6IHtcclxuICAgICAgICBjb21waWxlck9wdGlvbnM6IHtcclxuICAgICAgICAgIGlzQ3VzdG9tRWxlbWVudDogdGFnID0+IHRhZyA9PT0gJ3N3aXBlci1jb250YWluZXInIHx8IHRhZyA9PT0gJ3N3aXBlci1zbGlkZScsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG5cclxuICAgIHZ1ZUpzeCgpLFxyXG4gICAgVnVlRGV2VG9vbHMoKSxcclxuXHJcbiAgICAvLyBWdWV0aWZ5IHBsdWdpblxyXG4gICAgdnVldGlmeSh7XHJcbiAgICAgIHN0eWxlczogeyBjb25maWdGaWxlOiAnc3JjL2Fzc2V0cy9zdHlsZXMvdmFyaWFibGVzL192dWV0aWZ5LnNjc3MnIH0sXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBMYXlvdXRzIHBsdWdpblxyXG4gICAgTGF5b3V0cyh7IGxheW91dHNEaXJzOiAnLi9zcmMvbGF5b3V0cy8nIH0pLFxyXG5cclxuICAgIC8vIEF1dG8gY29tcG9uZW50cyBpbXBvcnRcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICBkaXJzOiBbJ3NyYy9AY29yZS9jb21wb25lbnRzJywgJ3NyYy92aWV3cy9kZW1vcycsICdzcmMvY29tcG9uZW50cyddLFxyXG4gICAgICBkdHM6IHRydWUsXHJcbiAgICAgIHJlc29sdmVyczogW1xyXG4gICAgICAgIG5hbWUgPT4gKG5hbWUgPT09ICdWdWVBcGV4Q2hhcnRzJyA/IHsgbmFtZTogJ2RlZmF1bHQnLCBmcm9tOiAndnVlMy1hcGV4Y2hhcnRzJywgYXM6ICdWdWVBcGV4Q2hhcnRzJyB9IDogdW5kZWZpbmVkKSxcclxuICAgICAgXSxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIEF1dG8gaW1wb3J0c1xyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFsndnVlJywgVnVlUm91dGVyQXV0b0ltcG9ydHMsICdAdnVldXNlL2NvcmUnLCAnQHZ1ZXVzZS9tYXRoJywgJ3Z1ZS1pMThuJywgJ3BpbmlhJ10sXHJcbiAgICAgIGRpcnM6IFtcclxuICAgICAgICAnLi9zcmMvQGNvcmUvdXRpbHMnLFxyXG4gICAgICAgICcuL3NyYy9AY29yZS9jb21wb3NhYmxlJyxcclxuICAgICAgICAnLi9zcmMvY29tcG9zYWJsZXMnLFxyXG4gICAgICAgICcuL3NyYy91dGlscycsXHJcbiAgICAgICAgJy4vc3JjL3BsdWdpbnMvKi9jb21wb3NhYmxlcy8qJyxcclxuICAgICAgXSxcclxuICAgICAgdnVlVGVtcGxhdGU6IHRydWUsXHJcbiAgICAgIGlnbm9yZTogWyd1c2VDb29raWVzJywgJ3VzZVN0b3JhZ2UnXSxcclxuICAgICAgZXNsaW50cmM6IHsgZW5hYmxlZDogdHJ1ZSwgZmlsZXBhdGg6ICcuLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJyB9LFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gaTE4biBwbHVnaW5cclxuICAgIFZ1ZUkxOG5QbHVnaW4oe1xyXG4gICAgICBydW50aW1lT25seTogdHJ1ZSxcclxuICAgICAgY29tcG9zaXRpb25Pbmx5OiB0cnVlLFxyXG4gICAgICBpbmNsdWRlOiBbZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9wbHVnaW5zL2kxOG4vbG9jYWxlcy8qKicsIGltcG9ydC5tZXRhLnVybCkpXSxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIFNWRyBsb2FkZXJcclxuICAgIHN2Z0xvYWRlcigpLFxyXG4gIF0sXHJcblxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQGNvcmUnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL0Bjb3JlJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAbGF5b3V0cyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvQGxheW91dHMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0BpbWFnZXMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL2Fzc2V0cy9pbWFnZXMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0BzdHlsZXMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL2Fzc2V0cy9zdHlsZXMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0B0aGVtZUNvbmZpZyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi90aGVtZUNvbmZpZy5qcycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQGNvbmZpZ3VyZWQtdmFyaWFibGVzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9hc3NldHMvc3R5bGVzL3ZhcmlhYmxlcy9fdGVtcGxhdGUuc2NzcycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQGRiJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9wbHVnaW5zL2Zha2UtYXBpL2hhbmRsZXJzJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAYXBpLXV0aWxzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9wbHVnaW5zL2Zha2UtYXBpL3V0aWxzJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIGRlZmluZTogeyAncHJvY2Vzcy5lbnYnOiB7fSB9LFxyXG5cclxuICBidWlsZDogeyBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMDAgfSxcclxuXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBlbnRyaWVzOiBbJy4vc3JjLyoqLyoudnVlJ10sXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4USxTQUFTLG9CQUFvQjtBQUMzUyxPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLFNBQVMsZUFBZSxXQUFXO0FBQ25DLE9BQU8sZUFBZTtBQUN0QixTQUFTLHNCQUFzQiw4QkFBOEI7QUFDN0QsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sYUFBYTtBQUNwQixPQUFPLG1CQUFtQjtBQUMxQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGVBQWU7QUFDdEIsT0FBTyxpQkFBaUI7QUFaK0ksSUFBTSwyQ0FBMkM7QUFjeE4sSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBO0FBQUEsSUFFUCxVQUFVO0FBQUEsTUFDUixZQUFZO0FBQUEsTUFDWixjQUFjLGVBQ1osdUJBQXVCLFNBQVMsRUFBRSxRQUFRLHFCQUFxQixPQUFPLEVBQUUsWUFBWTtBQUFBLElBQ3hGLENBQUM7QUFBQTtBQUFBLElBR0QsSUFBSTtBQUFBLE1BQ0YsVUFBVTtBQUFBLFFBQ1IsaUJBQWlCO0FBQUEsVUFDZixpQkFBaUIsU0FBTyxRQUFRLHNCQUFzQixRQUFRO0FBQUEsUUFDaEU7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFFRCxPQUFPO0FBQUEsSUFDUCxZQUFZO0FBQUE7QUFBQSxJQUdaLFFBQVE7QUFBQSxNQUNOLFFBQVEsRUFBRSxZQUFZLDRDQUE0QztBQUFBLElBQ3BFLENBQUM7QUFBQTtBQUFBLElBR0QsUUFBUSxFQUFFLGFBQWEsaUJBQWlCLENBQUM7QUFBQTtBQUFBLElBR3pDLFdBQVc7QUFBQSxNQUNULE1BQU0sQ0FBQyx3QkFBd0IsbUJBQW1CLGdCQUFnQjtBQUFBLE1BQ2xFLEtBQUs7QUFBQSxNQUNMLFdBQVc7QUFBQSxRQUNULFVBQVMsU0FBUyxrQkFBa0IsRUFBRSxNQUFNLFdBQVcsTUFBTSxtQkFBbUIsSUFBSSxnQkFBZ0IsSUFBSTtBQUFBLE1BQzFHO0FBQUEsSUFDRixDQUFDO0FBQUE7QUFBQSxJQUdELFdBQVc7QUFBQSxNQUNULFNBQVMsQ0FBQyxPQUFPLHNCQUFzQixnQkFBZ0IsZ0JBQWdCLFlBQVksT0FBTztBQUFBLE1BQzFGLE1BQU07QUFBQSxRQUNKO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLGFBQWE7QUFBQSxNQUNiLFFBQVEsQ0FBQyxjQUFjLFlBQVk7QUFBQSxNQUNuQyxVQUFVLEVBQUUsU0FBUyxNQUFNLFVBQVUsK0JBQStCO0FBQUEsSUFDdEUsQ0FBQztBQUFBO0FBQUEsSUFHRCxjQUFjO0FBQUEsTUFDWixhQUFhO0FBQUEsTUFDYixpQkFBaUI7QUFBQSxNQUNqQixTQUFTLENBQUMsY0FBYyxJQUFJLElBQUksaUNBQWlDLHdDQUFlLENBQUMsQ0FBQztBQUFBLElBQ3BGLENBQUM7QUFBQTtBQUFBLElBR0QsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsTUFDcEQsU0FBUyxjQUFjLElBQUksSUFBSSxlQUFlLHdDQUFlLENBQUM7QUFBQSxNQUM5RCxZQUFZLGNBQWMsSUFBSSxJQUFJLGtCQUFrQix3Q0FBZSxDQUFDO0FBQUEsTUFDcEUsV0FBVyxjQUFjLElBQUksSUFBSSx1QkFBdUIsd0NBQWUsQ0FBQztBQUFBLE1BQ3hFLFdBQVcsY0FBYyxJQUFJLElBQUksdUJBQXVCLHdDQUFlLENBQUM7QUFBQSxNQUN4RSxnQkFBZ0IsY0FBYyxJQUFJLElBQUksb0JBQW9CLHdDQUFlLENBQUM7QUFBQSxNQUMxRSx5QkFBeUIsY0FBYyxJQUFJLElBQUksZ0RBQWdELHdDQUFlLENBQUM7QUFBQSxNQUMvRyxPQUFPLGNBQWMsSUFBSSxJQUFJLG1DQUFtQyx3Q0FBZSxDQUFDO0FBQUEsTUFDaEYsY0FBYyxjQUFjLElBQUksSUFBSSxnQ0FBZ0Msd0NBQWUsQ0FBQztBQUFBLElBQ3RGO0FBQUEsRUFDRjtBQUFBLEVBRUEsUUFBUSxFQUFFLGVBQWUsQ0FBQyxFQUFFO0FBQUEsRUFFNUIsT0FBTyxFQUFFLHVCQUF1QixJQUFLO0FBQUEsRUFFckMsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGdCQUFnQjtBQUFBLEVBQzVCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
