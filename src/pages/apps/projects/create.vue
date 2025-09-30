<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Project</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- Name -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="project.name"
          label="Name"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.name"
          clearable
        />
      </VCol>

      <!-- Project Code -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="project.project_code"
          label="Project Code"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.project_code"
          clearable
        />
      </VCol>

      <!-- Start Date -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="project.start_date"
          label="Start Date"
          type="date"
          :error-messages="errorMessages.start_date"
        />
      </VCol>

      <!-- End Date -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="project.end_date"
          label="End Date"
          type="date"
          :min="project.start_date || undefined"
          :error-messages="errorMessages.end_date"
        />
      </VCol>

      <!-- Budget (optional) -->
      <!-- <VCol cols="12" md="4">
        <VTextField
          v-model="project.budget"
          label="Budget"
          type="number"
          step="0.01"
          :error-messages="errorMessages.budget"
          clearable
        />
      </VCol> -->

      <!-- Description -->
      <VCol cols="12">
        <VTextarea
          v-model="project.description"
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

import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { VBtn, VCol, VForm, VRow, VTextField, VTextarea } from 'vuetify/components';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const router = useRouter()

const today = new Date().toISOString().split('T')[0]

const project = ref({
  name: '',
  project_code: '',
  start_date: today,
  //end_date: '',
  // budget: '',
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
      name: project.value.name,
      project_code: project.value.project_code,
      start_date: project.value.start_date,
      end_date: project.value.end_date,
      description: project.value.description,
      // budget: project.value.budget === '' ? null : Number(project.value.budget),
    }

    const res = await axios.post(`${apiBaseUrl}/projects`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = res.data?.message || 'Project created successfully!'
    router.push('/dashboards/projects')
  } catch (error) {
    console.error('Error submitting form:', error)
    if (error.response?.data?.errors) {
      // Laravel validation errors { field: [messages...] }
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
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
</style>
