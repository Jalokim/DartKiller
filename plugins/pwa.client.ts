import { useRegisterSW } from 'virtual:pwa-register/vue'

export default defineNuxtPlugin(() => {
  useRegisterSW({ immediate: true })
}) 