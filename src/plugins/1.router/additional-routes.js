
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


{
  path: '/dashboards/assets',
  name: 'dashboards-assets',
  component: () => import('@/pages/apps/assets/index.vue'),
  meta: {
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Assets' },
    ],
  },
},

{
  path: '/dashboards/assets/create',
  name: 'dashboards-assets-create',
  component: () => import('@/pages/apps/assets/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-assets',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Assets', to: '/dashboards/assets' },
      { title: 'Create Asset' },
    ],
  },
},

{
  path: '/dashboards/assets/edit/:id',
  name: 'dashboards-assets-edit',
  component: () => import('@/pages/apps/assets/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-assets',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Assets', to: '/dashboards/assets' },
      { title: `Edit Asset #${route.params.id}` },
    ],
  },
},

{
  path: '/dashboards/assets/detail/:id',
  name: 'dashboards-assets-detail',
  component: () => import('@/pages/apps/assets/detail.vue'),
  meta: {
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Assets', to: '/dashboards/assets' },
      { title: `Asset #${route.params.id}` },
    ],
  },
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
  meta: {
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Investment Requests' },
    ],
  },
},

{
  path: '/dashboards/asset-investment-requests/create',
  name: 'dashboards-asset-investment-requests-create',
  component: () => import('@/pages/apps/asset-investment-request/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-asset-investment-requests',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Investment Requests', to: '/dashboards/asset-investment-requests' },
      { title: 'Create Request' },
    ],
  },
},

{
  path: '/dashboards/asset-investment-requests/edit/:id',
  name: 'dashboards-asset-investment-requests-edit',
  component: () => import('@/pages/apps/asset-investment-request/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-asset-investment-requests',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Investment Requests', to: '/dashboards/asset-investment-requests' },
      { title: `Edit #${route.params.id}` },
    ],
  },
},

{
  path: '/dashboards/asset-investment-requests/detail/:id',
  name: 'dashboards-asset-investment-requests-detail',
  component: () => import('@/pages/apps/asset-investment-request/detail.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-asset-investment-requests',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Investment Requests', to: '/dashboards/asset-investment-requests' },
      { title: `Request #${route.params.id}` },
    ],
  },
},



 {
  path: '/dashboards/assethandovers',
  name: 'dashboards-assethandovers',
  component: () => import('@/pages/apps/asset-handover/index.vue'),
  meta: {
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Handovers' },
    ],
  },
},

{
  path: '/dashboards/assethandovers/create',
  name: 'dashboards-assethandovers-create',
  component: () => import('@/pages/apps/asset-handover/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-assethandovers',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Handovers', to: '/dashboards/assethandovers' },
      { title: 'Create Handover' },
    ],
  },
},

{
  path: '/dashboards/assethandovers/edit/:id',
  name: 'dashboards-assethandovers-edit',
  component: () => import('@/pages/apps/asset-handover/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-assethandovers',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Handovers', to: '/dashboards/assethandovers' },
      { title: `Edit Handover #${route.params.id}` },
    ],
  },
},

{
  path: '/dashboards/assethandovers/detail/:id',
  name: 'dashboards-assethandovers-detail',
  component: () => import('@/pages/apps/asset-handover/detail.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-assethandovers',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Handovers', to: '/dashboards/assethandovers' },
      { title: `Handover #${route.params.id}` },
    ],
  },
},

  {
  path: '/dashboards/assettransfers',
  name: 'dashboards-assettransfers',
  component: () => import('@/pages/apps/asset-transfer/index.vue'),
  meta: {
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Transfer' },
    ],
  },
},

{
  path: '/dashboards/assettransfers/create',
  name: 'dashboards-assettransfers-create',
  component: () => import('@/pages/apps/asset-transfer/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-assettransfers',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Transfer', to: '/dashboards/assettransfers' },
      { title: 'Create' },
    ],
  },
},

{
  path: '/dashboards/assettransfers/edit/:id',
  name: 'dashboards-assettransfers-edit',
  component: () => import('@/pages/apps/asset-transfer/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-assettransfers',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Transfer', to: '/dashboards/assettransfers' },
      { title: 'Edit' },
    ],
  },
},

{
  path: '/dashboards/assettransfers/:id',
  name: 'dashboards-assettransfers-show',
  component: () => import('@/pages/apps/asset-transfer/show.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-assettransfers',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Transfer', to: '/dashboards/assettransfers' },
      { title: 'Detail' },
    ],
  },
},

{
  path: '/dashboards/vehiclehandovers',
  name: 'dashboards-vehiclehandovers',
  component: () => import('@/pages/apps/vehicle-handover/index.vue'),
  meta: {
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Vehicle Handover' },
    ],
  },
},

{
  path: '/dashboards/vehiclehandovers/:id',
  name: 'dashboards-vehiclehandovers-show',
  component: () => import('@/pages/apps/vehicle-handover/show.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-vehiclehandovers',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Vehicle Handover', to: '/dashboards/vehiclehandovers' },
      { title: 'Detail' },
    ],
  },
},

{
  path: '/dashboards/vehiclehandovers/create',
  name: 'dashboards-vehiclehandovers-create',
  component: () => import('@/pages/apps/vehicle-handover/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-vehiclehandovers',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Vehicle Handover', to: '/dashboards/vehiclehandovers' },
      { title: 'Create' },
    ],
  },
},

{
  path: '/dashboards/vehiclehandovers/edit/:id',
  name: 'dashboards-vehiclehandovers-edit',
  component: () => import('@/pages/apps/vehicle-handover/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-vehiclehandovers',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Vehicle Handover', to: '/dashboards/vehiclehandovers' },
      { title: 'Edit' },
    ],
  },
},

  
 {
  path: '/dashboards/rental-required',
  name: 'dashboards-rental-required',
  component: () => import('@/pages/apps/rental-required/index.vue'),
  meta: {
    breadcrumb: [
      { title: 'Dashboard', to: '/' },
      { title: 'Rental Required', active: true },
    ],
  },
},
{
  path: '/dashboards/rental-required/create',
  name: 'dashboards-rental-required-create',
  component: () => import('@/pages/apps/rental-required/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-rental-required',
    breadcrumb: [
      { title: 'Dashboard', to: '/' },
      { title: 'Rental Required', to: '/dashboards/rental-required' },
      { title: 'Create', active: true },
    ],
  },
},
{
  path: '/dashboards/rental-required/edit/:id',
  name: 'dashboards-rental-required-edit',
  component: () => import('@/pages/apps/rental-required/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-rental-required',
    breadcrumb: [
      { title: 'Dashboard', to: '/' },
      { title: 'Rental Required', to: '/dashboards/rental-required' },
      { title: 'Edit', active: true },
    ],
  },
},

{
  path: '/dashboards/rental-required/details/:id',
  name: 'dashboards-rental-required-details',
  component: () => import('@/pages/apps/rental-required/details.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-rental-required',
    breadcrumb: [
      { title: 'Dashboard', to: '/' },
      { title: 'Rental Required', to: '/dashboards/rental-required' },
      { title: 'Edit', active: true },
    ],
  },
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
  meta: {
    navActiveLink: 'dashboards-projects',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects' }
    ]
  },
},

{
  path: '/dashboards/projects/create',
  name: 'dashboards-projects-create',
  component: () => import('@/pages/apps/projects/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: 'Create Project' }
    ],
  },
},

{
  path: '/dashboards/projects/edit/:id',
  name: 'dashboards-projects-edit',
  component: () => import('@/pages/apps/projects/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: `Edit #${route.params.id}` }
    ],
  },
},

{
  path: "/dashboards/projects/show/:id",
  name: "dashboards-projects-show",
  component: () => import("@/pages/apps/projects/show.vue"),
  meta: {
    layout: "default",
    navActiveLink: "dashboards-projects",
    breadcrumb: (route) => [
      { title: "Dashboard", to: "/dashboards/projects" },
      { title: "Projects", to: "/dashboards/projects" },
      { title: `Details #${route.params.id}` },
    ],
  },
},

// Assign Users Routes
{
  path: '/dashboards/projects/:id/assignusers',
  name: 'dashboards-project-assignusers',
  component: () => import('@/pages/apps/projects/assignusers/index.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: `Project #${route.params.id}`, to: `/dashboards/projects/edit/${route.params.id}` },
      { title: 'Assigned Users' }
    ],
  },
},

// Assign assets Routes
{
  path: '/dashboards/projects/:id/assignAssets',
  name: 'dashboards-project-assignAssets',
  component: () => import('@/pages/apps/projects/assignAssets/index.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: 'Assign Assets' }
    ],
  },
},

{
  path: '/dashboards/projects/:id/assignAssets/create',
  name: 'dashboards-project-assignAssets/create',
  component: () => import('@/pages/apps/projects/assignAssets/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: `Project #${route.params.id}`, to: `/dashboards/projects/edit/${route.params.id}` },
      { title: 'Assign Assets' }
    ],
  },
},


{
  path: '/dashboards/projects/:id/assignusers/create',
  name: 'dashboards-project-assignusers-create',
  component: () => import('@/pages/apps/projects/assignusers/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: `Project #${route.params.id}`, to: `/dashboards/projects/edit/${route.params.id}` },
      { title: 'Assigned Users', to: `/dashboards/projects/${route.params.id}/assignusers` },
      { title: 'Add User' }
    ],
  },
},

{
  path: '/dashboards/projects/:id/assignusers/:assignusersId/edit',
  name: 'dashboards-project-assignusers-edit',
  component: () => import('@/pages/apps/projects/assignusers/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: `Project #${route.params.id}`, to: `/dashboards/projects/edit/${route.params.id}` },
      { title: 'Assigned Users', to: `/dashboards/projects/${route.params.id}/assignusers` },
      { title: `Edit Assigned User #${route.params.assignusersId}` }
    ],
  },
},

// Budget Routes
{
  path: '/dashboards/projects/:id/budgets',
  name: 'dashboards-project-budget',
  component: () => import('@/pages/apps/projects/budget/index.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: `Project #${route.params.id}`, to: `/dashboards/projects/edit/${route.params.id}` },
      { title: 'Budgets' }
    ],
  },
},

{
  path: '/dashboards/projects/:id/budgets/create',
  name: 'dashboards-project-budgets-create',
  component: () => import('@/pages/apps/projects/budget/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: `Project #${route.params.id}`, to: `/dashboards/projects/edit/${route.params.id}` },
      { title: 'Budgets', to: `/dashboards/projects/${route.params.id}/budgets` },
      { title: 'Create Budget' }
    ],
  },
},

{
  path: '/dashboards/projects/:id/budgets/:budgetId/edit',
  name: 'dashboards-project-budgets-edit',
  component: () => import('@/pages/apps/projects/budget/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-projects',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards/projects' },
      { title: 'Projects', to: '/dashboards/projects' },
      { title: `Project #${route.params.id}`, to: `/dashboards/projects/edit/${route.params.id}` },
      { title: 'Budgets', to: `/dashboards/projects/${route.params.id}/budgets` },
      { title: `Edit Budget #${route.params.budgetId}` }
    ],
  },
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

  {
    path: '/dashboards/asset-damage-report',
    name: 'dashboards-asset-damage-report',
    component: () => import('@/pages/apps/asset-damage-report/index.vue'),
  },
  {
    path: '/dashboards/asset-damage-report/create',
    name: 'dashboards-asset-damage-report-create',
    component: () => import('@/pages/apps/asset-damage-report/create.vue'),
  },
  {
    path: '/dashboards/asset-damage-report/detail/:id',
    name: 'dashboards-asset-damage-report-detail',
    component: () => import('@/pages/apps/asset-damage-report/detail.vue'),
  },
  {
    path: '/dashboards/asset-damage-report/edit/:id',
    name: 'dashboards-asset-damage-report-edit',
    component: () => import('@/pages/apps/asset-damage-report/edit.vue'),
  },
  {
    path: '/dashboards/asset-missing-report',
    name: 'dashboards-asset-missing-report',
    component: () => import('@/pages/apps/asset-missing-report/index.vue'),
  },
  {
    path: '/dashboards/asset-missing-report/detail/:id',
    name: 'dashboards-asset-missing-report-detail',
    component: () => import('@/pages/apps/asset-missing-report/detail.vue'),
  },
  {
    path: '/dashboards/asset-missing-report/edit/:id',
    name: 'dashboards-asset-missing-report-edit',
    component: () => import('@/pages/apps/asset-missing-report/edit.vue'),
  },  
  {
    path: '/dashboards/asset-missing-report/create',
    name: 'dashboards-asset-missing-report-create',
    component: () => import('@/pages/apps/asset-missing-report/create.vue'),
  },
  {
    path: '/dashboards/asset-scrap-report',
    name: 'dashboards-asset-scrap-report',
    component: () => import('@/pages/apps/asset-scrap-report/index.vue'),
  },

  {
    path: '/dashboards/asset-scrap-report/create',
    name: 'dashboards-asset-scrap-report-create',
    component: () => import('@/pages/apps/asset-scrap-report/create.vue'),
  },  
  {
    path: '/dashboards/asset-scrap-report/detail/:id',
    name: 'dashboards-asset-scrap-report-detail',
    component: () => import('@/pages/apps/asset-scrap-report/detail.vue'),
  },
  {
    path: '/dashboards/asset-scrap-report/edit/:id',
    name: 'dashboards-asset-scrap-report-edit',
    component: () => import('@/pages/apps/asset-scrap-report/edit.vue'),
  },
  {
    path: '/dashboards/policy-waiver-form',
    name: 'dashboards-policy-waiver-form',
    component: () => import('@/pages/apps/policy-waiver-form/index.vue'),
  },

  {
    path: '/dashboards/policy-waiver-form/create',
    name: 'dashboards-policy-waiver-form-create',
    component: () => import('@/pages/apps/policy-waiver-form/create.vue'),
  },  

  {
    path: '/dashboards/policy-waiver-form/detail/:id',
    name: 'dashboards-policy-waiver-form-detail',
    component: () => import('@/pages/apps/policy-waiver-form/detail.vue'),
  },

  {
    path: '/dashboards/policy-waiver-form/edit/:id',
    name: 'dashboards-policy-waiver-form-edit',
    component: () => import('@/pages/apps/policy-waiver-form/edit.vue'),
  },

  {
  path: '/dashboards/asset-demobilizations',
  name: 'dashboards-asset-demobilizations',
  component: () => import('@/pages/apps/asset-demobilizations/index.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-asset-demobilizations',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Demobilizations' }
    ],
  },
},
{
  path: '/dashboards/asset-demobilizations/create',
  name: 'dashboards-asset-demobilizations-create',
  component: () => import('@/pages/apps/asset-demobilizations/create.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-asset-demobilizations',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Demobilizations', to: '/dashboards/asset-demobilizations' },
      { title: 'Create' }
    ],
  },
},
{
  path: '/dashboards/asset-demobilizations/detail/:id',
  name: 'dashboards-asset-demobilizations-detail',
  component: () => import('@/pages/apps/asset-demobilizations/show.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-asset-demobilizations',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Demobilizations', to: '/dashboards/asset-demobilizations' },
      { title: `Detail #${route.params.id}` }
    ],
  },
},
{
  path: '/dashboards/asset-demobilizations/edit/:id',
  name: 'dashboards-asset-demobilizations-edit',
  component: () => import('@/pages/apps/asset-demobilizations/edit.vue'),
  meta: {
    layout: 'default',
    navActiveLink: 'dashboards-asset-demobilizations',
    breadcrumb: route => [
      { title: 'Dashboard', to: '/dashboards' },
      { title: 'Asset Demobilizations', to: '/dashboards/asset-demobilizations' },
      { title: `Edit #${route.params.id}` }
    ],
  },
},

 {
    path: '/dashboards/daily-asset-reportings',
    name: 'dashboards-daily-asset-reportings',
    component: () => import('@/pages/apps/daily-asset-reportings/index.vue'),
    meta: {
      layout: 'default',
      navActiveLink: 'dashboards-daily-asset-reportings',
      breadcrumb: [
        { title: 'Dashboard', to: '/dashboards' },
        { title: 'Daily Asset Reportings' }
      ],
    },
  },
  {
    path: '/dashboards/daily-asset-reportings/create',
    name: 'dashboards-daily-asset-reportings-create',
    component: () => import('@/pages/apps/daily-asset-reportings/create.vue'),
    meta: {
      layout: 'default',
      navActiveLink: 'dashboards-daily-asset-reportings',
      breadcrumb: [
        { title: 'Dashboard', to: '/dashboards' },
        { title: 'Daily Asset Reportings', to: '/dashboards/daily-asset-reportings' },
        { title: 'Create' }
      ],
    },
  },



]
