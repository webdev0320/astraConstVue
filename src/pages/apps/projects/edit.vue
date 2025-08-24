<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Project</h3>
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
      <VCol cols="12" md="4">
        <VTextField
          v-model="project.budget"
          label="Budget"
          type="number"
          step="0.01"
          :error-messages="errorMessages.budget"
          clearable
        />
      </VCol>

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
          Update
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VBtn, VCol, VForm, VRow, VTextField, VTextarea } from 'vuetify/components'

const apiBaseUrl = 'https://dm.kreashionsoftwarehouse.com/astraConst/public/api'

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.id)

const project = ref({
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

const requiredValidator = v => !!v || 'This field is required'

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

/* --------- Load existing project ---------- */
const loadProject = async () => {
  const accessToken = getCookie('accessToken')
  if (!accessToken) throw new Error('Access token is missing. Please log in.')
  const decodedToken = decodeURIComponent(accessToken)

  const res = await axios.get(`${apiBaseUrl}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
  })

  // Accept common shapes: array item, {data:{...}}, {project:{...}}, or plain object
  const p = res.data?.data ?? res.data?.project ?? res.data

  project.value.name = p.name ?? ''
  project.value.start_date = p.start_date ?? ''
  project.value.end_date = p.end_date ?? ''
  project.value.description = p.description ?? ''
  project.value.budget = p.budget ?? '' // keep as '' if null for editing
}

/* --------- Submit (UPDATE) ---------- */
const submitForm = async () => {
  try {
    loading.value = true
    errorMessages.value = {}

    const { valid } = await refForm.value?.validate?.() ?? { valid: true }
    if (!valid) { loading.value = false; return }

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const payload = {
      name: project.value.name,
      start_date: project.value.start_date,
      end_date: project.value.end_date,
      description: project.value.description,
      budget: project.value.budget === '' ? null : Number(project.value.budget),
    }

    await axios.put(`${apiBaseUrl}/projects/${projectId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = 'Project updated successfully!'
    router.push('/dashboards/projects')
  } catch (error) {
    console.error('Error updating project:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to update project.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await loadProject()
  } finally {
    loading.value = false
  }
})
</script>

<style>
.mb-4 { margin-bottom: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
</style>
