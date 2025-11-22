<template>
  <div class="page-wrap">
    <!-- app chrome: visible on screen, auto-hidden in print -->
    <div class="topbar">
      <div class="left">
      </div>
      <div class="right">
<!--         <VBtn color="primary" @click="$router.push(`/dashboards/assettransfers/edit/${id}`)">Edit</VBtn>
        <VBtn color="error" @click="onDelete">Delete</VBtn>
        <VBtn color="success" @click="onApprove">Approve</VBtn>
        <VBtn color="warning" @click="onReject">Reject</VBtn> -->
        <VBtn color="secondary" @click="printPage">Print</VBtn>
      </div>
    </div>

    <VAlert v-if="error" type="error" class="mb-4" variant="tonal">{{ error }}</VAlert>

    <template v-if="loading">
      <VSkeletonLoader type="card, list-item-two-line, table" class="mb-4" />
    </template>

    <template v-else-if="transfer">
      <!-- ===== A4 PRINT SHEET ===== -->
      <div class="" id="printArea">
        <!-- ===== HEADER ===== -->
        <VCard class="pa-4 mb-6" outlined>
  <VCardText>

    <!-- Row 1 -->
    <VRow dense>
      <VCol cols="6" sm="2">
        <div class="text-caption">ISSUE</div>
        <div class="font-weight-bold">{{ transfer.issue_no || '1' }}</div>
      </VCol>

      <VCol cols="6" sm="2">
        <div class="text-caption">REV</div>
        <div class="font-weight-bold">{{ transfer.revision_no || '0' }}</div>
      </VCol>

      <VCol cols="12" sm="4">
        <div class="text-caption">PROJECT</div>
        <div class="font-weight-bold">
          {{ transfer.transferredProjectName || defaultProject }}
        </div>
      </VCol>

      <VCol cols="6" sm="2">
        <div class="text-caption">DATE</div>
        <div class="font-weight-bold">
          {{ fmtDate(transfer.date) }}
        </div>
      </VCol>
    </VRow>

    <VDivider class="my-3" />

    <!-- Row 2 -->
    <VRow dense>
      <VCol cols="6" sm="2">
        <div class="font-weight-bold">
          {{ transfer.form_no || 'F-12-05' }}
        </div>
      </VCol>

      <VCol cols="6" sm="2">
        <div class="font-weight-bold">
          {{ fmtDate(transfer.revision_date) }}
        </div>
      </VCol>

      <VCol cols="12" sm="4">
        <div class="font-weight-bold text-center">
          ASSET TRANSFER FORM (ATF)
        </div>
      </VCol>

      <VCol cols="6" sm="2">
        <div class="text-caption font-weight-bold">TAG NO.</div>
        <div class="font-weight-bold">
          {{ transfer.tag_no || '—' }}
        </div>
      </VCol>
    </VRow>

  </VCardText>
</VCard>


        <!-- ===== SENDER ===== -->
       <VCard class="pa-4 mb-6" outlined>
  <VCardTitle class="text-subtitle-1 font-weight-bold">
    TO BE FILLED BY THE SENDER
  </VCardTitle>

  <VCardText>

    <!-- Row: From/To -->
    <VRow dense>
      <VCol cols="12" sm="6">
        <div class="text-caption">Transferred from</div>
        <div class="font-weight-bold">
          {{ transfer.transferredProjectName || projectOrId(transfer.transferred_from_project_id) }}
        </div>
      </VCol>

      <VCol cols="12" sm="6">
        <div class="text-caption">Transferred to</div>
        <div class="font-weight-bold">
          {{ transfer.transferredToProjectName || projectOrId(transfer.transferred_to_project_id) }}
        </div>
      </VCol>
    </VRow>

    <!-- Row: Date / Time -->
    <VRow dense class="mt-2">
      <VCol cols="12" sm="6">
        <div class="text-caption">Date of Transfer</div>
        <div class="font-weight-bold">{{ fmtDate(transfer.transfer_date) }}</div>
      </VCol>

      <VCol cols="12" sm="6">
        <div class="text-caption">Time</div>
        <div class="font-weight-bold">{{ fmtTime(transfer.transfer_time) }}</div>
      </VCol>
    </VRow>

    <!-- Row: Prepared By / Signature -->
    <VRow dense class="mt-2">
      <VCol cols="12" sm="6">
        <div class="text-caption">Prepared and Checked by</div>
        <div class="font-weight-bold">
          {{ transfer.preparedByName || transfer.prepared_by || '—' }}
        </div>
      </VCol>

      <VCol cols="12" sm="6">
        <div class="text-caption">Signature</div>
        <div class="font-weight-bold">&nbsp;</div>
      </VCol>
    </VRow>

    <!-- Row: Driver Name / Signature -->
    <VRow dense class="mt-2">
      <VCol cols="12" sm="6">
        <div class="text-caption">Driver Name</div>
        <div class="font-weight-bold">{{ transfer.driverName || '—' }}</div>
      </VCol>

      <VCol cols="12" sm="6">
        <div class="text-caption">Signature</div>
        <div class="font-weight-bold">&nbsp;</div>
      </VCol>
    </VRow>

    <!-- Row: Contact / Vehicle -->
    <VRow dense class="mt-2">
      <VCol cols="12" sm="6">
        <div class="text-caption">Contact Details</div>
        <div class="font-weight-bold">{{ transfer.contact_details || '—' }}</div>
      </VCol>

      <VCol cols="12" sm="6">
        <div class="text-caption">Vehicle Plate No.</div>
        <div class="font-weight-bold">{{ transfer.vehicle_plate_no || '—' }}</div>
      </VCol>
    </VRow>

  </VCardText>
</VCard>


        <!-- ===== ITEMS ===== -->
         <VDataTable
    :headers="headers"
    :items="formattedItems"
    class="mb-4"
    density="compact"
    hide-default-footer
    fixed-header
  >
    <template #item.sn="{ index }">
      {{ index + 1 }}
    </template>

      <template #item.asset="{ item }">
        {{ item.assetName }} {{ item.assetCode ? `(${item.assetCode})` : '' }}
      </template>


    <template #item.description="{ item }">
      {{ item.description || item.remarks || '' }}
    </template>

    <template #item.qty="{ item }">
      {{ item.qty ?? '' }}
    </template>

    <template #item.remarks="{ item }">
      {{ item.remarks || '' }}
    </template>
  </VDataTable>

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

const logoSrc = "/src/assets/images/logos/astra-logo.png";

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)

const loading = ref(true)
const error = ref('')
const transfer = ref(null)

const headers = [
  { title: 'S/N', key: 'sn', width: '70px', align: 'center' },
  { title: 'Asset Name & Code', key: 'asset' }, // <-- changed from assetName
  { title: 'DESCRIPTION', key: 'description' },
  { title: 'QTY', key: 'qty', width: '80px', align: 'center' },
  { title: 'REMARKS', key: 'remarks' },
]



const getCookie = (name) => {
  const v = `; ${document.cookie}`; const p = v.split(`; ${name}=`); if (p.length === 2) return p.pop().split(';').shift(); return null
}
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi' })
const fmtDate = (iso) => { try { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : fmt.format(d) } catch { return '—' } }
const fmtTime = (iso) => { try { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }) } catch { return '—' } }
const projectOrId = (pid) => (pid ? `#${pid}` : '—')

const filledRows = computed(() => {
  return Array.isArray(transfer.value?.items) ? transfer.value.items : []
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

const formattedItems = computed(() =>
  filledRows.value.map((it) => ({
    sn: '', // S/N is handled in template
    brand: it?.assetName,
    description: it?.description,
    qty: it?.qty,
    remarks: it?.remarks,
    asset_id: it?.asset_id,
    assetName: it?.assetName,
    assetCode: it?.assetCode,
  }))
)

const printPage = () => {


  const h = transfer.value;

  const printWindow = window.open("", "", "width=1000,height=700");

  printWindow.document.write(`
    <html>
      <head>
        <title>Asset Handover Form</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }

          .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: 1px solid #000;
              padding: 10px 20px;
              margin-bottom: 20px;
            }

          .header img {
            height: 70px;
          }

          .title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 14px;
          }

          table th, table td {
            border: 1px solid #000;
          }

          .grid-table td {
            padding: 3px 0;
          }

          .sign-row {
            margin-top: 50px;
          }

          .sign-col {
            width: 25%;
            text-align: center;
            font-weight: bold;
            height : 80px;
          }

          .footer {
            margin-top: 30px;
            font-size: 12px;
          }

        .left-text, .right-text {
            width: 30%;
            font-size: 14px;
            font-weight: bold;
            line-height: 18px;
            text-align: center;
          }

          .logo img {
            height: 70px;
          }

          .grid-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
              margin-bottom: 15px;
            }

            .grid-table td {
              border: 1px solid #000 !important;
              padding: 6px 10px;
              width: 50%;
              vertical-align: top;
            }

    .vh-mid-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.vh-mid-table td {
  vertical-align: top;
  border: 1px solid #000;
  padding: 10px;
}

.vh-left {
  width: 70%;
  text-align: center;
}

.vh-left img {
  width: 100%;
}

.vh-right {
  width: 55%;
}

.checks-title {
  font-weight: bold;
  margin: 10px 0 5px;
}

.checks-list {
  list-style: none;
  padding: 0;
  margin: 0 0 15px;
}

.checks-list li {
  margin: 4px 0;
  font-size: 14px;
}

.box {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 1px solid #000;
  text-align: center;
  line-height: 15px;
  margin-right: 8px;
}

    .vh-sign-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 30px;
}

.inner-sign-table {
  width: 100%;
  border: 1px solid #000;
  border-collapse: collapse;
  font-size: 14px;
}

.inner-sign-table th {
  text-align: center;
  font-weight: bold;
  background: #f0f0f0;
  padding: 6px;
  border: 1px solid #000;
}

.sig-cell {
  height: 60px; /* space for signature */
}

    .header-table{
      text-align:center !important;
    }


        </style>
      </head>

      <body>

        <!-- Logo & Header -->
         <div class="header">
            <div class="left-text">
              Arab Supply & Trading Co.<br>
              Construction Branch
            </div>

            <div class="logo">
              <img src="` + logoSrc + `" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>

         
         <!-- Header -->
      <table class="header-table">
        <tr>
          <td>ISSUE ${h.issue_no || ''}</td>
          <td>REV ${h.revision_no || '0'}</td>
          <td class="center" style="text-align:center" colspan="2"><b>${h.transferredProjectName}</b></td>
          <td>DATE ${fmtDate(h.date)}</td>
        </tr>
        <tr>
          <td>${h.form_no}</td>
          <td>${fmtDate(h.revision_date)}</td>
          <td class="center" colspan="2"><b>ASSET TRANSFER FORM (ATF)</b></td>
          <td>TAG NO. ${h.tag_no}</td>
        </tr>
      </table>

      <!-- Sender -->
      <div class="section-title">TO BE FILLED BY THE SENDER</div>
      <table>
        <tr>
          <td>Transferred from<br><b>${h.transferredProjectName}</b></td>
          <td>Transferred to<br><b>${h.transferredToProjectName}</b></td>
        </tr>
        <tr>
          <td>Date of Transfer<br><b>${fmtDate(h.transfer_date)}</b></td>
          <td>Time<br><b>${fmtTime(h.transfer_time)}</b></td>
        </tr>
        <tr>
          <td>Prepared and Checked by<br><b>${h.preparedByName}</b></td>
          <td>Signature</td>
        </tr>
        <tr>
          <td>Driver Name<br><b>${h.driverName}</b></td>
          <td>Signature</td>
        </tr>
        <tr>
          <td>Contact details<br><b>${h.contact_details}</b></td>
          <td>Vehicle Plate No.<br><b>${h.vehicle_plate_no || ''}</b></td>
        </tr>
      </table>

      <!-- Items -->
      <table class="grid items">
        <thead>
          <tr>
            <th>S/N</th>
            <th>BRAND / MODEL</th>
            <th>DESCRIPTION</th>
            <th>QTY</th>
            <th>REMARKS</th>
          </tr>
        </thead>
        <tbody>
          ${h.items.map((item, idx) => `
            <tr>
              <td class="center">${idx + 1}</td>
              <td>${item.assetCode || ''}</td>
              <td>${item.assetName}</td>
              <td class="center">${item.qty}</td>
              <td>${item.remarks || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Approvals -->
      <div class="section-title">TO BE FILLED BY THE PLANT & MACHINERY</div>
      <table>
        <tr>
          <td style="width:4%">Date</td>
          <td style="width:15%"></td>
          <td style="width:5%">Approved</td>
          <td style="width:5%"></td>
          <td rowspan="2"> Remarks:</td>
          <td rowspan="2"> Manager</td>
        </tr>

        <tr>
          <td style="width:4%">Date</td>
          <td style="width:15%"></td>
          <td style="width:5%">Disapproved</td>
          <td style="width:5%"></td>
        </tr>

      </table>

      <div class="section-title">APPROVAL FROM THE PROJECT INCHARGE/DEPARTMENT HEAD</div>
      <table>
       <table>
        <tr>
          <td style="width:4%">Date</td>
          <td style="width:15%"></td>
          <td style="width:5%">Approved</td>
          <td style="width:5%"></td>
          <td rowspan="2"> Remarks:</td>
          <td rowspan="2">Project Manager</td>
        </tr>

        <tr>
          <td style="width:4%">Date</td>
          <td style="width:15%"></td>
          <td style="width:5%">Disapproved</td>
          <td style="width:5%"></td>
        </tr>

      </table>
      </table>

      <!-- Receiver -->
      <div class="section-title">TO BE FILLED BY THE RECEIVER</div>
      <table>
        <tr>
          <td>Received from</td>
          <td>${h.received_from}</td>
          <td>Received by</td>
          <td>${h.received_by}</td>
        </tr>
        <tr>
          <td>Date</td>
          <td>${fmtDate(h.received_date)}</td>
          <td>Time</td>
          <td>${fmtTime(h.received_time)}</td>
        </tr>
        <tr>
          <td>Inspected by</td>
          <td>${h.inspected_by}</td>
          <td>Signature</td>
          <td></td>
        </tr>
        <tr>
          <td>Equipment / Material Accepted</td>
          <td>${h.equipment_status ? '' : ''}</td>
          <td>Equipment / Material Not Accepted</td>
          <td>${!h.equipment_status ? '' : ''}</td>
        </tr>
      </table>
      


        
         <div class="header">
            <div class="left-text">
              Arab Supply & Trading Co.<br>
              Construction Branch
            </div>

            <div class="logo">
              <img src="` + logoSrc + `" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>             

      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();


}

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
  border-block-end: none;
  gap: 6mm;
  grid-template-columns: 1fr auto 1fr;      /* left | logo | right */
  padding-block: 3mm;
  padding-inline: 4mm;
  place-items: center center;
}
.brand-block { text-align: center; white-space: normal; }
.brand-en { direction: ltr; font-size: 10pt; line-height: 1.2; }
.brand-ar { direction: rtl; font-size: 10pt; line-height: 1.2; }
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
.mast-grid .cell { border: 1px solid #000;border-block-start: none; font-size: 10pt; padding-block: 2.2mm; padding-inline: 2.6mm; }
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

