const emailRouteComponent = () => import('@/pages/apps/email/index.vue')

// 👉 Redirects
export const redirects = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // TODO: Get type from backend
      const userData = useCookie('userData')
      const userRole = userData.value?.role
      if (userRole === 'admin')
        return { name: 'dashboards-crm' }
      if (userRole === 'client')
        return { name: 'access-control' }

      return { name: 'login', query: to.query }
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
]
export const routes = [
  // Email filter
  {
    path: '/apps/email/filter/:filter',
    name: 'apps-email-filter',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },

  // Email label
  {
    path: '/apps/email/label/:label',
    name: 'apps-email-label',
    component: emailRouteComponent,
    meta: {
      // contentClass: 'email-application',
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },
  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: () => import('@/pages/apps/logistics/dashboard.vue'),
  },
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: () => import('@/pages/apps/academy/dashboard.vue'),
  },
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/pages/dashboards/ecommerce.vue'),
  },
  {
    path: '/dashboards/assets',
    name: 'dashboards-assets',
    component: () => import('@/pages/apps/assets/index.vue'),
  },
  {
    path: '/dashboards/assets/create',
    name: 'dashboards-assets-create',
    component: () => import('@/pages/apps/assets/create.vue'),
  },
  {
    path: '/dashboards/assets/edit/:id',
    name: 'dashboards-assets-edit',
    component: () => import('@/pages/apps/assets/edit.vue'),
  },
  
  {
    path: '/dashboards/projects',
    name: 'dashboards-projects',
    component: () => import('@/pages/apps/projects/index.vue'),
  },
  {
    path: '/dashboards/projects/create',
    name: 'dashboards-projects-create',
    component: () => import('@/pages/apps/projects/create.vue'),
  },
  {
    path: '/dashboards/projects/edit/:id',
    name: 'dashboards-projects-edit',
    component: () => import('@/pages/apps/projects/edit.vue'),
  },

  {
    path: '/dashboards/departments',
    name: 'dashboards-departments',
    component: () => import('@/pages/apps/departments/index.vue'),
  },
  {
    path: '/dashboards/departments/create',
    name: 'dashboards-departments-create',
    component: () => import('@/pages/apps/departments/create.vue'),
  },
  {
    path: '/dashboards/departments/edit/:id',
    name: 'dashboards-departments-edit',
    component: () => import('@/pages/apps/departments/edit.vue'),
  },

  {
    path: '/dashboards/users',
    name: 'dashboards-users',
    component: () => import('@/pages/apps/user/index.vue'),
  },
  {
    path: '/dashboards/users/create',
    name: 'dashboards-users-create',
    component: () => import('@/pages/apps/user/create.vue'),
  },
  {
    path: '/dashboards/users/edit/:id',
    name: 'dashboards-users-edit',
    component: () => import('@/pages/apps/user/edit.vue'),
  },
  {
    path: '/dashboards/faqs',
    name: 'dashboards-faqs',
    component: () => import('@/pages/apps/faq/index.vue'),
  },
  {
    path: '/dashboards/faqs/create',
    name: 'dashboards-faqs-create',
    component: () => import('@/pages/apps/faq/create.vue'),
  },
  {
    path: '/dashboards/faqs/edit/:id',
    name: 'dashboards-faqs-edit',
    component: () => import('@/pages/apps/faq/edit.vue'),
  },
  {
    path: '/dashboards/settings',
    name: 'dashboards-settings',
    component: () => import('@/pages/apps/setting/index.vue'),
  },
  {
    path: '/dashboards/settings/create',
    name: 'dashboards-settings-create',
    component: () => import('@/pages/apps/setting/create.vue'),
  },
  {
    path: '/dashboards/settings/edit/:id',
    name: 'dashboards-settings-edit',
    component: () => import('@/pages/apps/setting/edit.vue'),
  },

  {
    path: '/dashboards/supports',
    name: 'dashboards-supports',
    component: () => import('@/pages/apps/support/index.vue'),
  },
  {
    path: '/dashboards/supports/create',
    name: 'dashboards-supports-create',
    component: () => import('@/pages/apps/support/create.vue'),
  },
  {
    path: '/dashboards/supports/view/:id',
    name: 'dashboards-supports-view',
    component: () => import('@/pages/apps/support/view.vue'),
  },
]
