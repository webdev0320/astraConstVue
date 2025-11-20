<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Rental Required List</h3>

      <VTextField
        v-model="searchQuery"
        placeholder="Search rental..."
        density="comfortable"
        variant="outlined"
        hide-details
        class="mx-4 flex-grow-1"
        @input="filterRentalRequired"
      />

      <VBtn
        color="primary"
        class="ms-auto"
        @click="$router.push('/dashboards/rental-required/create')"
      >
        Create Rental Request
      </VBtn>
    </div>

    <VDataTable
      :headers="headers"
      :items="rentals"
      :items-per-page="10"
      class="mt-3"
    >
      <!-- Project Name -->
      <template #item.project_name="{ value }">
        <span>{{ value || '—' }}</span>
      </template>

      <!-- Activity for Asset Requests -->
      <template #item.activity="{ value }">
        <span>{{ value || '—' }}</span>
      </template>

      <!-- Requested No Days for Asset Requests -->
      <template #item.requested_no_days="{ value }">
        <span>{{ value || '—' }}</span>
      </template>

      <!-- Rental Equipment Activity -->
      <template #item.rental_activity="{ value }">
        <span>{{ value || '—' }}</span>
      </template>

      <!-- Requested No Days for Rental Equipment -->
      <template #item.rental_requested_no_days="{ value }">
        <span>{{ value || '—' }}</span>
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
            <!-- Delete -->
            <VListItem @click="$router.push(`/dashboards/rental-required/details/${item.id}`)">
              <template #prepend><VIcon icon="tabler-eye" /></template>
              <VListItemTitle>Details</VListItemTitle>
            </VListItem>

            <VListItem @click="deleteRentalRequest(item.id)">
              <template #prepend><VIcon icon="tabler-trash" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>

            <VListItem  v-if="item.myApproval !== null && (item.myApprovalStatus=='Rejected' || item.myApprovalStatus=='Pending')" @click="openApproveDialog(item.id,item.myApproval,'APPROVED')">
              <template #prepend><VIcon icon="tabler-check" /></template>
              <VListItemTitle>Approve</VListItemTitle>
            </VListItem>

            <VListItem v-if="item.myApproval !== null && (item.myApprovalStatus=='Approved' || item.myApprovalStatus=='Pending')" @click="openApproveDialog(item.id,item.myApproval,'REJECTED')">
              <template #prepend><VIcon icon="tabler-player-stop" /></template>
              <VListItemTitle>Reject</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </template>

      <template #no-data>
        <div class="py-6 text-center">No rental requests found.</div>
      </template>
    </VDataTable>

    <!-- Error / Loading (outside table for clarity) -->
    <p v-if="errorMessage" class="mt-3">{{ errorMessage }}</p>
    <p v-else-if="loading" class="mt-3">Loading...</p>
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
  VDataTable,
  VIcon,
  VList,
  VListItem,
  VListItemTitle,
  VMenu,
  VTextField
} from 'vuetify/components'
import ConfirmDialog from "@core/components/GlobalConfirmDialog.vue";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api

const API_ORIGIN = new URL(apiBaseUrl).origin

// Table headers mapped to your API fields
const headers = [
  { title: 'Request ID', key: 'rental_equipment_id' },
  { title: 'Project Name', key: 'project_name' },
  { title: 'Date', key: 'date' },
  { title: "Req Status", key: "reqStatus" },
  { title: "Status", key: "myApprovalStatus" },
  { title: 'Actions', key: 'actions', sortable: false },
]

const rentals = ref([])
const errorMessage = ref('')
const loading = ref(false)
const searchQuery = ref('')


const confirmDialog = ref({
  value: false,
  title: "",
  message: "",
  color: "primary",
  onConfirm: null,
});

const openApproveDialog = (rentalRequestId, approvalId,status) => {
  confirmDialog.value = {
    value: true,
    title: "Approve Request",
    message: "Are you sure you want to approve this request?",
    color: "primary",
    onConfirm: async () => {
      try {
        const accessToken = decodeURIComponent(getCookie("accessToken"));

        await axios.get(
          `${apiBaseUrl}/rental-required/changeStatus/${rentalRequestId}/${approvalId}/${status}`,
          {
            headers: { 
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );

        console.log(`Request ${rentalRequestId} approved by ${approvalId}`);
        // Optionally reload your table data
        await fetchRentalRequired();

      } catch (error) {
        console.error("Approve action failed:", error);
        alert(error.response?.data?.message || "Failed to approve request.");
      }
    },
  };
};


// --- fetch rental required list ---
const fetchRentalRequired = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const accessToken = normalizeToken(getCookie('accessToken'))
    if (!accessToken) throw new Error('Access token is missing. Please log in.')

    const res = await axios.get(`${apiBaseUrl}/rental-required`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    const list = Array.isArray(res.data?.data)
      ? res.data.data
      : []

    rentals.value = list.map(r => ({
      id: r.id,
      rental_equipment_id : r.rental_equipment_id,
      project_name: r.project_name ?? '—',
      date: r.date ?? '—',
      lastApprovedByUser: r.lastApprovedBy?r.lastApprovedBy.user_name:null,
      myApprovalStatus: r.myApproval?r.myApproval.status:'Pending',
      myApproval: r.myApproval?r.myApproval.id:null,
      reqStatus: r.status,
      asset_requests: r.asset_requests.map(req => ({
        activity: req.activity ?? '—',
        requested_no_days: req.requested_no_days ?? '—',
      })),
      rental_equipments: r.rental_equipments.map(eq => ({
        rental_activity: eq.activity ?? '—',
        rental_requested_no_days: eq.requested_no_days ?? '—',
      })),
    }))
  } catch (error) {
    console.error('Error fetching rental required:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to fetch rental required data.'
  } finally {
    loading.value = false
  }
}

// --- delete ---
const deleteRentalRequest = async (rentalId) => {
  if (!confirm('Are you sure you want to delete this rental request?')) return
  try {
    const accessToken = normalizeToken(getCookie('accessToken'))
    if (!accessToken) throw new Error('Access token is missing. Please log in.')

    await axios.delete(`${apiBaseUrl}/rental-required/${rentalId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    rentals.value = rentals.value.filter(r => r.id !== rentalId)
    alert('Rental request deleted successfully!')
  } catch (error) {
    console.error('Error deleting rental request:', error)
    alert(error.response?.data?.message || 'Failed to delete rental request.')
  }
}

// --- approve ---
const approveRentalRequest = async (rentalId) => {
  alert(`Approved rental request with ID: ${rentalId}`)
}

// --- reject ---
const rejectRentalRequest = async (rentalId) => {
  alert(`Rejected rental request with ID: ${rentalId}`)
}

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const normalizeToken = (raw) => {
  if (!raw) return null
  const decoded = decodeURIComponent(raw)
  return decoded.replace(/^"+|"+$/g, '')
}

// --- search filter ---
const filterRentalRequired = () => {
  rentals.value = rentals.value.filter(item => 
    item.project_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.asset_requests.some(req => req.activity.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    item.rental_equipments.some(eq => eq.rental_activity.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
}

onMounted(fetchRentalRequired)
</script>

<style scoped>
.v-data-table { margin-block-start: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.mt-3 { margin-block-start: 12px; }

</style>
