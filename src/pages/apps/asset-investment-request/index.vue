<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Asset Investment Request List</h3>
      <VBtn
        color="primary"
        class="ms-auto"
        @click="$router.push('/dashboards/asset-investment-requests/create')"
      >
        Create Asset Investment Request
      </VBtn>
    </div>

    <VDataTable
      v-if="assetInvestmentRequests.length > 0"
      :headers="headers"
      :items="assetInvestmentRequests"
      :items-per-page="10"
    >
      <!-- DATE -->
      <template #item.date="{ item }">
        {{ formatDate(item.raw?.date ?? item.date) }}
      </template>

      <!-- PLANNED COST -->
      <template #item.planned_cost="{ item }">
        {{ formatCurrency(item.raw?.planned_cost ?? item.planned_cost) }}
      </template>

      <!-- PROJECT -->
      <template #item.project_name="{ item }">
        {{ item.raw?.project?.name ?? item.project_name ?? '—' }}
      </template>

      <!-- USER -->
      <template #item.user_display="{ item }">
        <div>
          <div>{{ item.raw?.user?.name ?? item.user_name ?? '—' }}</div>
          <small class="muted">{{ item.raw?.user?.email ?? item.user_email ?? '' }}</small>
        </div>
      </template>

      <!-- DESCRIPTION -->
      <template #item.description="{ item }">
        <div class="desc-cell clamp-2" :title="item.raw?.description ?? item.description">
          {{ truncateSmart(item.raw?.description ?? item.description, 20, 160) }}
        </div>
      </template>

      <!-- REASON -->
      <template #item.reason="{ item }">
        <div class="desc-cell clamp-2" :title="item.raw?.reason ?? item.reason">
          {{ truncateSmart(item.raw?.reason ?? item.reason, 20, 160) }}
        </div>
      </template>

      <!-- ACTIONS -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            color="warning"
            size="small"
            @click="$router.push(`/dashboards/asset-investment-requests/edit/${item.raw?.id ?? item.id}`)"
          >
            Edit
          </VBtn>
          <VBtn
            color="error"
            size="small"
            @click="deleteRequest(item.raw?.id ?? item.id)"
          >
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <p v-else-if="errorMessage" class="text-error">{{ errorMessage }}</p>
    <p v-else>Loading...</p>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { VBtn, VDataTable } from "vuetify/components";

/* ✅ Your API base */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const headers = [
  { title: "ID", key: "id", sortable: true },
  { title: "Project", key: "project_name" },
  { title: "User", key: "user_display", sortable: false },
  { title: "Date", key: "date" },
  { title: "Planned Cost", key: "planned_cost" },
  { title: "Type", key: "request_type" },
  { title: "Description", key: "description", sortable: false },
  { title: "Reason", key: "reason", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
];

const assetInvestmentRequests = ref([]);
const errorMessage = ref("");
const isLoading = ref(true);

/* ---------- helpers ---------- */
const truncateSmart = (text, wordLimit = 20, charFallback = 160) => {
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

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const formatDate = (d) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
};

const formatCurrency = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(n);
  if (isNaN(num)) return n;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(num);
};

/* ---------- API ---------- */
// GET: /asset-investment-requests (array with nested project, user)
const fetchAssetInvestmentRequests = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing. Please log in.");
    const decodedToken = decodeURIComponent(accessToken);

    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
        Accept: "application/json",
      },
    });

    const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];

    assetInvestmentRequests.value = list.map((p) => ({
      id: p.id,
      project_id: p.project_id ?? null,
      project_name: p.project?.name ?? "—",
      user_id: p.user_id ?? null,
      user_name: p.user?.name ?? "—",
      user_email: p.user?.email ?? "",
      user_display: `${p.user?.name ?? "—"}${p.user?.email ? " (" + p.user.email + ")" : ""}`,
      date: p.date ?? "—",
      planned_cost: p.planned_cost ?? null, // often string "250000.00"
      request_type: p.request_type ?? "—",
      description: p.description ?? "—",
      reason: p.reason ?? "—",
      created_at: p.created_at,
      updated_at: p.updated_at,
      raw: p, // keep original if you like
    }));
  } catch (error) {
    console.error("Error fetching asset investment requests:", error);
    errorMessage.value =
      error.response?.data?.message ||
      "Failed to fetch asset investment requests.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAssetInvestmentRequests);

// DELETE: /asset-investment-requests/:id
const deleteRequest = async (id) => {
  if (!id) return;
  if (!confirm("Are you sure you want to delete this request?")) return;

  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing.");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.delete(`${apiBaseUrl}/asset-investment-requests/${id}`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
        Accept: "application/json",
      },
    });

    assetInvestmentRequests.value = assetInvestmentRequests.value.filter((r) => r.id !== id);
    alert("Request deleted successfully!");
  } catch (error) {
    console.error("Error deleting request:", error);
    alert(error.response?.data?.message || "Failed to delete request.");
  }
};
</script>

<style>
.v-data-table { margin-top: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-left: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-bottom: 16px; }
.text-error { color: #c62828; }
.muted { opacity: 0.7; }

/* Clamp + long strings */
.desc-cell {
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
