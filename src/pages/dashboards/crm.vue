<script setup>
import { ref } from 'vue'

const dashboardCards = ref([
  { title: 'Projects', icon: 'tabler-home', stat: `${(Math.random() * 200 + 50).toFixed(0)}`, color: 'success' },
  { title: 'Asset Investment Request', icon: 'tabler-device-gamepad-3', stat: `${(Math.random() * 100 + 10).toFixed(0)}`, color: 'info' },
  { title: 'Assets', icon: 'tabler-hammer', stat: `${(Math.random() * 300 + 50).toFixed(0)}`, color: 'warning' },
  { title: 'Asset HandOver', icon: 'tabler-table-row', stat: `${(Math.random() * 50 + 5).toFixed(0)}`, color: 'purple' },
  { title: 'Asset Transfer', icon: 'tabler-transfer', stat: `${(Math.random() * 80 + 10).toFixed(0)}`, color: 'teal' },
  { title: 'Vehicle Handover', icon: 'tabler-camper', stat: `${(Math.random() * 30 + 5).toFixed(0)}`, color: 'cyan' },
  { title: 'Rental Equipment', icon: 'tabler-badge-ar', stat: `${(Math.random() * 60 + 5).toFixed(0)}`, color: 'orange' },
  { title: 'Asset Damage Report', icon: 'tabler-car-crash', stat: `${(Math.random() * 10).toFixed(0)}`, color: 'error' },
  { title: 'Asset Missing Report', icon: 'tabler-zoom-out-area', stat: `${(Math.random() * 5).toFixed(0)}`, color: 'error' },
  { title: 'Asset Scrap Report', icon: 'tabler-trash', stat: `${(Math.random() * 15).toFixed(0)}`, color: 'warning' },
  { title: 'Policy Waiver Form', icon: 'tabler-file-info', stat: `${(Math.random() * 25).toFixed(0)}`, color: 'info' },
  { title: 'Asset Demobilization', icon: 'tabler-device-desktop-check', stat: `${(Math.random() * 20).toFixed(0)}`, color: 'primary' },
])
</script>

<template>
  <VRow class="match-height" dense>
    <VCol
      v-for="card in dashboardCards"
      :key="card.title"
      cols="12"
      sm="6"
      md="4"
      lg="4"
    >
      <VCard class="pa-4">
        <VCardText class="text-center">
          <VAvatar
            :color="card.color"
            variant="tonal"
            rounded
            size="44"
            class="mb-3"
          >
            <VIcon
              :icon="card.icon"
              size="28"
            />
          </VAvatar>

          <h5 class="text-h5">
            {{ card.title }}
          </h5>
          <p class="text-h6 font-weight-bold mt-2">
            {{ card.stat }}
          </p>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
