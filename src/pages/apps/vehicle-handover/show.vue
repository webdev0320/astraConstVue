<template>
  <div class="vh-page">
    <!-- Top bar -->
    <div class="d-flex justify-between align-center mb-4">

      <div class="d-flex align-center gap-2">
        <VBtn
          :loading="printing"
          :disabled="printing || !handover"
          variant="tonal"
          prepend-icon="tabler-printer"
          @click="printPage"
        >
          Print
        </VBtn>

        <!-- <VBtn
          :loading="pdfBusy"
          :disabled="pdfBusy || !handover"
          color="primary"
          prepend-icon="mdi-file-pdf-box"
          @click="downloadPdf"
        >
          Download PDF
        </VBtn> -->
      </div>
    </div>

    <!-- Error / Loading -->
    <VAlert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</VAlert>
    <VSkeletonLoader v-else-if="loading" type="card, list-item-two-line, table" class="mb-4" />

    <!-- CONTENT (screen cards) -->
    <div v-else-if="handover" class="content-wrap">
      <div class="grid gap-4 md:grid-cols-2">
        <VCard>
          <VCardTitle class="pb-0">Summary</VCardTitle>
          <VCardText>
            <div class="kv">
              <div><strong>Date</strong><span>{{ handover.report_date || '—' }}</span></div>
              <div><strong>Asset Code</strong><span>{{ handover.asset.code || '—' }}</span></div>
              <div><strong>Asset Name</strong><span>{{ handover.asset.title || '—' }}</span></div>
              <div><strong>Plate No</strong><span>{{ handover.plate_no || '—' }}</span></div>
              <div><strong>Driver Name</strong><span>{{ handover.driverName || '—' }}</span></div>
              <div><strong>KM Reading</strong><span>{{ handover.km_reading ?? '—' }}</span></div>
              <div><strong>Vehicle Type</strong><span>{{ handover.vehicle_type || '—' }}</span></div>
              <div><strong>Model No</strong><span>{{ handover.model_no || '—' }}</span></div>
              <div><strong>Investment Req. ID</strong><span>{{ handover.investment_req_id ?? '—' }}</span></div>
              <div><strong>Notes</strong><span>{{ handover.notes || '—' }}</span></div>
            </div>
          </VCardText>
        </VCard>

        <VCard>
          <VCardTitle class="pb-0">Handover Details</VCardTitle>
          <VCardText>
            <div class="kv">
              <div><strong>Releasing By</strong><span>{{ handover.releasingName || '—' }}</span></div>
              <div><strong>Receiving By</strong><span>{{ handover.receiverName || '—' }}</span></div>
              <div><strong>Handover Location</strong><span>{{ handover.handover_location_id ?? '—' }}</span></div>
              <div><strong>Receiving Location</strong><span>{{ handover.receiving_location_id ?? '—' }}</span></div>
              <div><strong>Handover DateTime</strong><span>{{ handover.handover_datetime || '—' }}</span></div>
              <div><strong>Receiving DateTime</strong><span>{{ handover.receiving_datetime || '—' }}</span></div>
            </div>
          </VCardText>
        </VCard>



        <VCard class="md:col-span-2">
          <VCardTitle class="pb-0">Checks</VCardTitle>
          <VCardText>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <p class="section-heading">CHECK MAJOR PARTS</p>
                <ul class="checklist">
                  <li><span class="box">{{ mark(handover.checks?.tires) }}</span> TIRES</li>
                  <li><span class="box">{{ mark(handover.checks?.battery) }}</span> BATTERY</li>
                  <li><span class="box">{{ mark(handover.checks?.scratches) }}</span> SCRATCHES</li>
                  <li><span class="box">{{ mark(handover.checks?.mirrors) }}</span> MIRRORS</li>
                </ul>
              </div>
              <div>
                <p class="section-heading">HANDING OVER</p>
                <ul class="checklist">
                  <li><span class="box">{{ mark(handover.checks?.registration_card) }}</span> REGISTRATION CARD</li>
                  <li><span class="box">{{ mark(handover.checks?.insurance_card) }}</span> INSURANCE CARD</li>
                  <li><span class="box">{{ mark(handover.checks?.spare_time ?? handover.checks?.spare_tire) }}</span> SPARE TIRE</li>
                  <li><span class="box">{{ mark(handover.checks?.jack) }}</span> JACK</li>
                  <li><span class="box">{{ mark(handover.checks?.tool_kit) }}</span> TOOL KIT</li>
                </ul>
              </div>
            </div>
          </VCardText>
        </VCard>

        <VCard class="md:col-span-2" v-if="images.length">
          <VCardTitle class="pb-0">Images</VCardTitle>
          <VCardText>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div v-for="(url, i) in images" :key="i" class="image-tile">
                <VImg :src="url" :eager="true" aspect-ratio="16/9" cover />
                <div class="text-caption mt-1 break-all">
                  <a :href="url" target="_blank" rel="noopener">Open original</a>
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>

        

      </div>

    </div>

    <div v-else class="py-6 text-center">No data found.</div>


    <VCard class="pa-3 rounded-lg no-print mt-4 no-padd" elevation="2">
            <VCardTitle class="no-padd">Approvals</VCardTitle>
            <VCardText class="no-padd">

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
                class="elev-1 no-padd"
              />

              <div v-else class="text-center py-4 text-medium-emphasis">
                No approvals found.
              </div>

            </VCardText>
          </VCard>
    
  </div>
</template>

<script setup>
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { VAlert, VBtn, VCard, VCardText, VCardTitle, VImg, VSkeletonLoader } from 'vuetify/components'

/** ROUTE */
const route = useRoute()
const id = computed(() => route.params.id)

const approvals = ref([])
const approvalsError = ref("")

/** BASE URL:
 *  Set in .env: VITE_API_BASE_URL={{baseUrl}}
 *  Endpoint becomes: {baseUrl}/api/vehicle-handovers/:id
 */
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const apiOrigin = RAW_BASE ? new URL(RAW_BASE).origin : window.location.origin

/** ===== Print assets (SET THESE) =====
 *  - Use absolute URLs OR import from /src/assets with Vite.
 *  Example imports:
 *    import logoPng from '@/assets/logo.png'
 *    const logoUrl = logoPng
 */

const logoUrl = "/src/assets/images/logos/astra-logo.png";
const carTop   = '/src/assets/images/carImage.png'


/** Helpers */
const joinUrl = (base, path) => {
  const b = String(base || '').replace(/\/+$/, '')
  const p = String(path || '').replace(/^\/+/, '')
  return `${b}/${p}`.replace(/(?<!:)\/{2,}/g, '/')
}
const endpointUrl = (handoverId) => joinUrl(RAW_BASE, `/vehicle-handovers/${handoverId}`) // <-- keep /api
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const loading = ref(false)
const error = ref('')
const handover = ref(null)
const images = ref([])

const printEl = ref(null)
const printing = ref(false)
const pdfBusy = ref(false)

/** Token from cookie (adjust name if different) */
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
const sanitizeUrl = (raw) => {
  if (!raw) return ''
  let s = String(raw).trim()
  if (s.startsWith('//')) s = 'https:' + s
  if (!/^https?:\/\//i.test(s)) {
    if (!s.startsWith('/')) s = '/' + s
    s = apiOrigin + s
  }
  try {
    const u = new URL(s)
    u.pathname = u.pathname.replace(/\/{2,}/g, '/')
    return u.toString()
  } catch { return s }
}
const normalizeImageArray = (arr) => Array.isArray(arr) ? arr.map(sanitizeUrl) : []
const mark = (v) => (+v ? '☒' : '☐')

/** Fetch */
const fetchHandover = async () => {
  try {
    loading.value = true
    error.value = ''
    const accessToken = normalizeToken(getCookie('accessToken'))
    if (!accessToken) throw new Error('Access token is missing. Please log in.')

    const res = await axios.get(endpointUrl(id.value), {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    })

    const d = res.data?.data ?? res.data ?? null
    if (!d) throw new Error('Empty response')
    handover.value = d
    images.value = normalizeImageArray(d.images)
  } catch (e) {
    console.error('Error fetching vehicle handover:', e)
    error.value = e.response?.data?.message || e.message || 'Failed to fetch vehicle handover.'
  } finally {
    loading.value = false
  }
}

const fetchApprovals = async () => {
  approvalsError.value = ""
  try {

    const accessToken = normalizeToken(getCookie('accessToken'))
    if (!accessToken) throw new Error('Access token is missing. Please log in.')

    const res = await axios.get(
      `${apiBaseUrl}/getApprovals/VehicleHandOver/${handover.value.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
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


/** PRINT via hidden iframe */
const printDoc = async () => {
  if (!handover.value) return
  try {
    printing.value = true
    await nextTick()
    const src = printEl.value
    const clone = src.cloneNode(true)

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const css = `
      @page { size: A4; margin: 10mm; }
      body { font-family: Arial, Helvetica, sans-serif; color:#111; }
      .offscreen { position: static; }
      ${printCss}
    `
    const doc = iframe.contentDocument || iframe.contentWindow.document
    doc.open()
    doc.write(`<html><head><title>Vehicle Handover</title><style>${css}</style></head><body></body></html>`)
    doc.body.appendChild(clone)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => document.body.removeChild(iframe), 500)
    }, 120)
  } catch (e) {
    console.error('Print error:', e)
    alert('Error while preparing print.')
  } finally {
    printing.value = false
  }
}

/** PDF */
const downloadPdf = async () => {
  if (!handover.value) return
  try {
    pdfBusy.value = true
    await nextTick()
    const element = printEl.value

    const fnPlate = (handover.value.plate_no || 'vehicle').replace(/\s+/g,'-')
    const filename = `Vehicle-Handover-${fnPlate}-#${id.value}.pdf`

    const opt = {
      filename,
      margin: [10, 10, 10, 10],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', scrollY: 0, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    }

    await html2pdf().set(opt).from(element).save()
  } catch (e) {
    console.error('PDF error:', e)
    alert('Error while generating PDF.')
  } finally {
    pdfBusy.value = false
  }
}

const printPage = () => {


  const h = handover.value;

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
              <img src="` + logoUrl + `" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>


         <!-- VEHICLE HANDOVER REPORT TITLE -->
              <div class="vh-titlebar" style="text-align:center;font-size:20px;font-weight:bold;margin-bottom:15px;text-decoration:underline;">
                VEHICLE HANDOVER REPORT
              </div>

              <!-- TOP INFORMATION TABLE -->
              <table class="top-table">
                <tr>
                  <th>Date</th>
                  <td>${handover.report_date || '' }</td>
                  <th>Plate No</th>
                  <td>${handover.plate_no || '' }</td>
                </tr>

                <tr>
                  <th>Driver Name</th>
                  <td>${handover.driverName || '' }</td>
                  <th>KM Reading</th>
                  <td>${handover.km_reading ?? '—' }</td>
                </tr>

                <tr>
                  <th>Vehicle Type</th>
                  <td>${handover.vehicle_type || '' }</td>
                  <th>Model No</th>
                  <td>${handover.model_no || '' }</td>
                </tr>
              </table>


       <!-- Middle: car silhouettes + checks -->
            <table class="vh-mid-table">
              <tr>
                <!-- Left: Car Image -->
                <td class="vh-left">
                  <div class="img-box">
                    <img src="${carTop}" alt="car top">
                  </div>
                </td>

                <!-- Right: Checks -->
                <td class="vh-right">
                  
                  <div class="checks-title">CHECK MAJOR PARTS</div>
                  <ul class="checks-list">
                    <li><span class="box">${mark(handover.checks?.tires)}</span> TIRES</li>
                    <li><span class="box">${mark(handover.checks?.battery)}</span> BATTERY</li>
                    <li><span class="box">${mark(handover.checks?.scratches)}</span> SCRATCHES</li>
                    <li><span class="box">${mark(handover.checks?.mirrors)}</span> MIRRORS</li>
                  </ul>

                  <div class="checks-title mt">HANDING OVER</div>
                  <ul class="checks-list">
                    <li><span class="box">${mark(handover.checks?.registration_card)}</span> REGISTRATION CARD</li>
                    <li><span class="box">${mark(handover.checks?.insurance_card)}</span> INSURANCE CARD</li>
                    <li><span class="box">${mark(handover.checks?.spare_time ?? handover.checks?.spare_tire)}</span> SPARE TIRE</li>
                    <li><span class="box">${mark(handover.checks?.jack)}</span> JACK</li>
                    <li><span class="box">${mark(handover.checks?.tool_kit)}</span> TOOL KIT</li>
                  </ul>

                </td>
              </tr>
            </table>


       <!-- Two signature blocks as table -->
<table class="vh-sign-table">
  <tr>
    <!-- Left: Person Releasing Vehicle -->
    <td class="vh-sign-left">
      <table class="inner-sign-table" style="margin-bottom:0px !important">
        <tr>
          <th colspan="2">PERSON RELEASING VEHICLE</th>
        </tr>
        <tr>
          <td style="width:50%">EMP. No. & NAME</td>
          <td style="width:50%">${handover.releasingName || '—'}</td>
        </tr>
        <tr>
          <td style="width:50%">POSITION</td>
          <td style="width:50%">—</td>
        </tr>
        <tr>
          <td style="width:50%">HANDOVER LOCATION</td>
          <td style="width:50%">${handover.handover_location_id ?? '—'}</td>
        </tr>
        <tr>
          <td style="width:50%">DATE & TIME</td>
          <td style="width:50%">${handover.handover_datetime || '—'}</td>
        </tr>
        <tr>
          <td style="width:50%">SIGNATURE</td>
          <td style="width:50%" class="sig-cell"></td>
        </tr>
      </table>
    </td>

    <!-- Right: Person Receiving Vehicle -->
    <td class="vh-sign-right">
      <table class="inner-sign-table">
        <tr>
          <th colspan="2">PERSON RECEIVING VEHICLE</th>
        </tr>
        <tr>
          <td style="width:50%">EMP. No. & NAME</td>
          <td style="width:50%">${handover.receiverName || '—'}</td>
        </tr>
        <tr>
          <td style="width:50%">POSITION</td>
          <td style="width:50%">—</td>
        </tr>
        <tr>
          <td style="width:50%">RECEIVING LOCATION</td>
          <td style="width:50%">${handover.receiving_location_id ?? '—'}</td>
        </tr>
        <tr>
          <td style="width:50%">DATE & TIME</td>
          <td style="width:50%">${handover.receiving_datetime || '—'}</td>
        </tr>
        <tr>
          <td style="width:50%">SIGNATURE</td>
          <td style="width:50%" class="sig-cell"></td>
        </tr>
      </table>
    </td>
  </tr>
</table>


        <!-- Note -->
        <p class="vh-note">
          Note: This tool is to be used when a vehicle is being handed over from one person to another in order to
          record any existing damage and avoid any potential disagreements in the future. It should be filled out in as much detail as possible.
        </p>
            
        
        
        
         <div class="header">
            <div class="left-text">
              Arab Supply & Trading Co.<br>
              Construction Branch
            </div>

            <div class="logo">
              <img src="` + logoUrl + `" />
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

onMounted(async () => {
  await fetchHandover()
  await fetchApprovals()
})  

/** Inject the same print CSS string we use in <style> so iframe has it */
const printCss = `
.vh-print{box-sizing:border-box;inline-size:794px;padding:8mm;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:14px;border:1px solid #222}
.vh-head{display:flex;justify-content:space-between;align-items:flex-start;border:2px solid #222;padding:6px 10px;margin-bottom:6px}
.vh-head-left{display:flex;align-items:center;gap:10px}
.vh-logo {
  width:300px
}
.vh-org .en{font-weight:700}
.vh-org .sub{font-weight:600;font-size:11px}
.vh-head-right{text-align:right;font-weight:700}
.vh-titlebar{background:#c53030;color:#fff;text-align:center;font-weight:800;letter-spacing:.5px;padding:6px;border:2px solid #222;margin-bottom:8px}
.vh-top-grid{border:2px solid #222;margin-bottom:8px}
.vh-top-grid .row{display:grid;grid-template-columns:1.2fr 1.8fr 1.2fr 1.8fr}
.vh-top-grid .cell{padding:6px 8px;border-bottom:1px solid #999;border-right:1px solid #999}
.vh-top-grid .row:last-child .cell{border-bottom:0}
.vh-top-grid .cell:last-child{border-right:0}
.vh-top-grid .cell.l{background:#efefef;font-weight:700}
.vh-mid{display:grid;grid-template-columns:2fr 1fr;gap:8px;margin-bottom:8px}
.vh-cars{display:grid;grid-template-columns:1fr;gap:6px;border:2px solid #222;padding:6px}
.vh-cars .img-box{border:1px solid #999;background:#f9f9f9;display:flex;align-items:center;justify-content:center;min-height:110px}
.vh-cars img{max-width:100%;max-height:100%}
.vh-checks{border:2px solid #222;padding:6px 8px}
.checks-title{font-weight:800;border-bottom:1px solid #999;padding-bottom:4px;margin-bottom:4px}
.checks-title.mt{margin-top:8px}
.checks-list{list-style:none;padding:0;margin:0}
.checks-list li{display:flex;align-items:center;gap:6px;padding:2px 0}
.box{display:inline-block;min-width:1.15rem;text-align:center;border:1px solid #111;font-family:monospace}
.vh-two{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px}
.vh-box{border:2px solid #222;padding:6px 8px}
.vh-box-title{font-weight:800;margin-bottom:4px;border-bottom:1px solid #999;padding-bottom:3px}
.kv>div{display:flex;justify-content:space-between;gap:12px;padding:3px 0;border-bottom:1px solid #ddd}
.kv>div:last-child{border-bottom:0}
.kv .l{font-weight:700}
.sig{display:inline-block;min-width:70mm;border-bottom:1px solid #111}
.vh-note{font-style:italic;border:1px solid #222;padding:6px}
`
</script>

<style scoped>
/* ===== Screen helpers ===== */
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 0.5rem; }
.mb-4 { margin-block-end: 1rem; }
.grid { display: grid; }
.gap-4 { gap: 1rem; }
.md\:grid-cols-2 { grid-template-columns: 1fr; }
.md\:col-span-2 { grid-column: span 1; }

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:col-span-2 { grid-column: span 2; }
}
.page-title { margin: 0; }
.kv > div { display: flex; justify-content: space-between; border-block-end: 1px dashed #e5e7eb; gap: 1rem; padding-block: 0.35rem; padding-inline: 0; }
.kv > div:last-child { border-block-end: 0; }
.section-heading { font-weight: 600; margin-block-end: 0.5rem; }
.checklist { padding: 0; margin: 0; list-style: none; }
.checklist li { display: flex; align-items: center; gap: 0.5rem; padding-block: 0.25rem; padding-inline: 0; }
.box { display: inline-block; border: 1px solid #111; border-radius: 2px; font-family: monospace; min-inline-size: 1.2rem; padding-block: 0; padding-inline: 0.15rem; text-align: center; }
.image-tile { overflow: hidden; border-radius: 10px; }
.text-caption { font-size: 12px; opacity: 0.8; }

/* ===== OFF-SCREEN print/pdf layout (Image-2 style) ===== */
.offscreen {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: -99999px;
  visibility: visible;
}

.vh-print {
  box-sizing: border-box;
  padding: 8mm;
  border: 1px solid #222;
  background: #fff;
  color: #111;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  inline-size: 794px; /* ~A4 @96dpi */
}

/* Header */
.vh-head {
  display: grid;
  align-items: center;
  border: 2px solid #222;
  gap: 10px;
  grid-template-columns: 1fr auto 1fr; /* left | center | right */
  margin-block-end: 6px;
  padding-block: 6px;
  padding-inline: 10px;
}
.vh-head-left { text-align: start; }
.vh-head-center { display: flex; justify-content: center; }
.vh-head-right { font-weight: 700; text-align: end; }

.vh-logo { block-size: 48px; inline-size: 48px; object-fit: contain; } /* tweak size if needed */
.vh-org .en { font-weight: 700; }
.vh-org .sub { font-size: 11px; font-weight: 600; }

/* Make Arabic block render RTL properly */
.ar { direction: rtl; }

/* Title bar (red) */
.vh-titlebar {
  padding: 6px;
  border: 2px solid #222;
  background: #c53030;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-block-end: 8px;
  text-align: center;
}

/* Top grid table */
.vh-top-grid { border: 2px solid #222; margin-block-end: 8px; }
.vh-top-grid .row { display: grid; grid-template-columns: 1.2fr 1.8fr 1.2fr 1.8fr; }
.vh-top-grid .cell { border-block-end: 1px solid #999; border-inline-end: 1px solid #999; padding-block: 6px; padding-inline: 8px; }
.vh-top-grid .row:last-child .cell { border-block-end: 0; }
.vh-top-grid .cell:last-child { border-inline-end: 0; }
.vh-top-grid .cell.l { background: #efefef; font-weight: 700; }

/* Mid area: cars + checks */
.vh-mid { display: grid; gap: 8px; grid-template-columns: 2fr 1fr; margin-block-end: 8px; }
.vh-cars { display: grid; padding: 6px; border: 2px solid #222; gap: 6px; grid-template-columns: 1fr 1fr; }
.vh-cars .img-box { display: flex; align-items: center; justify-content: center; border: 1px solid #999; background: #f9f9f9; min-block-size: 110px; }
.vh-cars img { max-block-size: 100%; max-inline-size: 100%; }

.vh-checks { border: 2px solid #222; padding-block: 6px; padding-inline: 8px; }
.checks-title { border-block-end: 1px solid #999; font-weight: 800; margin-block-end: 4px; padding-block-end: 4px; }
.checks-title.mt { margin-block-start: 8px; }
.checks-list { padding: 0; margin: 0; list-style: none; }
.checks-list li { display: flex; align-items: center; gap: 6px; padding-block: 2px; padding-inline: 0; }
.box { display: inline-block; border: 1px solid #111; font-family: monospace; min-inline-size: 1.15rem; text-align: center; }

/* Two boxes (signatures) */
.vh-two { display: grid; gap: 8px; grid-template-columns: 1fr 1fr; margin-block-end: 6px; }
.vh-box { border: 2px solid #222; padding-block: 6px; padding-inline: 8px; }
.vh-box-title { border-block-end: 1px solid #999; font-weight: 800; margin-block-end: 4px; padding-block-end: 3px; }
.kv > div { display: flex; justify-content: space-between; border-block-end: 1px solid #ddd; gap: 12px; padding-block: 3px; padding-inline: 0; }
.kv > div:last-child { border-block-end: 0; }
.kv .l { font-weight: 700; }
.sig { display: inline-block; border-block-end: 1px solid #111; min-inline-size: 70mm; }

/* Note */
.vh-note { padding: 6px; border: 1px solid #222; font-style: italic; }

/* Print media */
@media print {
  @page { margin: 10mm; size: a4; }
  .vh-page > *:not(.offscreen) { display: none !important; }
  .offscreen { position: static; inset-inline-start: auto; }
  .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #000;
      padding: 10px 20px;
      margin-bottom: 20px;
  }

  .left-text, .right-text {
    width: 30%;
    font-size: 14px;
    font-weight: bold;
    line-height: 18px;
    text-align: center;
}


}
</style>
