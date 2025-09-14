<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Department</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- Code -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="department.code"
          label="Code"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.code"
          clearable
        />
      </VCol>

      <!-- Name -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="department.name"
          label="Name"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.name"
          clearable
        />
      </VCol>

      <!-- Description -->
      <VCol cols="12">
        <VTextarea
          v-model="department.description"
          label="Description"
          :rows="3"
          :error-messages="errorMessages.description"
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
import { useRouter } from 'vue-router'
import { VBtn, VCol, VForm, VRow, VTextField, VTextarea } from 'vuetify/components'

const apiBaseUrl = 'https://dm.kreashionsoftwarehouse.com/astraConst/public/api'
const router = useRouter()

const department = ref({
  name: '',
  code: '',
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

    // (optional) basic client validation
    const { valid } = await refForm.value?.validate?.() ?? { valid: true }
    if (!valid) {
      loading.value = false
      return
    }

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    // Normalize budget: send null instead of empty string
    const payload = {
      name: department.value.name,
      code: department.value.code,
      description: department.value.description,
    }

    const res = await axios.post(`${apiBaseUrl}/departments`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = res.data?.message || 'department created successfully!'
    router.push('/dashboards/departments')
  } catch (error) {
    console.error('Error submitting form:', error)
    if (error.response?.data?.errors) {
      // Laravel validation errors { field: [messages...] }
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to create department.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style>
.mb-4 { margin-bottom: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
</style>
