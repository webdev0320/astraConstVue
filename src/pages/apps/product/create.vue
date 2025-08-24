<template>
  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- 1) Code -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.code"
          label="Code"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.code"
          clearable
        />
      </VCol>

      <!-- 2) Name -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.name"
          label="Name"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.name"
          clearable
        />
      </VCol>

      <!-- 3) Category (from backend) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.category_id"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Category"
          :rules="[requiredValidator]"
          :loading="loadingCategories"
          :disabled="loadingCategories"
          :error-messages="errorMessages.category_id"
          clearable
        />
      </VCol>

      <!-- 4) Sub Category (depends on category) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.sub_category_id"
          :items="subCategories"
          item-title="name"
          item-value="id"
          label="Sub Category"
          :rules="[requiredValidator]"
          :loading="loadingSubCategories"
          :disabled="!asset.category_id || loadingSubCategories"
          :error-messages="errorMessages.sub_category_id"
          clearable
        />
      </VCol>

      <!-- 5) Description -->
      <VCol cols="12">
        <VTextarea
          v-model="asset.description"
          label="Description"
          :rows="3"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.description"
        />
      </VCol>

      <!-- 6) Serial Number -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.serial_number"
          label="Serial Number"
          :error-messages="errorMessages.serial_number"
          clearable
        />
      </VCol>

      <!-- 7) Plate Number -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.plate_number"
          label="Plate Number"
          :error-messages="errorMessages.plate_number"
          clearable
        />
      </VCol>

      <!-- 8) Make -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.make"
          label="Make"
          :error-messages="errorMessages.make"
          clearable
        />
      </VCol>

      <!-- 9) Insurance Start Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.insurance_start_date"
          label="Insurance Start Date"
          type="date"
          :error-messages="errorMessages.insurance_start_date"
        />
      </VCol>

      <!-- 10) Warranty Start Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.warranty_start_date"
          label="Warranty Start Date"
          type="date"
          :error-messages="errorMessages.warranty_start_date"
        />
      </VCol>

      <!-- 11) Extended Warranty (Yes/No) -->
      <VCol cols="12" md="6" class="d-flex align-center">
        <VSwitch
          v-model="asset.extended_warranty"
          inset
          label="Extended Warranty"
        />
      </VCol>

      <!-- 12) Purchase Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.purchase_date"
          label="Purchase Date"
          type="date"
          :error-messages="errorMessages.purchase_date"
        />
      </VCol>

      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">
          Submit
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { ref, watch, onMounted } from 'vue'
import { VBtn, VCol, VForm, VRow, VSwitch, VTextField, VTextarea, VSelect } from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// ---- State ----
const asset = ref({
  code: '',
  name: '',
  category_id: null,
  sub_category_id: null,
  description: '',
  serial_number: '',
  plate_number: '',
  make: '',
  insurance_start_date: '',
  warranty_start_date: '',
  extended_warranty: false,
  purchase_date: '',
})

// dropdown data
const categories = ref([])
const subCategories = ref([])

const loading = ref(false)
const loadingCategories = ref(false)
const loadingSubCategories = ref(false)

const refForm = ref()
const message = ref('')
const errorMessages = ref({})

// ---- Utils ----
const requiredValidator = value => !!value || 'This field is required'

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// ---- API calls ----
const fetchCategories = async () => {
  try {
    loadingCategories.value = true
    const token = decodeURIComponent(getCookie('accessToken') || '')
    const res = await axios.get(`${apiBaseUrl}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    categories.value = Array.isArray(res.data?.data) ? res.data.data : res.data
  } catch (e) {
    console.error('Failed to load categories', e)
  } finally {
    loadingCategories.value = false
  }
}

const fetchSubCategories = async (categoryId) => {
  if (!categoryId) {
    subCategories.value = []
    return
  }
  try {
    loadingSubCategories.value = true
    const token = decodeURIComponent(getCookie('accessToken') || '')
    // example endpoint: /categories/{id}/sub-categories
    const res = await axios.get(`${apiBaseUrl}/categories/${categoryId}/sub-categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    subCategories.value = Array.isArray(res.data?.data) ? res.data.data : res.data
  } catch (e) {
    console.error('Failed to load sub categories', e)
    subCategories.value = []
  } finally {
    loadingSubCategories.value = false
  }
}

// when category changes, reset and fetch sub-categories
watch(() => asset.value.category_id, async (newVal, oldVal) => {
  asset.value.sub_category_id = null
  await fetchSubCategories(newVal)
})

// ---- Submit ----
const submitForm = async () => {
  try {
    loading.value = true
    errorMessages.value = {}

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const formData = {
      code: asset.value.code,
      name: asset.value.name,
      category_id: asset.value.category_id,
      sub_category_id: asset.value.sub_category_id,
      description: asset.value.description,
      serial_number: asset.value.serial_number,
      plate_number: asset.value.plate_number,
      make: asset.value.make,
      insurance_start_date: asset.value.insurance_start_date,
      warranty_start_date: asset.value.warranty_start_date,
      extended_warranty: asset.value.extended_warranty,
      purchase_date: asset.value.purchase_date,
      // 👇 type intentionally NOT sent (backend-controlled)
    }

    const response = await axios.post(`${apiBaseUrl}/assets`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = response.data.message || 'Asset created successfully!'

    // Reset form
    Object.keys(asset.value).forEach(key => {
      asset.value[key] = typeof asset.value[key] === 'boolean' ? false : (key.endsWith('_id') ? null : '')
    })
    subCategories.value = []
  } catch (error) {
    console.error('Error submitting form:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to create asset.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
