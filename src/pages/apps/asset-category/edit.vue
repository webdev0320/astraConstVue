<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Edit Asset Category</h3>
      <div class="d-flex gap-2">
        <VBtn variant="text" @click="$router.back()">Back</VBtn>
      </div>
    </div>

    <VAlert
      v-if="loadError"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ loadError }}
    </VAlert>

    <VForm ref="refForm" @submit.prevent="submitForm" v-if="loaded">
      <VRow>
        <!-- Title (required) -->
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.title"
            label="Title"
            :rules="[requiredValidator]"
            :error-messages="errors.title"
            clearable
          />
        </VCol>

        <!-- Status -->
        <VCol cols="12" md="6" class="d-flex align-center">
          <VSwitch
            v-model="form.status"
            inset
            :true-value="true"
            :false-value="false"
            label="Active Status"
          />
        </VCol>

        <!-- Is Parent -->
        <VCol cols="12" md="6" class="d-flex align-center">
          <VSwitch
            v-model="form.is_parent"
            inset
            :true-value="true"
            :false-value="false"
            label="Is Parent Category"
            @update:model-value="onIsParentToggled"
          />
        </VCol>

        <!-- Parent Category (required if NOT parent) -->
        <VCol cols="12" md="6">
          <VSelect
            v-model="form.parent_id"
            :items="parentOptions"
            :loading="loadingParents"
            :disabled="form.is_parent || loadingParents"
            item-title="label"
            item-value="id"
            label="Parent Category"
            :hint="form.is_parent ? 'Disabled because this is a parent category' : 'Choose the parent category'"
            persistent-hint
            :rules="[parentRequiredValidator]"
            :error-messages="errors.parent_id"
            clearable
          />
        </VCol>

        <!-- Description -->
        <VCol cols="12">
          <VTextarea
            v-model="form.description"
            label="Description"
            :rows="3"
            :error-messages="errors.description"
          />
        </VCol>

        <!-- Submit -->
        <VCol cols="12">
          <VBtn
            type="submit"
            color="primary"
            :loading="submitting"
            :disabled="submitting"
          >
            Update
          </VBtn>
        </VCol>
      </VRow>

      <div v-if="message" class="mt-4">{{ message }}</div>
    </VForm>

    <div v-else class="mt-4">Loading…</div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  VAlert,
  VBtn,
  VCol,
  VForm,
  VRow,
  VTextField,
  VTextarea,
  VSelect,
  VSwitch,
} from 'vuetify/components'

/** API base */
const apiBaseUrl = 'https://dm.kreashionsoftwarehouse.com/astraConst/public/api'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

/* ---------------- State ---------------- */
const loaded = ref(false)
const loadError = ref('')

const form = ref({
  title: '',
  status: true,
  description: '',
  is_parent: false,
  parent_id: null,
})

const parentOptions = ref([]) // [{ id, label }]
const loadingParents = ref(false)

const refForm = ref()
const submitting = ref(false)
const message = ref('')
const errors = ref({})

/* ---------------- Utils ---------------- */
const requiredValidator = v => !!(v?.toString?.().trim?.() || v === 0) || 'This field is required'
const parentRequiredValidator = v =>
  form.value.is_parent ? true : (!!v || 'Parent is required')

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const slugToTitle = slug =>
  (slug || '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, s => s.toUpperCase())

const onIsParentToggled = (val) => {
  if (val) form.value.parent_id = null
}

/* ---------------- Fetch helpers ---------------- */
const fetchAllCategories = async () => {
  let page = 1
  let total = Infinity
  let perPageFromServer = 15
  const all = []

  const token = decodeURIComponent(getCookie('accessToken') || '')

  while ((page - 1) * perPageFromServer < total) {
    const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
      params: { page },
      headers: { Authorization: `Bearer ${token}` },
    })

    const list = Array.isArray(res.data?.categories) ? res.data.categories : []
    total = Number(res.data?.total_records ?? all.length + list.length)
    perPageFromServer = Number(res.data?.perPage ?? perPageFromServer)
    page += 1

    all.push(...list)
    if (list.length === 0) break
  }
  return all
}

const loadParentOptions = async () => {
  try {
    loadingParents.value = true
    const raw = await fetchAllCategories()

    // Only parent categories, exclude self from dropdown
    const parents = raw.filter(c => c?.is_parent === true && c?.id !== id)

    parentOptions.value = parents
      .map(p => ({
        id: p.id,
        label: `${slugToTitle(p.slug)} (ID: ${p.id})`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  } catch (e) {
    console.error('Failed to load parent categories:', e)
    parentOptions.value = []
  } finally {
    loadingParents.value = false
  }
}

/* ---------------- Load existing record ---------------- */
const loadCategory = async () => {
  try {
    loadError.value = ''
    const token = decodeURIComponent(getCookie('accessToken') || '')
    if (!token) throw new Error('Access token is missing. Please log in.')

    const res = await axios.get(`${apiBaseUrl}/asset-categories/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })

    // Backend shape assumption: { success, data: {...} } or direct object
    const data = res.data?.data ?? res.data

    form.value.title = data?.title ?? slugToTitle(data?.slug ?? '')
    form.value.status = !!data?.status
    form.value.description = data?.description ?? ''
    form.value.is_parent = !!data?.is_parent
    form.value.parent_id = data?.parent_id ?? null

    loaded.value = true
  } catch (e) {
    console.error('Failed to load category:', e)
    loadError.value = e.response?.data?.message || 'Failed to load category.'
  }
}

/* ---------------- Submit (PUT) ---------------- */
const submitForm = async () => {
  try {
    submitting.value = true
    errors.value = {}
    message.value = ''

    const { valid } = (await refForm.value?.validate?.()) ?? { valid: true }
    if (!valid) {
      submitting.value = false
      return
    }

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const payload = {
      title: form.value.title,
      status: !!form.value.status,
      description: form.value.description || null,
      is_parent: !!form.value.is_parent,
      parent_id: form.value.is_parent ? null : (form.value.parent_id ? Number(form.value.parent_id) : null),
    }

    const res = await axios.put(`${apiBaseUrl}/asset-categories/${encodeURIComponent(id)}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = res.data?.message || 'Asset Category updated successfully!'
    router.push('/dashboards/assetcategories')
  } catch (error) {
    console.error('Error updating category:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to update asset category.'
    }
  } finally {
    submitting.value = false
  }
}

/* ---------------- Lifecycle ---------------- */
onMounted(async () => {
  await Promise.all([loadCategory(), loadParentOptions()])
})
</script>

<style>
.mb-4 { margin-bottom: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
</style>
