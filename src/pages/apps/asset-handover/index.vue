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
              <VIcon :icon="isActive ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </VBtn>
          </template>

          <VList density="compact">

            <VListItem @click="$router.push(`/dashboards/assethandovers/detail/${item.raw?.id ?? item.id}`)">
              <template #prepend><VIcon icon="mdi-file-document" /></template>
              <VListItemTitle>Detail</VListItemTitle>
            </VListItem>            

            <VListItem @click="$router.push(`/dashboards/assethandovers/edit/${item.raw?.id ?? item.id}`)">
              <template #prepend><VIcon icon="mdi-pencil" /></template>
              <VListItemTitle>Edit</VListItemTitle>
            </VListItem>

            <VListItem @click="deleteHandover(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="mdi-delete" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>

            <VListItem @click="approveHandover(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="mdi-thumb-up" /></template>
              <VListItemTitle>Approve</VListItemTitle>
            </VListItem>

            <VListItem @click="rejectHandover(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="mdi-thumb-down" /></template>
              <VListItemTitle>Reject</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </template>
    </VDataTable>

    <!-- Empty / Loading / Error states -->
    <p v-else-if="!isLoading && !handovers.length">No handovers found.</p>
    <p v-else-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
    <p v-else>Loading...</p>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { VBtn, VDataTable } from "vuetify/components";

/* ========= CONFIG ========= */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL; // ends with /api
const apiListUrl   = `${apiBaseUrl}/asset-handovers`;
const apiDeleteUrl = (id) => `${apiBaseUrl}/asset-handovers/${id}`;

/* ====== State ====== */
const isLoading    = ref(false);
const handovers    = ref([]);
const errorMessage = ref("");

/* ====== Table headers ====== */
const headers = [
  { title: "ID", key: "id", width: 80 },
  { title: "Handover Date", key: "handover_date" },
  { title: "Asset Request ID", key: "asset_investment_request_id" },
  // { title: "Quantity", key: "quantity" },
  { title: "Handover By", key: "handover_by_name" },
  { title: "Handover To", key: "user_name" },
  { title: "Remarks", key: "remarks" },
  { title: "Actions", key: "actions", sortable: false, width: 160 },
];

/* ====== Utils ====== */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const getToken = () => {
  // Cookie first, then localStorage as fallback
  const fromCookie = getCookie("accessToken");
  if (fromCookie) return decodeURIComponent(fromCookie);
  const fromLS = localStorage.getItem("accessToken");
  return fromLS ? decodeURIComponent(fromLS) : null;
};

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
    const token = getToken();
    if (!token) throw new Error("Access token is missing. Please log in.");

    const res = await axios.get(apiListUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    handovers.value = list.map((p) => ({
      id: p.id,
      handover_date: p.handover_date ?? null,
      asset_investment_request_id: p.asset_investment_request_id ?? "—",
      quantity: p.quantity ?? "—",
      handover_by_name: p.handover_by?.name ?? "—",
      user_name: p.user?.name ?? "—",
      remarks: p.remarks ?? "—",
    }));
  } catch (err) {
    console.error("Error fetching asset handovers:", err);
    errorMessage.value =
      err.response?.data?.message || err.message || "Failed to fetch asset handovers.";
  } finally {
    isLoading.value = false;
  }
};

/* ====== Delete ====== */
const deleteHandover = async (id) => {
  if (!id) return;
  if (!confirm("Are you sure you want to delete this handover?")) return;

  try {
    const token = getToken();
    if (!token) throw new Error("Access token is missing. Please log in.");

    await axios.delete(apiDeleteUrl(id), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    handovers.value = handovers.value.filter((h) => h.id !== id);
    alert("Handover deleted successfully!");
  } catch (err) {
    console.error("Error deleting handover:", err);
    alert(err.response?.data?.message || err.message || "Failed to delete handover.");
  }
};

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
