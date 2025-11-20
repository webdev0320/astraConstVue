<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Project</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- Name -->
      <VCol cols="12" md="12">
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

      <!-- Description -->
      <VCol cols="12">
      <VTextarea
  v-model="project.description"
  label="Description"
  rows="5"
  :rules="[wordLimitRule]"
  counter
  :counter-value="`${wordCount.value}/1000 words`"
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
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { VBtn, VCol, VForm, VRow, VTextField, VTextarea } from 'vuetify/components'
import { useWordLimit } from '@/utils/descValidator'
import { toRef } from 'vue'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const router = useRouter()

const today = new Date().toISOString().split('T')[0]

const project = ref({
  name: '',
  project_code: '',
  start_date: today,
  end_date: '',
  description: '',
})

const { wordCount, wordLimitRule } = useWordLimit(
  computed(() => project.value.description),
  1000
)

const refForm = ref()
const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

const requiredValidator = value => !!value || 'This field is required'

// 🧩 Custom date validation warnings
watch(
  () => project.value.start_date,
  newDate => {
    if (newDate && newDate < today) {
      errorMessages.value.start_date = ['Start date is older than today.']
    } else {
      errorMessages.value.start_date = []
    }

    // recheck end_date whenever start_date changes
    if (project.value.end_date && project.value.end_date < newDate) {
      errorMessages.value.end_date = ['End date cannot be before start date.']
    } else if (errorMessages.value.end_date?.[0] === 'End date cannot be before start date.') {
      errorMessages.value.end_date = []
    }
  }
)

watch(
  () => project.value.end_date,
  newDate => {
    if (newDate && newDate < project.value.start_date) {
      errorMessages.value.end_date = ['End date cannot be before start date.']
    } else {
      errorMessages.value.end_date = []
    }
  }
)

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const submitForm = async () => {
  try {
    loading.value = true
    message.value = ''
    errorMessages.value = {}

    const { valid } = await refForm.value?.validate?.() ?? { valid: true }
    if (!valid) {
      loading.value = false
      return
    }

    // check date constraints before submission
    if (project.value.start_date < today) {
      errorMessages.value.start_date = ['Start date is older than today.']
      loading.value = false
      //return
    }

    if (project.value.end_date && project.value.end_date < project.value.start_date) {
      errorMessages.value.end_date = ['End date cannot be before start date.']
      loading.value = false
      return
    }

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const payload = {
      name: project.value.name,
      project_code: project.value.project_code,
      start_date: project.value.start_date,
      end_date: project.value.end_date,
      description: project.value.description,
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
.v-text-field .v-input__details {
    padding-inline: 0px !important;
}
/* Quill dark theme fix for Vuetify dark mode */
.ql-toolbar,
.ql-container {
  background-color: #1e1e2f; /* match Vuetify dark cards */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.ql-toolbar {
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.ql-editor {
  min-height: 150px;
  color: #fff; /* make text readable */
}

.ql-picker,
.ql-stroke {
  color: #fff;
  stroke: #fff; /* toolbar icon color */
}

.ql-container {
  border-radius: 0 0 8px 8px;
  margin-bottom: 24px; /* add space before Submit button */
}

.ql-editor.ql-blank::before {
  color: rgba(255, 255, 255, 0.4); /* placeholder color */
}
.ql-container {
  height: fit-content !important;
}

</style>
