// src/plugins/fake-api/index.js
import { setupWorker } from 'msw/browser'

// ---- Handlers ----
import { handlerAppBarSearch } from '@db/app-bar-search/index'
import { handlerAppsAcademy } from '@db/apps/academy/index'
import { handlerAppsCalendar } from '@db/apps/calendar/index'
import { handlerAppsChat } from '@db/apps/chat/index'
import { handlerAppsEcommerce } from '@db/apps/ecommerce/index'
import { handlerAppsEmail } from '@db/apps/email/index'
import { handlerAppsInvoice } from '@db/apps/invoice/index'
import { handlerAppsKanban } from '@db/apps/kanban/index'
import { handlerAppLogistics } from '@db/apps/logistics/index'
import { handlerAppsPermission } from '@db/apps/permission/index'
import { handlerAppsUsers } from '@db/apps/users/index'
import { handlerAuth } from '@db/auth/index'
import { handlerDashboard } from '@db/dashboard/index'
import { handlerPagesDatatable } from '@db/pages/datatable/index'
import { handlerPagesFaq } from '@db/pages/faq/index'
import { handlerPagesHelpCenter } from '@db/pages/help-center/index'
import { handlerPagesProfile } from '@db/pages/profile/index'

// Handlers ko ek jagah collect karein
const handlers = [
  ...handlerAppsEcommerce,
  ...handlerAppsAcademy,
  ...handlerAppsInvoice,
  ...handlerAppsUsers,
  ...handlerAppsEmail,
  ...handlerAppsCalendar,
  ...handlerAppsChat,
  ...handlerAppsPermission,
  ...handlerPagesHelpCenter,
  ...handlerPagesProfile,
  ...handlerPagesFaq,
  ...handlerPagesDatatable,
  ...handlerAppBarSearch,
  ...handlerAppLogistics,
  ...handlerAuth,
  ...handlerAppsKanban,
  ...handlerDashboard,
]

// Worker export (agar kahin aur directly chahiye ho)
export const worker = setupWorker(...handlers)

/**
 * MSW ko sirf jab aap chaahein tab start karein.
 * Env flag: VITE_USE_MSW === 'true' ho to start hoga, warna NO-OP.
 * @returns {Promise<import('msw').SetupWorkerApi|null>}
 */
export async function initFakeApi() {
  const enabled = import.meta.env.VITE_USE_MSW === 'true'
  if (!enabled) return null

  const workerUrl = `${import.meta.env.BASE_URL ?? '/'}mockServiceWorker.js`

  return worker.start({
    serviceWorker: { url: workerUrl },
    // Real backend ke requests ko disturb na kare:
    onUnhandledRequest: 'bypass',
  })
}

// Backward compatibility: default export as starter function
export default initFakeApi
