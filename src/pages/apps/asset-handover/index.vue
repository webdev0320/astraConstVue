<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Asset Handovers List</h3>

      <VTextField
        v-model="searchQuery"
        placeholder="Search asset handOver..."
        density="comfortable"
        variant="outlined"
        hide-details
        class="mx-4 flex-grow-1"
        @input="filterAssethadnover"
      />

      <VBtn
        color="primary"
        class="ms-auto"
        @click="$router.push('/dashboards/assethandovers/create')"
      >
        Create Handover
      </VBtn>
    </div>

    <!-- Table -->
    <VDataTable
      v-if="!isLoading && handovers.length"
      :headers="headers"
      :items="handovers"
      :items-per-page="10"
      class="mt-4"
    >
      <!-- Custom header slot -->
      <template #headers="{ columns }">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="handover-th"
          >
            {{ column.title }}
          </th>
        </tr>
      </template>

      <!-- Handover Date -->
      <template #item.handover_date="{ item }">
        {{ formatDate(item.raw?.handover_date ?? item.handover_date) }}
      </template>

      <!-- Handover By -->
      <template #item.handover_by_name="{ item }">
        {{ item.raw?.handover_by_name ?? item.handover_by_name ?? '—' }}
      </template>

      <!-- User -->
      <template #item.user_name="{ item }">
        {{ item.raw?.user_name ?? item.user_name ?? '—' }}
      </template>

      <!-- Remarks (truncated) -->
      <template #item.remarks="{ item }">
        <div class="desc-cell clamp-2" :title="item.raw?.remarks ?? item.remarks">
          {{ truncateSmart(item.raw?.remarks ?? item.remarks, 20, 120) }}
        </div>
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

            <VListItem @click="$router.push(`/dashboards/assethandovers/detail/${item.raw?.id ?? item.id}`)">
              <template #prepend><VIcon icon="tabler-eye" /></template>
              <VListItemTitle>Detail</VListItemTitle>
            </VListItem>            

            <VListItem @click="$router.push(`/dashboards/assethandovers/edit/${item.raw?.id ?? item.id}`)">
              <template #prepend><VIcon icon="tabler-edit" /></template>
              <VListItemTitle>Edit</VListItemTitle>
            </VListItem>

            <VListItem @click="deleteHandover(item.raw?.id ?? item.id)">
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

    <VCard v-else-if="!isLoading && !handovers.length" class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>No handover requests found</VCardTitle>
      <VCardText>
        You do not have any requests yet. Start by creating your first request.
      </VCardText>
      <VBtn
        color="primary"
        @click="$router.push('/dashboards/assethandovers/create')"
      >
        Create HandOver Request
      </VBtn>
    </VCard>

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
import axios from "axios";
import { onMounted, ref } from "vue";
import { VBtn, VDataTable } from "vuetify/components";
import ConfirmDialog from "@core/components/GlobalConfirmDialog.vue";
/* ========= CONFIG ========= */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL; // ends with /api
const apiListUrl   = `${apiBaseUrl}/asset-handovers`;
const apiDeleteUrl = (id) => `${apiBaseUrl}/asset-handovers/${id}`;

/* ====== State ====== */
const isLoading    = ref(false);
const handovers    = ref([]);
const errorMessage = ref("");

const searchQuery = ref('')

/* ====== Table headers ====== */
const headers = [
  { title: "ID", key: "handover_id" },

  { title: "Date", key: "handover_date" },
  { title: "AIR ID", key: "asset_investment_request_id" },

  { title: "Handover By", key: "handover_by_name" },
  { title: "Handover To", key: "user_name" },
  { title: "Req.Status", key: "reqStatus" },
  { title: "My Status", key: "myApprovalStatus" },
  { title: "Actions", key: "actions", sortable: false, width: 160 },
];

/* ====== Utils ====== */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};



const getAuthHeaders = () => {
  const accessToken = getCookie('accessToken')

  if (!accessToken) throw new Error('Access token is missing.')
  const decodedToken = decodeURIComponent(accessToken)
  return { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' }
}

const truncateSmart = (text, wordLimit = 20, charFallback = 120) => {
  if (!text) return "—";
  const str = String(text).trim();
  const words = str.split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : str;
  }
  return str.length > charFallback ? str.slice(0, charFallback) + "..." : str;
};


const confirmDialog = ref({
  value: false,
  title: "",
  message: "",
  color: "primary",
  onConfirm: null,
});


function filterAssethadnover() {
  // logic
}

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

        // Use POST so you can include remarks in body
        await axios.post(
          `${apiBaseUrl}/asset-handovers/${assetInvestmentRequestId}/changeStatus/${approvalId}/${encodeURIComponent(status)}`,
          { remarks }, // <-- send remarks in request body
          {
            headers: getAuthHeaders(),
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




const formatDate = (d) => {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

/* ====== Fetch list ====== */
const fetchHandovers = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {


    const res = await axios.get(apiListUrl, {
            headers: getAuthHeaders(),
    });

    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    handovers.value = list.map((p) => ({
      id: p.id,
      handover_id: p.handover_id,
      handover_date: p.handover_date ?? null,
      asset_investment_request_id: p.asset_investment_request_id ?? "—",
      quantity: p.quantity ?? "—",
      handover_by_name: p.handover_by?.name ?? "—",
      user_name: p.user?.name ?? "—",
      remarks: p.remarks ?? "—",
      reqStatus: p.status ?? "Pending",
      myApproval: p.myApproval,
      lastApprovedByUser: p.lastApprovedBy?.user_name,
      myApprovalStatus: p.myApproval?p.myApproval.status:'Pending',
    }));



  } catch (err) {
    console.error("Error fetching asset handovers:", err);
    errorMessage.value =
      err.response?.data?.message || err.message || "Failed to fetch asset handovers.";
  } finally {
    isLoading.value = false;
  }
};




/* ---------- DELETE HANDLER ---------- */
import Swal from "sweetalert2";
/* ---------------- Mutations ---------------- */
const deleteHandover = async (id) => {

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

    await axios.delete(apiDeleteUrl(id), {
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


/* ====== Lifecycle ====== */
onMounted(fetchHandovers);
</script>

<style scoped>
.v-data-table { margin-block-start: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }

.desc-cell {
  overflow: hidden;
  max-inline-size: 520px;
  overflow-wrap: anywhere;
  text-overflow: ellipsis;
  word-break: break-word;
}

.clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.text-danger { color: #d32f2f; }

.handover-th {
  padding: 10px;
  color: #000;
  font-weight: bold;
  text-align: start;
}

</style>
