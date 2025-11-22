<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Vehicle Handover List</h3>

      <VTextField
        v-model="searchQuery"
        placeholder="Search vehicle handover..."
        density="comfortable"
        variant="outlined"
        hide-details
        class="mx-4 flex-grow-1"
        @input="filtervehiclehandover"
      />

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
      <!-- Handover DateTime (formatted) -->
      <template #item.handover_dt_display="{ value }">
        <span>{{ value || '—' }}</span>
      </template>

      <!-- Receiving DateTime (formatted) -->
      <template #item.receiving_dt_display="{ value }">
        <span>{{ value || '—' }}</span>
      </template>

      <!-- Images: count + preview -->
      <template #item.images="{ value }">
        <div class="d-flex align-center gap-2">
          <span v-if="!(value && value.length)">—</span>
          <template v-else>
            <span class="text-caption">{{ value.length }} file(s)</span>
            <VBtn size="x-small" variant="tonal" @click="openImages(value)">
              View
            </VBtn>
          </template>
        </div>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <VMenu :close-on-content-click="true">
          <!-- Activator with arrow toggle -->
          <template #activator="{ props, isActive }">
            <VBtn
              v-bind="props"
              size="small"
              color="primary"
              variant="elevated"
              class="d-flex align-center gap-1"
            >
              Actions
              <VIcon :icon="isActive ? 'tabler-caret-up' : 'tabler-caret-down'" />
            </VBtn>
          </template>

          <VList density="compact">

            <VListItem
                @click="$router.push(`/dashboards/vehiclehandovers/${item.raw?.id ?? item.id}`)"
              >
                <template #prepend><VIcon icon="tabler-eye" /></template>
                <VListItemTitle>View Details</VListItemTitle>
            </VListItem>

            <!-- Delete -->
            <VListItem @click="deleteHandover(item.raw.id)">
              <template #prepend><VIcon icon="tabler-trash" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>

            <VListItem v-if="item?.myApproval !== null && (item?.myApprovalStatus=='Rejected' || item?.myApprovalStatus=='Pending')" @click="openApproveDialog(item?.id,item?.myApproval?.id,'APPROVED')">
              <template #prepend><VIcon icon="tabler-check" /></template>
              <VListItemTitle>Approve</VListItemTitle>
            </VListItem>

            <VListItem v-if="item?.myApproval !== null && (item?.myApprovalStatus=='Approved' || item?.myApprovalStatus=='Pending')" @click="openApproveDialog(item?.id,item?.myApproval?.id,'REJECTED')">
              <template #prepend><VIcon icon="tabler-player-stop" /></template>
              <VListItemTitle>Reject</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </template>
    </VDataTable>

    <VCard v-else-if="!isLoading && handovers.length === 0" class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>No Hand Over Requests Found</VCardTitle>
      <VCardText>
        You don’t have requests yet. Create your first one to get started.
      </VCardText>
      <VBtn color="primary" @click="$router.push('/dashboards/vehiclehandovers/create')">
        Create Hand Over Requests
      </VBtn>
    </VCard>

    <!-- Error / Loading (outside table for clarity) -->
    <p v-if="errorMessage" class="mt-3">{{ errorMessage }}</p>
    <p v-else-if="loading" class="mt-3">Loading...</p>

    <!-- Images Preview Dialog -->
    <VDialog v-model="imagesDialog.open" max-width="900">
      <VCard>
        <VCardTitle class="d-flex justify-between align-center">
          <span>Images</span>
          <VBtn icon="mdi-close" variant="text" @click="imagesDialog.open=false" />
        </VCardTitle>
        <VCardText>
          <div v-if="imagesDialog.urls.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div v-for="(url, idx) in imagesDialog.urls" :key="idx" class="image-tile">
              <VImg :src="url" :eager="true" aspect-ratio="16/9" cover />
              <div class="text-caption mt-1 break-all">
                <a :href="url" target="_blank" rel="noopener">Open original</a>
              </div>
            </div>
          </div>
          <div v-else class="py-6 text-center">No images available.</div>
        </VCardText>
        <VCardActions class="justify-end">
          <VBtn variant="text" @click="imagesDialog.open=false">Close</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>

    <ConfirmDialog
      v-model="confirmDialog.value"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :color="confirmDialog.color"
      :onConfirm="confirmDialog.onConfirm"
    />

</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VDataTable,
  VDialog,
  VImg,
} from 'vuetify/components'
import ConfirmDialog from "@core/components/GlobalConfirmDialog.vue";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api

const API_ORIGIN = new URL(apiBaseUrl).origin

// Table headers mapped to your API fields
const headers = [
  { title: 'ID', key: 'vehicle_handover_id'},
  { title: 'Plate#', key: 'plate_no' },
  { title: 'Veh', key: 'vehicle_type' },
  { title: 'DateTime', key: 'handover_dt_display' },
  { title: 'Rec DateTime', key: 'receiving_dt_display' },
  { title: "Req Status", key: "reqStatus" },
  { title: "My Status", key: "myApprovalStatus" },
  { title: 'Actions', key: 'actions', sortable: false },
]

const handovers = ref([])
const errorMessage = ref('')
const loading = ref(false)

// Image preview dialog state
const imagesDialog = ref({
  open: false,
  urls: [],
})

// --- utils ---
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const normalizeToken = (raw) => {
  if (!raw) return null
  const decoded = decodeURIComponent(raw)
  // sometimes stored with surrounding quotes
  return decoded.replace(/^"+|"+$/g, '')
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

// --- image URL normalization ---
const sanitizeUrl = (raw) => {
  if (!raw) return ''
  let s = String(raw).trim()

  // protocol-relative => https
  if (s.startsWith('//')) s = 'https:' + s

  // make absolute if relative
  if (!s.startsWith('http')) {
    if (!s.startsWith('/')) s = '/' + s
    s = API_ORIGIN + s
  }

  try {
    const u = new URL(s)
    // collapse duplicate slashes in pathname only (keep https://)
    u.pathname = u.pathname.replace(/\/{2,}/g, '/')
    return u.toString()
  } catch {
    return s
  }
}

const normalizeImageArray = (arr) =>
  Array.isArray(arr) ? arr.map(sanitizeUrl) : []

// --- open images preview ---
const openImages = (urls = []) => {
  imagesDialog.value.urls = normalizeImageArray(urls)
  imagesDialog.value.open = true
}

const confirmDialog = ref({
  value: false,
  title: "",
  message: "",
  color: "primary",
  onConfirm: null,
});


const openApproveDialog = (assetInvestmentRequestId, approvalId, status) => {
  confirmDialog.value = {
    value: true,
    title: status === "APPROVED" ? "Approve Request" : "Reject Request",
    message: status === "APPROVED"
      ? "Are you sure you want to approve this request? You may add remarks."
      : "Are you sure you want to reject this request? Please add remarks.",
    color: status === "APPROVED" ? "primary" : "error",
    // onConfirm receives remarks (string)
    onConfirm: async (remarks) => {
      try {
        actionLoading.value = true;
        const accessToken = getCookie("accessToken");
        if (!accessToken) throw new Error("Access token missing");

        const decodedToken = decodeURIComponent(accessToken);

        // Use POST so you can include remarks in body
        await axios.post(
          `${apiBaseUrl}/vehicle-handover/${assetInvestmentRequestId}/changeStatus/${approvalId}/${encodeURIComponent(status)}`,
          { remarks }, // <-- send remarks in request body
          {
            headers: {
              Authorization: `Bearer ${decodedToken}`,
              Accept: "application/json",
            },
          }
        );

        // success: refresh table
        await fetchAssetInvestmentRequests();
      } catch (error) {
        console.error("Approve/Reject failed:", error);
        alert(error.response?.data?.message || error.message || "Action failed");
        // rethrow if you want the dialog to keep showing loading; currently confirmWithRemarks catches errors
        throw error;
      } finally {
        actionLoading.value = false;
      }
    },
  };
};


// --- fetch list ---
const fetchHandovers = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const accessToken = normalizeToken(getCookie('accessToken'))
    if (!accessToken) throw new Error('Access token is missing. Please log in.')

    const res = await axios.get(`${apiBaseUrl}/vehicle-handovers`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    const list = Array.isArray(res.data?.data)
      ? res.data.data
      : (Array.isArray(res.data) ? res.data : [])

    handovers.value = list.map(h => ({
      id: h.id,
      vehicle_handover_id : h.vehicle_handover_id,
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
      images: normalizeImageArray(h.images),
      reqStatus: h.status,
      myApproval: h.myApproval,
      lastApprovedByUser: h.lastApprovedBy?.user_name,
      myApprovalStatus: h.myApproval?h.myApproval.status:'Pending',
    }))
  } catch (error) {
    console.error('Error fetching vehicle handovers:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to fetch vehicle handovers.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchHandovers)

// --- delete ---
const deleteHandover = async (handoverId) => {
  if (!confirm('Are you sure you want to delete this vehicle handover?')) return
  try {
    const accessToken = normalizeToken(getCookie('accessToken'))
    if (!accessToken) throw new Error('Access token is missing. Please log in.')

    await axios.delete(`${apiBaseUrl}/vehicle-handovers/${handoverId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.sm\:grid-cols-2 { }
.md\:grid-cols-3 { }

@media (min-width: 640px) { .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

@media (min-width: 768px) { .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.image-tile { overflow: hidden; border-radius: 10px; }
.text-caption { font-size: 12px; opacity: 0.8; }
</style>
