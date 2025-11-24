<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const loading = ref(true)
const dashboardCards = ref([])
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const props = defineProps({
  name: { type: String, default: "User" },
})

// —————————————————————————————
// Helpers
// —————————————————————————————

// Read cookie
const getCookie = name =>
  document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="))
    ?.split("=")[1] || null

// Date + Time
const currentDate = ref("")
const currentTime = ref("")

const updateDateTime = () => {
  const now = new Date()

  currentDate.value = now.toISOString().slice(0, 10) // YYYY-MM-DD
  currentTime.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// —————————————————————————————
// Fetch Dashboard
// —————————————————————————————
const fetchDashboard = async () => {
  try {
    const token = decodeURIComponent(getCookie("accessToken") || "")

    const { data } = await axios.get(`${apiBaseUrl}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const d = data.data

    dashboardCards.value = [
      { title: "Projects", stat: d.project_count, color: "success" },
      { title: "Asset Investment Request", stat: d.assetInvestment_count, color: "info" },
      { title: "Asset HandOver", stat: d.assetHandover_count, color: "purple" },
      { title: "Asset Transfer", stat: d.assetTransfer_count, color: "teal" },
      { title: "Vehicle Handover", stat: d.vehicleHandOver_count, color: "cyan" },
      { title: "Rental Equipment", stat: d.rentalEquipment_count, color: "orange" },
      { title: "Asset Damage Report", stat: d.assetDamageReport_count, color: "error" },
      { title: "Asset Missing Report", stat: d.assetMissingReport_count, color: "error" },
      { title: "Asset Scrap Report", stat: d.assetScrapReport_count, color: "warning" },
      { title: "Asset Demobilization", stat: d.assetDemobilization_count, color: "primary" },
    ]
  } catch (err) {
    console.error("Dashboard API Error:", err)
  } finally {
    loading.value = false
  }
}

// Init
onMounted(() => {
  updateDateTime()
  setInterval(updateDateTime, 1000)
  fetchDashboard()
})
</script>

<template>

<VRow class="w-100" no-gutters gap="16">   <!-- 🔥 added gap -->

      <!-- Welcome Card -->
      <VCol cols="12" sm="6" md="4" lg="4">
        <VCardText class="text-center card-sm">
          <h5 class="text-h5">Welcome {{ props.name }}!</h5>

          <p class="mb-1 text-medium-emphasis">Time</p>
          <h4 class="text-h4 text-primary">{{ currentTime }}</h4>

          <p class="mb-1 text-medium-emphasis mt-4">Date</p>
          <h4 class="text-h4 text-primary">{{ currentDate }}</h4>
        </VCardText>
      </VCol>

      <!-- Dashboard Cards -->
      <VCol
        cols="12"
        sm="6"
        md="4"
        lg="4"
        v-for="(card, index) in dashboardCards"
        :key="index"
      >
        <VCard class="card-sm">   <!-- 🔥 reduced height -->
          <VCardItem class="pb-2">
            <VCardTitle>{{ card.title }}</VCardTitle>
            <VCardSubtitle>Total</VCardSubtitle>
          </VCardItem>

          <VCardText>
            <div class="d-flex align-center justify-space-between mt-2">
              <h4 class="text-h4 font-weight-medium">{{ card.stat }}</h4>
              <span class="text-sm" :class="`text-${card.color}`">+0%</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

    </VRow>

</template>
<style scoped lang="scss">
.card-sm {
  padding: 12px !important;   /* smaller padding */
  min-height: 140px;          /* reduce card height */
}

.congo-john-img {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 1.25rem;
}
</style>

