import { createApp } from './vue'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// Unregister service worker in dev
if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW !== 'true' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))
}

const app = createApp(App)
registerPlugins(app)
app.mount('#app')
