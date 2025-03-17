<template>
  <div>
    <!-- Number buttons grid -->
    <div class="grid grid-cols-5 gap-2 flex-grow">
      <!-- Regular numbers 1-20 -->
      <button
        v-for="num in 20"
        :key="num"
        class="bg-slate-200 hover:bg-slate-300 py-3 rounded-lg text-base md:text-xl font-bold shadow-sm transition-colors touch-manipulation"
        @click="$emit('add-score', num * multiplier)"
        :disabled="disabled"
      >
        {{ num }}
      </button>
    </div>

    <!-- Special buttons row -->
    <div class="grid grid-cols-5 gap-2 mt-2" v-if="showSpecialButtons">
      <button
        class="bg-slate-200 hover:bg-slate-300 py-3 rounded-lg text-base md:text-xl font-bold shadow-sm transition-colors touch-manipulation"
        @click="$emit('add-score', 0)"
      >
        0
      </button>
      <button
        class="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-base md:text-xl font-bold shadow-sm transition-colors touch-manipulation"
        @click="$emit('add-score', 25 * (multiplier === 2 ? 2 : 1))"
        :disabled="multiplier === 3"
        :class="{
          'opacity-50 cursor-not-allowed': multiplier === 3,
        }"
      >
        25
      </button>
      <button
        class="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-base md:text-xl font-bold shadow-sm transition-colors touch-manipulation"
        @click="$emit('add-score', 50)"
        :disabled="multiplier > 1"
        :class="{
          'opacity-50 cursor-not-allowed': multiplier > 1,
        }"
      >
        50
      </button>
      <button
        class="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-base md:text-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-1 touch-manipulation"
        @click="$emit('add-crown-score')"
        :disabled="currentScoreIndex > 0 || multiplier > 1"
        :class="{
          'opacity-50 cursor-not-allowed':
            currentScoreIndex > 0 || multiplier > 1,
        }"
      >
        <Icon name="ph:crown-fill" class="text-white" />
      </button>
      <button
        class="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-base md:text-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-1 touch-manipulation"
        @click="$emit('lose-life')"
      >
        <Icon name="ph:skull-fill" class="text-white" />
      </button>
    </div>

    <!-- Double and Triple buttons -->
    <div class="grid grid-cols-2 gap-2 mt-2" v-if="showMultipliers">
      <button
        @click="$emit('toggle-multiplier', 2)"
        class="bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-base font-semibold shadow-sm transition-colors touch-manipulation"
        :class="{
          'ring-4 ring-amber-300 bg-amber-600 font-bold': multiplier === 2,
          relative: multiplier === 2,
        }"
      >
        Double
        <div
          v-if="multiplier === 2"
          class="absolute top-0 right-0 w-3 h-3 bg-white rounded-full -mt-1 -mr-1"
        ></div>
      </button>
      <button
        @click="$emit('toggle-multiplier', 3)"
        class="bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-lg text-base font-semibold shadow-sm transition-colors touch-manipulation"
        :class="{
          'ring-4 ring-rose-300 bg-rose-600 font-bold': multiplier === 3,
          relative: multiplier === 3,
        }"
      >
        Triple
        <div
          v-if="multiplier === 3"
          class="absolute top-0 right-0 w-3 h-3 bg-white rounded-full -mt-1 -mr-1"
        ></div>
      </button>
    </div>

    <!-- Undo button (separate from special buttons) -->
    <div class="mt-2" v-if="showUndoButton">
      <button
        @click="$emit('undo')"
        class="bg-amber-500 hover:bg-amber-600 text-white w-full py-3 rounded-lg text-base font-bold shadow-sm transition-colors touch-manipulation flex items-center justify-center gap-1"
        :disabled="!canUndo"
        :class="{ 'opacity-50 cursor-not-allowed': !canUndo }"
      >
        <Icon name="ph:arrow-left" class="w-5 h-5" />
        Undo
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  multiplier: {
    type: Number,
    default: 1,
  },
  currentScoreIndex: {
    type: Number,
    default: 0,
  },
  canUndo: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showSpecialButtons: {
    type: Boolean,
    default: true,
  },
  showMultipliers: {
    type: Boolean,
    default: true,
  },
  showUndoButton: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "add-score",
  "add-crown-score",
  "undo",
  "lose-life",
  "toggle-multiplier",
]);
</script>
