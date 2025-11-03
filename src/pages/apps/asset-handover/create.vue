<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Asset Handover</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>

      <VCol cols="12" md="4">
              <VTextField
                v-model="form.hor_number"
                label="HandOver Number"
                :error-messages="errorMessages.hor_number"
                clearable
              />
            </VCol>
     
    <VCol cols="12" md="4">
          <VSelect
            v-model="form.project_id"
            :items="projects"
            item-title="label"
            item-value="id"
            label="Project"
            :loading="loadingProjects"
            :disabled="loadingProjects"
            :error-messages="errorMessages.project_id"
            clearable
            @update:modelValue="onProjectChange"
          />
        </VCol>

      <!-- Asset Investment Request -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="form.asset_investment_requests_id"
          :items="requestOptions"
          item-title="title"
          item-value="value"
          label="Asset Investment Request"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_investment_requests_id"
          clearable
          :loading="loadingRequests"
        />
      </VCol>


      <!-- Handover Date (defaults to today) -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.handover_date"
          label="Handover Date"
          type="date"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.handover_date"
        />
      </VCol>

      <!-- Department -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="form.department_id"
          :items="departmentsOptions"
          item-title="title"
          item-value="value"
          label="Department"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.department_id"
          clearable
          :loading="loadingDepartments"
        />
      </VCol>

      <!-- Handover To (global users) -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="form.user_id"
          :items="usersOptions"
          item-title="title"
          item-value="value"
          label="Handover To"
          :loading="loadingUsers"
          :disabled="loadingUsers"
          :error-messages="errorMessages.user_id"
          clearable
        />
      </VCol>

      <!-- Notice -->
      <VCol cols="12">
        <p class="notice-text">
          Dear Sir / Madam<br>
          Please find the below the assets handed over to you, to support you in carrying out your assignment/work in a most Proficient manner. Please sign also the attached picture.
        </p>
      </VCol>

      <!-- Items Table -->
      <VCol cols="12">
        <VCard variant="outlined">
          <VCardTitle class="px-4 py-3">Items</VCardTitle>
          <VCardText class="px-0">
            <VTable density="comfortable" fixed-header>
              <thead>
                <tr>
                  <th style="inline-size: 80px;">S.No</th>
                  <th>Description</th>
                  <th style="inline-size: 160px;">Asset Requested</th>
                   <th style="inline-size: 160px;">Asset Providing</th>
                  <th style="inline-size: 180px;">Quantity (Requested)</th>
                  <th style="inline-size: 180px;">Quantity (Handover)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingItems">
                  <td colspan="6" class="text-center py-6">Loading items…</td>
                </tr>

                <tr v-else-if="requestItems.length === 0">
                  <td colspan="6" class="text-center py-6">No items found for this request.</td>
                </tr>

                <tr v-for="(row, idx) in requestItems" :key="row.item_id">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ row.description }}</td>

                  <!-- Asset ID (readonly, optional) -->
                  <td>
                    <VTextField
                      v-model="row.asset_code"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      placeholder="(optional)"
                      readonly
                    />
                  </td>

                  <!-- Asset Code (dropdown, optional) -->
                 <!-- Asset (dropdown, optional) -->
                  <td>
                    <VSelect
                      v-model="row.asset_id"
                      :items="assetOptions"
                      item-title="title"
                      item-value="value"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      placeholder="Select Asset (optional)"
                      clearable
                      :loading="loadingAssets"
                    />
                  </td>



                  <!-- Quantity (Requested) readonly -->
                  <td>
                    <VTextField
                      v-model.number="row.request_qty"
                      type="number"
                      min="0"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      readonly
                    />
                  </td>

                  <!-- Quantity (Handover) -->
                    <VTextField
                      v-model.number="row.handover_qty"
                      type="number"
                      min="1"
                      :max="row.request_qty"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      :error-messages="rowErrors[idx]?.handover_qty"
                      placeholder="Enter qty"
                      @input="validateQty(row, idx)"
                    />

                  <!-- Remarks -->
                  <td>
                    <VTextarea
                      v-model="row.remarks"
                      :rows="1"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      placeholder="Remarks"
                      auto-grow
                    />
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Authorized Signatory Section -->
      <!-- <VCol cols="12">
        <div class="auth-signatory">
          <span>Authorized Signatory <br /> (Person Requesting)</span>
          <span>Authorized Signatory <br /> (Approver)</span>
        </div>
      </VCol> -->

      <!-- ACKNOWLEDGEMENT AND DECLARATION BY EMPLOYEE: -->
      <!-- <VCol cols="12">
        <h5>ACKNOWLEDGEMENT AND DECLARATION BY EMPLOYEE:</h5>
        <p>
          I,
          <strong>
            {{
              usersOptions.find(u => u.value === form.user_id)?.title?.split(' — ')[0]
              || form.employee_name
              || '________'
            }}
          </strong>
          acknowledge that I have received the above mentioned assets. I understand that this asset belongs to ASTRA CONSTRUCTION and is under my possession for carrying out my work. I hereby assure that I will take care of the assets of the company to the best possible extent and will handover/transfer or return back to the company before my vacation or end of contract clearance (termination/resignation).
        </p>
      </VCol> -->

      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">
          Submit
        </VBtn>
        <VBtn class="ms-2" variant="text" @click="router.push('/dashboards/assethandovers')">
          Cancel
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  VBtn, VCard, VCardText, VCardTitle, VCol, VForm, VRow,
  VSelect, VTable, VTextField, VTextarea,
} from 'vuetify/components'

/* ========= CONFIG ========= */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api
const apiCreateUrl = `${apiBaseUrl}/asset-handovers`
const apiRequestsUrl = `${apiBaseUrl}/asset-investment-requests`
const apiDepartmentsUrl = `${apiBaseUrl}/departments`
const apiUsersUrl = `${apiBaseUrl}/users` // global users

const router = useRouter()

/* ========= STATE ========= */
const refForm = ref()
const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

const loadingRequests = ref(false)
const assetRequests = ref([])

const loadingUsers = ref(false)
const allUsers = ref([])

const loadingDepartments = ref(false)
const departments = ref([])

const hor_number = ref(null);

/* items for selected request */
const loadingItems = ref(false)
const requestItems = ref([])   // [{ item_id, description, request_qty, handover_qty, asset_code|null, remarks, asset_type }]
const rowErrors = ref([])      // per-row client errors

// Watcher for handover date


/* today as default date */
const today = new Date().toISOString().split('T')[0]

/* include employee_id/employee_name/employee_code */
const form = ref({
  employee_id: null,           // hidden, captured from logged-in user.id
  employee_name: '',           // shown (readonly)
  employee_code: '',           // shown (readonly)
  asset_investment_requests_id: null,
  user_id: null,
  department_id: null,
  handover_date: today,
  hor_number: null,
})

watch(
  () => form.value.handover_date,
  (newVal) => {
    if (!newVal) {
      errorMessages.value.handover_date = "";
      return;
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const selected = new Date(newVal).setHours(0, 0, 0, 0);

    if (selected < today) {
      errorMessages.value.handover_date = "Handover date cannot be older than today.";
    } else {
      errorMessages.value.handover_date = "";
    }
  }
);

/* ========= VALIDATORS ========= */
const requiredValidator = v => (!!v || v === 0) || 'This field is required'
const posInt = v => Number.isInteger(+v) && +v > 0

/* ========= TOKEN HELPERS ========= */
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}
const getToken = () => {
  const fromCookie = getCookie('accessToken')
  if (fromCookie) return decodeURIComponent(fromCookie)
  const fromLS = localStorage.getItem('accessToken')
  return fromLS ? decodeURIComponent(fromLS) : null
}
const getAuthHeaders = () => {
  const token = getToken()
  if (!token) throw new Error('Access token is missing. Please log in.')
  return { Accept: 'application/json', Authorization: `Bearer ${token}` }
}

/* ========= CURRENT USER (fill Name/Code) ========= */
const currentUser = ref(null)

const validateQty = (row, index) => {
  if (row.handover_qty > row.request_qty) {
    rowErrors.value[index] = {
      handover_qty: "Handover quantity cannot exceed requested quantity"
    }
  } else {
    rowErrors.value[index] = {}
  }
}

/**
 * Tries common "who am I" endpoints. If you already have a dedicated endpoint,
 * replace the candidates array with that single URL.
 */
const fetchCurrentUser = async () => {
  const token = getToken()
  if (!token) return

  const candidates = [
    `${apiBaseUrl}/me`,
    `${apiBaseUrl}/user`,
    `${apiBaseUrl}/profile`,
  ]

  for (const url of candidates) {
    try {
      const res = await axios.get(url, { headers: getAuthHeaders() })
      const u = res.data?.data ?? res.data?.user ?? res.data
      if (u && (u.name || u.user_code || u.id)) {
        currentUser.value = u
        form.value.employee_id = u.id ?? null
        form.value.employee_name = u.name ?? ''
        form.value.employee_code = u.user_code ?? (u.id ? String(u.id) : '')
        return
      }
    } catch (e) { /* try next */ }
  }

  // Fallback: if you stored login payload in localStorage as "user"
  try {
    const fromLS = localStorage.getItem('user')
    if (fromLS) {
      const u = JSON.parse(fromLS)
      currentUser.value = u
      form.value.employee_id = u.id ?? null
      form.value.employee_name = u.name ?? ''
      form.value.employee_code = u.user_code ?? (u.id ? String(u.id) : '')
    }
  } catch (e) {}
}

/* ========= OPTIONS ========= */
const requestOptions = computed(() =>
  assetRequests.value.map(r => ({
    value: r.id,
    title: `#${r.air_number}`,
  })),
)
const usersOptions = computed(() =>
  allUsers.value.map(u => ({
    value: u.id,
    title: `${u.name ?? '(no name)'} — ${u.user_code ?? u.id}`,
  })),
)
const departmentsOptions = computed(() =>
  departments.value.map(d => ({ value: d.id, title: d.name })),
)

/* ========= LOADERS ========= */
const fetchAssetRequests = async (projectId = null) => {
  loadingRequests.value = true
  try {
    const res = await axios.get(apiRequestsUrl, {
      params: { project_id: projectId },
      headers: getAuthHeaders()
    })
    assetRequests.value = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : []
  } catch (err) {
    console.error('Error loading asset investment requests:', err)
    message.value = err.response?.data?.message || 'Failed to load asset investment requests.'
  } finally {
    loadingRequests.value = false
  }
}

/* NEW: Global users list (/api/users) */
const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    // pull a generous page for select; adjust per_page if needed
    const res = await axios.get(apiUsersUrl, {
      headers: getAuthHeaders(),
      params: { page: 1, per_page: 100 },
    })

    // users can be: { data: { users: [...] }} OR { users: [...] } OR { data: { data: [...] } }
    const usersNode = res?.data?.data?.users ?? res?.data?.users ?? res?.data?.data
    const rows = Array.isArray(usersNode) ? usersNode : (usersNode?.data ?? [])
    allUsers.value = rows
  } catch (err) {
    console.error('Error fetching users:', err)
    message.value = err.response?.data?.message || 'Failed to fetch users.'
    allUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

const fetchDepartments = async () => {
  loadingDepartments.value = true
  try {
    const res = await axios.get(apiDepartmentsUrl, { headers: getAuthHeaders() })
    departments.value = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : []
  } catch (err) {
    console.error('Error loading departments:', err)
    message.value = err.response?.data?.message || 'Failed to load departments.'
  } finally {
    loadingDepartments.value = false
  }
}

/* DETAIL + items map */
const fetchInvestmentRequestDetail = async (id) => {
  requestItems.value = []
  rowErrors.value = []
  if (!id) return

  loadingItems.value = true
  try {
    const res = await axios.get(`${apiRequestsUrl}/${id}`, { headers: getAuthHeaders() })
    const detail = res.data?.data || res.data
    const items = Array.isArray(detail?.items) ? detail.items : []

    requestItems.value = items.map(it => ({
      item_id: it.id,
      description: it.description,
      request_qty: Number(it.pending_quantity) || 1,      // readonly
      handover_qty: 1,     // editable default
      asset_code: it.asset_code != null ? String(it.asset_code) : null,
      remarks: '',
      asset_type: it.request_type || 'NEW',
    }))

    form.value.user_id = detail?.user_id ?? null;

    rowErrors.value = requestItems.value.map(() => ({}))
  } catch (err) {
    console.error('Error loading request detail/items:', err)
    message.value = err.response?.data?.message || 'Failed to load request items.'
    requestItems.value = []
  } finally {
    loadingItems.value = false
  }
}

/* ========= WATCHERS ========= */
watch(
  () => form.value.asset_investment_requests_id,
  newVal => {
    // when request changes, clear selection and items, then load its items
    form.value.user_id = null
    requestItems.value = []
    rowErrors.value = []
    if (newVal) fetchInvestmentRequestDetail(newVal)
  },
)

/* ========= SUBMIT ========= */
const validateRows = () => {
  let ok = true
  rowErrors.value = requestItems.value.map(r => {
    const e = {}
    if (!posInt(r.handover_qty)) {
      e.handover_qty = 'Enter a positive integer'
      ok = false
    }
    return e
  })
  return ok
}


/* ========= ASSETS DROPDOWN ========= */
const loadingAssets = ref(false)
const assets = ref([])

const projects = ref([])
const loadingProjects = ref(false)


const assetOptions = computed(() =>
  assets.value.map(a => ({
    value: a.id,
    title: `${a.asset_code ?? a.id} — ${a.title ?? a.title ?? 'Unnamed Asset'}`,
  }))
)

const fetchAssets = async () => {
  loadingAssets.value = true
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, { headers: getAuthHeaders() })
    assets.value = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : []
  } catch (err) {
    console.error('Error loading assets:', err)
    message.value = err.response?.data?.message || 'Failed to load assets.'
  } finally {
    loadingAssets.value = false
  }
}


const submitForm = async () => {
  try {
    loading.value = true
    message.value = ''
    errorMessages.value = {}

    const { valid } = (await refForm.value?.validate?.()) ?? { valid: true }
    if (!valid) { loading.value = false; return }

    if (requestItems.value.length === 0) {
      message.value = 'No items to hand over for the selected request.'
      loading.value = false; return
    }
    if (!validateRows()) {
      message.value = 'Please fix the highlighted row errors.'
      loading.value = false; return
    }

    const payload = {
      // include employee metadata
      employee_id: form.value.employee_id,
      employee_name: form.value.employee_name,
      employee_code: form.value.employee_code,
      hor_number: form.value.hor_number,
      handover_date: form.value.handover_date,
      department_id: form.value.department_id,
      user_id: form.value.user_id || undefined,
      asset_investment_requests_id : form.value.asset_investment_requests_id,
      data: requestItems.value.map(r => ({
        item_id: r.item_id,
        asset_id : r.asset_id,
        asset_code: (r.asset_code === null || r.asset_code === '') ? null : Number(r.asset_code),
        quantity: Number(r.handover_qty),
        remarks: r.remarks || '',
        asset_type: r.asset_type,
      })),
    }

    const res = await axios.post(apiCreateUrl, payload, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    })

    message.value = res.data?.message || 'Asset Handover created successfully.'
    router.push('/dashboards/assethandovers')
  } catch (error) {
    console.error('Error submitting handover:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to create asset handover.'
      alert(error.response?.data?.message);
    }
  } finally {
    loading.value = false
  }
}

const onProjectChange = (projectId) => {
  if (!projectId) {
    investmentRequests.value = []
    asset.asset_investment_requests_id = null
    return
  }

  fetchAssetRequests(projectId)
}

const fetchProjects = async () => {
  try {
    loadingProjects.value = true
    const res = await axios.get(`${apiBaseUrl}/projects`, {
      headers: { ...getAuthHeaders(), Accept: 'application/json' },
    })
    const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
    projects.value = list.map(ir => ({
      id: ir.id,
      label:ir.project_code+'-'+ir.name,
    }))
  } catch (e) {
    console.error('Failed to load projects', e)
    projects.value = []
  } finally {
    loadingProjects.value = false
  }
}


const fetchLatestId = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/getLatestNumber`, {
      params: { type: 'HandOverRequest'},
      headers: getAuthHeaders(),
    });


    const numberId = res.data.value;
    console.log(numberId);
    form.value.hor_number = numberId;
  } catch (e) {
    console.error(e);
    form.value.hor_number = '';
  } finally {

  }
};

/* ========= LIFECYCLE ========= */
onMounted(async () => {
  await Promise.all([
    fetchCurrentUser(),
    fetchProjects(),
    fetchDepartments(),
    fetchUsers(),
    fetchAssets(), // ✅ load all assets for dropdown
    fetchLatestId()
  ])
})

</script>

<style scoped>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-2 { margin-inline-start: 8px; }
.notice-text { line-height: 1.6; }
.text-center { text-align: center; }
.py-6 { padding-block: 24px; }

.auth-signatory {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-block-start: 16px;
}
</style>
