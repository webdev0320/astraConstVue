<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// ... your headers/colors omitted for brevity

const search = ref('')
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref<string | undefined>()
const orderBy = ref<'asc' | 'desc' | undefined>()

const updateOptions = (options: any) => {
  sortBy.value  = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

// A tiny helper to normalize different API shapes
function normalizePermissions(payload: any) {
  if (!payload) return { items: [], total: 0 }

  // Option A: { permissions: [], totalPermissions: n }
  if (Array.isArray(payload.permissions)) {
    return {
      items: payload.permissions,
      total: Number(payload.totalPermissions ?? payload.permissions.length),
    }
  }

  // Option B (Laravel paginator): { data: [], total: n } or { data: [], meta:{ total:n } }
  if (Array.isArray(payload.data)) {
    return {
      items: payload.data,
      total: Number(payload.total ?? payload.meta?.total ?? payload.data.length),
    }
  }

  return { items: [], total: 0 }
}

// Build URL with current filters
const buildUrl = () =>
  createUrl('/permissions', {
    query: {
      q: search.value || undefined,
      itemsPerPage: itemsPerPage.value,
      page: page.value,
      sortBy: sortBy.value || undefined,
      orderBy: orderBy.value || undefined,
    },
  })

// Fetch
const { data: permissionsData, error, refresh, pending } = await useApi(buildUrl, {
  immediate: true,
})

// Re-fetch when filters change
watch([search, itemsPerPage, page, sortBy, orderBy], () => {
  refresh()
})

// Safe computed (no null reads)
const table = computed(() => normalizePermissions(permissionsData.value))
const permissions = computed(() => table.value.items)
const totalPermissions = computed(() => table.value.total)

// Dialogs
const isPermissionDialogVisible = ref(false)
const isAddPermissionDialogVisible = ref(false)
const permissionName = ref('')

const editPermission = (name: string) => {
  isPermissionDialogVisible.value = true
  permissionName.value = name
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <!-- top bar omitted -->

        <VDataTableServer
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :items-length="totalPermissions"
          :headers="headers"
          :items="permissions"
          item-value="name"
          class="text-no-wrap"
          @update:options="updateOptions"
        >
          <template #no-data>
            <div class="text-center pa-6">
              <div v-if="error">Failed to load permissions ({{ error?.statusCode || '' }}). Please try again.</div>
              <div v-else-if="pending">Loading…</div>
              <div v-else>No permissions found.</div>
            </div>
          </template>

          <!-- your slots (name, assignedTo, actions, bottom) stay the same -->
        </VDataTableServer>
      </VCard>

      <AddEditPermissionDialog
        v-model:isDialogVisible="isPermissionDialogVisible"
        v-model:permission-name="permissionName"
      />
      <AddEditPermissionDialog v-model:isDialogVisible="isAddPermissionDialogVisible" />
    </VCol>
  </VRow>
</template>
