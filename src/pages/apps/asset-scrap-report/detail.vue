<template>
  <div class="container mt-4">

    <!-- Header with Print Button -->
    <div class="d-flex justify-content-between align-items-center mb-3 no-print">
      <h2 class="fw-bold mb-0">Asset Scrap Report Details</h2>
      <VBtn color="primary" class="ms-auto" @click="printReport">
        <v-icon left>mdi-printer</v-icon> Print
      </VBtn>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="text-center py-5">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- Report -->
    <div v-else-if="report" id="print-section" class="p-4 border bg-white">

      <!-- Company Header -->
      <div class="company-header mb-2">
        <div class="header-grid">
          <!-- Left side (English) -->
          <div class="text-start">
            <h5 class="mb-0 fw-bold text-print">Arab Supply & Trading Co.</h5>
            <p class="small mb-0 text-print">Construction Branch</p>
          </div>

          <!-- Center (Logo) -->
          <div class="text-center">
            <img :src="logoPath" alt="Logo" class="company-logo" />
          </div>

          <!-- Right side (Arabic) -->
          <div class="text-end">
            <p class="mb-0 fw-bold text-print">الشركة العربية للإمدادات والتجارة</p>
            <p class="small mb-0 text-print">فرع الإنشاءات</p>
          </div>
        </div>
      </div>

      <!-- Report Title Section -->
      <table class="table table-bordered text-center align-middle">
        <tr>
          <td class="text-print"><strong class="text-print">{{ report.project }}</strong></td>
          <td class="text-print"><strong class="text-print">DATE</strong><br>{{ report.report_date }}</td>
          <td class="text-print"><strong class="text-print">Tag No.</strong><br>{{ report.tag_no }}</td>
        </tr>
        <tr>
          <td colspan="3" class="fw-bold text-print">ASSET SCRAP REPORT (ASR)</td>
        </tr>
      </table>

      <!-- General Info -->
      <table class="table table-bordered mb-1">
        <tbody>
          <tr>
            <td class="text-print"><strong>Asset Scraped On</strong></td>
            <td class="text-print">{{ report.asset_scraped_on }}</td>
            <td class="text-print"><strong>Scraped By</strong></td>
            <td class="text-print">{{ report.scraped_by_name }}</td>
          </tr>
          <tr>
            <td class="text-print"><strong>Asset Purchased / Transferred On</strong></td>
            <td class="text-print">{{ report.asset_purchased_transferred_on }}</td>
            <td class="text-print"><strong>If Transferred (Where From)</strong></td>
            <td class="text-print">{{ report.transferred_from }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Section 2 -->
      <div class="fw-bold mb-1 text-print">2. TO BE FILLED BY THE PLANT & MACHINERY HEAD:</div>
      <table class="table table-bordered mb-2">
        <tr>
          <td class="text-print"><strong>Proposed Action:</strong></td>
        </tr>
        <tr>
          <td style="height: 80px;" class="text-print">{{ report.proposed_action }}</td>
        </tr>
        <tr>
          <td class="text-end fw-bold">Manager: {{ report.manager_name }}</td>
        </tr>
      </table>

      <!-- Section 3 -->
      <div class="fw-bold mb-1 text-print">3. TO BE FILLED BY THE PROJECT MANAGER / DEPARTMENT HEAD:</div>
      <table class="table table-bordered mb-2">
        <tr>
          <td width="50%">
            <strong>Approved</strong>
            <input type="checkbox" :checked="report.approved == 1" />
            &nbsp;&nbsp;&nbsp;
            <strong>Disapproved</strong>
            <input type="checkbox" :checked="report.approved == 0" />
          </td>
          <td rowspan="2">
            <strong class="text-print">Remarks:</strong><br>
            <span class="text-print">{{ report.approval_remarks }}</span>
          </td>
        </tr>
        <tr>
          <td class="text-end fw-bold">Project Manager: {{ report.approval_manager_name }}</td>
        </tr>
      </table>

      <!-- Section 4 -->
      <div class="fw-bold mb-1 text-print">4. TO BE FILLED BY THE ACCOUNTS DEPARTMENT:</div>
      <table class="table table-bordered">
        <tr>
          <td class="text-print"><strong>Report Received On</strong></td>
          <td class="text-print">{{ report.report_received_on }}</td>
          <td class="text-print"><strong>Time</strong></td>
          <td class="text-print">{{ report.received_time }}</td>
        </tr>
        <tr>
          <td class="text-print"><strong>Assessed By</strong></td>
          <td class="text-print">{{ report.assessed_by_name }}</td>
          <td class="text-print"><strong>Assessed Date</strong></td>
          <td class="text-print">{{ report.assessed_date }}</td>
        </tr>
      </table>

      <!-- Images -->
      <div v-if="report.images && report.images.length" class="mt-3">
        <h6 class="fw-bold">Attached Images:</h6>
        <div class="d-flex flex-wrap gap-2">
          <img
            v-for="(img, i) in report.images"
            :key="i"
            :src="img.original_url"
            class="border rounded shadow-sm"
            style="width: 150px; height: 150px; object-fit: contain;"
          />
        </div>
      </div>

    </div>

    <!-- No Data -->
    <div v-else class="text-center text-muted py-5">
      No report details found.
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { VBtn, VIcon, VProgressCircular } from "vuetify/components";

const route = useRoute();
const report = ref(null);
const loading = ref(false);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Correct logo path resolution
const logoPath = new URL("@/assets/images/logos/astra-logo.png", import.meta.url).href;

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  if (!token) throw new Error("Access token missing");
  return {
    Authorization: `Bearer ${decodeURIComponent(token)}`,
    Accept: "application/json",
  };
};

const fetchReport = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(
      `${apiBaseUrl}/asset-scrap-reports/${route.params.id}`,
      { headers: getAuthHeaders() }
    );
    if (data.data) {
      report.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching report details:", error);
  } finally {
    loading.value = false;
  }
};

const printReport = () => window.print();

onMounted(fetchReport);
</script>

<style scoped>
.table {
  border-collapse: collapse !important;
  width: 100%;
  font-size: 13px;
}
.table th,
.table td {
  border: 1px solid #000 !important;
  padding: 4px 6px !important;
  vertical-align: middle !important;
}
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: #fff;
  }
  #print-section {
    margin: 0;
    padding: 0;
  }
  .text-print {
    color: black !important;
  }
}
.company-header {
  width: 100%;
}
.header-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  text-align: center;
}
.company-logo {
  height: 70px;
  display: block;
  margin: 0 auto;
}
@media print {
  .company-logo {
    height: 65px;
  }
}
</style>
