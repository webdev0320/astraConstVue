<template>
  <div class="container mt-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3 no-print">
      <h2 class="fw-bold mb-0">Asset Damage Report Details</h2>
      <VBtn color="primary" class="ms-auto" @click="printReport">
        <v-icon left>mdi-printer</v-icon>
        Print
      </VBtn>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- Report Details -->
    <div v-else-if="report" id="print-section" class="p-4 border bg-white">
      <!-- Company Header -->
    
      <!-- Report Title Section -->
      <table class="table table-bordered text-center align-middle">
        <tr>
          <td class="text-print">
            <h5 class="mb-0 fw-bold text-print">Arab Supply & Trading Co.</h5><br>            
            <p class="small mb-0 text-print">Construction Branch</p>
          </td>
          <td class="text-print">
            <img :src="logoPath" alt="Logo" style="height: 70px;" class="me-3" />            
          </td>
          <td class="text-print">
            <p class="mb-0 fw-bold text-print">الشركة العربية للإمدادات والتجارة</p>
            <p class="small mb-0 text-print">فرع الإنشاءات</p>            
          </td>
        </tr>
        <tr>
          <td class="text-print"><strong>Project</strong><br />{{ report.project }}</td>
          <td class="text-print"><strong>Date</strong><br />{{ report.report_date }}</td>
          <td class="text-print"><strong>Tag No</strong><br />{{ report.tag_no }}</td>
        </tr>
        <tr>
          <td colspan="3" class="text-dark fw-bold text-print">
            ASSET DAMAGE REPORT (ADR)
          </td>
        </tr>
      </table>

      <!-- General Information -->
      <table class="table table-bordered mb-2">
        <tbody>
          <tr>
            <td class="text-print"><strong>Reported By</strong></td>
            <td class="text-print">{{ report.reported_by }}</td>
            <td class="text-print"><strong>Asset Damaged By</strong></td>
            <td class="text-print">{{ report.asset_damaged_by }}</td>
          </tr>
          <tr>
            <td class="text-print"><strong>Damaged Asset Reported On</strong></td>
            <td class="text-print">{{ report.damaged_asset_reported_on }}</td>
            <td class="text-print"><strong>Warranty Status</strong></td>
            <td class="text-print">{{ report.warranty_status }}</td>
          </tr>
          <tr>
            <td class="text-print"><strong>Time</strong></td>
            <td class="text-print">{{ report.time }}</td>
            <td class="text-print"><strong>Project</strong></td>
            <td class="text-print">{{ report.project }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Damage Cause & Condition -->
      <div class="fw-bold mb-1 text-print">1. DAMAGE CAUSE & CONDITION:</div>
      <table class="table table-bordered mb-2">
        <tbody>
          <tr>
            <td class="text-print"><strong>Wear Condition:</strong></td>
            <td class="text-print">{{ report.wear_condition ? 'Yes' : 'No' }}</td>
            <td class="text-print"><strong>Inadequate Use:</strong></td>
            <td class="text-print">{{ report.inadequate_use ? 'Yes' : 'No' }}</td>
          </tr>
          <tr>
            <td class="text-print"><strong>Repair Estimation Attached:</strong></td>
            <td class="text-print">{{ report.repair_estimation_attached ? 'Yes' : 'No' }}</td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td colspan="4">
              <strong class="text-print">Asset Damaged Due To:</strong><br />
              <span class="text-print">{{ report.asset_damaged_due_to }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Assessment Details -->
      <div class="fw-bold mb-1 text-print">2. ASSESSMENT DETAILS:</div>
      <table class="table table-bordered mb-2">
        <tbody>
          <tr>
            <td class="text-print"><strong>Assessed By</strong></td>
            <td class="text-print">{{ report.assessed_by }}</td>
            <td class="text-print"><strong>Assessed Date</strong></td>
            <td class="text-print">{{ report.assessed_date }}</td>
          </tr>
          <tr>
            <td colspan="4">
              <strong class="text-print">Proposed Action:</strong><br /><span class="text-print">{{ report.proposed_action }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Manager Approval -->
      <div class="fw-bold mb-1">3. MANAGER APPROVAL:</div>
      <table class="table table-bordered mb-2">
        <tbody>
          <tr>
            <td class="text-print"><strong>Manager</strong></td>
            <td class="text-print">{{ report.manager }}</td>
            <td class="text-print"><strong>Manager Action Date</strong></td>
            <td class="text-print">{{ report.manager_action_date }}</td>
          </tr>
          <tr>
            <td class="text-print"><strong>Approved</strong></td>
            <td class="text-print">{{ report.approved ? 'Yes' : 'No' }}</td>
            <td class="text-print"><strong>Approval Date</strong></td>
            <td class="text-print">{{ report.approval_date }}</td>
          </tr>
          <tr>
            <td class="text-print"><strong>Approval Manager</strong></td>
            <td class="text-print">{{ report.approval_manager }}</td>
            <td colspan="2">
              <strong class="text-print">Approval Remarks:</strong><br />{{ report.approval_remarks }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Attached Images -->
      <div v-if="report.images && report.images.length" class="mt-3">
        <h6 class="fw-bold">Attached Images:</h6>
        <div class="d-flex flex-wrap gap-2">
          <img
            v-for="(img, i) in report.images"
            :key="i"
            :src="resolveImageUrl(img)"
            class="border rounded shadow-sm"
            style="width: 150px; height: 150px; object-fit: contain;"
          />
        </div>
      </div>

      <!-- Signatures -->
      <div class="mt-5">
        <table class="table table-bordered text-center align-middle">
          <thead class="bg-light">
            <tr>
              <th class="text-print">Prepared By</th>
              <th class="text-print">Checked By</th>
              <th class="text-print">Approved By</th>
            </tr>
          </thead>
          <tbody>
            <tr style="height: 80px;">
              <td class="text-print"></td>
              <td class="text-print"></td>
              <td class="text-print"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="text-end text-muted small border-top pt-3 mt-3">
        <p class="mb-0 text-print">Created At: {{ report.created_at }}</p>
        <p class="text-print">Last Updated: {{ report.updated_at }}</p>
      </div>
    </div>

    <!-- Empty -->
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
const logoPath = "/src/assets/images/logos/astra-logo.png";

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

const resolveImageUrl = (img) => {
  if (!img) return "";
  if (typeof img === "string" && img.startsWith("http")) return img;
  if (img.original_url) return img.original_url;
  return `${apiBaseUrl}/storage/${img}`;
};

const fetchReport = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(
      `${apiBaseUrl}/asset-damage-reports/${route.params.id}`,
      { headers: getAuthHeaders() }
    );
    if (data.status) {
      report.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching asset damage report:", error);
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
.bg-warning {
  background-color: #f9e79f !important;
}

@media print {
  .text-print{
    color: black !important;
  }
  .no-print {
    display: none !important;
  }

  body {
    background: #fff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  #print-section {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm;
    margin: auto;
  }

  .table {
    page-break-inside: avoid !important;
  }

  img {
    max-height: 120px !important;
    object-fit: contain !important;
  }
}
</style>
