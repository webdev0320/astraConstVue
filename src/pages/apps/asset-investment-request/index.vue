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

    <!-- Loading -->
    <p v-if="isLoading">Loading...</p>

    <!-- Error -->
    <p v-else-if="errorMessage" class="text-error">{{ errorMessage }}</p>

    <!-- Table -->
    <VDataTable
      v-else-if="assetInvestmentRequests.length > 0"
      :headers="headers"
      :items="assetInvestmentRequests"
      item-value="id"
      :items-per-page="10"
      show-expand
      v-model:expanded="expanded"
      @update:expanded="onExpandedChange"
      class="mb-6"
    >
      <!-- DATE -->
      <template #item.date="{ item }">
        {{ formatDate(item.raw.date) }}
      </template>

      <!-- PLANNED TOTAL -->
      <template #item.planned_total="{ item }">
        {{ item.raw.planned_total ?? '—' }}
      </template>

      <!-- PROJECT -->
      <template #item.project_name="{ item }">
        {{ item.raw.project_name || '—' }}
      </template>

      <!-- USER -->
      <template #item.user_display="{ item }">
        <div>
          <div>{{ item.raw.user_name || '—' }}</div>
          <small class="muted">{{ item.raw.user_email || '' }}</small>
        </div>
      </template>

      <!-- ACTIONS: dropdown -->
      <template #item.actions="{ item }">
        <VMenu :close-on-content-click="true">
          <template #activator="{ props }">
            <VBtn v-bind="props" size="small" color="primary" variant="elevated">
              Actions
            </VBtn>
          </template>
          <VList density="compact">

             <VListItem @click="$router.push(`/dashboards/asset-investment-requests/detail/${item.raw.id}`)">
              <template #prepend><VIcon icon="mdi-file-document" /></template>
              <VListItemTitle>Detail</VListItemTitle>
            </VListItem>
            
            <VListItem @click="$router.push(`/dashboards/asset-investment-requests/edit/${item.raw.id}`)">
              <template #prepend><VIcon icon="mdi-pencil" /></template>
              <VListItemTitle>Edit</VListItemTitle>
            </VListItem>

            <VListItem @click="deleteRequest(item.raw.id)">
              <template #prepend><VIcon icon="mdi-delete" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>

            <VListItem @click="openStatusModal(item.raw.id)">
              <template #prepend><VIcon icon="mdi-flag" /></template>
              <VListItemTitle>Status</VListItemTitle>
            </VListItem>

            <VListItem @click="openAccordanceModal(item.raw.id)">
              <template #prepend><VIcon icon="mdi-check-decagram" /></template>
              <VListItemTitle>Mark As Accordance With Budget</VListItemTitle>
            </VListItem>

           
          </VList>
        </VMenu>
      </template>
    </VDataTable>

    <!-- Empty State -->
    <VCard v-else class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>No asset investment requests found</VCardTitle>
      <VCardText>
        You do not have any requests yet. Start by creating your first request.
      </VCardText>
      <VBtn
        color="primary"
        @click="$router.push('/dashboards/asset-investment-requests/create')"
      >
        Create Asset Investment Request
      </VBtn>
    </VCard>

    <!-- STATUS MODAL -->
    <VDialog v-model="statusDialog" max-width="480">
      <VCard>
        <VCardTitle>Change Request Status</VCardTitle>
        <VCardText>
          <VForm @submit.prevent="submitStatus">
            <VSelect
              v-model="statusValue"
              :items="statusOptions"
              label="Select status"
              :disabled="actionLoading"
              required
            />
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="closeStatusModal" :disabled="actionLoading">Cancel</VBtn>
          <VBtn color="primary" @click="submitStatus" :loading="actionLoading">Save</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- ACCORDANCE MODAL -->
    <VDialog v-model="accordanceDialog" max-width="480">
      <VCard>
        <VCardTitle>Mark Accordance With Budget</VCardTitle>
        <VCardText>
          <VForm @submit.prevent="submitAccordance">
            <VSelect
              v-model="accordanceValue"
              :items="accordanceOptions"
              label="Select"
              :disabled="actionLoading"
              required
            />
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="closeAccordanceModal" :disabled="actionLoading">Cancel</VBtn>
          <VBtn color="primary" @click="submitAccordance" :loading="actionLoading">Save</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import {
  VBtn, VCard,
  VCardActions,
  VCardText, VCardTitle, VDataTable,
  VDialog,
  VForm,
  VIcon,
  VList, VListItem, VListItemTitle,
  VMenu,
  VSelect,
  VSpacer
} from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

/* ------------ Master headers (one row per request) ------------ */
const headers = [
  { title: "ID", key: "id", sortable: true },
  { title: "Project", key: "project_name" },
  { title: "User", key: "user_display", sortable: false },
  { title: "Date", key: "date" },
  { title: "Planned Total", key: "planned_total" },
  { title: "Actions", key: "actions", sortable: false },
];

/* ------------ Line headers (expanded table) ------------ */
const lineHeaders = [
  { title: "Asset Code", key: "asset_code" },
  { title: "Category", key: "category_name" },
  { title: "Subcategory", key: "subcategory_name" },
  { title: "Type", key: "request_type" },
  { title: "Description", key: "description" },
  { title: "Reason", key: "reason" },
  { title: "Qty", key: "quantity" },
  { title: "Planned Cost", key: "planned_cost" },
  { title: "Line Total", key: "line_total" },
];

const assetInvestmentRequests = ref([]);
const expanded = ref([]); // ids of expanded rows
const linesCache = ref({}); // { [id]: { loading: bool, data: [] } }
const errorMessage = ref("");
const isLoading = ref(true);

/* ------ action dialog state ------ */
const actionLoading = ref(false);
const statusDialog = ref(false);
const accordanceDialog = ref(false);
const currentRequestId = ref(null);

const statusValue = ref(null);
const statusOptions = ["APPROVED", "REJECTED"];

const accordanceValue = ref(null);
const accordanceOptions = ["APPROVED", "REJECTED"];

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

const nn = (n) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
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

/* ---------- normalizers ---------- */
const normalizeLines = (rawLines, reqId) => {
  return rawLines.map((r, idx) => {
    const qty  = nn(r.quantity ?? 1);
    const cost = nn(r.planned_cost ?? r.cost ?? 0);
    const lineTotal = cost * qty;

    return {
      __key: `${reqId}|${idx}`,
      asset_code: r.asset?.code ?? "—",
      category_name: r.category_name ?? r.category?.title ?? r.asset_category?.title ?? "—",
      subcategory_name: r.sub_category ?? r.subcategory?.title ?? r.asset_subcategory?.title ?? "—",
      request_type: r.request_type ?? "NEW",
      description: truncateSmart(r.description ?? "—"),
      reason: truncateSmart(r.reason ?? "—"),
      quantity: qty,
      planned_cost: cost,
      line_total: lineTotal,
      raw: { ...r, planned_cost: cost, line_total: lineTotal },
    };
  });
};

/* ---------- API: master list ---------- */
const fetchAssetInvestmentRequests = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing. Please log in.");
    const decodedToken = decodeURIComponent(accessToken);

    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    assetInvestmentRequests.value = list.map((p) => {
      const embedded =
        Array.isArray(p.data)  ? p.data  :
        Array.isArray(p.lines) ? p.lines :
        Array.isArray(p.items) ? p.items : null;

      const linesCount =
        Number(p.lines_count ?? p.items_count ?? p.data_count ?? (embedded ? embedded.length : 0)) || 0;

      const plannedCost = nn(p.planned_cost);

      return {
        id: p.id,
        project_name: p.project_name ?? "—",
        user_name: p.user_name ?? "—",
        user_email: p.user?.email ?? "",
        user_display: `${p.user?.name ?? p.user_name ?? "—"}${p.user?.email ? " (" + p.user.email + ")" : ""}`,
        date: p.date ?? "—",
        lines_count: linesCount,
        planned_total: plannedCost || null,
        raw: {
          id: p.id,
          date: p.date ?? "—",
          project_name: p.project_name ?? "—",
          user_name: p.user_name ?? "—",
          user_email: p.user?.email ?? "",
          planned_total: plannedCost || null,
        },
      };
    });
  } catch (error) {
    console.error("Error fetching asset investment requests:", error);
    errorMessage.value =
      error.response?.data?.message ||
      "Failed to fetch asset investment requests.";
  } finally {
    isLoading.value = false;
  }
};

/* ---------- API: details per row (lazy) ---------- */
const loadLinesFor = async (reqId) => {
  if (!reqId) return;
  if (linesCache.value[reqId]?.data) return; // already loaded
  linesCache.value[reqId] = { loading: true, data: [] };

  try {
    const accessToken = getCookie("accessToken");
    const decodedToken = decodeURIComponent(accessToken);

    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests/${reqId}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    const p = res.data?.data ?? res.data ?? {};
    const rawLines =
      Array.isArray(p.data)  ? p.data  :
      Array.isArray(p.lines) ? p.lines :
      Array.isArray(p.items) ? p.items :
      Array.isArray(p.details) ? p.details :
      Array.isArray(p.asset_investment_request_details) ? p.asset_investment_request_details :
      [];

    const lines = normalizeLines(rawLines, reqId);
    linesCache.value[reqId] = { loading: false, data: lines };

    // Compute & patch total if missing
    const row = assetInvestmentRequests.value.find(r => r.id === reqId);
    if (row && (!row.raw.planned_total && !row.planned_total)) {
      const total = lines.reduce((s, l) => s + nn(l.raw.line_total), 0);
      row.planned_total = total;
      row.raw.planned_total = total;
      row.lines_count = lines.length;
    }
  } catch (e) {
    console.error("Error loading lines for request", reqId, e?.response ?? e);
    linesCache.value[reqId] = { loading: false, data: [] };
  }
};

/* ---------- expand handler ---------- */
const onExpandedChange = async (ids) => {
  expanded.value = ids;
  for (const id of ids) {
    await loadLinesFor(id);
  }
};

/* ---------- init ---------- */
onMounted(fetchAssetInvestmentRequests);

/* ---------- delete ---------- */
const deleteRequest = async (id) => {
  if (!id) return;
  if (!confirm("Are you sure you want to delete this request?")) return;

  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing.");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.delete(`${apiBaseUrl}/asset-investment-requests/${id}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    assetInvestmentRequests.value = assetInvestmentRequests.value.filter((r) => r.id !== id);
    delete linesCache.value[id];
    alert("Request deleted successfully!");
  } catch (error) {
    console.error("Error deleting request:", error);
    alert(error.response?.data?.message || "Failed to delete request.");
  }
};

/* ---------- STATUS actions ---------- */
const openStatusModal = (id) => {
  currentRequestId.value = id;
  statusValue.value = null;
  statusDialog.value = true;
};
const closeStatusModal = () => {
  statusDialog.value = false;
  currentRequestId.value = null;
  statusValue.value = null;
};
const submitStatus = async () => {
  if (!currentRequestId.value || !statusValue.value) return;
  try {
    actionLoading.value = true;
    const accessToken = getCookie("accessToken");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.get(
      `${apiBaseUrl}/asset-investment-requests/${currentRequestId.value}/changeStatus/${encodeURIComponent(statusValue.value)}`,
      {
        headers: {
          Authorization: `Bearer ${decodedToken}`,
          Accept: "application/json",
          // Optional: avoid caches on some setups
          "Cache-Control": "no-cache",
        },
      }
    );

    closeStatusModal();
    await fetchAssetInvestmentRequests();
  } catch (e) {
    console.error("Status update failed", e);
    alert(e?.response?.data?.message || "Failed to update status.");
  } finally {
    actionLoading.value = false;
  }
};

/* ---------- ACCORDANCE actions ---------- */
const openAccordanceModal = (id) => {
  currentRequestId.value = id;
  accordanceValue.value = null;
  accordanceDialog.value = true;
};
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Resets the accordance modal state after use.
 *
 * @function closeAccordanceModal
 */
/*******  0d21c5e0-f72f-4236-95b1-3756595eaa7d  *******/
const closeAccordanceModal = () => {
  accordanceDialog.value = false;
  currentRequestId.value = null;
  accordanceValue.value = null;
};
const submitAccordance = async () => {
  if (!currentRequestId.value || !accordanceValue.value) return;
  try {
    actionLoading.value = true;
    const accessToken = getCookie("accessToken");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.get(
      `${apiBaseUrl}/asset-investment-requests/${currentRequestId.value}/markAsAccordance/${encodeURIComponent(accordanceValue.value)}`,
      {
        headers: {
          Authorization: `Bearer ${decodedToken}`,
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );

    closeAccordanceModal();
    await fetchAssetInvestmentRequests();
  } catch (e) {
    console.error("Accordance update failed", e);
    alert(e?.response?.data?.message || "Failed to update accordance status.");
  } finally {
    actionLoading.value = false;
  }
};
</script>

<style>
.v-data-table { margin-block-start: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.text-error { color: #c62828; }
.muted { opacity: 0.7; }
.pa-6 { padding: 24px; }
</style>
