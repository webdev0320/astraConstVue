<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Project</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="updateProject">
    <VRow>
      <!-- Name -->
      <VCol cols="12">
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
        <label class="mb-1 d-block">Description</label>
        <QuillEditor
          v-model:content="project.description"
          content-type="html"
          theme="snow"
          toolbar="full"
        />
        <small v-if="errorMessages.description" class="text-red">
          {{ errorMessages.description[0] }}
        </small>
      </VCol>

      <!-- Submit -->
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import { VBtn, VCol, VForm, VRow, VTextField } from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const router = useRouter()
const route = useRoute()

const projectId = route.params.id
const today = new Date().toISOString().split('T')[0]

const project = ref({
  name: '',
  project_code: '',
  start_date: today,
  end_date: '',
  description: '',
})

const refForm = ref()
const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

const requiredValidator = value => !!value || 'This field is required'

// ✅ Watchers for date validation
watch(
  () => project.value.start_date,
  newDate => {
    if (newDate && newDate < today) {
      errorMessages.value.start_date = ['Start date is older than today.']
    } else {
      errorMessages.value.start_date = []
    }

    if (project.value.end_date && project.value.end_date < newDate) {
      errorMessages.value.end_date = ['End date cannot be before start date.']
    } else {
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

// ✅ Fetch existing project data
onMounted(async () => {
  try {
    loading.value = true
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token missing.')
    const decodedToken = decodeURIComponent(accessToken)

    const res = await axios.get(`${apiBaseUrl}/projects/${projectId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    project.value = res.data.data || res.data
  } catch (error) {
    console.error('Error loading project:', error)
    message.value = 'Failed to load project data.'
  } finally {
    loading.value = false
  }
})

// ✅ Update project handler
const updateProject = async () => {
  try {
    loading.value = true
    message.value = ''
    errorMessages.value = {}

    const { valid } = await refForm.value?.validate?.() ?? { valid: true }
    if (!valid) {
      loading.value = false
      return
    }

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
    if (!accessToken) throw new Error('Access token missing.')
    const decodedToken = decodeURIComponent(accessToken)

    const payload = {
      name: project.value.name,
      project_code: project.value.project_code,
      start_date: project.value.start_date,
      end_date: project.value.end_date,
      description: project.value.description,
    }

    const res = await axios.put(`${apiBaseUrl}/projects/${projectId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = res.data?.message || 'Project updated successfully!'
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
</script>

<style>
.mb-4 {
  margin-block-end: 16px;
}
.d-flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.align-center {
  align-items: center;
}
.v-text-field .v-input__details {
  padding-inline: 0px !important;
}


.ql-toolbar,
.ql-container {
  background-color: #1e1e2f;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  height: fit-content !important;
}

.ql-toolbar {
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.ql-container {
  border-radius: 0 0 8px 8px;
  margin-bottom: 24px;
  height: fit-content !important;
  min-height: 100px !important;
}

.ql-editor {
  min-height: 150px !important;
  max-height: none !important;
  height: 100 !important;
  color: #fff;
  overflow-y: visible !important;
}

.ql-editor.ql-blank::before {
  color: rgba(255, 255, 255, 0.4);
}

.ql-picker,
.ql-stroke {
  color: #fff;
  stroke: #fff;
}
</style>
