<template>
  <div class="flex flex-col min-h-screen bg-slate-50 pb-6 overflow-hidden">
    <div class="bg-emerald-800 text-white mb-6 p-6">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/"
            class="text-white opacity-70 hover:opacity-100 mr-2"
            title="Back to Home"
          >
            <Icon name="ph:arrow-left" class="w-5 h-5" />
          </NuxtLink>
          <h1 class="text-2xl font-bold">Roulette</h1>
        </div>
        <button
          @click="showInstructions = true"
          class="opacity-40 hover:opacity-100 inline-flex items-center gap-2 border border-white rounded-md p-2"
        >
          <Icon name="ph:info" class="w-6 h-6" /> How to Play
        </button>
      </div>
    </div>

    <!-- Instructions Modal -->
    <div
      v-if="showInstructions"
      @click="showInstructions = false"
      class="fixed inset-0 z-50 bg-emerald-800"
    >
      <div class="flex flex-col p-6 overflow-auto h-full">
        <h2 class="text-white text-3xl font-bold mb-6 pt-10">How to Play</h2>
        <div class="bg-white rounded-lg p-4 w-full max-w-lg">
          <div class="space-y-3 text-gray-700">
            <p>
              <strong>Setup:</strong> Select a target score (default is 101) and
              add players.
            </p>
            <p>
              <strong>Gameplay:</strong> Each turn, the dartboard spins to give
              three random target numbers.
            </p>
            <p>
              <strong>Scoring:</strong> Players try to hit the target numbers
              with their own throws. For each matched number, they earn points
              equal to that number.
            </p>
            <p>
              <strong>Perfect Match:</strong> If a player matches all three
              target numbers exactly, they earn double points!
            </p>
            <p>
              <strong>Winning:</strong> First player to reach or exceed the
              target score wins.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-md mx-auto w-full p-4 flex flex-col">
      <!-- Game settings -->
      <div class="mb-4">
        <h2 class="text-xl font-semibold mb-3">Game Settings</h2>

        <div class="bg-white p-3 rounded-lg shadow-sm mb-4">
          <div class="flex items-center">
            <div class="flex items-center">
              <button
                @click="decrementTarget"
                class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-l-md flex items-center justify-center"
                :disabled="targetScore <= 1"
                :class="{ 'opacity-50 cursor-not-allowed': targetScore <= 1 }"
              >
                <Icon name="ph:minus" class="w-4 h-4" />
              </button>
              <input
                id="targetScore"
                v-model="targetScore"
                type="number"
                min="1"
                class="w-16 h-8 text-center border-y border-gray-300 focus:outline-none"
              />
              <button
                @click="incrementTarget"
                class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-r-md flex items-center justify-center"
              >
                <Icon name="ph:plus" class="w-4 h-4" />
              </button>
            </div>
            <div class="ml-4">
              <label
                for="targetScore"
                class="block text-xs font-medium text-gray-700 mb-1"
              >
                Target Score
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Player management -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-3">
          Players ({{ players.length }})
        </h2>
        <!-- Add player input -->
        <div class="flex gap-2 mb-2">
          <input
            id="playerName"
            v-model="newPlayerName"
            type="text"
            class="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            placeholder="Enter player name"
            @keyup.enter="addPlayer"
          />
          <button
            @click="addPlayer"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors text-sm"
            :disabled="!newPlayerName.trim()"
            :class="{
              'opacity-50 cursor-not-allowed': !newPlayerName.trim(),
            }"
          >
            Add
          </button>
        </div>
        <p v-if="errorMessage" class="text-xs text-rose-600">
          {{ errorMessage }}
        </p>
        <!-- Player list -->
        <div v-if="players.length > 0" class="mb-4 space-y-2">
          <div
            v-for="(player, index) in players"
            :key="index"
            class="flex items-center bg-white p-2 rounded-lg shadow-sm"
          >
            <div class="flex-grow font-medium text-sm">{{ player.name }}</div>
            <button
              @click="removePlayer(index)"
              class="text-rose-500 hover:text-rose-700 p-1"
            >
              <Icon name="ph:trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Start game button -->
      <div>
        <button
          @click="startGame"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-lg font-bold shadow-sm transition-colors touch-manipulation"
          :disabled="players.length < 2"
          :class="{ 'opacity-50 cursor-not-allowed': players.length < 2 }"
        >
          Start Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const players = ref([]);
const newPlayerName = ref("");
const errorMessage = ref("");
const targetScore = ref(101);
const showInstructions = ref(false);

// Increment target score
function incrementTarget() {
  targetScore.value = parseInt(targetScore.value) + 1;
}

// Decrement target score
function decrementTarget() {
  if (targetScore.value > 1) {
    targetScore.value = parseInt(targetScore.value) - 1;
  }
}

// Load saved players from localStorage
onMounted(() => {
  // Load saved target score if available
  const savedTargetScore = localStorage.getItem("rouletteTargetScore");
  if (savedTargetScore) {
    targetScore.value = parseInt(savedTargetScore);
  }

  // Load saved player names
  const savedPlayers = localStorage.getItem("killerPlayerNames");
  if (savedPlayers) {
    const playerNames = JSON.parse(savedPlayers);
    // Create player objects from saved names
    players.value = playerNames.map((name) => ({
      name,
      score: 0,
    }));
  }
});

// Add a new player
function addPlayer() {
  const name = newPlayerName.value.trim();

  if (!name) {
    errorMessage.value = "Please enter a player name";
    return;
  }

  // Check for duplicate names
  if (
    players.value.some(
      (player) => player.name.toLowerCase() === name.toLowerCase()
    )
  ) {
    errorMessage.value = "Player name already exists";
    return;
  }

  // Add the player
  players.value.push({
    name,
    score: 0,
  });
  newPlayerName.value = "";
  errorMessage.value = "";

  // Save player names to localStorage
  savePlayerNames();
}

// Remove a player
function removePlayer(index) {
  players.value.splice(index, 1);

  // Save updated player list to localStorage
  savePlayerNames();
}

// Save player names to localStorage
function savePlayerNames() {
  const playerNames = players.value.map((player) => player.name);
  localStorage.setItem("killerPlayerNames", JSON.stringify(playerNames));
}

// Start the game
function startGame() {
  if (players.value.length < 2) {
    return;
  }

  // Save target score
  localStorage.setItem("rouletteTargetScore", targetScore.value.toString());

  // Save player names
  savePlayerNames();

  // Navigate to the roulette game page
  router.push("/roulette");
}
</script>
