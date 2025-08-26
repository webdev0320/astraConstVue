<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Department</h3>
    <VBtn variant="text" @click="$router.push('/dashboards/departments')">Back to list</VBtn>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- Code -->
      <VCol cols="12" md="4">
        <VTextField
          v-model.trim="department.code"
          label="Code"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.code"
          clearable
        />
      </VCol>

      <!-- Name -->
      <VCol cols="12" md="4">
        <VTextField
          v-model.trim="department.name"
          label="Name"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.name"
          clearable
        />
      </VCol>

      <!-- Description -->
      <VCol cols="12">
        <VTextarea
          v-model.trim="department.description"
          label="Description"
          :rows="3"
          :error-messages="errorMessages.description"
        />
      </VCol>

      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="saving" :disabled="saving">
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
const departmentId = route.params.id

const department = ref({
  name: '',
  code: '',
  description: '',
})

const refForm = ref()
const loading = ref(false)   // for initial fetch
const saving = ref(false)    // for submit
const message = ref('')
const errorMessages = ref({})

const requiredValidator = value => !!(value ?? '').toString().trim() || 'This field is required'

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Small helper to only send fields that are not empty strings
const cleanPayload = obj =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
  )

// Load current department
const fetchDepartment = async () => {
  try {
    loading.value = true
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const res = await axios.get(`${apiBaseUrl}/departments/${departmentId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    // API could return object directly or wrapped
    const d = res.data?.data ?? res.data
    department.value = {
      name: d?.name ?? '',
      code: d?.code ?? '',
      description: d?.description ?? '',
    }
  } catch (error) {
    console.error('Error fetching department:', error)
    message.value = error.response?.data?.message || 'Failed to load department.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDepartment)

// Submit update
const submitForm = async () => {
  try {
    saving.value = true
    errorMessages.value = {}
    message.value = ''

    const { valid } = (await refForm.value?.validate?.()) ?? { valid: true }
    if (!valid) {
      saving.value = false
      return
    }

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const payload = cleanPayload({
      name: department.value.name,
      code: department.value.code,
      description: department.value.description,
    })

    await axios.put(`${apiBaseUrl}/departments/${departmentId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = 'Department updated successfully!'
    router.push('/dashboards/departments')
  } catch (error) {
    console.error('Error updating department:', error)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      // Laravel validation errors { field: [messages...] }
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to update department.'
    }
  } finally {
    saving.value = false
  }
}
</script>

<style>
.mb-4 { margin-bottom: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
</style>
