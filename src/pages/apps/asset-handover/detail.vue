<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center w-100 mb-4">
      <h2 class="m-0">Asset Handover Detail</h2>

      <div class="d-flex align-center gap-2" style="margin-left: auto;">
        <VBtn color="secondary" @click="printPage">Print</VBtn>
        <VBtn color="primary" @click="$router.push('/dashboards/assethandovers')">Back to List</VBtn>
      </div>
    </div>

    <!-- Loading / Error -->
    <VCard v-if="isLoading" class="pa-4"><p>Loading details...</p></VCard>
    <VAlert v-else-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</VAlert>

    <!-- Detail View -->
    <VCard v-else-if="handover" id="printArea" class="pa-6">
      <VCardText>
        <!-- Top Info Grid -->
        <div class="detail-grid mb-6">
          <div class="kv"><span class="k">Handover ID</span><span class="v">{{ show(handover.handover_id) }}</span></div>
          <div class="kv"><span class="k">Handover Date</span><span class="v">{{ show(handover.handover_date) }}</span></div>
          <div class="kv"><span class="k">Project Name</span><span class="v">{{ show(handover.projectName) }}</span></div>
          <div class="kv"><span class="k">Asset Investment Request ID</span><span class="v">{{ show(handover.asset_investment_request_id) }}</span></div>

          <div class="kv"><span class="k">Handover By</span><span class="v">{{ show(handover.handover_by?.name) }} ({{ show(handover.handover_by?.user_code) }})</span></div>
          <div class="kv"><span class="k">Handover To</span><span class="v">{{ show(handover.user?.name) }} ({{ show(handover.user?.user_code) }})</span></div>
          <div class="kv"><span class="k">Status</span><span class="v">{{ show(handover.status) }}</span></div>
        </div>
         <div class="detail-grid mb-6">
          <div class="kv"><span class="k">Remarks</span><span class="v">{{ show(handover.remarks) }}</span></div>
        </div>

        <!-- Items Table -->
        <div>
          <h3 class="mb-2">Handover Items</h3>
          <table class="handover-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Asset Name</th>
                <th>Asset Type</th>
                <th>Quantity Requested</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in handover.items" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ show(item.asset_code) }} - {{ show(item.asset_name) }}</td>
                <td>{{ show(item.asset_type) }}</td>
                <td>{{ show(item.quantity) }}</td>
                <td>{{ show(item.remarks) }}</td>
              </tr>
              <tr v-if="!handover.items?.length">
                <td colspan="7" class="text-center">No items found</td>
              </tr>
            </tbody>
          </table>
        </div>



         <div>
          <h3 class="mb-2">History</h3>
          <table class="handover-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Given By User Name</th>
                <th>Given By User Code</th>
                <th>Quantity Given</th>
                <th>Quantity Pending</th>

              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in handover.history" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ show(item.created_at) }}</td>
                <td>{{ show(item.user.name) }}</td>
                <td>{{ show(item.user.user_code) }}</td>
                <td>{{ show(item.quantity_given) }}</td>
                <td>{{ show(item.quantity_pending) }}</td>
              </tr>
              <tr v-if="!handover.history?.length">
                <td colspan="7" class="text-center">No items found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { VBtn, VCard, VCardText, VAlert } from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();

const handover = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const getAuthHeaders = () => {
  const accessToken = getCookie("accessToken");
  if (!accessToken) throw new Error("Access token is missing. Please log in.");
  return { Authorization: `Bearer ${decodeURIComponent(accessToken)}` };
};

const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);

const fetchDetail = async () => {
  isLoading.value = true;
  try {
    const id = route.params.id;
    const res = await axios.get(`${apiBaseUrl}/asset-handovers/${id}`, {
      headers: getAuthHeaders(),
    });
    handover.value = res.data?.data ?? res.data;
  } catch (err) {
    console.error(err);
    errorMessage.value = err.response?.data?.message || "Failed to load handover details.";
  } finally {
    isLoading.value = false;
  }
};
const logoPath = "/src/assets/images/logos/astra-logo.png";
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
            padding: 6px;
          }

          .grid-table td {
            padding: 3px 0;
          }

          .sign-row {
            margin-top: 50px;
          }

          .sign-col {
            width: 50%;
            text-align: center;
            font-weight: bold;
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
              <img src="` + logoPath + `" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>


        <div class="title">ASSET HANDOVER FORM</div>

        <!-- Employee Info -->
         <table class="grid-table">
            <tr>
              <td><strong>Name of Employee:</strong> ${show(h.user?.name)}</td>
              <td><strong>Asset Transfer No.:</strong> ${show(h.handover_id)}</td>
            </tr>

            <tr>
              <td><strong>Employee Code:</strong> ${show(h.user?.user_code)}</td>
              <td><strong>Handover Date:</strong> ${show(h.handover_date)}</td>
            </tr>

            <tr>
              <td><strong>Department:</strong> —</td>
              <td><strong>Handover By:</strong> ${show(h.handover_by?.name)}</td>
            </tr>
          </table>

        <p>Dear Sir / Madam,<br>
        Please find below the assets handed over to you. Please sign also the attached picture.</p>

        <!-- Table -->
        <table>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Particulars</th>
              <th>Asset Code</th>
              <th>Qty</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${
              h.items.map((item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${show(item.asset_name)}</td>
                  <td>${show(item.asset_code)}</td>
                  <td>${show(item.quantity)}</td>
                  <td>${show(item.remarks)}</td>
                </tr>
              `).join("")
            }
          </tbody>
        </table>

        <!-- Signatures -->
        <table class="sign-row">
          <tr>
            <td class="sign-col">Authorized Signatory<br>(Person Requesting)</td>
            <td class="sign-col">Authorized Signatory<br>(Approver)</td>
          </tr>
        </table>

        <p><strong>ACKNOWLEDGEMENT AND DECLARATION BY EMPLOYEE:</strong></p>
        <p>
              I, Mr. <strong>${show(h.user?.name)}</strong>   acknowledge that I have Received the above mentioned assets. I understand that this asset belongs to ASTRA CONSTRUCTION and is under my possession for carrying out my work. I hereby assure that I will take care of the assets of the company to the best possible extend and will handover/Transfer or Return back to the company before my vacation or end of contract clearance (termination/Resignation).

        </p>

        <p><strong>Employee Signature:</strong> ___________________________</p>

        <div class="footer">
          ISSUE 01 &nbsp;&nbsp;|&nbsp;&nbsp; REV 01 &nbsp;&nbsp;|&nbsp;&nbsp; F-12-08 &nbsp;&nbsp;|&nbsp;&nbsp; 16-08-2020
        </div>

      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};

onMounted(fetchDetail);
</script>

<style>
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 25px;
}
.kv {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 6px;
}
.k {
  font-weight: 600;
}
.handover-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.handover-table th,
.handover-table td {
  border: 1px solid #ddd;
  padding: 8px;
}
.handover-table th {
  font-weight: 600;
}
.text-center {
  text-align: center;
}
</style>
