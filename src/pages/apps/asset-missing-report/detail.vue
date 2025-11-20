<template>
  <div class="container mt-4">

    <!-- Header with Print Button -->
    <div class="d-flex justify-content-between align-items-center mb-3 no-print">
      <h2 class="fw-bold mb-0">Asset Scrap Report Details</h2>
      <VBtn color="primary" class="ms-auto" @click="printReport">
        <i class="bi bi-printer me-2"></i> Print
      </VBtn>
    </div>

    <VCard class="p-4 shadow-sm rounded-3">
      <div class="text-center mb-3">
        <h4 class="fw-bold text-uppercase">Asset Scrap Report</h4>
        <p class="text-muted mb-0">Detailed Summary</p>
      </div>

      <!-- General Information -->
      <VCard class="mb-4" outlined>
        <VCardTitle class="fw-bold text-primary">General Information</VCardTitle>
        <VCardText>
          <VRow dense>
            <VCol cols="6">
              <strong>Project:</strong> {{ report.project?.name || 'N/A' }}
            </VCol>
            <VCol cols="6">
              <strong>Tag No:</strong> {{ report.tag_no || 'N/A' }}
            </VCol>
            <VCol cols="6">
              <strong>Report Date:</strong> {{ formatDate(report.report_date) }}
            </VCol>
            <VCol cols="6">
              <strong>Report Time:</strong> {{ report.time || 'N/A' }}
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Scrap Details -->
      <VCard class="mb-4" outlined>
        <VCardTitle class="fw-bold text-primary">Scrap Details</VCardTitle>
        <VCardText>
          <VRow dense>
            <VCol cols="6">
              <strong>Asset Scraped On:</strong> {{ formatDate(report.asset_scraped_on) }}
            </VCol>
            <VCol cols="6">
              <strong>Scraped By:</strong> {{ report.scraped_by_user?.name || 'N/A' }}
            </VCol>
            <VCol cols="6">
              <strong>Asset Purchased/Transferred On:</strong>
              {{ formatDate(report.asset_purchased_transferred_on) }}
            </VCol>
            <VCol cols="6">
              <strong>Proposed Action:</strong> {{ report.proposed_action || 'N/A' }}
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Approval Details -->
      <VCard class="mb-4" outlined>
        <VCardTitle class="fw-bold text-primary">Approval Details</VCardTitle>
        <VCardText>
          <VRow dense>
            <VCol cols="6">
              <strong>Approved By:</strong> {{ report.approved_by_user?.name || 'N/A' }}
            </VCol>
            <VCol cols="6">
              <strong>Approval Date:</strong> {{ formatDate(report.approval_date) }}
            </VCol>
            <VCol cols="12">
              <strong>Remarks:</strong>
              <div class="border p-2 rounded bg-light mt-1">
                {{ report.remarks || 'No remarks provided.' }}
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Asset Images -->
      <VCard v-if="report.images && report.images.length" class="mb-4" outlined>
        <VCardTitle class="fw-bold text-primary">Asset Images</VCardTitle>
        <VCardText>
          <VRow dense>
            <VCol
              v-for="(img, index) in report.images"
              :key="index"
              cols="12"
              md="4"
              class="mb-3"
            >
              <VImg
                :src="img"
                aspect-ratio="1"
                contain
                class="rounded border"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Footer -->
      <div class="text-center mt-4">
        <p class="text-muted small mb-0">
          This is a system-generated report. No signature required.
        </p>
      </div>
    </VCard>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AssetScrapReportDetails",
  data() {
    return {
      report: {},
      isLoading: true,
    };
  },
  mounted() {
    this.fetchReport();
  },
  methods: {
    async fetchReport() {
      try {
        const id = this.$route.params.id;
        const response = await axios.get(`/api/asset-scrap-reports/${id}`);
        this.report = response.data.data;
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString();
    },
    printReport() {
      window.print();
    },
  },
};
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  @page {
    size: A4 portrait;
    margin: 20mm;
  }

  .container {
    max-width: 100%;
    padding: 0;
  }

  .v-card {
    box-shadow: none !important;
    border: none !important;
  }

  body {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}

.v-card {
  border-radius: 12px;
}

.v-card-title {
  font-size: 1rem;
  background-color: #f8f9fa;
  padding: 10px 14px;
  border-bottom: 1px solid #dee2e6;
}
</style>
