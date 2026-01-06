<template>
  <div class="container mt-4">
    <h3 class="text-h5 font-weight-bold mb-4">Edit Policy Waiver Form</h3>

    <VCard class="pa-4">
      <VForm @submit.prevent="updateForm">
        <div class="row">

          <!-- FORM NO -->
          <div class="col-md-4 mb-3">
            <VTextField v-model="form.form_no" label="Form No" variant="outlined" />
          </div>

          <!-- WAIVER TYPE -->
          <div class="col-md-4 mb-3">
            <VTextField v-model="form.waiver_type" label="Waiver Type *" variant="outlined" required />
          </div>

          <!-- PO NO -->
          <div class="col-md-4 mb-3">
            <VTextField v-model="form.po_no" label="PO No" variant="outlined" />
          </div>

          <!-- DATE -->
          <div class="col-md-4 mb-3">
            <VTextField v-model="form.date" label="Date" type="date" variant="outlined" />
          </div>

          <!-- DEPARTMENT -->
          <div class="col-md-4 mb-3">
            <VSelect
              v-model="form.department_id"
              :items="departments"
              item-title="name"
              item-value="id"
              label="Department *"
              variant="outlined"
              required
            />
          </div>

          <!-- PROJECT -->
          <div class="col-md-4 mb-3">
            <VSelect
              v-model="form.project_id"
              :items="projects"
              item-title="name"
              item-value="id"
              label="Project *"
              variant="outlined"
              required
            />
          </div>

          <div class="col-md-12 mb-3">
            <VTextarea v-model="form.item_description" label="Item Description" variant="outlined" />
          </div>

          <div class="col-md-12 mb-3">
            <VTextarea v-model="form.original_policy" label="Original Policy" variant="outlined" />
          </div>

          <div class="col-md-12 mb-3">
            <VTextarea
              v-model="form.policy_waived_and_reason"
              label="Policy Waived & Reason"
              variant="outlined"
            />
          </div>

          <div class="col-md-12 mb-3">
            <VTextarea
              v-model="form.concerned_department_remarks"
              label="Concerned Department Remarks"
              variant="outlined"
            />
          </div>

          <div class="col-md-12 mb-3">
            <VTextarea
              v-model="form.cost_controls_and_finance_department_remarks"
              label="Cost Controls & Finance Department Remarks"
              variant="outlined"
            />
          </div>

          <div class="col-md-12 mb-3">
            <VTextarea v-model="form.gm_remarks" label="GM Remarks" variant="outlined" />
          </div>
        </div>

        <div class="d-flex justify-end mt-4">
          <VBtn color="secondary" class="me-3" @click="$router.push('/dashboards/policy-waiver-form')">
            Cancel
          </VBtn>
          <VBtn color="primary" type="submit">
            Update
          </VBtn>
        </div>
      </VForm>
    </VCard>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const id = route.params.id

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// AUTH TOKEN
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

const getAuthHeaders = () => {
  const token = getCookie('accessToken')
  return { Authorization: `Bearer ${decodeURIComponent(token)}`, Accept: 'application/json' }
}

// FORM MODEL
const form = reactive({
  form_no: '',
  waiver_type: '',
  po_no: '',
  date: '',
  department_id: '',
  project_id: '',
  item_description: '',
  original_policy: '',
  policy_waived_and_reason: '',
  concerned_department_remarks: '',
  cost_controls_and_finance_department_remarks: '',
  gm_remarks: '',
})

const departments = ref([])
const projects = ref([])

// FETCH DROPDOWNS
const fetchDropdowns = async () => {
  try {
    const [deptRes, projRes] = await Promise.all([
      axios.get(`${apiBaseUrl}/departments`, { headers: getAuthHeaders() }),
      axios.get(`${apiBaseUrl}/projects`, { headers: getAuthHeaders() }),
    ])
    departments.value = deptRes.data.data || deptRes.data
    projects.value = projRes.data.data || projRes.data
  } catch (err) {
    console.error('Error fetching dropdown data:', err)
  }
}

// LOAD EXISTING DATA
const fetchFormData = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/policy-waiver-forms/${id}`, {
      headers: getAuthHeaders(),
    })

    const data = res.data.data

    // Populate form with API data
    Object.assign(form, {
      form_no: data.form_no,
      waiver_type: data.waiver_type,
      po_no: data.po_no,
      date: data.date,
      department_id: data.department_id,
      project_id: data.project_id,
      item_description: data.item_description,
      original_policy: data.original_policy,
      policy_waived_and_reason: data.policy_waived_and_reason,
      concerned_department_remarks: data.concerned_department_remarks,
      cost_controls_and_finance_department_remarks: data.cost_controls_and_finance_department_remarks,
      gm_remarks: data.gm_remarks,
    })

  } catch (error) {
    console.error(error)
    alert('Failed to load form details')
  }
}

// UPDATE FORM (PUT)
const updateForm = async () => {
  try {
    await axios.put(`${apiBaseUrl}/policy-waiver-forms/${id}`, form, {
      headers: getAuthHeaders(),
    })

    alert('Form updated successfully!')
    router.push('/dashboards/policy-waiver-form')
  } catch (err) {
    console.error(err)
    alert('Error updating form')
  }
}

onMounted(() => {
  fetchDropdowns()
  fetchFormData()
})
</script>
