<template>
  <div
    class="h-1/3 bg-emerald-800 text-white p-4 flex flex-col justify-center items-center shadow-md"
  >
    <h1 class="text-xl font-bold mb-1">{{ currentPlayer.name }}</h1>
    <div class="text-4xl font-bold">{{ totalScore }}</div>

    <!-- Brackets for individual scores -->
    <div class="flex gap-4 mt-3 text-xl">
      <div
        class="w-10 h-10 border-2 border-white rounded-md flex items-center justify-center"
      >
        {{ scores[0] || "" }}
      </div>
      <div
        class="w-10 h-10 border-2 border-white rounded-md flex items-center justify-center"
      >
        {{ scores[1] || "" }}
      </div>
      <div
        class="w-10 h-10 border-2 border-white rounded-md flex items-center justify-center"
      >
        {{ scores[2] || "" }}
      </div>
    </div>

    <!-- Player scores -->
    <div class="mt-4 w-full max-w-xs">
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="(player, index) in players"
          :key="index"
          class="bg-emerald-700 px-2 py-1 rounded-md flex justify-between items-center"
          :class="{ 'ring-2 ring-white': currentPlayer.name === player.name }"
        >
          <span class="font-medium truncate text-sm">{{ player.name }}</span>
          <span class="font-bold text-sm">{{ player.score }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  scores: {
    type: Array,
    required: true,
  },
  totalScore: {
    type: Number,
    required: true,
  },
  currentPlayer: {
    type: Object,
    required: true,
  },
  players: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>
