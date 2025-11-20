<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // ✅ add base URL
const route = useRoute()
const router = useRouter()

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

onMounted(fetchDetails)
</script>

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
            <th>SPO #</th>
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
            <td>{{ item.spo_number }}</td>
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
