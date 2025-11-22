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

const approvals = ref([])
const approvalsError = ref("")

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

const fetchApprovals = async () => {
  approvalsError.value = ""
  try {

    const res = await axios.get(
      `${apiBaseUrl}/getApprovals/RentalEquipment/${data.value.id}`,
      {
        headers: getAuthHeaders(),
      }
    )

    const approvalData = res.data?.data ?? []
    approvals.value = approvalData.map(a => ({
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

const approvalHeaders = [
  { title: "#", key: "id" },
  { title: "Name", key: "name" },
  { title: "User Code", key: "user_code" },
  { title: "Status", key: "status" },
];

// Table headers
const assetRequestHeaders = [
  { title: 'Category', key: 'asset_category_name' },
  { title: 'Sub Category', key: 'asset_sub_category_name' },
  { title: 'Asset', key: 'asset_name' },
  { title: 'Qty at Site', key: 'quantity' },
  { title: 'Activity', key: 'activity' },
  { title: 'Start Date', key: 'start_date' },
  { title: 'End Date', key: 'end_date' },
];

const rentalEquipmentHeaders = [
  { title: 'Category', key: 'asset_category_name' },
  { title: 'Sub Category', key: 'asset_sub_category_name' },
  { title: 'Asset', key: 'asset_name' },
  { title: 'Quantity', key: 'quantity_at_site' },
  { title: 'Activity', key: 'activity' },
  { title: 'Start Date', key: 'start_date' },
  { title: 'End Date', key: 'end_date' },
  { title: 'Requested # Days', key: 'requested_no_days' },
  { title: 'SPO #', key: 'spo_number' },
];


const show = v => (v === null || v === undefined || v === '' ? '-' : v)



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

onMounted(async () => {
  await fetchDetails()
  await fetchApprovals()
})  

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
    </VCard>
      <!-- Asset Requests Table -->
      <VCardTitle class="no-padd">Assets Requests</VCardTitle>      
      <VDataTable
        v-if="data && data.asset_requests?.length"
        :headers="assetRequestHeaders"
        :items="data.asset_requests"
        item-value="id"
        density="comfortable"
        fixed-header
        :items-per-page="5"
      >
        <template #item.start_date="{ item }">{{ show(item.start_date) }}</template>
        <template #item.end_date="{ item }">{{ show(item.end_date) }}</template>
        <template #no-data>
          <div class="text-center py-4">No asset requests found.</div>
        </template>
      </VDataTable>
      <p v-else>No asset requests</p>

      <!-- Rental Equipments Table -->
      <VCardTitle class="no-padd">Rental Equipments</VCardTitle>
      <VDataTable
          v-if="data && data.rental_equipments?.length"
          :headers="rentalEquipmentHeaders"
          :items="data.rental_equipments"
          item-value="id"
          density="comfortable"
          fixed-header
          :items-per-page="5"
        >
          <template #item.start_date="{ item }">{{ show(item.start_date) }}</template>
          <template #item.end_date="{ item }">{{ show(item.end_date) }}</template>
          <template #item.spo_number="{ item }">{{ show(item.spo_number) }}</template>
          <template #no-data>
            <div class="text-center py-4">No rental equipments found.</div>
          </template>
        </VDataTable>

      <p v-else>No rental equipments</p>


 <VCardTitle class="no-padd">Approvals</VCardTitle>
      <VDataTable
          v-if="approvals.length"
          :headers="approvalHeaders"
          :items="approvals"
          item-value="id"
          density="comfortable"
          fixed-header
          :items-per-page="5"
        >
           <template #item.id="{ item }">{{ item.id }}</template>
           <template #item.name="{ item }">{{ item.name }}</template>
           <template #item.user_code="{ item }">{{ item.user_code }}</template>
           <template #item.status="{ item }">{{ item.status }}</template>
        </VDataTable>

      <p v-else>No approvals found.</p>
  </div>
</template>
