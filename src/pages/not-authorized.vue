<script setup>
definePage({
  alias: '/pages/misc/not-authorized',
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="401"
      title="You are not authorized! 🔐"
      description="You don’t have permission to access this page. Go Home!."
    />

    <VBtn
      class="mb-11"
      to="/"
    >
      Back To Home
    </VBtn>

    <!-- Image removed -->
    <div class="misc-avatar w-100 text-center">
      <!-- Placeholder or leave empty -->
    </div>

    <!-- Footer image removed -->
    <!-- <img class="misc-footer-img d-none d-md-block" alt="misc-footer-img" height="320"> -->
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
