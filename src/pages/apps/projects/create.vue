<template>
  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>

      <!-- 2) Name -->
      <VCol cols="12" md="6">
        <VTextField
          label="Name"
          :rules="[requiredValidator]"
          clearable
        />
      </VCol>

      <!-- 2) Start Date -->
      <VCol cols="12" md="6">
        <VTextField
          label="Start Date"
          type="date"
        />
      </VCol>

      <!-- 3) End Date -->
      <VCol cols="12" md="6">
        <VTextField
          label="End Date"
          type="date"
        />
      </VCol>

      <!-- 4) Budget -->
      <VCol cols="12" md="6">
        <VTextField
          label="Budget"
          type="number"
        />
      </VCol>

      <!-- 5) Description -->
      <VCol cols="12">
        <VTextarea
          label="Description"
          :rows="3"
          :rules="[requiredValidator]"
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
  start_date: '',
  end_date: '',
  budget: '',
  description: '',
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
      code: project.value.code,
      name: project.value.name,
      start_date: project.value.start_date,
      end_date: project.value.end_date,
      budget: project.value.budget,
      description: project.value.description,
    }

    const response = await axios.post(`${apiBaseUrl}/projects`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = response.data.message || 'Product created successfully!'

    // Reset form
    Object.keys(project.value).forEach(key => {
      project.value[key] = typeof project.value[key] === 'boolean' ? false : ''
    })

    // If you navigate after create:
    // router.push('/dashboards/projects')
  } catch (error) {
    console.error('Error submitting form:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to create project.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* optional */
</style>
