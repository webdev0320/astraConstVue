import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import '@vueup/vue-quill/dist/vue-quill.snow.css'


// src/main.js
if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW !== 'true' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))
}

// MSW ko sirf tab start karo jab flag true ho
if (import.meta.env.VITE_USE_MSW === 'true') {
  const { initFakeApi } = await import('@/plugins/fake-api')
  await initFakeApi()
}

// Create vue app
const app = createApp(App)


// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
