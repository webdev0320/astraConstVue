<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Create Asset Category</h3>
      <VBtn variant="text" @click="$router.back()">Back</VBtn>
    </div>

    <VForm ref="refForm" @submit.prevent="submitForm">
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

        <!-- Status (active/inactive) -->
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
            Submit
          </VBtn>
        </VCol>
      </VRow>

      <div v-if="message" class="mt-4">{{ message }}</div>
    </VForm>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
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
const router = useRouter()

/* ---------------- State ---------------- */
const form = ref({
  title: '',
  status: true,       // default: active
  description: '',
  is_parent: false,   // default: it's a child
  parent_id: null,    // required when is_parent = false
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

/* If user toggles to parent, clear parent_id */
const onIsParentToggled = (val) => {
  if (val) form.value.parent_id = null
}

/* ---------------- Fetch parent categories (all pages) ---------------- */
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

    // Only those which are parent categories (is_parent === true)
    const parents = raw.filter(c => c?.is_parent === true)

    // label pref: slug -> Title Case (and show id to disambiguate)
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

/* ---------------- Submit ---------------- */
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

    // Build payload exactly like your Postman example
    const payload = {
      title: form.value.title,
      status: !!form.value.status,
      description: form.value.description || null,
      is_parent: !!form.value.is_parent,
      parent_id: form.value.is_parent ? null : (form.value.parent_id ? Number(form.value.parent_id) : null),
    }

    const res = await axios.post(`${apiBaseUrl}/asset-categories`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = res.data?.message || 'Asset Category created successfully!'
    // Go back to index
    router.push('/dashboards/assetcategories')
  } catch (error) {
    console.error('Error submitting form:', error)
    if (error.response?.data?.errors) {
      // Laravel validation errors { field: [messages...] }
      errors.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to create asset category.'
    }
  } finally {
    submitting.value = false
  }
}

/* ---------------- Lifecycle ---------------- */
onMounted(() => {
  loadParentOptions()
})
</script>

<style>
.mb-4 { margin-bottom: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
</style>
