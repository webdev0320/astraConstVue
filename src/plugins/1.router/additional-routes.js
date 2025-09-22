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
    meta: { layout: 'default', navActiveLink: 'dashboards-assets' },
  },
  {
    path: '/dashboards/assets/edit/:id',
    name: 'dashboards-assets-edit',
    component: () => import('@/pages/apps/assets/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-assets' },
  },
  {
    path: '/dashboards/assetcategories',
    name: 'dashboards-assetcategories',
    component: () => import('@/pages/apps/asset-category/index.vue'),
  },
  {
    path: '/dashboards/assetcategories/create',
    name: 'dashboards-assetcategories-create',
    component: () => import('@/pages/apps/asset-category/create.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-assetcategories' },
  },
  {
    path: '/dashboards/assetcategories/edit/:id',
    name: 'dashboards-assetcategories-edit',
    component: () => import('@/pages/apps/asset-category/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-assetcategories' },
  },
  {
    path: '/dashboards/asset-investment-requests',
    name: 'dashboards-asset-investment-requests',
    component: () => import('@/pages/apps/asset-investment-request/index.vue'),
  },
  {
    path: '/dashboards/asset-investment-requests/create',
    name: 'dashboards-asset-investment-requests-create',
    component: () => import('@/pages/apps/asset-investment-request/create.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-asset-investment-requests' },
  },
  {
    path: '/dashboards/asset-investment-requests/edit/:id',
    name: 'dashboards-asset-investment-requests-edit',
    component: () => import('@/pages/apps/asset-investment-request/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-asset-investment-requests' },
  },
  {
    path: '/dashboards/asset-investment-requests/detail/:id',
    name: 'dashboards-asset-investment-requests-detail',
    component: () => import('@/pages/apps/asset-investment-request/detail.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-asset-investment-requests' },
  },
  
  {
    path: '/dashboards/assethandovers',
    name: 'dashboards-assethandovers',
    component: () => import('@/pages/apps/asset-handover/index.vue'),
  },
  {
    path: '/dashboards/assethandovers/create',
    name: 'dashboards-assethandovers-create',
    component: () => import('@/pages/apps/asset-handover/create.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-assethandovers' },
  },
  {
    path: '/dashboards/assethandovers/edit/:id',
    name: 'dashboards-assethandovers-edit',
    component: () => import('@/pages/apps/asset-handover/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-assethandovers' },
  },

  {
    path: '/dashboards/assettransfers',
    name: 'dashboards-assettransfers',
    component: () => import('@/pages/apps/asset-transfer/index.vue'),
  },
  {
    path: '/dashboards/assettransfers/create',
    name: 'dashboards-assettransfers-create',
    component: () => import('@/pages/apps/asset-transfer/create.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-assettransfers' },
  },
  {
    path: '/dashboards/assettransfers/edit/:id',
    name: 'dashboards-assettransfers-edit',
    component: () => import('@/pages/apps/asset-transfer/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-assettransfers' },
  },

  {
    path: '/dashboards/vehiclehandovers',
    name: 'dashboards-vehiclehandovers',
    component: () => import('@/pages/apps/vehicle-handover/index.vue'),
  },
  {
    path: '/dashboards/vehiclehandovers/create',
    name: 'dashboards-vehiclehandovers-create',
    component: () => import('@/pages/apps/vehicle-handover/create.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-vehiclehandovers' },
  },
  {
    path: '/dashboards/vehiclehandovers/edit/:id',
    name: 'dashboards-vehiclehandovers-edit',
    component: () => import('@/pages/apps/vehicle-handover/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-vehiclehandovers' },
  },
  
  {
    path: '/dashboards/rental-required',
    name: 'dashboards-rental-required',
    component: () => import('@/pages/apps/rental-required/index.vue'),
  },
  {
    path: '/dashboards/rental-required/create',
    name: 'dashboards-rental-required-create',
    component: () => import('@/pages/apps/rental-required/create.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-rental-required' },
  },
  {
    path: '/dashboards/rental-required/edit/:id',
    name: 'dashboards-rental-required-edit',
    component: () => import('@/pages/apps/rental-required/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-rental-required' },
  },

  {
    path: '/dashboards/locations',
    name: 'dashboards-locations',
    component: () => import('@/pages/apps/locations/index.vue'),
  },
  {
    path: '/dashboards/locations/create',
    name: 'dashboards-locations-create',
    component: () => import('@/pages/apps/locations/create.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-locations' },
  },
  {
    path: '/dashboards/locations/edit/:id',
    name: 'dashboards-locations-edit',
    component: () => import('@/pages/apps/locations/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-locations' },
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
    meta: { layout: 'default', navActiveLink: 'dashboards-projects' },
  },
  {
    path: '/dashboards/projects/edit/:id',
    name: 'dashboards-projects-edit',
    component: () => import('@/pages/apps/projects/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-projects' },
  },
  {
    path: '/dashboards/projects/:id/assignusers',
    name: 'dashboards-project-assignusers',
    component: () => import('@/pages/apps/projects/assignusers/index.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-projects' },
  },
  {
    path: '/dashboards/projects/:id/assignusers/create',
    name: 'dashboards-project-assignusers-create',
    component: () => import('@/pages/apps/projects/assignusers/create.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-projects' },
  },
    {
    path: '/dashboards/projects/:id/assignusers/:assignusersId/edit',
    name: 'dashboards-project-assignusers-edit',
    component: () => import('@/pages/apps/projects/assignusers/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-projects' },
  },

  {
    path: '/dashboards/projects/:id/budgets',
    name: 'dashboards-project-budget',
    component: () => import('@/pages/apps/projects/budget/index.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-projects' },
  },
  {
    path: '/dashboards/projects/:id/budgets/create',
    name: 'dashboards-project-budgets-create',
    component: () => import('@/pages/apps/projects/budget/create.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-projects' },
  },
    {
    path: '/dashboards/projects/:id/budgets/:budgetId/edit',
    name: 'dashboards-project-budgets-edit',
    component: () => import('@/pages/apps/projects/budget/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-projects' },
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
    meta: { layout: 'default', navActiveLink: 'dashboards-departments' },
  },
  {
    path: '/dashboards/departments/edit/:id',
    name: 'dashboards-departments-edit',
    component: () => import('@/pages/apps/departments/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-departments' },
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
    meta: { layout: 'default', navActiveLink: 'dashboards-users' },
  },
  {
    path: '/dashboards/users/edit/:id',
    name: 'dashboards-users-edit',
    component: () => import('@/pages/apps/user/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-users' },
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
    meta: { layout: 'default', navActiveLink: 'dashboards-faqs' },
  },
  {
    path: '/dashboards/faqs/edit/:id',
    name: 'dashboards-faqs-edit',
    component: () => import('@/pages/apps/faq/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-faqs' },
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
    meta: { layout: 'default', navActiveLink: 'dashboards-settings' },
  },
  {
    path: '/dashboards/settings/edit/:id',
    name: 'dashboards-settings-edit',
    component: () => import('@/pages/apps/setting/edit.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-settings' },
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
    meta: { layout: 'default', navActiveLink: 'dashboards-supports' },
  },
  {
    path: '/dashboards/supports/view/:id',
    name: 'dashboards-supports-view',
    component: () => import('@/pages/apps/support/view.vue'),
    meta: { layout: 'default', navActiveLink: 'dashboards-supports' },
  },
]
