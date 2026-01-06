<template>
  <div class="pa-6">
    <!-- 🔹 Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h3>Permissions List</h3>
      <VBtn color="primary" @click="openCreateDialog">
        Create Permission
      </VBtn>
    </div>

    <!-- 🔹 Error -->
    <VAlert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </VAlert>

    <!-- 🔹 Loader -->
    <div v-if="isLoading" class="d-flex justify-center my-8">
      <VProgressCircular indeterminate size="48" />
    </div>

    <!-- 🔹 Table -->
    <VDataTable
      v-else
      :headers="headers"
      :items="permissions"
      :items-per-page="50"
      class="mt-4"
    >
      <!-- NAME -->
      <template #item.name="{ item }">
        <strong>{{ item.raw?.name ?? item.name }}</strong>
      </template>

      <!-- ACTIONS -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            size="small"
            color="warning"
            @click="editPermission(item.raw?.name ?? item.name)"
          >
            Edit
          </VBtn>

          <VBtn
            size="small"
            color="error"
            @click="deletePermission(item.raw?.id ?? item.id)"
          >
            Delete
          </VBtn>
        </div>
      </template>

      <!-- NO DATA -->
      <template #no-data>
        <div class="py-8 text-center">
          No permissions found.
        </div>
      </template>
    </VDataTable>

    <!-- 🔹 Dialog -->
    <AddEditPermissionDialog
      v-model:isDialogVisible="isDialogVisible"
      v-model:permission-name="permissionName"
    />
  </div>
</template>
<script setup lang="ts">
import axios from "axios"
import { ref, onMounted } from "vue"

import {
  VBtn,
  VDataTable,
  VAlert,
  VProgressCircular,
} from "vuetify/components"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

/* ---------------------------------
   TABLE HEADERS
---------------------------------- */
const headers = [
  { title: "NAME", key: "name" },
  { title: "ACTIONS", key: "actions", sortable: false },
]

/* ---------------------------------
   STATE
---------------------------------- */
const permissions = ref<any[]>([])
const isLoading = ref(false)
const errorMessage = ref("")

/* ---------------------------------
   DIALOG
---------------------------------- */
const isDialogVisible = ref(false)
const permissionName = ref("")

const openCreateDialog = () => {
  permissionName.value = ""
  isDialogVisible.value = true
}

const editPermission = (name: string) => {
  permissionName.value = name
  isDialogVisible.value = true
}

/* ---------------------------------
   HELPERS
---------------------------------- */
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  return parts.length === 2 ? parts.pop()?.split(";").shift() : null
}

/* ---------------------------------
   NORMALIZE API RESPONSE
---------------------------------- */
const normalizePermissions = (payload: any) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.permissions)) return payload.permissions
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

/* ---------------------------------
   FETCH PERMISSIONS
---------------------------------- */
const fetchPermissions = async () => {
  isLoading.value = true
  errorMessage.value = ""

  try {
    const token = getCookie("accessToken")
    if (!token) throw new Error("Authentication required")

    const res = await axios.get(
      `${apiBaseUrl}/getAllPermissions`,
      {
        headers: {
          Authorization: `Bearer ${decodeURIComponent(token)}`,
          Accept: "application/json",
        },
      }
    )

    permissions.value = normalizePermissions(res.data)
  } catch (error: any) {
    console.error(error)
    errorMessage.value =
      error.response?.data?.message || "Failed to load permissions."
  } finally {
    isLoading.value = false
  }
}

/* ---------------------------------
   DELETE
---------------------------------- */
const deletePermission = async (id: number) => {
  if (!confirm("Delete this permission?")) return

  try {
    const token = getCookie("accessToken")
    await axios.delete(`${apiBaseUrl}/permissions/${id}`, {
      headers: {
        Authorization: `Bearer ${decodeURIComponent(token!)}`,
      },
    })

    permissions.value = permissions.value.filter(p => p.id !== id)
  } catch (error: any) {
    alert(error.response?.data?.message || "Delete failed.")
  }
}

/* ---------------------------------
   INIT
---------------------------------- */
onMounted(fetchPermissions)
</script>
