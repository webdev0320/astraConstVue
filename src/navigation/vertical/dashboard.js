export default [
      {
        title: 'Dashboard',
        to: 'dashboards-crm',
        icon: 'tabler-dashboard',
      },
      {
        title: 'Projects',
        to: 'dashboards-projects',
        icon: 'tabler-home',        
      },
      {
        title: 'Asset Investment Request',
        to: 'dashboards-asset-investment-requests',
        icon: 'tabler-device-gamepad-3',    
      },
        {
        title: 'Assets',
        to: 'dashboards-assets',
         roles: ['Admin','Asset Manager'], // 👈 Only Admins can see this
         icon: 'tabler-hammer',  
      },
      {
        title: 'Asset HandOver',
        to: 'dashboards-assethandovers',
        icon: 'tabler-table-row',  
      },
      {
        title: 'Asset Transfer',
        to: 'dashboards-assettransfers',
        icon: 'tabler-transfer', 
      },
      {
        title: 'Vehicle Handover',
        to: 'dashboards-vehiclehandovers',
        icon: 'tabler-camper', 
      },
      {
        title: 'Rental Equipment',
        to: 'dashboards-rental-required',
        icon: 'tabler-badge-ar', 
      },
      {
        title: 'Asset Damage Report',
        to: 'dashboards-asset-damage-report',
         icon: 'tabler-car-crash', 
      },
      {
        title: 'Asset Missing Report',
        to: 'dashboards-asset-missing-report',
         icon: 'tabler-zoom-out-area', 
       
      },
      {
        title: 'Asset Scrap Report',
        to: 'dashboards-asset-scrap-report',
        icon: 'tabler-trash', 
      },
      {
        title: 'Policy Waiver Form',
        to: 'dashboards-policy-waiver-form',
         icon: 'tabler-file-info', 
      },
      {
        title: 'Asset Demobilization',
        to: 'dashboards-asset-demobilizations',
         icon: 'tabler-device-desktop-check', 
      },
      {
        title: 'Daily Asset Reporting',
        to: 'dashboards-daily-asset-reportings',
         icon: 'tabler-report-analytics', 
      },
      {
        title: 'Assets Categories',
        to: 'dashboards-assetcategories',
         icon: 'tabler-category', 
      },
      {
        title: 'Departments',
        to: 'dashboards-departments',
         icon: 'tabler-window', 
      },
      {
        title: 'Location',
        to: 'dashboards-locations',
         icon: 'tabler-map-2', 
      },
      {
        title: 'Users',
        to: 'dashboards-users',
         icon: 'tabler-users', 
      },
      {
        title: 'Permissions',
        to: 'apps-permissions',
         icon: 'tabler-versions', 
      },
      {
        title: 'Settings',
        to: 'dashboards-settings',
         icon: 'tabler-settings', 
      }

]
