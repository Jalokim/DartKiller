<template>
  <div class="safe-area-wrapper">
    <slot />
  </div>
</template>

<style scoped>
.safe-area-wrapper {
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
</style>
