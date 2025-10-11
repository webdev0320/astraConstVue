<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center w-100 mb-4">
        <h2 class="m-0">Asset Detail</h2>

        <div class="d-flex align-center gap-2" style="margin-left: auto;">
          <VBtn color="secondary" @click="printPage">Print</VBtn>
          <VBtn color="primary" @click="$router.push('/dashboards/assets')">Back to List</VBtn>
        </div>
      </div>


    <!-- Loading / Error -->
    <VCard v-if="isLoading" class="pa-4"><p>Loading asset details...</p></VCard>
    <VAlert v-else-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</VAlert>

    <!-- Asset Details -->
    <VCard v-else-if="asset" id="printArea">
      <VCardText>
        <!-- Meta Grid -->
        <div class="detail-grid">
          <!-- Left column: meta -->
          <div class="grid-left">
            <div class="kv"><span class="v"><strong>ID</strong></span><span class="v">{{ show(asset.id) }}</span></div>
            <div class="kv"><span class="v"><strong>Title</strong></span><span class="v">{{ show(asset.title) }}</span></div>
            <div class="kv"><span class="v"><strong>Code</strong></span><span class="v">{{ show(asset.code) }}</span></div>
            <div class="kv"><span class="v"><strong>Category</strong></span><span class="v">{{ show(asset.category_name) }}</span></div>
            <div class="kv"><span class="v"><strong>Sub Category</strong></span><span class="v">{{ show(asset.sub_category) }}</span></div>
            <div class="kv"><span class="v"><strong>Type</strong></span><span class="v">{{ show(asset.type) }}</span></div>
            <div class="kv"><span class="v"><strong>Asset Type</strong></span><span class="v">{{ show(asset.asset_type) }}</span></div>
            <div class="kv"><span class="v"><strong>Brand</strong></span><span class="v">{{ show(asset.brand) }}</span></div>
            <div class="kv"><span class="v"><strong>Model</strong></span><span class="v">{{ show(asset.model) }}</span></div>
            <div class="kv"><span class="v"><strong>Model #</strong></span><span class="v">{{ show(asset.model_number) }}</span></div>
            <div class="kv"><span class="v"><strong>Serial #</strong></span><span class="v">{{ show(asset.serial_number) }}</span></div>
            <div class="kv"><span class="v"><strong>Plate #</strong></span><span class="v">{{ show(asset.plate_number) }}</span></div>
            <div class="kv"><span class="v"><strong>Manufacturing Year</strong></span><span class="v">{{ show(asset.manufacturing_year) }}</span></div>
            <div class="kv"><span class="v"><strong>Production Date</strong></span><span class="v">{{ show(asset.production_date) }}</span></div>
            <div class="kv"><span class="v"><strong>Location</strong></span><span class="v">{{ show(asset.location) }}</span></div>
            <div class="kv"><span class="v"><strong>Description</strong></span><span class="v">{{ show(asset.description) }}</span></div>
          </div>

          <!-- Right column: financial & warranty -->
          <div class="grid-right">
            <div class="kv"><span class="v"><strong>Purchase Date</strong></span><span class="v">{{ show(asset.purchase_date) }}</span></div>
            <div class="kv"><span class="v"><strong>Price</strong></span><span class="v">{{ show(asset.price) }}</span></div>
            <div class="kv"><span class="v"><strong>Purchase Cost</strong></span><span class="v">{{ show(asset.purchase_cost) }}</span></div>
            <div class="kv"><span class="v"><strong>Replacement Cost</strong></span><span class="v">{{ show(asset.replacement_cost) }}</span></div>
            <div class="kv"><span class="v"><strong>Book Value</strong></span><span class="v">{{ show(asset.book_value) }}</span></div>
            <div class="kv"><span class="v"><strong>Useful Life</strong></span><span class="v">{{ show(asset.useful_life) }}</span></div>
            <div class="kv"><span class="v"><strong>Is Related to IT?</strong></span><span class="v">{{ boolShow(asset.is_related_to_it) }}</span></div>
            <div class="kv"><span class="v"><strong>Insurance Start</strong></span><span class="v">{{ show(asset.insurance_start_date) }}</span></div>
            <div class="kv"><span class="v"><strong>Insurance End</strong></span><span class="v">{{ show(asset.insurance_end_date) }}</span></div>
            <div class="kv"><span class="v"><strong>Warranty Start</strong></span><span class="v">{{ show(asset.warranty_start_date) }}</span></div>
            <div class="kv"><span class="v"><strong>Warranty End</strong></span><span class="v">{{ show(asset.warranty_end_date) }}</span></div>
            <div class="kv"><span class="v"><strong>Extended Warranty</strong></span><span class="v">{{ show(asset.extended_warranty) }}</span></div>
            <div class="kv"><span class="v"><strong>Created At</strong></span><span class="v">{{ show(asset.created_at) }}</span></div>
          </div>
        </div>

        <!-- Schedule Details -->
        <div v-if="Array.isArray(asset.schedule) && asset.schedule.length" class="mt-6">
          <h4>Depreciation Schedule</h4>
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Depreciation</th>
                <th>Remaining Value</th>
                <th>Remaining %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in asset.schedule" :key="index">
                <td>{{ item.year }}</td>
                <td>SAR {{ show(item.depreciation) }}</td>
                <td>SAR {{ show(item.remaining_value) }}</td>
                <td>{{ show(item.percent_remaining) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Media & QR -->
        <div class="mt-6">
          <h4>QR Code</h4>
          <div v-if="asset.qr_code">
            <a :href="asset.qr_code" target="_blank" rel="noopener">
              <VImg :src="asset.qr_code" width="140" />
            </a>
          </div>
          <div v-else>—</div>
        </div>
        <h4 class="mt-4 imageSection">Images</h4>
          <div v-if="Array.isArray(asset.media) && asset.media.length" class="media-grid imageSection">
            <div v-for="(m, i) in asset.media" :key="i" class="media-item">
              <a :href="m?.url || m" target="_blank" rel="noopener">
                <VImg :src="m?.url || m" alt="Asset media" width="140" />
              </a>
            </div>
          </div>
          <div v-else>—</div>

      </VCardText>
    </VCard>

    <VCard>


    </VCard>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { VBtn, VCard, VCardText, VImg, VAlert } from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();

const asset = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

// Cookie helper
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Auth header
const getAuthHeaders = () => {
  const accessToken = getCookie("accessToken");
  if (!accessToken) throw new Error("Access token is missing. Please log in.");
  return { Authorization: `Bearer ${decodeURIComponent(accessToken)}` };
};

// Formatters
const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const boolShow = (b) => (b === true ? "Yes" : b === false ? "No" : "—");

// Fetch asset detail
const fetchDetail = async () => {
  isLoading.value = true;
  try {
    const id = route.params.id;
    const res = await axios.get(`${apiBaseUrl}/assets/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = res.data?.data ?? res.data;
    asset.value = {
      ...data,
      media: Array.isArray(data?.images)
        ? data.images
        : data?.images
        ? [data.images]
        : [],
    };
  } catch (err) {
    console.error(err);
    errorMessage.value = err.response?.data?.message || "Failed to load asset details.";
  } finally {
    isLoading.value = false;
  }
};

const printPage = () => {
  const printContent = document.getElementById("printArea").innerHTML;
  const printWindow = window.open("", "", "width=1000,height=700");
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Asset Detail</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
          }

          h2, h4 {
            margin: 10px 0;
          }

          /* Keep grid layout visible */
          .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 24px;
            width: 100%;
          }

          .kv {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 6px;
            align-items: start;
            margin-bottom: 4px;
          }

          .k {
            font-weight: bold;
            color: #333;
            text-align: right;
            padding-right: 6px;
          }

          .v {
            text-align: left;
            word-break: break-word;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            text-align: center;
          }

          th {
            background: #f3f3f3;
            font-weight: 600;
          }

          /* Hide images and buttons */
          img, .v-btn, .imageSection {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};


onMounted(fetchDetail);
</script>

<style>
.detail-grid {
  display: grid;
  gap: 12px 24px;
  grid-template-columns: 1fr 1fr;
}
.kv {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 6px;
}
.k {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
}
.v {
  word-break: break-word;
}
.media-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}
.schedule-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}
.schedule-table th,
.schedule-table td {
  border: 1px solid #ccc;
  padding: 8px 10px;
  text-align: center;
}
.schedule-table th {
  font-weight: 600;
}
@media print {
  body * {
    visibility: hidden;
  }
  #printArea,
  #printArea * {
    visibility: visible;
  }
  #printArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}

@media print {
  .imageSection {
    display: none !important;
  }
}
@media print {
  /* Keep grid layout in print */
  .detail-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 12px 24px !important;
    width: 100%;
  }

  .kv {
    display: grid !important;
    grid-template-columns: 180px 1fr !important;
    gap: 6px !important;
    align-items: start;
  }

  .v {
    text-align: left !important;
    word-break: break-word;
  }

  /* Optional: add padding for better readability */
  #printArea {
    padding: 20px;
  }

  /* Hide buttons and images */
  .v-btn, .hide-on-print, img {
    display: none !important;
  }
}

@media print {
  /* Keep grid layout */
  .detail-grid {
      display: grid;
      gap: 12px 24px;
      grid-template-columns: 1fr 1fr;
  }

  /* Keep label-value alignment */
  .kv {
    display: grid !important;
    grid-template-columns: 160px auto !important;
    gap: 6px;
    align-items: start;
  }

  .k {
    font-weight: bold;
    color: #000 !important;
    text-align: right;
  }

  .v {
    text-align: left !important;
    word-break: break-word;
  }

  /* Add some space and readability */
  #printArea {
    padding: 20px 40px;
  }

  h2 {
    text-align: center;
    margin-bottom: 20px;
  }

  /* Hide images, buttons, etc. */
  img,
  .v-btn,
  .hide-on-print {
    display: none !important;
  }

  /* Table styling */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  th,
  td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #f8f8f8;
    font-weight: bold;
  }
}

</style>
