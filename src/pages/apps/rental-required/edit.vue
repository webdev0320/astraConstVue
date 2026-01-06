<template>
  <div class="rental-form-container">
    <VCard class="pa-4">
      <VForm ref="refForm" @submit.prevent="saveRentalRequest">
        <VRow>
          <VCol cols="12" md="4">
            <VTextField
              v-model="form.ren_number"
              label="Rental Equipment Number"
              :error-messages="errorMessages.ren_number"
              readonly
            />
          </VCol>

          <!-- Project -->
          <VCol cols="12" md="4">
            <VSelect
              v-model="form.project_id"
              :items="projectOptions"
              item-title="label"
              item-value="id"
              label="Select Project"
              :error-messages="errorMessages.project_id"
              :loading="loading.projects"
              :disabled="loading.projects"
              hide-details="auto"
              clearable
              @update:modelValue="onProjectChange"
            />
          </VCol>

          <!-- Date -->
          <VCol cols="12" md="4">
            <VTextField
              v-model="form.date"
              type="date"
              label="Date"
              :error-messages="errorMessages.date"
              hide-details="auto"
              clearable
            />
          </VCol>
        </VRow>

        <!-- Asset Requests -->
        <div class="mt-6">
          <div class="font-weight-medium mb-2">LIST OF EQUIPMENT REQUIRED</div>
          <VRow>
            <VCol cols="12" md="4">
              <VSelect
                v-model="assetRequest.asset_category_id"
                :items="categories"
                item-title="name"
                item-value="id"
                label="Select Asset Category"
                :loading="loading.categories"
                :disabled="loading.categories"
                hide-details="auto"
                clearable
              />
            </VCol>

            <VCol cols="12" md="4">
              <VSelect
                v-model="assetRequest.asset_sub_category_id"
                :items="subCategoriesForAsset"
                item-title="name"
                item-value="id"
                label="Select Subcategory"
                :disabled="!assetRequest.asset_category_id || loading.subCategories"
                :loading="loading.subCategories"
                hide-details="auto"
                clearable
              />
            </VCol>

            <VCol cols="12" md="4">
              <VSelect
                v-model="assetRequest.asset_id"
                :items="assets"
                item-title="label"
                item-value="id"
                label="Asset"
                :loading="loading.assets"
                :disabled="!assetRequest.asset_sub_category_id || loading.assets"
                clearable
                @update:modelValue="onAssetChange"
              />
            </VCol>

            <VCol cols="12" md="3">
              <VTextField
                v-model.number="assetRequest.quantity"
                type="number"
                min="1"
                :max="assetRequest.maxQty"
                label="Quantity"
                :rules="[v => !assetRequest.maxQty || v <= assetRequest.maxQty || `Max allowed: ${assetRequest.maxQty}`]"
                hide-details="auto"
              />
            </VCol>

            <VCol cols="12" md="3">
              <VTextField
                v-model="assetRequest.start_date"
                type="date"
                label="Date of Need"
                :error-messages="errorMessages.asset_request?.start_date"
                hide-details="auto"
                clearable
              />
            </VCol>

            <VCol cols="12" md="3">
              <VTextField
                v-model="assetRequest.end_date"
                type="date"
                label="End Date"
                :error-messages="errorMessages.asset_request?.end_date"
                hide-details="auto"
                clearable
              />
            </VCol>

            <VCol cols="12" md="12">
              <VTextField
                v-model="assetRequest.activity"
                label="Activity"
                :error-messages="errorMessages.asset_request?.activity"
                hide-details="auto"
              />
            </VCol>

            <VCol cols="12" md="3" class="d-flex align-end">
              <VBtn color="primary" @click="addAssetRequest" :disabled="!isAssetRequestValid">
                <VIcon start>mdi-plus</VIcon> Add
              </VBtn>
            </VCol>
          </VRow>

          <!-- Asset Request Chips -->
          <div v-if="form.asset_requests.length" class="mt-4">
            <VChip
              v-for="(asset, idx) in form.asset_requests"
              :key="idx"
              class="ma-1"
              closable
              @click:close="removeAssetRequest(idx)"
            >
              {{ asset.activity }} — {{ assetNameById(asset.asset_id) }} — Qty: {{ asset.quantity }} — {{ formatDate(asset.start_date) }} to {{ formatDate(asset.end_date) }}
            </VChip>
          </div>

          <!-- Asset Request Table -->
          <VDataTable
            v-if="form.asset_requests.length"
            :headers="assetHeaders"
            :items="form.asset_requests"
            :items-per-page="5"
            class="mt-4"
          >
            <template #item.asset_id="{ item }">
              {{ assetNameById(item.asset_id) }}
            </template>
            <template #item.start_date="{ item }">
              {{ formatDate(item.start_date) }}
            </template>
            <template #item.end_date="{ item }">
              {{ formatDate(item.end_date) }}
            </template>
            <template #item.actions="{ item }">
              <VBtn color="error" size="small" @click="removeAssetRequest(form.asset_requests.indexOf(item))">
                Delete
              </VBtn>
            </template>
          </VDataTable>
        </div>

        <!-- Rental Equipment -->
        <div class="mt-6">
          <div class="font-weight-medium mb-5">LIST OF EQUIPMENT ALREADY WORKING ON THE PROJECT</div>
          <VDataTable :headers="assetInListHeaders" :items="assetsInProject" :items-per-page="50" />
        </div>

        <!-- Summary -->
        <VCol cols="12" class="d-flex justify-end mt-4">
          <div class="text-end">
            <div class="text-medium-emphasis">Asset Requests: <b>{{ form.asset_requests.length }}</b></div>
            <div class="text-medium-emphasis">Total Asset Quantity: <b>{{ totalAssetQuantity }}</b></div>
            <div class="text-medium-emphasis">Rental Equipments: <b>{{ form.rental_equipments.length }}</b></div>
            <div class="text-medium-emphasis">Total Equipment Quantity: <b>{{ totalEquipmentQuantity }}</b></div>
          </div>
        </VCol>

        <!-- Actions -->
        <div class="d-flex gap-2 mt-4">
          <VBtn
            color="primary"
            type="submit"
            :loading="loading.submit"
            :disabled="loading.submit || (!form.asset_requests.length && !form.rental_equipments.length)"
          >
            <VIcon start>mdi-content-save</VIcon> Update
          </VBtn>
          <VBtn variant="text" @click="clearAll" :disabled="!form.asset_requests.length && !form.rental_equipments.length">
            Clear
          </VBtn>
        </div>

        <VAlert v-if="message" :type="message.includes('success') ? 'success' : 'error'" class="mt-4">
          {{ message }}
        </VAlert>
      </VForm>
    </VCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const rentalId = route.params.id
const assetsInProject = ref([])
/* ---------------- STATE ---------------- */
const loading = ref({
  projects: false,
  categories: false,
  submit: false,
})

const message = ref('')
const errorMessages = ref({})

const projectOptions = ref([])
const categories = ref([])
const assets = ref([]) // optional future use

/* ---------------- FORM ---------------- */
const form = ref({
  project_id: null,
  ren_number: '',
  date: '',
  asset_requests: [],
  rental_equipments: [],
})
const today = new Date().toISOString().split('T')[0]

const subCategoriesForAsset = ref([])
const subCategoriesForRental = ref([])

/* ---------------- TABLE HEADERS ---------------- */
const assetHeaders = [
  { title: 'Asset', key: 'asset_id' },
  { title: 'Activity', key: 'activity' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Start Date', key: 'start_date' },
  { title: 'End Date', key: 'end_date' },
  { title: 'Actions', key: 'actions' },
]

const assetRequest = ref({
  asset_category_id: null,
  asset_sub_category_id: null,
  asset_id: null,
  activity: '',
  quantity: null,
  start_date: today,
})

const rentalEquipment = ref({
  asset_category_id: null,
  asset_sub_category_id: null,
  asset_id: null,
  activity: '',
  quantity_at_site: null,
  start_date: today,
  end_date: '',
  spo_number: '',
})



const assetInListHeaders = [
  { title: 'Asset', key: 'asset_name' },
  { title: 'Activity', key: 'activity' },
  { title: 'Quantity At Site', key: 'quantity_at_site' },
  { title: 'Start Date', key: 'start_date' },
  { title: 'End Date', key: 'end_date' },
  { title: 'SPO Number', key: 'spo_number' },
]

/* ---------------- COMPUTED ---------------- */
const totalAssetQuantity = computed(() =>
  form.value.asset_requests.reduce((s, r) => s + Number(r.quantity || 0), 0)
)

const totalEquipmentQuantity = computed(() =>
  form.value.rental_equipments.reduce((s, r) => s + Number(r.quantity_at_site || 0), 0)
)

const isAssetRequestValid = computed(() =>
  assetRequest.value.asset_id &&
  assetRequest.value.quantity &&
  assetRequest.value.start_date &&
  assetRequest.value.end_date
)

const onProjectChange = (val) => {
  form.value.project_id = val;   // update reactive projectId
  if (val) fetchProjectAssets(); // call your function
};
const filters = ref({
  asset_category_id: null,
  asset_sub_category_id: null
});

// fetch project assets
const fetchProjectAssets = async () => {
  if (!form.value.project_id) return;

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/getRentalAssets/${encodeURIComponent(
        form.value.project_id
      )}`,
      {
        headers: authHeaders(),
        params: { asset_type: "LEASED" },
      }
    );

    assetsInProject.value = res.data.data.rental_equipments;
  } catch (e) {
    console.error(e);
  }
};

watch(
  () => assetRequest.value.asset_sub_category_id,
  async newVal => {
    assetRequest.value.asset_id = null
    await fetchAssets(newVal)
  }
)

watch(
  () => rentalEquipment.value.asset_sub_category_id,
  async newVal => {
    rentalEquipment.value.asset_id = null
    await fetchAssets(newVal)
  }
)

const fetchAssets = async (subCategoryId) => {
  if (!subCategoryId) {
    //assets.value = []
    return
  }
  loading.value.assets = true
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      params: { asset_sub_category_id: subCategoryId, project_id : form.value.project_id },
      headers: authHeaders(),
    })
    const list = res.data?.data?.data ?? res.data?.data ?? res.data ?? []

    assets.value = list.map(a => {
      const code = a.code;
      const title = a.title
      return { id: Number(a.id), label: `${code} — ${title}`.trim(),quantity: Number(a.quantity) }
    })


  } catch (error) {
    console.error('Error fetching Assets:', error)
    message.value = 'Failed to load assets.'
  } finally {
    loading.value.assets = false
  }
}

/* ---------------- HELPERS ---------------- */
const normalizeDate = d => (d ? d.split('T')[0] : '')

const assetNameById = id => `Asset #${id}`

/* ---------------- AUTH ---------------- */
const getCookie = name =>
  document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1]

const authHeaders = () => ({
  Authorization: `Bearer ${decodeURIComponent(getCookie('accessToken') || '')}`,
  Accept: 'application/json',
})

/* ---------------- API ---------------- */
const fetchProjects = async () => {
  loading.value.projects = true
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: authHeaders() })
    projectOptions.value = res.data.data.map(p => ({
      id: p.id,
      label: `${p.project_code} - ${p.name}`,
    }))
  } finally {
    loading.value.projects = false
  }
}


const fetchRentalData = async () => {
  const res = await axios.get(`${apiBaseUrl}/rental-required/${rentalId}`, {
    headers: authHeaders(),
  })

  const data = res.data.data

  form.value.project_id = data.project_id
  form.value.ren_number = data.rental_equipment_id
  form.value.date = normalizeDate(data.date)

  // 👇 SHOW IN "LIST OF EQUIPMENT REQUIRED"
  form.value.asset_requests = data.rental_equipments.map(r => ({
    asset_id: r.asset_id,
    activity: r.activity,
    quantity: r.quantity_at_site,
    start_date: normalizeDate(r.start_date),
    end_date: normalizeDate(r.end_date),
  }))

  // 👇 SHOW IN "ALREADY WORKING"
  form.value.rental_equipments = data.rental_equipments
}

// watchers
watch(
  () => assetRequest.value.asset_category_id,
  async newVal => {
    assetRequest.value.asset_sub_category_id = null
    assetRequest.value.asset_id = null
/*    assets.value = []*/
    await fetchSubCategories(newVal, 'asset')
  }
)

watch(
  () => rentalEquipment.value.asset_category_id,
  async newVal => {
    rentalEquipment.value.asset_sub_category_id = null
    rentalEquipment.value.asset_id = null
/*    assets.value = []*/
    await fetchSubCategories(newVal, 'rental')
  }
)


const fetchAllCategories = async () => {
  let page = 1
  let all = []
  let total = Infinity
  let perPageFromServer = 15

  while ((page - 1) * perPageFromServer < total) {
    const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
      params: { page },
      headers: authHeaders(),
    })

    const list =
      Array.isArray(res.data?.categories) ? res.data.categories
      : Array.isArray(res.data?.data) ? res.data.data
      : Array.isArray(res.data) ? res.data : []

    all = all.concat(list)

    total = Number(res.data?.total_records ?? total)
    perPageFromServer = Number(res.data?.perPage ?? perPageFromServer)

    if (!list.length) break
    page += 1
  }

  return all
}

const fetchCategories = async () => {
  try {
    loading.value.categories = true
    const raw = await fetchAllCategories()

    const parents = raw.filter(
      c => c && c.status === true && c.is_parent === true && (c.parent_id === null || c.parent_id === undefined)
    )

    categories.value = parents
      .map(c => ({ id: c.id, slug: c.slug, name: c.title || slugToTitle(c.slug) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error('Failed to load categories', e)
    categories.value = []
    message.value = 'Failed to load categories.'
  } finally {
    loading.value.categories = false
  }
}

const fetchSubCategories = async (parentId, target) => {
  if (!parentId) {
    if (target === 'asset') subCategoriesForAsset.value = []
    else subCategoriesForRental.value = []
    return
  }
  try {
    loading.value.subCategories = true
    const res = await axios.get(`${apiBaseUrl}/asset-categories/${encodeURIComponent(parentId)}`, {
      headers: authHeaders(),
    })
    const children = res?.data?.data?.children || res?.data?.children || []
    const formatted = children
      .filter(ch => ch?.status !== false)
      .map(ch => ({ id: ch.id, slug: ch.slug, name: ch.title || slugToTitle(ch.slug) }))
      .sort((a, b) => a.name.localeCompare(b.name))
    
    if (target === 'asset') subCategoriesForAsset.value = formatted
    else subCategoriesForRental.value = formatted
  } catch (e) {
    console.error('Failed to load sub categories', e)
    if (target === 'asset') subCategoriesForAsset.value = []
    else subCategoriesForRental.value = []
    message.value = 'Failed to load subcategories.'
  } finally {
    loading.value.subCategories = false
  }
}


/* ---------------- ACTIONS ---------------- */
const addAssetRequest = () => {
  form.value.asset_requests.push({ ...assetRequest.value })
  assetRequest.value = {
    asset_id: null,
    activity: '',
    quantity: null,
    start_date: '',
    end_date: '',
  }
}

const removeAssetRequest = index => {
  form.value.asset_requests.splice(index, 1)
}

const clearAll = () => {
  form.value.asset_requests = []
  form.value.rental_equipments = []
}

const saveRentalRequest = async () => {
  loading.value.submit = true
  try {
    await axios.put(
      `${apiBaseUrl}/rental-required/${rentalId}`,
      {
        project_id: form.value.project_id,
        date: form.value.date,
        asset_requests: form.value.asset_requests,
        rental_equipments: form.value.rental_equipments,
      },
      { headers: authHeaders() }
    )

    message.value = 'Rental request updated successfully'
    router.push({ name: 'dashboards-rental-required' })
  } catch {
    message.value = 'Failed to update rental request'
  } finally {
    loading.value.submit = false
  }
}

/* ---------------- INIT ---------------- */
onMounted(async () => {
  await Promise.all([
    fetchProjects(),
    fetchCategories(),
    fetchRentalData(),
  ])
})
</script>


<style scoped>
/* keep your previous styles */
</style>
