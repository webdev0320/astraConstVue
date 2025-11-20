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
  base: "./",
  // required if deploying in subfolder like public_html
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxsYXJhZ29uXFxcXHd3d1xcXFxhc3RyYUNvbnN0VnVlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxsYXJhZ29uXFxcXHd3d1xcXFxhc3RyYUNvbnN0VnVlXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9sYXJhZ29uL3d3dy9hc3RyYUNvbnN0VnVlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcbmltcG9ydCBWdWVSb3V0ZXIgZnJvbSAndW5wbHVnaW4tdnVlLXJvdXRlci92aXRlJ1xyXG5pbXBvcnQgeyBWdWVSb3V0ZXJBdXRvSW1wb3J0cywgZ2V0UGFzY2FsQ2FzZVJvdXRlTmFtZSB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1yb3V0ZXInXHJcbmltcG9ydCBMYXlvdXRzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1sYXlvdXRzJ1xyXG5pbXBvcnQgdnVldGlmeSBmcm9tICd2aXRlLXBsdWdpbi12dWV0aWZ5J1xyXG5pbXBvcnQgVnVlSTE4blBsdWdpbiBmcm9tICdAaW50bGlmeS91bnBsdWdpbi12dWUtaTE4bi92aXRlJ1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQgc3ZnTG9hZGVyIGZyb20gJ3ZpdGUtc3ZnLWxvYWRlcidcclxuaW1wb3J0IFZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogJy4vJywgLy8gcmVxdWlyZWQgaWYgZGVwbG95aW5nIGluIHN1YmZvbGRlciBsaWtlIHB1YmxpY19odG1sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgLy8gVnVlIFJvdXRlclxyXG4gICAgVnVlUm91dGVyKHtcclxuICAgICAgaW1wb3J0TW9kZTogJ2FzeW5jJyxcclxuICAgICAgZ2V0Um91dGVOYW1lOiByb3V0ZU5vZGUgPT5cclxuICAgICAgICBnZXRQYXNjYWxDYXNlUm91dGVOYW1lKHJvdXRlTm9kZSkucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKSxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIFZ1ZSBjb3JlXHJcbiAgICB2dWUoe1xyXG4gICAgICB0ZW1wbGF0ZToge1xyXG4gICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xyXG4gICAgICAgICAgaXNDdXN0b21FbGVtZW50OiB0YWcgPT4gdGFnID09PSAnc3dpcGVyLWNvbnRhaW5lcicgfHwgdGFnID09PSAnc3dpcGVyLXNsaWRlJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcblxyXG4gICAgdnVlSnN4KCksXHJcbiAgICBWdWVEZXZUb29scygpLFxyXG5cclxuICAgIC8vIFZ1ZXRpZnkgcGx1Z2luXHJcbiAgICB2dWV0aWZ5KHtcclxuICAgICAgc3R5bGVzOiB7IGNvbmZpZ0ZpbGU6ICdzcmMvYXNzZXRzL3N0eWxlcy92YXJpYWJsZXMvX3Z1ZXRpZnkuc2NzcycgfSxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIExheW91dHMgcGx1Z2luXHJcbiAgICBMYXlvdXRzKHsgbGF5b3V0c0RpcnM6ICcuL3NyYy9sYXlvdXRzLycgfSksXHJcblxyXG4gICAgLy8gQXV0byBjb21wb25lbnRzIGltcG9ydFxyXG4gICAgQ29tcG9uZW50cyh7XHJcbiAgICAgIGRpcnM6IFsnc3JjL0Bjb3JlL2NvbXBvbmVudHMnLCAnc3JjL3ZpZXdzL2RlbW9zJywgJ3NyYy9jb21wb25lbnRzJ10sXHJcbiAgICAgIGR0czogdHJ1ZSxcclxuICAgICAgcmVzb2x2ZXJzOiBbXHJcbiAgICAgICAgbmFtZSA9PiAobmFtZSA9PT0gJ1Z1ZUFwZXhDaGFydHMnID8geyBuYW1lOiAnZGVmYXVsdCcsIGZyb206ICd2dWUzLWFwZXhjaGFydHMnLCBhczogJ1Z1ZUFwZXhDaGFydHMnIH0gOiB1bmRlZmluZWQpLFxyXG4gICAgICBdLFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gQXV0byBpbXBvcnRzXHJcbiAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgaW1wb3J0czogWyd2dWUnLCBWdWVSb3V0ZXJBdXRvSW1wb3J0cywgJ0B2dWV1c2UvY29yZScsICdAdnVldXNlL21hdGgnLCAndnVlLWkxOG4nLCAncGluaWEnXSxcclxuICAgICAgZGlyczogW1xyXG4gICAgICAgICcuL3NyYy9AY29yZS91dGlscycsXHJcbiAgICAgICAgJy4vc3JjL0Bjb3JlL2NvbXBvc2FibGUnLFxyXG4gICAgICAgICcuL3NyYy9jb21wb3NhYmxlcycsXHJcbiAgICAgICAgJy4vc3JjL3V0aWxzJyxcclxuICAgICAgICAnLi9zcmMvcGx1Z2lucy8qL2NvbXBvc2FibGVzLyonLFxyXG4gICAgICBdLFxyXG4gICAgICB2dWVUZW1wbGF0ZTogdHJ1ZSxcclxuICAgICAgaWdub3JlOiBbJ3VzZUNvb2tpZXMnLCAndXNlU3RvcmFnZSddLFxyXG4gICAgICBlc2xpbnRyYzogeyBlbmFibGVkOiB0cnVlLCBmaWxlcGF0aDogJy4vLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nIH0sXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBpMThuIHBsdWdpblxyXG4gICAgVnVlSTE4blBsdWdpbih7XHJcbiAgICAgIHJ1bnRpbWVPbmx5OiB0cnVlLFxyXG4gICAgICBjb21wb3NpdGlvbk9ubHk6IHRydWUsXHJcbiAgICAgIGluY2x1ZGU6IFtmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL3BsdWdpbnMvaTE4bi9sb2NhbGVzLyoqJywgaW1wb3J0Lm1ldGEudXJsKSldLFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gU1ZHIGxvYWRlclxyXG4gICAgc3ZnTG9hZGVyKCksXHJcbiAgXSxcclxuXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAY29yZSc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvQGNvcmUnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0BsYXlvdXRzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9AbGF5b3V0cycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQGltYWdlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvYXNzZXRzL2ltYWdlcycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQHN0eWxlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvYXNzZXRzL3N0eWxlcycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAnQHRoZW1lQ29uZmlnJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3RoZW1lQ29uZmlnLmpzJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAY29uZmlndXJlZC12YXJpYWJsZXMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL2Fzc2V0cy9zdHlsZXMvdmFyaWFibGVzL190ZW1wbGF0ZS5zY3NzJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICdAZGInOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL3BsdWdpbnMvZmFrZS1hcGkvaGFuZGxlcnMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgJ0BhcGktdXRpbHMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL3BsdWdpbnMvZmFrZS1hcGkvdXRpbHMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgZGVmaW5lOiB7ICdwcm9jZXNzLmVudic6IHt9IH0sXHJcblxyXG4gIGJ1aWxkOiB7IGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNTAwMCB9LFxyXG5cclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGVudHJpZXM6IFsnLi9zcmMvKiovKi52dWUnXSxcclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThRLFNBQVMsb0JBQW9CO0FBQzNTLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7QUFDbkIsU0FBUyxlQUFlLFdBQVc7QUFDbkMsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsc0JBQXNCLDhCQUE4QjtBQUM3RCxPQUFPLGFBQWE7QUFDcEIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZUFBZTtBQUN0QixPQUFPLGlCQUFpQjtBQVorSSxJQUFNLDJDQUEyQztBQWN4TixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUE7QUFBQSxFQUNOLFNBQVM7QUFBQTtBQUFBLElBRVAsVUFBVTtBQUFBLE1BQ1IsWUFBWTtBQUFBLE1BQ1osY0FBYyxlQUNaLHVCQUF1QixTQUFTLEVBQUUsUUFBUSxxQkFBcUIsT0FBTyxFQUFFLFlBQVk7QUFBQSxJQUN4RixDQUFDO0FBQUE7QUFBQSxJQUdELElBQUk7QUFBQSxNQUNGLFVBQVU7QUFBQSxRQUNSLGlCQUFpQjtBQUFBLFVBQ2YsaUJBQWlCLFNBQU8sUUFBUSxzQkFBc0IsUUFBUTtBQUFBLFFBQ2hFO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBRUQsT0FBTztBQUFBLElBQ1AsWUFBWTtBQUFBO0FBQUEsSUFHWixRQUFRO0FBQUEsTUFDTixRQUFRLEVBQUUsWUFBWSw0Q0FBNEM7QUFBQSxJQUNwRSxDQUFDO0FBQUE7QUFBQSxJQUdELFFBQVEsRUFBRSxhQUFhLGlCQUFpQixDQUFDO0FBQUE7QUFBQSxJQUd6QyxXQUFXO0FBQUEsTUFDVCxNQUFNLENBQUMsd0JBQXdCLG1CQUFtQixnQkFBZ0I7QUFBQSxNQUNsRSxLQUFLO0FBQUEsTUFDTCxXQUFXO0FBQUEsUUFDVCxVQUFTLFNBQVMsa0JBQWtCLEVBQUUsTUFBTSxXQUFXLE1BQU0sbUJBQW1CLElBQUksZ0JBQWdCLElBQUk7QUFBQSxNQUMxRztBQUFBLElBQ0YsQ0FBQztBQUFBO0FBQUEsSUFHRCxXQUFXO0FBQUEsTUFDVCxTQUFTLENBQUMsT0FBTyxzQkFBc0IsZ0JBQWdCLGdCQUFnQixZQUFZLE9BQU87QUFBQSxNQUMxRixNQUFNO0FBQUEsUUFDSjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxhQUFhO0FBQUEsTUFDYixRQUFRLENBQUMsY0FBYyxZQUFZO0FBQUEsTUFDbkMsVUFBVSxFQUFFLFNBQVMsTUFBTSxVQUFVLCtCQUErQjtBQUFBLElBQ3RFLENBQUM7QUFBQTtBQUFBLElBR0QsY0FBYztBQUFBLE1BQ1osYUFBYTtBQUFBLE1BQ2IsaUJBQWlCO0FBQUEsTUFDakIsU0FBUyxDQUFDLGNBQWMsSUFBSSxJQUFJLGlDQUFpQyx3Q0FBZSxDQUFDLENBQUM7QUFBQSxJQUNwRixDQUFDO0FBQUE7QUFBQSxJQUdELFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3BELFNBQVMsY0FBYyxJQUFJLElBQUksZUFBZSx3Q0FBZSxDQUFDO0FBQUEsTUFDOUQsWUFBWSxjQUFjLElBQUksSUFBSSxrQkFBa0Isd0NBQWUsQ0FBQztBQUFBLE1BQ3BFLFdBQVcsY0FBYyxJQUFJLElBQUksdUJBQXVCLHdDQUFlLENBQUM7QUFBQSxNQUN4RSxXQUFXLGNBQWMsSUFBSSxJQUFJLHVCQUF1Qix3Q0FBZSxDQUFDO0FBQUEsTUFDeEUsZ0JBQWdCLGNBQWMsSUFBSSxJQUFJLG9CQUFvQix3Q0FBZSxDQUFDO0FBQUEsTUFDMUUseUJBQXlCLGNBQWMsSUFBSSxJQUFJLGdEQUFnRCx3Q0FBZSxDQUFDO0FBQUEsTUFDL0csT0FBTyxjQUFjLElBQUksSUFBSSxtQ0FBbUMsd0NBQWUsQ0FBQztBQUFBLE1BQ2hGLGNBQWMsY0FBYyxJQUFJLElBQUksZ0NBQWdDLHdDQUFlLENBQUM7QUFBQSxJQUN0RjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFFBQVEsRUFBRSxlQUFlLENBQUMsRUFBRTtBQUFBLEVBRTVCLE9BQU8sRUFBRSx1QkFBdUIsSUFBSztBQUFBLEVBRXJDLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxnQkFBZ0I7QUFBQSxFQUM1QjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
