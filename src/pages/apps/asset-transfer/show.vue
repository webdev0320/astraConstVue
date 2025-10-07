<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <div class="d-flex align-center gap-2">
        <VBtn variant="text" prepend-icon="mdi-arrow-left" @click="$router.back()">Back</VBtn>
        <h3 class="page-title">Asset Transfer Details — #{{ id }}</h3>
      </div>

      <div class="d-flex align-center gap-2">
        <VBtn color="primary" variant="elevated" @click="$router.push(`/dashboards/assettransfers/edit/${id}`)">
          Edit
        </VBtn>
        <VBtn color="error" variant="elevated" @click="onDelete">Delete</VBtn>
        <VBtn color="success" variant="elevated" @click="onApprove">Approve</VBtn>
        <VBtn color="warning" variant="elevated" @click="onReject">Reject</VBtn>
      </div>
    </div>

    <VAlert v-if="error" type="error" class="mb-4" variant="tonal">
      {{ error }}
    </VAlert>

    <template v-if="loading">
      <VSkeletonLoader type="card, list-item-two-line, table" class="mb-4" />
    </template>

    <template v-else-if="transfer">
      <VCard class="mb-6">
        <VCardTitle>Header</VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12" md="4"><strong>Issue No:</strong> {{ transfer.issue_no ?? '—' }}</VCol>
            <VCol cols="12" md="4"><strong>Form No:</strong> {{ transfer.form_no ?? '—' }}</VCol>
            <VCol cols="12" md="4"><strong>Revision Date:</strong> {{ fmtDate(transfer.revision_date) }}</VCol>

            <VCol cols="12" md="4"><strong>Date:</strong> {{ fmtDate(transfer.date) }}</VCol>
            <VCol cols="12" md="4"><strong>Prepared By:</strong> {{ transfer.prepared_by ?? '—' }}</VCol>
            <VCol cols="12" md="4"><strong>Status:</strong> {{ transfer.status ?? '—' }}</VCol>
          </VRow>
        </VCardText>
      </VCard>

      <VCard class="mb-6">
        <VCardTitle>Projects & Timing</VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12" md="6">
              <strong>From Project:</strong>
              {{ transfer.transferredProjectName ?? (transfer.transferred_from_project_id ? `#${transfer.transferred_from_project_id}` : '—') }}
            </VCol>
            <VCol cols="12" md="6">
              <strong>To Project:</strong>
              {{ transfer.transferredToProjectName ?? (transfer.transferred_to_project_id ? `#${transfer.transferred_to_project_id}` : '—') }}
            </VCol>

            <VCol cols="12" md="6"><strong>Transfer Date:</strong> {{ fmtDate(transfer.transfer_date) }}</VCol>
            <VCol cols="12" md="6"><strong>Transfer Time:</strong> {{ fmtTime(transfer.transfer_time) }}</VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- If your API returns line items, show them here -->
      <VCard v-if="Array.isArray(transfer.items) && transfer.items.length">
        <VCardTitle>Items</VCardTitle>
        <VCardText>
          <VDataTable
            :items="transfer.items"
            :headers="itemHeaders"
            :items-per-page="50"
          />
        </VCardText>
      </VCard>
    </template>

    <template v-else>
      <p>No data found.</p>
    </template>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  VAlert,
  VBtn,
  VCard,
  VCardText,
  VCardTitle,
  VCol,
  VDataTable,
  VRow,
  VSkeletonLoader,
} from 'vuetify/components'

const apiBaseUrl = 'https://dm.kreashionsoftwarehouse.com/astraConst/public/api'
const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)

const loading = ref(true)
const error = ref('')
const transfer = ref(null)

const itemHeaders = [
  { title: 'Asset', key: 'asset_name' },
  { title: 'Code', key: 'asset_code' },
  { title: 'Qty', key: 'quantity' },
  { title: 'UOM', key: 'uom' },
  { title: 'Remarks', key: 'remarks' },
]

// helpers
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi' })
const fmtDate = (iso) => {
  try {
    if (!iso) return '—'
    const d = new Date(iso)
    return isNaN(d.getTime()) ? '—' : fmt.format(d)
  } catch {
    return '—'
  }
}
const fmtTime = (iso) => {
  try {
    if (!iso) return '—'
    const d = new Date(iso)
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' })
  } catch {
    return '—'
  }
}

const fetchDetail = async () => {
  loading.value = true
  error.value = ''
  transfer.value = null
  try {
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    // assumes backend supports GET /asset-transfers/:id
    const res = await axios.get(`${apiBaseUrl}/asset-transfers/${id.value}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })

    // Accept both {data: {...}} or {...}
    transfer.value = res.data?.data ?? res.data ?? null
  } catch (e) {
    console.error('Error fetching asset transfer detail:', e)
    error.value = e.response?.data?.message || 'Failed to load details.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)

// actions
const onDelete = async () => {
  if (!confirm('Delete this asset transfer?')) return
  try {
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    await axios.delete(`${apiBaseUrl}/asset-transfers/${id.value}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })
    alert('Deleted successfully.')
    router.push('/dashboards/assettransfers')
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to delete.')
  }
}

const onApprove = async () => {
  try {
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    // adjust endpoint/method to your backend
    await axios.post(`${apiBaseUrl}/asset-transfers/${id.value}/approve`, {}, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })
    alert('Approved.')
    fetchDetail()
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to approve.')
  }
}

const onReject = async () => {
  try {
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    // adjust endpoint/method to your backend
    await axios.post(`${apiBaseUrl}/asset-transfers/${id.value}/reject`, {}, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })
    alert('Rejected.')
    fetchDetail()
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to reject.')
  }
}
</script>

<style scoped>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.page-title { margin: 0; }
</style>
