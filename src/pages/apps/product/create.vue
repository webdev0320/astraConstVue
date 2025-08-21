<template>
  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- 1) Code -->
      <VCol cols="12" md="6">
        <VTextField
          label="Code"
          :rules="[requiredValidator]"
          clearable
        />
      </VCol>

      <!-- 2) Name -->
      <VCol cols="12" md="6">
        <VTextField
          label="Name"
          :rules="[requiredValidator]"
          clearable
        />
      </VCol>

      <!-- 3) Type -->
      <VCol cols="12" md="6">
        <VTextField
          label="Type"
          :rules="[requiredValidator]"
          clearable
        />
      </VCol>

      <!-- 4) Description -->
      <VCol cols="12">
        <VTextarea
          label="Description"
          :rows="3"
          :rules="[requiredValidator]"
        />
      </VCol>

      <!-- 5) Serial Number -->
      <VCol cols="12" md="6">
        <VTextField
          label="Serial Number"
          clearable
        />
      </VCol>

      <!-- 6) Plate Number -->
      <VCol cols="12" md="6">
        <VTextField
          label="Plate Number"
          clearable
        />
      </VCol>

      <!-- 7) Make -->
      <VCol cols="12" md="6">
        <VTextField
          label="Make"
          clearable
        />
      </VCol>

      <!-- 8) Insurance Start Date -->
      <VCol cols="12" md="6">
        <VTextField
          label="Insurance Start Date"
          type="date"
        />
      </VCol>

      <!-- 9) Warranty Start Date -->
      <VCol cols="12" md="6">
        <VTextField
          label="Warranty Start Date"
          type="date"
        />
      </VCol>

      <!-- 10) Extended Warranty (Yes/No) -->
      <VCol cols="12" md="6" class="d-flex align-center">
        <VSwitch
          inset
          label="Extended Warranty"
        />
      </VCol>

      <!-- 11) Purchase Date -->
      <VCol cols="12" md="6">
        <VTextField
          label="Purchase Date"
          type="date"
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
import { ref } from 'vue'
import { VBtn, VCol, VForm, VRow, VSwitch, VTextField, VTextarea } from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// 🆕 Fields updated as requested
const product = ref({
  code: '',
  name: '',
  type: '',
  description: '',
  serial_number: '',
  plate_number: '',
  make: '',
  insurance_start_date: '',
  warranty_start_date: '',
  extended_warranty: false, // boolean
  purchase_date: '',
})

const refForm = ref()
const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

const requiredValidator = value => !!value || 'This field is required'

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const submitForm = async () => {
  try {
    loading.value = true
    errorMessages.value = {}

    const accessToken = getCookie('accessToken')
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in.')
    }
    const decodedToken = decodeURIComponent(accessToken)

    // ✅ Only send the new fields
    const formData = {
      code: asset.value.code,
      name: asset.value.name,
      type: asset.value.type,
      description: asset.value.description,
      serial_number: asset.value.serial_number,
      plate_number: asset.value.plate_number,
      make: asset.value.make,
      insurance_start_date: asset.value.insurance_start_date,
      warranty_start_date: asset.value.warranty_start_date,
      extended_warranty: asset.value.extended_warranty,
      purchase_date: asset.value.purchase_date,
    }

    const response = await axios.post(`${apiBaseUrl}/assets`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = response.data.message || 'Product created successfully!'

    // Reset form
    Object.keys(asset.value).forEach(key => {
      asset.value[key] = typeof asset.value[key] === 'boolean' ? false : ''
    })

    // If you navigate after create:
    // router.push('/dashboards/assets')
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
</script>

<style>
/* optional */
</style>
