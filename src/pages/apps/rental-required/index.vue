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
      :items="filteredRentals"
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
            <VListItem @click="$router.push(`/dashboards/rental-required/details/${item.id}`)">
              <template #prepend><VIcon icon="tabler-eye" /></template>
              <VListItemTitle>Details</VListItemTitle>
            </VListItem>

            <VListItem @click="$router.push(`/dashboards/rental-required/edit/${item.id}`)">
              <template #prepend><VIcon icon="tabler-edit" /></template>
              <VListItemTitle>Edit</VListItemTitle>
            </VListItem>

            <VListItem @click="deleteRentalRequest(item.id)">
              <template #prepend><VIcon icon="tabler-trash" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>

            <VListItem
              v-if="item.myApproval !== null && (item.myApprovalStatus=='Rejected' || item.myApprovalStatus=='Pending')"
              @click="openApproveDialog(item.id,item.myApproval,'APPROVED')"
            >
              <template #prepend><VIcon icon="tabler-check" /></template>
              <VListItemTitle>Approve</VListItemTitle>
            </VListItem>

            <VListItem
              v-if="item.myApproval !== null && (item.myApprovalStatus=='Approved' || item.myApprovalStatus=='Pending')"
              @click="openApproveDialog(item.id,item.myApproval,'REJECTED')"
            >
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

    <p v-if="errorMessage" class="mt-3">{{ errorMessage }}</p>
    <p v-else-if="loading" class="mt-3">Loading...</p>

    <ConfirmDialog
      v-model="confirmDialog.value"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :color="confirmDialog.color"
      :onConfirm="confirmDialog.onConfirm"
    />
  </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'
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

// --------------------
// Table headers
// --------------------
const headers = [
  { title: 'Request ID', key: 'rental_equipment_id' },
  { title: 'Project Name', key: 'project_name' },
  { title: 'Date', key: 'date' },
  { title: "Req Status", key: "reqStatus" },
  { title: "My Status", key: "myApprovalStatus" },
  { title: 'Actions', key: 'actions', sortable: false },
]

// --------------------
// Refs
// --------------------
const rentals = ref([])
const filteredRentals = ref([])
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

// --------------------
// Helpers
// --------------------
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

const getAuthHeaders = () => {
  const token = normalizeToken(getCookie('accessToken'))
  if (!token) throw new Error('Access token is missing')
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' }
}

// --------------------
// Fetch rental list
// --------------------
const fetchRentalRequired = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const res = await axios.get(`${apiBaseUrl}/rental-required`, {
      headers: getAuthHeaders(),
    })

    const list = Array.isArray(res.data?.data) ? res.data.data : []

    rentals.value = list.map(r => ({
      id: r.id,
      rental_equipment_id : r.rental_equipment_id,
      project_name: r.project_name ?? '—',
      date: r.date ?? '—',
      lastApprovedByUser: r.lastApprovedBy ? r.lastApprovedBy.user_name : null,
      myApprovalStatus: r.myApproval ? r.myApproval.status : 'Pending',
      myApproval: r.myApproval ? r.myApproval.id : null,
      reqStatus: r.status,
      asset_requests: Array.isArray(r.asset_requests)
        ? r.asset_requests.map(req => ({
            activity: req.activity ?? '—',
            requested_no_days: req.requested_no_days ?? '—',
          }))
        : [],
      rental_equipments: Array.isArray(r.rental_equipments)
        ? r.rental_equipments.map(eq => ({
            rental_activity: eq.activity ?? '—',
            rental_requested_no_days: eq.requested_no_days ?? '—',
          }))
        : [],
    }))

    filteredRentals.value = [...rentals.value]

  } catch (error) {
    console.error('Error fetching rental required:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to fetch rental required data.'
  } finally {
    loading.value = false
  }
}


/* ---------- DELETE HANDLER ---------- */
import Swal from "sweetalert2";
/* ---------------- Mutations ---------------- */
const deleteRentalRequest = async (id) => {

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This request will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    customClass: {
      title: 'swal-title-color',      // title text
      content: 'swal-content-color',  // message text
      confirmButton: 'swal-confirm-btn', // confirm button text
      cancelButton: 'swal-cancel-btn'    // cancel button text
    }
  });

  if (!result.isConfirmed) return;

  try {
    Swal.fire({
      title: "Deleting...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    await axios.delete(`${apiBaseUrl}/rental-required/${id}`, {
        headers: getAuthHeaders(),
    });
    Swal.fire({
      title: "Deleted!",
      text: "Request deleted successfully.",
      icon: "success",
      customClass: {
        title: 'swal-title-color',      // title text
        content: 'swal-content-color',  // message text
        confirmButton: 'swal-confirm-btn', // confirm button text
        cancelButton: 'swal-cancel-btn'    // cancel button text
      }
    }).then(() => {
      // ✅ Reload the page
      window.location.reload();
    });;

  } catch (e) {
    console.error("Error deleting request:", e);

    Swal.fire({
      title: "Error!",
      text: e.response?.data?.message || "Failed to request.",
      icon: "error",
    });
  }

}

// --------------------
// Approve/Reject dialog
// --------------------
const openApproveDialog = (assetInvestmentRequestId, approvalId, status) => {
  confirmDialog.value = {
    value: true,
    title: status === "APPROVED" ? "Approve Request" : "Reject Request",
    message: status === "APPROVED"
      ? "Are you sure you want to approve this request? You may add remarks."
      : "Are you sure you want to reject this request? Please add remarks.",
    color: status === "APPROVED" ? "primary" : "error",
    onConfirm: async (remarks) => {
      try {
        const accessToken = normalizeToken(getCookie("accessToken"))
        if (!accessToken) throw new Error("Access token missing");

        await axios.post(
          `${apiBaseUrl}/rental-required/${assetInvestmentRequestId}/changeStatus/${approvalId}/${encodeURIComponent(status)}`,
          { remarks },
          { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" } }
        )

        await fetchRentalRequired()
      } catch (error) {
        console.error("Approve/Reject failed:", error)
        alert(error.response?.data?.message || error.message || "Action failed")
        throw error
      }
    },
  }
}

// --------------------
// Search filter
// --------------------
const filterRentalRequired = () => {
  const q = searchQuery.value.toLowerCase().trim()
  filteredRentals.value = rentals.value.filter(item => 
    item.project_name.toLowerCase().includes(q) ||
    item.asset_requests.some(req => req.activity.toLowerCase().includes(q)) ||
    item.rental_equipments.some(eq => eq.rental_activity.toLowerCase().includes(q))
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
