<!-- Login.vue -->
<script setup>
import { useAbility } from '@casl/vue'
import { themeConfig } from '@themeConfig'
import { nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VForm } from 'vuetify/components/VForm'

definePage({
  meta: { layout: 'blank', unauthenticatedOnly: true },
})

const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()
const ability = useAbility()

const errors = ref({
  email: undefined,
  password: undefined,
  otp_verified: undefined,
})

const refVForm = ref()
const credentials = ref({ email: '', password: '' })
const rememberMe = ref(false)
const isSubmitting = ref(false)

const login = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const res = await $api('https://dm.kreashionsoftwarehouse.com/astraConst/public/api/login', {
      method: 'POST',
      body: {
        email: credentials.value.email,
        password: credentials.value.password,
      },
      onResponseError({ response }) {
        if (response._data?.errors) {
          errors.value = {}
          for (const [key, messages] of Object.entries(response._data.errors)) {
            if (messages == 'Invalid credentials') {
              errors.value['email'] = Array.isArray(messages) ? messages.join(', ') : messages
            } else {
              errors.value[key] = Array.isArray(messages) ? messages.join(', ') : messages
            }
          }
        }
      },
    })

    const { access_token, user, roles } = res
    useCookie('userAbilityRules').value = roles
    ability.update(roles)
    useCookie('userData').value = user
    useCookie('accessToken').value = access_token

    await nextTick(() => router.replace('/dashboards/crm'))
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) login()
  })
}
</script>

<template>
  <!-- Full-screen, centered -->
  <div class="login-bg d-flex align-center justify-center">
    <VContainer class="py-8" fluid>
      <VRow no-gutters class="d-flex align-center justify-center">
        <VCol cols="12" sm="9" md="6" lg="5" xl="4">
          <!-- Main Card -->
          <VCard elevation="10" rounded="xl" class="pa-2">
            <!-- Header -->
            <VCardItem class="text-center pt-6 pb-2">
              <div class="d-flex flex-column align-center w-100">
                <VAvatar size="64" variant="tonal" class="mb-3">
                  <VImg src="/logo/astra-logo.png" alt="Astra Logo" />
                </VAvatar>
                <VCardTitle class="text-h5 font-weight-bold mb-1">
                  Welcome to <span class="text-capitalize">{{ themeConfig.app.title }}</span>
                </VCardTitle>
                <VCardSubtitle class="text-medium-emphasis">
                  Please sign in to your account and start the adventure
                </VCardSubtitle>
              </div>
            </VCardItem>

            <VDivider class="my-4" />

            <!-- Form -->
            <VCardText class="pt-0">
              <VForm ref="refVForm" @submit.prevent="onSubmit">
                <VRow>
                  <VCol cols="12" v-if="errors.otp_verified">
                    <VAlert type="error" variant="tonal" density="compact" class="mb-3">
                      {{ errors.otp_verified }}
                    </VAlert>
                  </VCol>

                  <VCol cols="12">
                    <AppTextField
                      v-model="credentials.email"
                      label="Email"
                      placeholder="email@example.com"
                      type="email"
                      autofocus
                      :rules="[requiredValidator]"
                      :error-messages="errors.email"
                    />
                  </VCol>

                  <VCol cols="12">
                    <AppTextField
                      v-model="credentials.password"
                      label="Password"
                      placeholder="············"
                      :rules="[requiredValidator]"
                      :type="isPasswordVisible ? 'text' : 'password'"
                      :error-messages="errors.password"
                      :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                      @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    />
                  </VCol>

                  <VCol cols="12" class="d-flex align-center justify-space-between">
                    <VCheckbox v-model="rememberMe" density="comfortable" label="Remember me" />
                    <RouterLink class="text-primary ms-2" :to="{ name: 'forgot-password' }">
                      Forgot Password?
                    </RouterLink>
                  </VCol>

                  <VCol cols="12" class="pt-1">
                    <VBtn
                      block
                      type="submit"
                      size="large"
                      :loading="isSubmitting"
                      class="text-none"
                    >
                      Login
                    </VBtn>
                  </VCol>

                  <VCol cols="12" class="text-center pt-1">
                    <small>New on our platform?</small>
                    <RouterLink class="text-primary ms-1" :to="{ name: 'register' }">
                      Create an account
                    </RouterLink>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>

          <!-- Small footer badge -->
          <div class="text-center mt-4">
            <span class="text-disabled text-caption">
              © {{ new Date().getFullYear() }} Astra Construction — All rights reserved
            </span>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

// Background: soft gradient + subtle pattern
.login-bg {
  background:
    radial-gradient(1200px 500px at 10% 10%, rgba(0, 0, 0, 4%), transparent 60%),
    linear-gradient(180deg, rgba(0, 0, 0, 2%), transparent 35%),
    var(--v-theme-surface);
  min-block-size: 100vh;
}

// Card polish
.v-card {
  backdrop-filter: saturate(1.1) blur(0.5px);
}

.v-avatar {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  background-color: rgb(var(--v-theme-primary), 0.08) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 5%);
}
</style>
