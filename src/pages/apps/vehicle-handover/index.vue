<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Vehicle Handover List</h3>
      <VBtn
        color="primary"
        class="ms-auto"
        @click="$router.push('/dashboards/vehiclehandovers/create')"
      >
        Create Vehicle Handover
      </VBtn>
    </div>

    <VDataTable
      v-if="handovers.length > 0"
      :headers="headers"
      :items="handovers"
      :items-per-page="10"
      class="mt-3"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <!-- <VBtn
            color="warning"
            size="small"
            @click="$router.push(`/dashboards/vehiclehandovers/edit/${item.raw.id}`)"
          >
            Edit
          </VBtn> -->
          <VBtn
            color="error"
            size="small"
            @click="deleteHandover(item.raw.id)"
          >
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>
  </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { VBtn, VDataTable } from 'vuetify/components'

const apiBaseUrl = 'https://dm.kreashionsoftwarehouse.com/astraConst/public/api'

const headers = [
  { title: 'ID', key: 'id', width: 80 },
  { title: 'Investment Req', key: 'investment_req_id' },
  { title: 'Report Date', key: 'report_date' },
  { title: 'Plate No', key: 'plate_no' },
  { title: 'Vehicle', key: 'vehicle_type' },
  { title: 'Model', key: 'model_no' },
  { title: 'KM', key: 'km_reading' },
  { title: 'Handover DateTime', key: 'handover_dt_display' },
  { title: 'Receiving DateTime', key: 'receiving_dt_display' },
  { title: 'Releasing By', key: 'releasingName' },
  { title: 'Receiving By', key: 'receiverName' },
  { title: 'Driver', key: 'driverName' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const handovers = ref([])
const errorMessage = ref('')

// ---- utils ----
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const prettyDateTime = (val) => {
  if (!val) return '—'
  try {
    const s = String(val)
    const isoLike = s.includes('T') ? s : s.replace(' ', 'T')
    const d = new Date(isoLike)
    if (isNaN(d.getTime())) return s
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return String(val)
  }
}

// ---- fetch list ----
const fetchHandovers = async () => {
  try {
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const res = await axios.get(`${apiBaseUrl}/vehicle-handovers`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
        Accept: 'application/json',
      },
    })

    const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : [])
    handovers.value = list.map(h => ({
      id: h.id,
      investment_req_id: h.investment_req_id ?? '—',
      report_date: h.report_date ?? '—',
      plate_no: h.plate_no ?? '—',
      vehicle_type: h.vehicle_type ?? '—',
      model_no: h.model_no ?? '—',
      km_reading: h.km_reading ?? '—',
      handover_dt_display: prettyDateTime(h.handover_datetime),
      receiving_dt_display: prettyDateTime(h.receiving_datetime),
      releasingName: h.releasingName ?? '—',
      receiverName: h.receiverName ?? '—',
      driverName: h.driverName ?? '—',
    }))
  } catch (error) {
    console.error('Error fetching vehicle handovers:', error)
    errorMessage.value =
      error.response?.data?.message || 'Failed to fetch vehicle handovers.'
  }
}

onMounted(fetchHandovers)

// ---- delete ----
const deleteHandover = async (handoverId) => {
  if (!confirm('Are you sure you want to delete this vehicle handover?')) return
  try {
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    await axios.delete(`${apiBaseUrl}/vehicle-handovers/${handoverId}`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
        Accept: 'application/json',
      },
    })

    handovers.value = handovers.value.filter(h => h.id !== handoverId)
    alert('Vehicle handover deleted successfully!')
  } catch (error) {
    console.error('Error deleting vehicle handover:', error)
    alert(error.response?.data?.message || 'Failed to delete vehicle handover.')
  }
}
</script>

<style>
.v-data-table { margin-block-start: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.mt-3 { margin-block-start: 12px; }
</style>
