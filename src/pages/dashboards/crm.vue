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
      { title: "Projects", stat: d.project_count, color: "success",icon: "tabler-home" },
      { title: "Asset Investment Request", stat: d.assetInvestment_count, color: "info",icon: "tabler-device-gamepad-3" },
      { title: "Asset HandOver", stat: d.assetHandover_count, color: "purple",icon: "tabler-table-row" },
      { title: "Asset Transfer", stat: d.assetTransfer_count, color: "teal",icon: "tabler-transfer" },
      { title: "Vehicle Handover", stat: d.vehicleHandOver_count, color: "cyan",icon: "tabler-camper" },
      { title: "Rental Equipment", stat: d.rentalEquipment_count, color: "orange",icon: "tabler-badge-ar" },
      { title: "Asset Damage Report", stat: d.assetDamageReport_count, color: "error",icon: "tabler-car-crash" },
      { title: "Asset Missing Report", stat: d.assetMissingReport_count, color: "error",icon: "tabler-zoom-out-area" },
      { title: "Asset Scrap Report", stat: d.assetScrapReport_count, color: "warning",icon: "tabler-trash" },
      { title: "Asset Demobilization", stat: d.assetDemobilization_count, color: "primary",icon: "tabler-device-desktop-check" },
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
  <!-- TOP BAR -->
  <div class="top-bar d-flex align-center justify-space-between px-4">
    <div class="welcome-text">Welcome, {{ props.name }} 👋</div>

    <div class="date-time d-flex align-center">
      <span class="mr-4">{{ currentDate }}</span>
      <span>{{ currentTime }}</span>
    </div>
  </div>

  <!-- DASHBOARD GRID -->
  <VRow no-gutters class="dashboard-grid w-100 mt-4">

    <!-- Dashboard Cards -->
    <VCol
      class="mt-2"
      cols="12"
      sm="6"
      md="4"
      lg="4"
      v-for="(card, index) in dashboardCards"
      :key="index"
    >
      <VCard class="stat-card">
        <div class="card-header" :class="card.color"></div>

       <VCardItem>
          <div class="d-flex align-center justify-space-between w-100">
            <VCardTitle class="card-title">{{ card.title }}</VCardTitle>

            <VIcon
              :icon="card.icon"
              size="34"
              class="card-icon"
            />
          </div>
        </VCardItem>



        <VCardText class="pt-0">
          <div class="d-flex align-center justify-space-between">
            <h3 class="stat-value">{{ card.stat }}</h3>
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

.stat-card{
  width: 95%;
}

.card-icon {
  opacity: 0.85;
}


.stat-card,
.welcome-card {
  border-radius: 18px !important;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.stat-card:hover,
.welcome-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.card-header {
  height: 6px;
  border-radius: 0;
}

.card-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
}

.label {
  font-size: 14px;
  color: #888;
}

.value {
  font-size: 28px;
  font-weight: 700;
  color: #1976d2;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
}

.success {
  background: linear-gradient(90deg, #4caf50, #81c784);
}
.info {
  background: linear-gradient(90deg, #2196f3, #64b5f6);
}
.purple {
  background: linear-gradient(90deg, #9c27b0, #ce93d8);
}
.teal {
  background: linear-gradient(90deg, #009688, #4db6ac);
}
.cyan {
  background: linear-gradient(90deg, #00acc1, #4dd0e1);
}
.orange {
  background: linear-gradient(90deg, #fb8c00, #ffb74d);
}
.error {
  background: linear-gradient(90deg, #e53935, #ef9a9a);
}
.warning {
  background: linear-gradient(90deg, #fdd835, #fff176);
}
.primary {
  background: linear-gradient(90deg, #1976d2, #64b5f6);
}
.top-bar {
  width: 100%;
  height: 40px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  font-size: 16px;
  font-weight: 600;
}

.welcome-text {
  font-size: 18px;
  font-weight: 700;
  color: #1976d2;
}

.date-time span {
  font-size: 15px;
  font-weight: 600;
  color: #555;
}

</style>

