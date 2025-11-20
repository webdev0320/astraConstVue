<template>
  <div class="container mt-4 policy-waiver-detail">
    <!-- Header Buttons -->
    <div class="d-flex justify-space-between align-center mb-4 no-print">
      <h3 class="text-h5 font-weight-bold mb-0">Policy Waiver Form Details</h3>
      <div class="d-flex gap-2">
        <VBtn color="primary" @click="printReport">
          <VIcon icon="mdi-printer" class="me-1" /> Print
        </VBtn>
        <VBtn color="secondary" @click="$router.push('/dashboards/policy-waiver-form')">
          <VIcon icon="mdi-arrow-left" class="me-1" /> Back
        </VBtn>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="!form" class="text-center mt-5">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- Display Data -->
    <div v-else>
      <!-- On-screen view -->
      <VCard class="pa-4 no-print shadow-sm border">
        <div class="form-grid">
          <div><strong>Form No:</strong> {{ form.form_no || '-' }}</div>
          <div><strong>Date:</strong> {{ formatDate(form.date) }}</div>

          <div><strong>Waiver Type:</strong> {{ form.waiver_type || '-' }}</div>
          <div><strong>PO No:</strong> {{ form.po_no || '-' }}</div>

          <div><strong>Department:</strong> {{ form.department_name || '-' }}</div>
          <div><strong>Project:</strong> {{ form.project_name || '-' }}</div>

          <div><strong>Prepared By:</strong> {{ form.user_name || '-' }}</div>
          <div><strong>ID:</strong> {{ form.id }}</div>

          <div class="col-span-2">
            <strong>Item Description:</strong><br />
            {{ form.item_description || '-' }}
          </div>

          <div class="col-span-2">
            <strong>Original Policy:</strong><br />
            {{ form.original_policy || '-' }}
          </div>

          <div class="col-span-2">
            <strong>Policy Waived & Reason:</strong><br />
            {{ form.policy_waived_and_reason || '-' }}
          </div>

          <div class="col-span-2">
            <strong>Concerned Department Remarks:</strong><br />
            {{ form.concerned_department_remarks || '-' }}
          </div>

          <div class="col-span-2">
            <strong>Cost Controls & Finance Department Remarks:</strong><br />
            {{ form.cost_controls_and_finance_department_remarks || '-' }}
          </div>

          <div class="col-span-2">
            <strong>GM Remarks:</strong><br />
            {{ form.gm_remarks || '-' }}
          </div>
        </div>
      </VCard>

      <!-- PRINT VIEW -->
      <div id="print-area" class="print-area">
        <h2 class="text-center fw-bold mb-4">POLICY WAIVER FORM</h2>

        <table class="print-table">
          <tr>
            <td><strong>Form No:</strong> {{ form.form_no || '-' }}</td>
            <td><strong>Date:</strong> {{ formatDate(form.date) }}</td>
          </tr>
          <tr>
            <td><strong>Department:</strong> {{ form.department_name || '-' }}</td>
            <td><strong>Project:</strong> {{ form.project_name || '-' }}</td>
          </tr>
          <tr>
            <td><strong>Waiver Type:</strong> {{ form.waiver_type }}</td>
            <td><strong>PO No:</strong> {{ form.po_no || '-' }}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Item Description:</strong><br />{{ form.item_description || '-' }}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Original Policy:</strong><br />{{ form.original_policy || '-' }}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Policy Waived & Reason:</strong><br />{{ form.policy_waived_and_reason || '-' }}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Concerned Department Remarks:</strong><br />{{ form.concerned_department_remarks || '-' }}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Cost Controls & Finance Department Remarks:</strong><br />{{ form.cost_controls_and_finance_department_remarks || '-' }}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>GM Remarks:</strong><br />{{ form.gm_remarks || '-' }}</td>
          </tr>
        </table>

        <div class="signature-section mt-5">
          <div class="d-flex justify-space-between">
            <div><strong>Prepared By:</strong> {{ form.user_name || '____________________' }}</div>
            <div><strong>Approved By (GM):</strong> __________________________</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const form = ref(null)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

const getAuthHeaders = () => {
  const token = getCookie('accessToken')
  return { Authorization: `Bearer ${decodeURIComponent(token)}`, Accept: 'application/json' }
}

const fetchForm = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/policy-waiver-forms/${route.params.id}`, {
      headers: getAuthHeaders(),
    })
    // API returns { data: {...}, status: true, message: "..." }
    form.value = res.data.data
  } catch (err) {
    console.error('Error fetching form:', err)
  }
}

const printReport = () => window.print()
const formatDate = date => (date ? new Date(date).toLocaleDateString() : '-')

onMounted(fetchForm)
</script>

<style scoped>
/* ============= On-screen Styling ============= */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 24px;
}

.form-grid div {
  padding: 6px 0;
}

.form-grid strong {
  font-weight: 600;
  display: inline-block;
  min-width: 180px;
}

.col-span-2 {
  grid-column: span 2;
  margin-top: 8px;
}

/* ============= Print Styling ============= */
.print-area {
  display: none;
}

@media print {
  body * {
    visibility: hidden;
  }

  .print-area,
  .print-area * {
    visibility: visible;
  }

  .print-area {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    min-height: 297mm;
    padding: 25mm;
    background: #fff;
    color: #000;
    font-size: 13.5px;
    font-family: 'Arial', sans-serif;
  }

  .no-print {
    display: none !important;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #000;
  }

  .print-table td {
    border: 1px solid #000;
    padding: 8px 10px;
    vertical-align: top;
  }

  .print-table strong {
    display: inline-block;
    width: 220px;
  }

  .signature-section {
    margin-top: 40px;
    font-size: 13px;
  }

  .text-center {
    text-align: center;
  }

  .fw-bold {
    font-weight: bold;
  }
}
</style>
