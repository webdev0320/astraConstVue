<template>
  <div class="page-wrap">
    <!-- app chrome: visible on screen, auto-hidden in print -->
    <div class="topbar">
      <div class="left">
        <VBtn variant="text" prepend-icon="mdi-arrow-left" @click="$router.back()">Back</VBtn>
        <h3 class="page-title">Asset Transfer — #{{ id }}</h3>
      </div>
      <div class="right">
        <VBtn color="primary" @click="$router.push(`/dashboards/assettransfers/edit/${id}`)">Edit</VBtn>
        <VBtn color="error" @click="onDelete">Delete</VBtn>
        <VBtn color="success" @click="onApprove">Approve</VBtn>
        <VBtn color="warning" @click="onReject">Reject</VBtn>
        <VBtn color="secondary" @click="printPage">Print</VBtn>
      </div>
    </div>

    <VAlert v-if="error" type="error" class="mb-4" variant="tonal">{{ error }}</VAlert>

    <template v-if="loading">
      <VSkeletonLoader type="card, list-item-two-line, table" class="mb-4" />
    </template>

    <template v-else-if="transfer">
      <!-- ===== A4 PRINT SHEET ===== -->
      <div class="sheet a4 portrait" id="printArea">
        <!-- ===== HEADER ===== -->
        <div class="masthead">
          <!-- Brand strip (English — Logo — Arabic) -->
          <div class="brandline">
            <div class="brand-block brand-en">
              <div class="line1">Arab Supply &amp; Trading CO. LTD</div>
              <div class="line2">C.R:3550005809</div>
            </div>

            <img :src="logoSrc" alt="ASTRA" class="brand-logo" />

            <div class="brand-block brand-ar">
              <div class="line1">الشركة العربية للتموين والتجارة المحدودة</div>
              <div class="line2">سجل تجاري ٣٥٥٠٠٠٥٨٠٩</div>
            </div>
          </div>

          <!-- Row 1 -->
          <div class="mast-grid">
            <div class="cell small"><span>ISSUE</span><b>{{ transfer.issue_no || '1' }}</b></div>
            <div class="cell small"><span>REV</span><b>{{ transfer.revision_no || '0' }}</b></div>
            <div class="cell project"><b>{{ transfer.transferredProjectName || defaultProject }}</b></div>
            <div class="cell label"><b>DATE</b></div>
            <div class="cell value"><b>{{ fmtDate(transfer.date) }}</b></div>
          </div>
          <!-- Row 2 -->
          <div class="mast-grid">
            <div class="cell small"><b>{{ transfer.form_no || 'F-12-05' }}</b></div>
            <div class="cell small"><b>{{ fmtDate(transfer.revision_date) }}</b></div>
            <div class="cell atf-title"><b>ASSET TRANSFER FORM (ATF)</b></div>
            <div class="cell label"><b>TAG No.</b></div>
            <div class="cell value"><b>{{ transfer.tag_no || '—' }}</b></div>
          </div>
        </div>

        <!-- ===== SENDER ===== -->
        <div class="section-title">TO BE FILLED BY THE SENDER</div>
        <div class="meta sender">
          <div class="row">
            <label>Transferred from</label>
            <b>{{ transfer.transferredProjectName || projectOrId(transfer.transferred_from_project_id) }}</b>
            <label>Transferred to</label>
            <b>{{ transfer.transferredToProjectName || projectOrId(transfer.transferred_to_project_id) }}</b>
          </div>
          <div class="row">
            <label>Date Of Transfer</label>
            <b>{{ fmtDate(transfer.transfer_date) }}</b>
            <label>Time</label>
            <b>{{ fmtTime(transfer.transfer_time) }}</b>
          </div>
          <div class="row">
            <label>Prepared and Checked by</label>
            <b>{{ transfer.preparedByName || transfer.prepared_by || '—' }}</b>
            <label>Signature</label>
            <b>&nbsp;</b>
          </div>
          <div class="row">
            <label>Driver Name</label>
            <b>{{ transfer.driverName || '—' }}</b>
            <label>Signature</label>
            <b>&nbsp;</b>
          </div>
          <div class="row">
            <label>Contact details</label>
            <b>{{ transfer.contact_details || '—' }}</b>
            <label>Vehicle plate no.</label>
            <b>{{ transfer.vehicle_plate_no || '—' }}</b>
          </div>
        </div>

        <!-- ===== ITEMS ===== -->
        <table class="grid items">
          <thead>
            <tr>
              <th class="w-sno">S/N</th>
              <th class="w-brand">BRAND / MODEL</th>
              <th>DESCRIPTION</th>
              <th class="w-qty">QTY</th>
              <th class="w-remarks">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, i) in filledRows" :key="i">
              <td class="center">{{ it ? i + 1 : '' }}</td>
              <td>{{ it?.assetName || (it?.asset_id ? `#${it.asset_id}` : '') }}</td>
              <td>{{ it?.description || it?.remarks || '' }}</td>
              <td class="center">{{ it?.qty ?? '' }}</td>
              <td>{{ it?.remarks || '' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- ===== PLANT & MACHINERY ===== -->
        <div class="section-title">TO BE FILLED BY THE PLANT &amp; MACHINERY:</div>
        <div class="approval-grid">
          <div class="date-box">
            <div class="row small">
              <div class="cell mini">DD</div><div class="cell mini">MM</div><div class="cell mini">YY</div>
              <div class="cell text"><b>Approved</b></div>
            </div>
            <div class="row small">
              <div class="cell mini">DD</div><div class="cell mini">MM</div><div class="cell mini">YY</div>
              <div class="cell text"><b>Disapproved</b></div>
            </div>
          </div>
          <div class="remarks-box"><div><b>Remarks :</b> {{ transfer.plant_manager_remarks || '' }}</div></div>
          <div class="sign-box right"><div class="undertext"><i>MANAGER</i></div></div>
        </div>

        <!-- ===== PROJECT INCHARGE ===== -->
        <div class="section-title">APPROVAL FROM THE PROJECT INCHARGE/DEPARTMENT HEAD</div>
        <div class="approval-grid">
          <div class="date-box">
            <div class="row small">
              <div class="cell mini">DD</div><div class="cell mini">MM</div><div class="cell mini">YY</div>
              <div class="cell text"><b>Approved</b></div>
            </div>
            <div class="row small">
              <div class="cell mini">DD</div><div class="cell mini">MM</div><div class="cell mini">YY</div>
              <div class="cell text"><b>Disapproved</b></div>
            </div>
          </div>
          <div class="remarks-box"><div><b>Remarks :</b> {{ transfer.project_incharge_remarks || '' }}</div></div>
          <div class="sign-box right"><div class="undertext"><i>Project Manager</i></div></div>
        </div>

        <!-- ===== RECEIVER ===== -->
        <div class="section-title">TO BE FILLED BY THE RECEIVER</div>
        <div class="receiver-grid">
          <div class="row">
            <label>Received from</label><b>{{ transfer.received_from || '—' }}</b>
            <label>Received by</label><b>{{ transfer.received_by || '—' }}</b>
          </div>
          <div class="row">
            <label>Date</label><b>{{ fmtDate(transfer.received_date) }}</b>
            <label>Time</label><b>{{ fmtTime(transfer.received_time) }}</b>
          </div>
          <div class="row">
            <label>Inspected by</label><b>{{ transfer.inspected_by || '—' }}</b>
            <label>Signature</label><b>&nbsp;</b>
          </div>
          <div class="row">
            <div class="half"><div class="accept grayless"><b>Equipment / Material Accepted</b></div></div>
            <div class="half"><div class="accept gray"><b>Equipment / Material Not Accepted</b></div></div>
          </div>
        </div>
      </div>
      <!-- /sheet -->
    </template>

    <template v-else><p>No data found.</p></template>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VAlert, VBtn, VSkeletonLoader } from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api

const defaultProject = '10006 BISHA PROJECT'
const logoSrc = '/astra-logo.png'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)

const loading = ref(true)
const error = ref('')
const transfer = ref(null)

const getCookie = (name) => {
  const v = `; ${document.cookie}`; const p = v.split(`; ${name}=`); if (p.length === 2) return p.pop().split(';').shift(); return null
}
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi' })
const fmtDate = (iso) => { try { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : fmt.format(d) } catch { return '—' } }
const fmtTime = (iso) => { try { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }) } catch { return '—' } }
const projectOrId = (pid) => (pid ? `#${pid}` : '—')

const MAX_ROWS = 13
const filledRows = computed(() => {
  const rows = Array.isArray(transfer.value?.items) ? transfer.value.items : []
  if (rows.length >= MAX_ROWS) return rows.slice(0, MAX_ROWS)
  return [...rows, ...Array(MAX_ROWS - rows.length).fill(null)]
})

const fetchDetail = async () => {
  loading.value = true; error.value = ''; transfer.value = null
  try {
    const token = getCookie('accessToken'); if (!token) throw new Error('Access token is missing. Please log in.')
    const decoded = decodeURIComponent(token)
    const { data } = await axios.get(`${apiBaseUrl}/asset-transfers/${id.value}`, {
      headers: { Authorization: `Bearer ${decoded}`, Accept: 'application/json' },
    })
    transfer.value = data?.data ?? data ?? null
  } catch (e) { console.error(e); error.value = e.response?.data?.message || 'Failed to load details.' }
  finally { loading.value = false }
}
onMounted(fetchDetail)

const onDelete = async () => {
  if (!confirm('Delete this asset transfer?')) return
  try {
    const token = getCookie('accessToken'); if (!token) throw new Error('Access token is missing. Please log in.')
    await axios.delete(`${apiBaseUrl}/asset-transfers/${id.value}`, {
      headers: { Authorization: `Bearer ${decodeURIComponent(token)}`, Accept: 'application/json' },
    })
    alert('Deleted successfully.'); router.push('/dashboards/assettransfers')
  } catch (e) { alert(e.response?.data?.message || 'Failed to delete.') }
}
const onApprove = async () => {
  try {
    const token = getCookie('accessToken'); if (!token) throw new Error('Access token is missing. Please log in.')
    await axios.post(`${apiBaseUrl}/asset-transfers/${id.value}/approve`, {}, {
      headers: { Authorization: `Bearer ${decodeURIComponent(token)}`, Accept: 'application/json' },
    })
    alert('Approved.'); fetchDetail()
  } catch (e) { alert(e.response?.data?.message || 'Failed to approve.') }
}
const onReject = async () => {
  try {
    const token = getCookie('accessToken'); if (!token) throw new Error('Access token is missing. Please log in.')
    await axios.post(`${apiBaseUrl}/asset-transfers/${id.value}/reject`, {}, {
      headers: { Authorization: `Bearer ${decodeURIComponent(token)}`, Accept: 'application/json' },
    })
    alert('Rejected.'); fetchDetail()
  } catch (e) { alert(e.response?.data?.message || 'Failed to reject.') }
}
const printPage = () => window.print()
</script>

<style scoped>
:root {
  --green: #0b9a50;       /* brand border */
  --olive: #c7d4a5;       /* ATF band + section titles */
  --hdr-gray: #e5e5e5;    /* grey cells */
  --light-gray: #e7f3ea;  /* table header bg */
}
.page-wrap { padding: 8px; }
.page-title { margin-block: 0; margin-inline: 8px; }
.topbar { display: flex; align-items: center; justify-content: space-between; margin-block-end: 12px; }

/* SHEET */
.sheet.a4.portrait {
  --w: 210mm;
  --h: 297mm;
  --pad: 8mm;

  padding: var(--pad);
  background: #fff;
  box-shadow: 0 0 0.6rem rgba(0, 0, 0, 15%);
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  inline-size: var(--w);
  margin-inline: auto;
  min-block-size: var(--h);
}

/* HEADER */
.masthead { margin-block-end: 3mm; }

/* brandline — robust, no merging, RTL ok */
.brandline {
  display: grid;
  border: 2px solid var(--green);
  background: #f2f2f2;
  border-block-end: none;
  gap: 6mm;
  grid-template-columns: 1fr auto 1fr;      /* left | logo | right */
  padding-block: 3mm;
  padding-inline: 4mm;
  place-items: center center;
}
.brand-block { text-align: center; white-space: normal; }
.brand-en { color: #333; direction: ltr; font-size: 10pt; line-height: 1.2; }
.brand-ar { color: #333; direction: rtl; font-size: 10pt; line-height: 1.2; }
.brand-block .line2 { color: #555; font-size: 8.5pt; }
.brand-logo { block-size: auto; inline-size: 40mm; object-fit: contain; }

/* header grids */
.mast-grid {
  display: grid;
  align-items: center;
  border-inline-end: 2px solid var(--green);
  border-inline-start: 2px solid var(--green);
  grid-template-columns: 28mm 28mm 1fr 22mm 42mm;
}
.mast-grid:first-of-type { border-block-start: 2px solid #000; }
.mast-grid + .mast-grid { border-block-start: 2px solid #000; }
.mast-grid:last-of-type { border-block-end: 2px solid var(--green); }
.mast-grid .cell { border: 1px solid #000; background: #fff; border-block-start: none; font-size: 10pt; padding-block: 2.2mm; padding-inline: 2.6mm; }
.mast-grid .cell.small { text-align: center; }
.mast-grid .cell span { text-transform: uppercase; }
.mast-grid .cell b { font-weight: 800; }
.mast-grid .project { background: var(--hdr-gray); font-size: 12pt; font-weight: 800; letter-spacing: 0.2px; text-align: center; }
.mast-grid .label { background: var(--hdr-gray); text-align: center; text-transform: uppercase; }
.mast-grid .value { text-align: center; }
.mast-grid .atf-title { background: var(--olive); font-size: 12pt; font-weight: 900; letter-spacing: 0.2px; text-align: center; }

/* section titles */
.section-title {
  border: 1px solid #000;
  background: var(--olive);
  font-weight: 800;
  margin-block: 2mm 1mm;
  padding-block: 2mm;
  padding-inline: 2.2mm;
  text-transform: uppercase;
}

/* meta rows */
.meta.sender .row,
.receiver-grid .row {
  display: grid;
  border: 1px solid #000;
  grid-template-columns: 36mm 1fr 36mm 1fr;
  min-block-size: 10mm;
}

.meta.sender .row + .row,
.receiver-grid .row + .row { border-block-start: none; }

.meta.sender label,
.receiver-grid label { display: flex; align-items: center; font-size: 9pt; padding-block: 1.3mm; padding-inline: 2mm; }

.meta.sender b,
.receiver-grid b { display: flex; align-items: center; border-inline-start: 1px solid #000; font-size: 9pt; padding-block: 1.3mm; padding-inline: 2mm; }

/* items table */
.grid.items { border-collapse: collapse; inline-size: 100%; margin-block-start: 2mm; }

.grid.items th,
.grid.items td { border: 1px solid #000; font-size: 9pt; padding-block: 1.5mm; padding-inline: 2mm; }
.grid.items thead th { background: var(--light-gray); text-align: center; text-transform: uppercase; }
.center { text-align: center; }
.w-sno { inline-size: 17mm; }
.w-brand { inline-size: 50mm; }
.w-qty { inline-size: 16mm; }
.w-remarks { inline-size: 35mm; }

/* approvals */
.approval-grid { display: grid; border: 1px solid #000; border-block-start: none; grid-template-columns: 90mm 1fr 40mm; margin-block-end: 3mm; }
.approval-grid + .approval-grid { margin-block-start: -2mm; }
.approval-grid .date-box { border-inline-end: 1px solid #000; }
.approval-grid .remarks-box { padding: 2mm; border-inline-end: 1px solid #000; }
.approval-grid .sign-box { display: flex; align-items: flex-end; justify-content: flex-end; padding: 2mm; }
.approval-grid .sign-box .undertext { font-size: 9pt; margin-inline-end: 2mm; }
.approval-grid .row.small { display: grid; border-block-end: 1px solid #000; grid-template-columns: 10mm 10mm 10mm 1fr; }
.approval-grid .row.small:last-child { border-block-end: none; }
.approval-grid .cell { display: flex; align-items: center; justify-content: center; border-inline-end: 1px solid #000; font-size: 9pt; padding-block: 1.6mm; padding-inline: 0; }
.approval-grid .cell:last-child { border-inline-end: none; }
.approval-grid .cell.text { justify-content: flex-start; padding-inline-start: 2mm; }

/* receiver */
.receiver-grid .row:last-child { grid-template-columns: 1fr 1fr; }
.receiver-grid .row .half { display: flex; }
.receiver-grid .row .accept { padding: 2mm; border-inline-start: 1px solid #000; inline-size: 100%; text-align: center; }
.receiver-grid .row .accept.gray { background: #d9d9d9; }
.receiver-grid .row .accept.grayless { background: #f5f5f5; }

/* PRINT ONLY */
@media print {
  /* A4 with safe top room even if "Headers and footers" ON */
  @page { margin-block: 14mm 8mm; margin-inline: 6mm; size: a4 portrait; }

  /* Hide whole app chrome / random cards outside the sheet */
  body > *:not(#printArea) { display: none !important; }

  /* Buttons only hidden in print */
  .topbar { display: none !important; }

  /* Show ONLY the sheet; no fixed positioning (prevents top clipping) */
  #printArea,
 #printArea * { visibility: visible !important; }

  #printArea {
    position: static !important;       /* FIX: was fixed */
    padding: 0 !important;
    background: #fff !important;
    block-size: auto !important;
    box-shadow: none !important;
    inline-size: 210mm !important;
    margin-block: 0 !important;
    margin-inline: auto !important;
  }

  /* Brandline must never be hidden or split */
  #printArea .brandline {
    break-inside: avoid;
    min-block-size: 16mm;
    page-break-inside: avoid;
  }

  #printArea .brandline,
 #printArea .brandline * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Avoid awkward splits */
  .grid,
 .meta,
 .approval-grid,
 .receiver-grid { page-break-inside: avoid; }
}
</style>

