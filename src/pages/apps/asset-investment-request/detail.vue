<template>
  <div>
    <!-- Top Toolbar (screen only) -->
    <div class="d-flex justify-between align-center mb-4 no-print">
      <div class="d-flex align-center gap-2">
        <VBtn variant="text" prepend-icon="mdi-arrow-left" @click="$router.back()">Back</VBtn>
        <h3 class="page-title">Asset Investment Request — #{{ id }}</h3>
      </div>

      <div class="d-flex gap-2">
        <VBtn variant="tonal" prepend-icon="mdi-printer" @click="printPage">Print</VBtn>
      </div>
    </div>

    <!-- Error (screen only) -->
    <VAlert v-if="error" type="error" class="mb-4 no-print" variant="tonal">
      {{ error }}
    </VAlert>

    <!-- Skeleton while loading (screen only) -->
    <template v-if="loading">
      <VSkeletonLoader type="card, list-item-two-line, table" class="mb-4 no-print" />
      <VSkeletonLoader type="table" class="no-print" />
    </template>

    <!-- Content (screen only) -->
    <template v-else-if="request">
      <!-- Summary (unchanged) -->
      <VRow class="mb-4 no-print" dense>
        <VCol cols="12" md="12">
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
              </div>

              <div class="divider my-3" />

              <div class="d-grid-3">
                <div class="kv">
                  <div class="k">Request ID</div>
                  <div class="v">#{{ request.id }}</div>
                </div>
                <div class="kv">
                  <div class="k">Planned Cost</div>
                  <div class="v">{{ formatCurrency(request.planned_cost) }}</div>
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
                  <div class="v">{{ formatCurrency(itemsTotal) }}</div>
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

      <!-- Items Table (screen only) -->
      <VCard variant="elevated" class="no-print">
        <VCardTitle>Requested Items (screen view)</VCardTitle>
        <VCardText>
          <VDataTable
            :headers="itemHeaders"
            :items="itemsNormalized"
            :items-per-page="10"
            class="elev-1"
          >
            <template #item.planned_cost="{ item }">
              {{ formatCurrency(item.raw.planned_cost) }}
            </template>
            <template #item.line_total="{ item }">
              {{ formatCurrency(item.raw.line_total) }}
            </template>
            <template #bottom>
              <div class="d-flex justify-end pa-4">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <strong>{{ formatCurrency(itemsTotal) }}</strong>
                </div>
              </div>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </template>

    <!-- Empty (screen only) -->
    <VCard v-else class="pa-8 text-center no-print" variant="tonal">
      <VCardTitle>No data</VCardTitle>
      <VCardText>Could not find this asset investment request.</VCardText>
    </VCard>

    <!-- =========================
         PRINT-ONLY DOCUMENT
         ========================= -->
    <div id="print-area" class="print-root" v-show="showPrintSection">
      <!-- EXACT header: left EN, center logo, right AR -->
      <div class="print-header-3">
        <div class="hdr-left">
          <div class="en-1">Arab Supply &amp; Trading Co.</div>
          <div class="en-2">Construction Branch</div>
        </div>
        <div class="hdr-logo">
          <img :src="printLogo" alt="Logo" />
        </div>
        <div class="hdr-right">
          <div class="ar">الشركة العربية للتموين والتجارة</div>
          <div class="ar">فرع الإنشاءات</div>
        </div>
      </div>

      <!-- Centered grey title with two spaces between words -->
      <div class="print-title">Asset Investment&nbsp;&nbsp;Request</div>

      <!-- PROJECT / NUMBER / DATE -->
      <table class="box-table">
        <tr>
          <td class="lbl w35">PROJECT NAME:</td>
          <td class="val w65">{{ request?.project_name || '—' }}</td>
        </tr>
        <tr>
          <td class="lbl">INVESTMENT REQUEST NUMBER:</td>
          <td class="val">{{ request?.request_no || request?.code || request?.reference || ('#' + (request?.id ?? '—')) }}</td>
        </tr>
        <tr>
          <td class="lbl">DATE:</td>
          <td class="val">{{ formatDate(request?.date) }}</td>
        </tr>
      </table>

      <!-- Detailed Description -->
      <!-- <div class="section-heading">Detailed Asset Description: (As Per Quotation)</div>
      <div class="box block">
        <div class="multiline">{{ request?.detailed_description || request?.description || '—' }}</div>
      </div> -->

      <!-- Requested Items (from API) -->
      <div class="section-heading">Requested Items</div>
      <table class="box-table items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Planned Cost</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="it in items" :key="it.id">
            <td class="td-desc">{{ it.description || '—' }}</td>
            <td class="td-num">{{ formatCurrency(it.planned_cost) }}</td>
            <td class="td-center">{{ it.request_type || '—' }}</td>
            <td class="td-center">{{ it.quantity ?? '—' }}</td>
            <td class="td-reason">{{ it.reason || '—' }}</td>
          </tr>
          <tr v-if="!items || items.length === 0">
            <td colspan="5">—</td>
          </tr>
        </tbody>
      </table>

      <!-- Planned cost + Asset type -->
      <div class="section-heading">PLANNED COST (in SAR):</div>
      <div class="box row-2col">
        <div class="cell">
          <span class="value-strong">{{ formatCurrency(request?.planned_cost) }}</span>
        </div>
        <div class="cell">
          <div class="checks">
            <span class="check" :class="{on: isType('NEW')}"></span> NEW ASSET
            <span class="check" :class="{on: isType('LEASED')}"></span> LEASED ASSET
            <span class="check" :class="{on: isType('USED')}"></span> USED ASSET
          </div>
        </div>
      </div>

      <!-- Reasons -->
      <!-- <div class="section-heading">
        Reason(s)/Purpose of the investment:
        <small>(With investment over 100,000 SAR a cost effectiveness analysis has to be enclosed and agreed with Board of Directors)</small>
      </div>
      <div class="box block tall">
        <div class="multiline">{{ request?.reasons || request?.purpose || '—' }}</div>
      </div> -->

      <!-- Finance -->
      <div class="section-heading">This Part to be Filled by Finance</div>
      <table class="box-table">
        <tr>
          <td class="lbl w40">Asset Life/Period:</td>
          <td class="val">{{ request?.asset_life_period ?? '—' }}</td>
        </tr>
      </table>

      <!-- Dept head + Checked by finance -->
      <div class="box row-2col">
        <div class="cell">
          <div class="mini-header">Requesting Department Head :</div>
          <div class="name-line">{{ request?.department_head || '—' }}</div>
          <div class="mini-row">
            <div class="mini-col"><span class="mini-label">Date:</span> {{ formatDate(request?.department_head_date) }}</div>
          </div>
        </div>
        <div class="cell">
          <div class="mini-header">Checked by Financial Department:</div>
          <div class="name-line">{{ request?.finance_checker || '—' }}</div>
          <div class="mini-row">
            <div class="mini-col"><span class="mini-label">Date:</span> {{ formatDate(request?.finance_checked_date) }}</div>
          </div>
        </div>
      </div>

      <!-- Signatures & Accordance -->
      <div class="box row-2col">
        <div class="cell">
          <div class="mini-header">Signatures:</div>
          <div class="subgrid">
            <div class="lblcol">Approval</div>
            <div class="valcol">
              <div class="name-line">{{ request?.ceo_name || 'Eng. Baher Jaber' }}</div>
              <div class="role">CEO</div>
              <div class="mini-row">
                <div class="mini-col"><span class="mini-label">Date:</span> {{ formatDate(request?.ceo_date) }}</div>
              </div>
            </div>
          </div>
          <div class="subgrid top-gap">
            <div class="lblcol">NAME</div>
            <div class="valcol">
              <div class="name-line">{{ request?.bod_signatory || 'BOD Signature (As Per Authority Matrix)' }}</div>
              <div class="mini-row">
                <div class="mini-col"><span class="mini-label">Date</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="cell">
          <div class="mini-header">In accordance with budget:</div>
          <div class="checks mb8">
            <span class="check" :class="{on: isAccordance('YES')}"></span> Yes
          </div>
          <div class="checks">
            <span class="check" :class="{on: isAccordance('NO')}"></span> No
          </div>

          <div class="subgrid top-gap">
            <div class="lblcol">Name:</div>
            <div class="valcol">
              <div class="name-line">{{ request?.director_name || 'Mr. Mohammed Irfan' }}</div>
              <div class="role">D-CEO</div>
            </div>
          </div>
          <div class="mini-row">
            <div class="mini-col"><span class="mini-label">Date</span></div>
          </div>
        </div>
      </div>
    </div>
    <!-- /PRINT -->
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

const showPrintSection = ref(false);

/* logo path for print header */
const printLogo = "/src/assets/images/logos/astra-logo.png";

/* state */
const loading = ref(true);
const error = ref("");
const request = ref(null);
const items = ref([]);

/* headers (screen) */
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
  if (s === "true" || s === "yes" || s === "1") return "Yes";
  if (s === "false" || s === "no" || s === "0") return "No";
  return val ?? "—";
};

/* helpers (print checkboxes) */
const isType = (t) => {
  const v = String(request.value?.asset_type || request.value?.request_type || "").toUpperCase();
  return v === t.toUpperCase();
};
const isAccordance = (ans) => {
  const v = String(request.value?.is_accordance_with_budget ?? "").toLowerCase();
  if (ans === 'YES') return ["true","yes","1","approved"].includes(v);
  if (ans === 'NO')  return ["false","no","0","rejected"].includes(v);
  return false;
};

/* computed (screen only) */
const itemsNormalized = computed(() => {
  return items.value.map((r) => {
    const qty = nn(r.quantity ?? 1);
    const cost = nn(r.planned_cost ?? 0);
    return { ...r, planned_cost: cost, line_total: qty * cost, raw: { ...r, planned_cost: cost, line_total: qty * cost } };
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
      request_type: data.request_type,
      asset_type: data.asset_type,
      is_accordance_with_budget: data.is_accordance_with_budget,
      asset_life_period: data.asset_life_period,
      status: data.status,
      planned_cost: data.planned_cost,
      created_at: data.created_at,
      detailed_description: data.detailed_description || data.description,
      reasons: data.reasons || data.purpose,
      department_head: data.department_head,
      department_head_date: data.department_head_date,
      finance_checker: data.finance_checker,
      finance_checked_date: data.finance_checked_date,
      ceo_name: data.ceo_name,
      ceo_date: data.ceo_date,
      bod_signatory: data.bod_signatory,
      director_name: data.director_name,
      request_no: data.request_no || data.code || data.reference,
    };

    const rawItems = Array.isArray(data.items) ? data.items : [];
    items.value = rawItems.map(i => ({
      id: i.id,
      category_name: i.category_name ?? i.category?.title ?? "—",
      sub_category: i.sub_category ?? i.subcategory?.title ?? "—",
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

/* print */
const printPage = () => {
  showPrintSection.value = true;
  // wait till DOM paints the print section, then print, then hide again
  setTimeout(() => {
    window.print();
    showPrintSection.value = false;
  }, 300);
};

onMounted(fetchDetail);
</script>

<!-- Screen styles (unchanged) -->
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

.bullets { margin: 0; padding-inline-start: 18px; }

.no-print { display: initial; }

@media (max-width: 900px) { .d-grid-3 { grid-template-columns: 1fr; } }
</style>

<!-- Global styles: IMPORTANT — keep .print-root hidden on screen -->
<style>
/* Hidden on screen; shown only in @media print below */
.print-root { display: none; }

@media print {
  /* hide everything by default */
  body * { visibility: hidden !important; }

  /* show only the print form */
  #print-area,
  #print-area * { visibility: visible !important; }

  #print-area {
    position: absolute !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
    inline-size: 100% !important;
    inset: 0 !important;
  }

  @page { margin: 10mm; size: a4; }

  /* ✅ SHOW the print layout during print */
  .print-root {
    position: absolute;
    display: block !important;
    background: #fff;
    inline-size: 100%;
    inset: 0;
  }

  .print-header-3 {
    display: grid;
    align-items: center;
    column-gap: 8mm;
    grid-template-columns: 1fr 110px 1fr; /* left / logo / right */
    margin-block-end: 2mm;
  }

  .hdr-left { color: #000; font-weight: 700; line-height: 1.15; text-align: start; }
  .hdr-left .en-2 { font-weight: 600; }

  .hdr-logo { position: relative; z-index: 2; text-align: center; }
  .hdr-logo img { block-size: 48px; inline-size: auto; object-fit: contain; }

  .hdr-right {
    position: relative;
    z-index: 2;
    color: #000;
    direction: rtl;
    font-weight: 700;
    line-height: 1.2;

    /* text-align: end; */
    unicode-bidi: isolate;
    white-space: nowrap;
  }
  .hdr-right .ar { display: block; padding: 0; margin: 0; }

  .print-title {
    color: #808080;
    font-size: 18px;
    font-weight: 700;
    margin-block: 2mm 4mm;
    text-align: center;
  }

  .section-heading { font-size: 12px; font-weight: 700; margin-block: 2mm 1mm; margin-inline: 0; }

  .box { border: 1px solid #000; }
  .block { min-block-size: 18mm; padding-block: 4px; padding-inline: 6px; }
  .block.tall { min-block-size: 28mm; }

  .box-table { border-collapse: collapse; inline-size: 100%; margin-block-end: 2mm; }

  .box-table td,
  .box-table th { border: 1px solid #000; padding-block: 4px; padding-inline: 6px; vertical-align: middle; }
  .box-table th { background: #f0f0f0; font-weight: 700; text-align: start; }
  .box-table .lbl { background: #f7f7f7; font-weight: 700; inline-size: 35%; }
  .box-table .val { inline-size: 65%; }
  .box-table .w35 { inline-size: 35%; }
  .box-table .w65 { inline-size: 65%; }
  .box-table .w40 { inline-size: 40%; }

  /* items table helpers */
  .items-table .td-num { text-align: end; }
  .items-table .td-center { text-align: center; }

  .items-table .td-desc,
  .items-table .td-reason { white-space: pre-wrap; }

  .row-2col { display: grid; grid-template-columns: 1fr 1fr; }
  .row-2col .cell { border-inline-end: 1px solid #000; padding-block: 4px; padding-inline: 6px; }
  .row-2col .cell:last-child { border-inline-end: none; }

  .multiline { white-space: pre-wrap; word-wrap: break-word; }
  .value-strong { font-weight: 700; }

  .mini-header { font-weight: 700; margin-block-end: 2mm; }
  .name-line { border-block-end: 1px solid #000; min-block-size: 7mm; }
  .role { font-size: 11px; margin-block-start: 1mm; }
  .mini-row { display: flex; gap: 10mm; margin-block-start: 1mm; }
  .mini-col .mini-label { font-weight: 700; }

  .checks { display: flex; align-items: center; gap: 6mm; }
  .checks.mb8 { margin-block-end: 2mm; }
  .check { display: inline-block; border: 1px solid #000; block-size: 12px; inline-size: 12px; margin-inline-end: 3mm; vertical-align: middle; }
  .check.on { background: #000; }

  .subgrid { display: grid; align-items: start; column-gap: 4mm; grid-template-columns: 28mm 1fr; }
  .subgrid.top-gap { margin-block-start: 4mm; }
}
</style>
