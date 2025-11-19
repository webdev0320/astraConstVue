<template>
  <div>

    <!-- ========================  
        TOP TOOLBAR (SCREEN ONLY)
    ========================== -->
    <div class="d-flex justify-space-between align-center mb-4 no-print">
      <div class="d-flex align-center gap-2">
        <h3 class="page-title">Asset Investment Request</h3>
      </div>
      <div class="d-flex align-center gap-2">
        <VBtn variant="tonal" prepend-icon="tabler-printer" @click="printPage">
          Print
        </VBtn>
      </div>
    </div>

    <!-- Error -->
    <VAlert v-if="error" type="error" class="mb-4 no-print" variant="tonal">
      {{ error }}
    </VAlert>

    <!-- Loading Skeleton -->
    <template v-if="loading">
      <VSkeletonLoader type="card, list-item-two-line, table" class="mb-4 no-print" />
      <VSkeletonLoader type="table" class="no-print" />
    </template>

    <!-- ========================  
        MAIN CONTENT (SCREEN)
    ========================== -->
    <template v-else-if="request">

      <VRow class="mb-4 no-print">
        <VCol cols="12">

          <!-- SUMMARY CARD -->
          <VCard class="summary-card" variant="elevated">
            <VCardText>

              <div class="d-flex justify-between align-start mb-3">
                <div>
                  <div class="eyebrow">Project</div>
                  <div class="title-lg">{{ request.project_name || '—' }}</div>
                  <div class="muted">
                    Requested by <strong>{{ request.user_name || '—' }}</strong>
                  </div>
                </div>
              </div>

              <div class="divider my-3" />

              <div class="d-grid-3">
                <div class="kv">
                  <div class="k">AIR Number</div>
                  <div class="v">#{{ request.air_number }}</div>
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

            </VCardText>

            <VCardText class="pt-2">
              <ul class="bullets">
                <li><strong>Status:</strong> {{ request.status ?? '—' }}</li>
                <li><strong>Accordance With Budget:</strong> {{ humanYesNo(request.is_accordance_with_budget) }}</li>
              </ul>
            </VCardText>
          </VCard>

          <!-- REQUESTED ITEMS CARD -->
          <!-- REQUESTED ITEMS CARD -->
<VCard variant="elevated" class="no-print summary-card mt-4">
  <VCardTitle class="text-h6 font-weight-bold">Requested Items</VCardTitle>

  <VCardText>
    <VRow>
      <VCol
        v-for="item in itemsNormalized"
        :key="item.id"
        cols="12"
      >
        <VCard class="pa-3 rounded-lg" elevation="2">

          <!-- 🔹 FIRST ROW (Category, Subcategory, Asset Code) -->
          <VRow class="item-row">
            <VCol cols="4">
              <div class="label">Category</div>
              <div class="value">{{ item.category_name }}</div>
            </VCol>

            <VCol cols="4">
              <div class="label">Subcategory</div>
              <div class="value">{{ item.sub_category }}</div>
            </VCol>

            <VCol cols="4">
              <div class="label">Asset Code</div>
              <div class="value">{{ item.asset_name || '—' }}</div>
            </VCol>
          </VRow>

          <VDivider class="my-2" />

          <!-- 🔹 SECOND ROW (Type, Qty, Unit Cost, Planned Cost) -->
          <VRow class="item-row">
            <VCol cols="3">
              <div class="label">Type</div>
              <div class="value">{{ item.request_type }}</div>
            </VCol>

            <VCol cols="3">
              <div class="label">Qty</div>
              <div class="value">{{ item.quantity }}</div>
            </VCol>

            <VCol cols="3">
              <div class="label">Unit Cost</div>
              <div class="value">{{ formatCurrency(item.unit_cost) }}</div>
            </VCol>

            <VCol cols="3">
              <div class="label">Planned Cost</div>
              <div class="value font-weight-bold">{{ formatCurrency(item.planned_cost) }}</div>
            </VCol>
          </VRow>

          <VDivider class="my-2" />

          <!-- 🔹 Description -->
          <div class="item-row">
            <div class="label">Description</div>
            <div class="value">{{ item.description }}</div>
          </div>

          <!-- 🔹 Reason -->
          <div class="item-row mt-2">
            <div class="label">Reason</div>
            <div class="value">{{ item.reason }}</div>
          </div>

        </VCard>
      </VCol>
    </VRow>

    <!-- Subtotal -->
    <div class="d-flex justify-end mt-4 font-weight-bold text-body-1">
      Subtotal: {{ formatCurrency(itemsTotal) }}
    </div>
  </VCardText>
</VCard>


          <!-- APPROVALS TABLE -->
          <VCard variant="elevated" class="no-print mt-4">
            <VCardTitle>Approvals</VCardTitle>
            <VCardText>

              <VAlert
                v-if="approvalsError"
                type="error"
                class="mb-4"
                variant="tonal"
              >
                {{ approvalsError }}
              </VAlert>

              <VDataTable
                v-if="approvals.length"
                :headers="approvalHeaders"
                :items="approvals"
                :items-per-page="5"
                class="elev-1"
              />

              <div v-else class="text-center py-4 text-medium-emphasis">
                No approvals found.
              </div>

            </VCardText>
          </VCard>

        </VCol>
      </VRow>
    </template>

    <!-- No Data -->
    <VCard v-else class="pa-8 text-center no-print" variant="tonal">
      <VCardTitle>No data</VCardTitle>
      <VCardText>Could not find this asset investment request.</VCardText>
    </VCard>

    <!-- ========================  
        PRINT VERSION ONLY
    ========================== -->
    <div id="print-area" class="print-root" v-show="showPrintSection">
      <div class="print-body">

        <!-- Header -->
        <div class="print-header-3">
          <div class="hdr-left">
            <div class="en-1">Arab Supply & Trading Co.</div>
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

        <!-- Printed title -->
        <div class="print-title">Asset Investment&nbsp;&nbsp;Request</div>

        <!-- Project info table -->
        <table class="box-table">
          <tr>
            <td class="lbl w35">PROJECT NAME:</td>
            <td class="val w65">{{ request?.project_name || '—' }}</td>
          </tr>
          <tr>
            <td class="lbl">INVESTMENT REQUEST NUMBER:</td>
            <td class="val">{{ request?.request_no || request?.code || request?.reference || ('#' + (request?.air_number ?? '—')) }}</td>
          </tr>
          <tr>
            <td class="lbl">DATE:</td>
            <td class="val">{{ formatDate(request?.date) }}</td>
          </tr>
        </table>

        <!-- Requested items -->
        <div class="section-heading textBlack">Requested Items</div>

        <div class="table-wrapper">
          <table class="box-table items-table print-table">
            <thead>
              <tr>
                <th class="textBlack">Category</th>
                <th class="textBlack">SubCategory</th>
                <th class="textBlack">Asset</th>
                <th class="textBlack">Description</th>
                <th class="textBlack">Reason</th>
                <th class="textBlack">Unit Cost</th>
                <th class="textBlack">Qty</th>
                <th class="textBlack">Planned Cost</th>
                <th class="textBlack">Type</th>
                <th class="textBlack">Asset Life Period</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in items" :key="it.id">
                <td class="textBlack td-desc">{{ it.category_name }}</td>
                <td class="textBlack td-desc">{{ it.sub_category }}</td>
                <td class="textBlack td-desc">{{ it.asset_name }} {{ it.asset_code }}</td>
                <td class="textBlack td-desc">{{ it.description }}</td>
                <td class="textBlack td-reason">{{ it.reason }}</td>
                <td class="textBlack td-num">{{ formatCurrency(it.unit_cost) }}</td>
                <td class="textBlack td-center">{{ it.quantity }}</td>
                <td class="textBlack td-num">{{ formatCurrency(it.planned_cost) }}</td>
                <td class="textBlack td-center">{{ it.request_type }}</td>
                <td class="textBlack td-center">{{ it.asset_life_period }}</td>
              </tr>

              <tr v-if="!items || items.length === 0">
                <td colspan="10" class="textBlack td-center">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Planned cost -->
        <div class="section-heading textBlack">PLANNED COST (in SAR):</div>
        <div class="box row-2col">
          <div class="cell">
            <span class="value-strong textBlack">{{ formatCurrency(request?.planned_cost) }}</span>
          </div>
        </div>

        <!-- Department head -->
        <div class="box row-2col">
          <div class="cell">
            <div class="mini-header textBlack">Requesting Department Head :</div>
            <div class="name-line textBlack">{{ request?.department_head || '—' }}</div>
            <div class="mini-row">
              <div class="mini-col"><span class="mini-label textBlack">Date:</span> {{ formatDate(request?.department_head_date) }}</div>
            </div>
          </div>

          <div class="cell">
            <div class="mini-header textBlack">Checked by Financial Department:</div>
            <div class="name-line textBlack">{{ request?.finance_checker || '—' }}</div>
            <div class="mini-row">
              <div class="mini-col"><span class="mini-label textBlack">Date:</span> {{ formatDate(request?.finance_checked_date) }}</div>
            </div>
          </div>
        </div>

        <!-- Accordance with budget -->
        <div class="box row-2col">
          <div class="cell">
            <div class="mini-header textBlack">In accordance with budget:</div>
            <div class="checks mb8 textBlack">
              <span class="check" :class="{ on: isAccordance('YES') }"></span> Yes
            </div>
            <div class="checks textBlack">
              <span class="check" :class="{ on: isAccordance('NO') }"></span> No
            </div>
          </div>
        </div>

        <!-- Approvals section -->
        <div class="box approval-section">
          <div class="cell col-12">
            <div class="mini-header textBlack">Approvals:</div>

            <table
              v-if="approvals && approvals.length"
              class="approval-table"
              style="width: 100%; border-collapse: collapse; margin-top: 10px;"
            >
              <thead>
                <tr style="border-bottom: 1px solid #ccc;">
                  <th class="textBlack" style="text-align: left; padding: 8px;">Name / Code</th>
                  <th class="textBlack" style="text-align: left; padding: 8px;">Status</th>
                  <th class="textBlack" style="text-align: left; padding: 8px;">Signature</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(approval, index) in approvals"
                  :key="approval.id || index"
                  style="border-bottom: 1px solid #eee;"
                >
                  <td class="textBlack" style="padding: 8px;">{{ approval.name }} - {{ approval.user_code }}</td>
                  <td class="textBlack" style="padding: 8px;">{{ approval.status || '—' }}</td>
                  <td class="textBlack" style="padding: 8px;">_____________________</td>
                </tr>
              </tbody>
            </table>

            <div v-else class="top-gap textBlack">
              No approvals found.
            </div>

          </div>
        </div>

      </div>
    </div>
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
const approvals = ref([])
const approvalsError = ref("")

/* headers (screen) */
const itemHeaders = [
  { title: "Category", key: "category_name" },
  { title: "Subcategory", key: "sub_category" },
  { title: "Asset Code If Any", key: "asset_name" },
  { title: "Type", key: "request_type" },
  { title: "Description", key: "description" },
  { title: "Reason", key: "reason" },
  { title: "Qty", key: "quantity" },
  { title: "Unit Cost", key: "unit_cost" },
  { title: "Planned Cost", key: "planned_cost" },
];

const approvalHeaders = [
  { title: "Employee Code", key: "user_code" },
  { title: "Employee Name", key: "name" },
  { title: "Status", key: "status" },
]

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
/*const isType = (t) => {
  const v = String(request.value?.items?.[0]?.request_type || "").toUpperCase();
  console.log("Asset Type:", v);
  return v === t.toUpperCase();
};*/
const isAccordance = (ans) => {
  const v = String(request.value?.is_accordance_with_budget ?? "").toLowerCase();
  if (ans === 'YES') return ["true","yes","1","approved"].includes(v);
  if (ans === 'NO')  return ["false","no","0","rejected"].includes(v);
  return false;
};

/* computed (screen only) */
const itemsNormalized = computed(() => {
  return items.value.map((r) => {
    console.log(r);
    const qty = nn(r.quantity ?? 1);
    const cost = nn(r.unit_cost ?? 0);
    return { ...r, planned_cost: qty * cost, unit_cost: cost, raw: { ...r, planned_cost: qty * cost, unit_cost: cost } };
  });
});
const itemsTotal = computed(() => itemsNormalized.value.reduce((s, l) => s + nn(l.raw.planned_cost), 0));

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
      air_number: data.air_number,
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
      asset_name: i.asset_code + "—" + i.asset_name,
      description: i.description,
      planned_cost: i.planned_cost,
      unit_cost: i.unit_cost,
      request_type: i.request_type,
      quantity: i.quantity,
      reason: i.reason,
      created_at: i.created_at,
      asset_life_period : i.asset_life_period,
    }));
  } catch (e) {
    console.error("Fetch detail failed", e);
    error.value = e?.response?.data?.message || e?.message || "Failed to load details.";
  } finally {
    loading.value = false;
  }
};


const fetchApprovals = async () => {
  approvalsError.value = ""
  try {
    const accessToken = getCookie("accessToken")
    if (!accessToken) throw new Error("Access token missing.")
    const decodedToken = decodeURIComponent(accessToken)

    const res = await axios.get(
      `${apiBaseUrl}/getApprovals/AssetInvestmentRequest/${id.value}`,
      {
        headers: { Authorization: `Bearer ${decodedToken}` },
      }
    )

    const data = res.data?.data ?? []
    approvals.value = data.map(a => ({
      id: a.id,
      status: a.status,
      name: a.user?.name ?? "—",
      user_code: a.user?.user_code ?? "—",
    }))
  } catch (e) {
    console.error("Fetch approvals failed", e)
    approvalsError.value = e?.response?.data?.message || e?.message || "Failed to load approvals."
  }
}


/* print */
const printPage = () => {
  showPrintSection.value = true;
  // wait till DOM paints the print section, then print, then hide again
  setTimeout(() => {
    window.print();
    showPrintSection.value = false;
  }, 300);
};

onMounted(async () => {
  await fetchDetail()
  await fetchApprovals()
})
</script>

<!-- Screen styles -->
<style scoped>
.page-title { margin: 0; font-weight: 700; }
.eyebrow { font-size: 12px; letter-spacing: 0.08em; opacity: 0.7; text-transform: uppercase; }
.title-lg { font-size: 20px; font-weight: 700; }
.muted { opacity: 0.8; }
.divider { background: var(--v-theme-surface-variant); block-size: 1px; opacity: 0.4; }
.d-grid-3 { display: grid; gap: 50px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
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
.print-root { display: none; }

@media print {
  .mt-4 { margin-top: 4mm !important; }
  .top-gap { margin-top: 3mm !important; }
}

@media print {
  html, body {
    background: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #print-area {
    background: #fff !important;
    box-shadow: none !important;
    border: none !important;
  }

  body * { visibility: hidden !important; }
  #print-area, #print-area * { visibility: visible !important; }

  @page { margin: 0.1mm; size: a4 portrait; }

  #print-area {
    position: absolute !important;
    display: block !important;
    overflow: hidden !important;
    padding: 5px !important;
    background: #fff !important;
    block-size: calc(297mm - 16mm) !important;
    inline-size: calc(210mm - 16mm) !important;
    inset: 0 !important;
    margin: 0 auto !important;
    border: none !important;
  }

  :root { --print-scale: 1.3; }

  .print-body {

  }

  .print-header-3 {
    display: grid;
    align-items: center;
    break-inside: avoid;
    column-gap: 6mm;
    grid-template-columns: 1fr 110px 1fr;
    margin-block-end: 2mm;
  }

  .hdr-left { color: #000; font-weight: 700; line-height: 1.15; text-align: start; }
  .hdr-left .en-2 { font-weight: 600; }
  .hdr-logo { text-align: center; }
  .hdr-logo img { block-size: 48px; inline-size: auto; object-fit: contain; }
  .hdr-right { color: #000; direction: rtl; font-weight: 700; line-height: 1.2; unicode-bidi: isolate; white-space: nowrap; }
  .hdr-right .ar { display: block; margin: 0; }

  .print-title { color: #808080; font-size: 18px; font-weight: 700; margin: 2mm 0 4mm; text-align: center; }
  .section-heading { font-size: 12px; font-weight: 700; margin: 2mm 0 1mm; }

  .box { border: 0.5px solid #000; }
  .block { min-block-size: 18mm; padding: 4px 6px; }
  .block.tall { min-block-size: 28mm; }

  .box-table { border-collapse: collapse; width: 100%; margin-block-end: 2mm; }
  .box-table td, .box-table th { border: 0.5px solid #000; padding: 4px 6px; vertical-align: middle; }
  .box-table th { background: #f0f0f0; font-weight: 700; text-align: start; }
  .box-table .lbl { background: #f7f7f7; font-weight: 700; width: 35%; }
  .box-table .val { width: 65%; }
  .box-table .w35 { width: 35%; }
  .box-table .w65 { width: 65%; }
  .box-table .w40 { width: 40%; }

  .lbl, .val, .textBlack { color: #000 !important; }

  .items-table .td-num { text-align: end; }
  .items-table .td-center { text-align: center; }
  .items-table .td-desc, .items-table .td-reason { white-space: pre-wrap; }

  .row-2col { display: grid; grid-template-columns: 1fr 1fr; }
  .row-2col .cell { border-inline-end: 0.5px solid #000; padding: 4px 6px; }
  .row-2col .cell:last-child { border-inline-end: none; }

  .multiline { white-space: pre-wrap; word-wrap: break-word; }
  .value-strong { font-weight: 700; }
  .mini-header { font-weight: 700; margin-bottom: 2mm; }
  .name-line { border-bottom: 0.5px solid #000; min-block-size: 7mm; }
  .role { font-size: 11px; margin-top: 1mm; }
  .mini-row { display: flex; gap: 10mm; margin-top: 1mm; }
  .mini-col .mini-label { font-weight: 700; }

  .checks { display: flex; align-items: center; gap: 6mm; }
  .checks.mb8 { margin-bottom: 2mm; }
  .check { display: inline-block; border: 0.5px solid #000; block-size: 12px; inline-size: 12px; margin-right: 3mm; vertical-align: middle; }
  .check.on { background: #000; }

  .subgrid { display: grid; align-items: start; column-gap: 4mm; grid-template-columns: 28mm 1fr; }
  .subgrid.top-gap { margin-top: 4mm; }
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Prevents overflow */
  word-wrap: break-word;
  font-size: 12px; /* Adjust for print readability */
}

.print-table th,
.print-table td {
  border: 1px solid #ccc;
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
  word-break: break-word;
}

/* Reduce wide text columns */
.print-table th:nth-child(4),
.print-table td:nth-child(4),
.print-table th:nth-child(5),
.print-table td:nth-child(5) {
  max-width: 120px;
  white-space: normal;
}

/* Numeric columns */
.print-table th:nth-child(6),
.print-table th:nth-child(7),
.print-table th:nth-child(8),
.print-table th:nth-child(9),
.print-table th:nth-child(10),
.print-table td:nth-child(6),
.print-table td:nth-child(7),
.print-table td:nth-child(8),
.print-table td:nth-child(9),
.print-table td:nth-child(10) {
  text-align: center;
  width: 70px;
}

/* Print-specific rules */
@media print {
  .table-wrapper {
    overflow: visible;
  }

  .print-table {
    page-break-inside: auto;
  }

  .print-table tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
}
}

.item-row {
  padding: 4px 8px !important;
}

.item-row .label {
  font-size: 11px;
  text-transform: uppercase;
  opacity: 0.75;
  margin-bottom: 2px;
}

.item-row .value {
  font-size: 13px;
  font-weight: 600;
}

/* Ensure all VCol spacing matches */
.item-row .v-col {
  padding-left: 12px !important;
  padding-right: 12px !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

/* Prevent Vuetify auto-padding issues */
.v-card .v-card-text {
  padding: 16px !important;
}
.v-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

</style>
