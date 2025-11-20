<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // ✅ add base URL
const route = useRoute()
const router = useRouter()
const printLogo = "/src/assets/images/logos/astra-logo.png";
const loading = ref(true)
const data = ref(null)

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

const getAuthHeaders = () => {
  const accessToken = getCookie('accessToken')
  if (!accessToken) throw new Error('Access token is missing.')
  return {
    Authorization: `Bearer ${decodeURIComponent(accessToken)}`,
    Accept: 'application/json',
  }
}

const fetchDetails = async () => {
  try {
    const id = route.params.id
    const res = await axios.get(`${apiBaseUrl}/rental-required/${id}`, {
      headers: getAuthHeaders(),
    })

    data.value = res.data.data
  } catch (error) {
    console.error(error)
    alert('Error fetching details')
  } finally {
    loading.value = false
  }
}

const printPage = () => {


  const h = data.value;

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
              <img src="` + printLogo + `" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>

        <!-- Employee Info -->
         <table class="grid-table">
            <thead>
            <tr>
              <td colspan="6" style="text-align:center"><h3>Equipment Rental Request Form</h3></td>
            </tr>              
            <tr>
              <td>Project Name</td>
              <td colspan="4" style="text-align:center"><strong>Project Name</td>
              <td>Name</td>
            </tr>

            <tr>
              <td colspan="6" style="text-align:center"><h4>To Be Filled By Requesting Department</h4></td>
            </tr>

            <tr>
              <td colspan="6" style="text-align:center"><h3>LIST OF EQUIPMENT REQUIRED</h3></td>
            </tr>


             <tr>
              <td>Equipment Type</td>
              <td>Activity</td>
              <td>QTY</td>
              <td>Date of Need</td>
              <td>End Date</td>
              <td></td>
            </tr>
            </thead>
             <tbody>
            ${
              h.asset_requests.map((item, i) => `
                <tr>
                  <td>${item.asset_name}</td>
                  <td>${item.activity}</td>
                  <td>${item.quantity}</td>
                  <td>${item.start_date ?? '-'}</td>
                  <td>${item.end_date}</td>
                <td></td>
                </tr>
              `).join("")
            }
          </tbody>

              </table>
            <table class="grid-table">
            <thead>
            <tr>
              <td colspan="6" style="text-align:center"><h3>LIST OF EQUIPMENT ALREADY WORKING ON THE PROJECT</h4></td>
            </tr>

             <tr>
              <td>Equipment Type</td>
              <td>Activity</td>
              <td>QTY at Site</td>
              <td>Start Date as per SPO</td>
              <td>End Date as Per SPO</td>
              <td>SPO Number</td>
            </tr>  
            </thead> 
            <tbody>
            ${
              h.rental_equipments.map((item, i) => `
                <tr>
                  <td>${item.asset_name}</td>
                  <td>${item.activity}</td>
                  <td>${item.quantity_at_site}</td>
                  <td>${item.start_date ?? '-'}</td>
                  <td>${item.end_date ?? '-'}</td>
                  <td>${item.spo_number ?? '-'}</td>

                </tr>
              `).join("")
            }
          </tbody>           

          </table>

        <!-- Signatures -->
        <table class="sign-row">
          <tr>
            <td class="sign-col">Prepared By</td>
            <td class="sign-col"></td>
            <td class="sign-col">Approved By</td>
            <td class="sign-col"></td>
          </tr>
        </table>

        <table class="sign-row">
          <tr>
            <td class="sign-col">Checked By <br> (Cost Controller)</td>
            <td class="sign-col"></td>
            <td class="sign-col">Approved By <br> (General Manager)</td>
            <td class="sign-col"></td>
          </tr>
        </table> 

         <div class="header">
            <div class="left-text">
              Arab Supply & Trading Co.<br>
              Construction Branch
            </div>

            <div class="logo">
              <img src="` + printLogo + `" />
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

onMounted(fetchDetails)
</script>

<style scoped>
  
</style>

<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <VBtn variant="text" @click="router.back()">← Back</VBtn>
      <h3>Rental Required Details</h3>
    </div>

    <VCard v-if="loading" class="pa-6">
      <VProgressCircular indeterminate />
    </VCard>

    <!-- ✅ guard to avoid null errors -->
    <VCard v-else-if="data" class="pa-4">
      <VBtn variant="tonal" color="primary" @click="printPage">Print</VBtn>

      <!-- Request Info -->
      <h4 class="mb-3">Request Information</h4>
      <VRow>
        <VCol cols="12" md="4"><strong>ID:</strong> {{ data.id }}</VCol>
        <VCol cols="12" md="4"><strong>Rental Req ID:</strong> {{ data.rental_equipment_id }}</VCol>
        <VCol cols="12" md="4"><strong>Project:</strong> {{ data.project_name }}</VCol>
        <VCol cols="12" md="4"><strong>Date:</strong> {{ data.date }}</VCol>
        <VCol cols="12" md="4"><strong>Created At:</strong> {{ data.created_at }}</VCol>
      </VRow>

      <!-- Asset Requests Table -->
      <h4 class="mt-6 mb-2">Asset Requests</h4>
      <VTable v-if="data.asset_requests?.length">
        <thead>
          <tr>
            <th>Category</th>
            <th>Sub Category</th>
            <th>Asset</th>
            <th>Qty at Site</th>
            <th>Activity</th>
            <th>Start Date</th>
            <th>End Date</th>

          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in data.asset_requests" :key="i">
            <td>{{ item.asset_category_name }}</td>
            <td>{{ item.asset_sub_category_name }}</td>
            <td>{{ item.asset_name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.activity }}</td>
            <td>{{ item.start_date ?? '-' }}</td>
            <td>{{ item.end_date }}</td>
          </tr>
        </tbody>
      </VTable>
      <p v-else>No asset requests</p>

      <!-- Rental Equipments -->
      <h4 class="mt-6 mb-2">Rental Equipments</h4>
      <VTable v-if="data.rental_equipments?.length">
        <thead>
          <tr>
            <th>Category</th>
            <th>Sub Category</th>
            <th>Asset</th>
            <th>Quantity</th>
            <th>Activity</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>SPO #</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in data.rental_equipments" :key="i">
            <td>{{ item.asset_category_name }}</td>
            <td>{{ item.asset_sub_category_name }}</td>
            <td>{{ item.asset_name }}</td>
            <td>{{ item.quantity_at_site }}</td>
            <td>{{ item.activity }}</td>
            <td>{{ item.start_date ?? '-' }}</td>
            <td>{{ item.end_date ?? '-' }}</td>
            <td>{{ item.requested_no_days }}</td>
            <td>{{ item.spo_number ?? '-' }}</td>
          </tr>
        </tbody>
      </VTable>
      <p v-else>No rental equipments</p>

    </VCard>

  </div>
</template>
