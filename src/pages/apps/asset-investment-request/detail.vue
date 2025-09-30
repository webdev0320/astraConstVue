<template>
  <div>
    <!-- Top Toolbar (no edit/actions) -->
    <div class="d-flex justify-between align-center mb-4">
      <div class="d-flex align-center gap-2">
        <VBtn variant="text" prepend-icon="mdi-arrow-left" @click="$router.back()">Back</VBtn>
        <h3 class="page-title">Asset Investment Request — #{{ id }}</h3>
      </div>
    </div>

    <!-- Error -->
    <VAlert v-if="error" type="error" class="mb-4" variant="tonal">
      {{ error }}
    </VAlert>

    <!-- Skeleton while loading -->
    <template v-if="loading">
      <VSkeletonLoader type="card, list-item-two-line, table" class="mb-4" />
      <VSkeletonLoader type="table" />
    </template>

    <!-- Content -->
    <template v-else-if="request">
      <!-- Summary -->
      <VRow class="mb-4" dense>
        <VCol cols="12" md="8">
          <VCard class="summary-card" variant="elevated">
            <VCardText>
              <div class="d-flex justify-between align-start mb-3">
                <div>
                  <div class="eyebrow">Project</div>
                  <div class="title-lg">{{ request.project_name || '—' }}</div>
                  <div class="muted">
                    Requested by <strong>{{ request.user_name || '—' }}</strong>
                    • {{ formatDate(request.date) }}
                  </div>
                </div>

                <!-- <div class="d-flex flex-column align-end gap-2">
                  <VChip :color="statusColor(request.status)" size="small" label>
                    {{ request.status ?? '—' }}
                  </VChip>
                  <VChip
                    :color="accordanceColor(request.is_accordance_with_budget)"
                    size="small"
                    label
                    variant="tonal"
                  >
                    Accordance: {{ humanYesNo(request.is_accordance_with_budget) }}
                  </VChip>
                </div> -->
              </div>

              <div class="divider my-3" />

              <div class="d-grid-3">
                <div class="kv">
                  <div class="k">Request ID</div>
                  <div class="v">#{{ request.id }}</div>
                </div>
                <div class="kv">
                  <div class="k">Planned Cost</div>
                  <div class="v">{{ request.planned_cost }}</div>
                </div>
                <div class="kv">
                  <div class="k">Created At</div>
                  <div class="v">{{ formatDateTime(request.created_at) }}</div>
                </div>
              </div>

              <div class="d-grid-3 mt-3">
                <div class="kv">
                  <div class="k">Asset Life Period</div>
                  <div class="v">{{ request.asset_life_period ?? '—' }}</div>
                </div>
                <div class="kv">
                  <div class="k">Items Count</div>
                  <div class="v">{{ items.length }}</div>
                </div>
                <div class="kv">
                  <div class="k">Computed Total</div>
                  <div class="v">{{ itemsTotal }}</div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard class="side-card" variant="tonal">
            <VCardTitle class="pb-0">Quick Info</VCardTitle>
            <VCardText class="pt-2">
              <ul class="bullets">
                <li><strong>Status:</strong> {{ request.status ?? '—' }}</li>
                <li><strong>Accordance:</strong> {{ humanYesNo(request.is_accordance_with_budget) }}</li>
                <li><strong>Project:</strong> {{ request.project_name ?? '—' }}</li>
                <li><strong>User:</strong> {{ request.user_name ?? '—' }}</li>
              </ul>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Items Table -->
      <VCard variant="elevated">
        <VCardTitle>Requested Items</VCardTitle>
        <VCardText>
          <VDataTable
            :headers="itemHeaders"
            :items="itemsNormalized"
            :items-per-page="10"
            class="elev-1"
          >
            <template #item.planned_cost="{ item }">
              {{ item.raw.planned_cost }}
            </template>
            <template #item.line_total="{ item }">
              {{ item.raw.line_total }}
            </template>
            <template #bottom>
              <div class="d-flex justify-end pa-4">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <strong>{{ itemsTotal }}</strong>
                </div>
              </div>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </template>

    <!-- Empty -->
    <VCard v-else class="pa-8 text-center" variant="tonal">
      <VCardTitle>No data</VCardTitle>
      <VCardText>Could not find this asset investment request.</VCardText>
    </VCard>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  VAlert, VBtn, VCard, VCardText, VCardTitle,
  VCol, VDataTable, VRow, VSkeletonLoader
} from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const id = computed(() => route.params.id);

/* state */
const loading = ref(true);
const error = ref("");
const request = ref(null);
const items = ref([]);

/* headers */
const itemHeaders = [
  { title: "Category", key: "category_name" },
  { title: "Subcategory", key: "sub_category" },
  { title: "Type", key: "request_type" },
  { title: "Description", key: "description" },
  { title: "Reason", key: "reason" },
  { title: "Qty", key: "quantity" },
  { title: "Planned Cost", key: "planned_cost" },
  { title: "Line Total", key: "line_total" },
];

/* utils */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
const nn = (n) => { const x = Number(n); return Number.isFinite(x) ? x : 0; };
const formatDate = (d) => { if (!d) return "—"; try { const dt = new Date(d); return isNaN(dt) ? d : dt.toLocaleDateString(); } catch { return d; } };
const formatDateTime = (d) => { if (!d) return "—"; try { const dt = new Date(d); return isNaN(dt) ? d : dt.toLocaleString(); } catch { return d; } };
const formatCurrency = (n) => {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(n); if (isNaN(num)) return n;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(num);
};
const humanYesNo = (val) => {
  const s = String(val ?? "").toLowerCase();
  if (s === "true" || s === "yes") return "Yes";
  if (s === "false" || s === "no") return "No";
  return val ?? "—";
};
const statusColor = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "approved") return "success";
  if (v === "rejected") return "error";
  if (v === "pending") return "warning";
  return "secondary";
};
const accordanceColor = (v) => {
  const s = String(v || "").toLowerCase();
  if (s === "true" || s === "yes") return "success";
  if (s === "false" || s === "no") return "warning";
  return "secondary";
};

/* computed */
const itemsNormalized = computed(() => {
  return items.value.map((r) => {
    const qty = nn(r.quantity ?? 1);
    const cost = nn(r.planned_cost ?? 0);
    return {
      ...r,
      planned_cost: cost,
      line_total: qty * cost,
      raw: { ...r, planned_cost: cost, line_total: qty * cost },
    };
  });
});
const itemsTotal = computed(() => itemsNormalized.value.reduce((s, l) => s + nn(l.raw.line_total), 0));

/* fetch */
const fetchDetail = async () => {
  loading.value = true; error.value = "";
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing. Please log in.");
    const decodedToken = decodeURIComponent(accessToken);

    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests/${id.value}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    const data = res.data?.data ?? res.data ?? {};
    request.value = {
      id: data.id,
      project_id: data.project_id,
      user_id: data.user_id,
      project_name: data.project_name,
      user_name: data.user_name,
      date: data.date,
      is_accordance_with_budget: data.is_accordance_with_budget,
      asset_life_period: data.asset_life_period,
      status: data.status,
      planned_cost: data.planned_cost,
      created_at: data.created_at,
    };

    const rawItems = Array.isArray(data.items) ? data.items : [];
    items.value = rawItems.map(i => ({
      id: i.id,
      asset_category_id: i.asset_category_id,
      asset_sub_category_id: i.asset_sub_category_id,
      asset_id: i.asset_id,
      category_name: i.category_name ?? i.category?.title ?? "—",
      sub_category: i.sub_category ?? i.subcategory?.title ?? "—",
      asset_name: i.asset_name,
      description: i.description,
      planned_cost: i.planned_cost,
      request_type: i.request_type,
      quantity: i.quantity,
      reason: i.reason,
      created_at: i.created_at,
    }));
  } catch (e) {
    console.error("Fetch detail failed", e);
    error.value = e?.response?.data?.message || e?.message || "Failed to load details.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDetail);
</script>

<style scoped>
.page-title { margin: 0; font-weight: 700; }
.eyebrow { font-size: 12px; letter-spacing: 0.08em; opacity: 0.7; text-transform: uppercase; }
.title-lg { font-size: 20px; font-weight: 700; }
.muted { opacity: 0.8; }
.divider { background: var(--v-theme-surface-variant); block-size: 1px; opacity: 0.4; }
.d-grid-3 { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.kv .k { font-size: 12px; opacity: 0.7; }
.kv .v { font-weight: 600; }

.summary-card,
.side-card,
.elev-1 { border-radius: 16px; }
.total-row { display: flex; align-items: baseline; font-size: 16px; gap: 12px; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.my-3 { margin-block: 12px; }
.pa-8 { padding: 32px; }

@media (max-width: 900px) { .d-grid-3 { grid-template-columns: 1fr; } }
</style>
