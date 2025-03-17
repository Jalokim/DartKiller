<template>
  <div class="flex flex-col min-h-screen bg-slate-50">
    <div class="bg-emerald-800 text-white p-6">
      <div class="gap-2">
        <h1 class="text-2xl text-center font-bold">Dart Games</h1>
      </div>
    </div>

    <!-- PWA installation message (only shown when not installed as PWA) -->
    <div
      v-if="!isAppInstalled"
      class="bg-amber-100 p-4 border-b border-amber-200"
    >
      <div class="max-w-md mx-auto">
        <div class="flex items-center mb-1">
          <Icon name="ph:device-mobile" class="text-amber-600 text-xl mr-2" />
          <span class="font-bold text-amber-800">Install as App</span>
        </div>
        <p class="text-sm text-amber-700">
          Tap the share icon and select "Add to Home Screen"
        </p>
      </div>
    </div>

    <div class="flex-grow flex flex-col items-center justify-center p-6">
      <div class="max-w-md w-full space-y-6">
        <button
          @click="navigateToKiller"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-lg text-xl font-bold shadow-md transition-colors touch-manipulation"
        >
          Killer Game
        </button>

        <button
          @click="navigateToRoulette"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-lg text-xl font-bold shadow-md transition-colors touch-manipulation"
        >
          Roulette Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";

const router = useRouter();
const isAppInstalled = ref(false);

function navigateToKiller() {
  router.push("/killer-config");
}

function navigateToRoulette() {
  router.push("/roulette-config");
}

onMounted(() => {
  // Check if the app is running as an installed PWA
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  isAppInstalled.value = isStandalone;

  // Also listen for display mode changes
  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", (evt) => {
      isAppInstalled.value = evt.matches;
    });
});
</script>

<style>
/* Global styles to prevent zooming on mobile */
button {
  touch-action: manipulation;
}
</style>
