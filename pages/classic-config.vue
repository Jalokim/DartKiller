<template>
  <div class="flex flex-col min-h-screen bg-slate-50 pb-6">
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
          <h1 class="text-2xl font-bold">Classic</h1>
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
              <strong>Setup:</strong> Each player starts with the selected score
              (101-1001).
            </p>
            <p>
              <strong>Gameplay:</strong> Players take turns throwing three
              darts, aiming to reduce their score to exactly zero.
            </p>
            <div>
              <strong>Scoring:</strong>
              <ul class="list-disc ml-4 mt-1">
                <li>Use the number grid to enter scores</li>
                <li>Double and Triple buttons multiply your next hit</li>
                <li>Crown button is a shortcut for the sequence 5-20-1</li>
                <li>You get three throws per turn</li>
              </ul>
            </div>
            <p>
              <strong>Double Out Rule:</strong> Players must hit a double to
              finish the game (reduce score to exactly zero).
            </p>
            <p>
              <strong>Busting:</strong> If a player scores more than their
              remaining points or would reduce their score to 1, they "bust" and
              their turn ends without scoring.
            </p>
            <p>
              <strong>Winning:</strong> First player to reach exactly zero with
              a double wins!
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
          <label
            for="startScore"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Starting Score
          </label>
          <select
            id="startScore"
            v-model="startScore"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option
              v-for="score in availableScores"
              :key="score"
              :value="score"
            >
              {{ score }}
            </option>
          </select>
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
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-lg font-bold shadow-sm transition-colors touch-manipulation"
          :disabled="players.length < 1"
          :class="{ 'opacity-50 cursor-not-allowed': players.length < 1 }"
        >
          Start Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const players = ref([]);
const newPlayerName = ref("");
const errorMessage = ref("");
const startScore = ref(501);
const showInstructions = ref(false);

// Available starting scores
const availableScores = computed(() => {
  return [101, 201, 301, 401, 501, 601, 701, 801, 901, 1001];
});

// Load saved players and starting score from localStorage
onMounted(() => {
  // Load saved starting score
  const savedStartScore = localStorage.getItem("classicStartScore");
  if (savedStartScore) {
    startScore.value = parseInt(savedStartScore);
  }

  // Load saved player names
  const savedPlayers = localStorage.getItem("classicPlayerNames");
  if (savedPlayers) {
    const playerNames = JSON.parse(savedPlayers);
    // Create player objects from saved names
    players.value = playerNames.map((name) => ({
      name,
      score: startScore.value,
      history: [],
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

  // Add the player with the specified score
  players.value.push({
    name,
    score: startScore.value,
    history: [],
  });

  // Clear the input and error message
  newPlayerName.value = "";
  errorMessage.value = "";
}

// Remove a player
function removePlayer(index) {
  players.value.splice(index, 1);
}

// Start the game
function startGame() {
  if (players.value.length === 0) {
    errorMessage.value = "Please add at least one player";
    return;
  }

  // Save game settings to localStorage
  localStorage.setItem("classicStartScore", startScore.value.toString());
  localStorage.setItem(
    "classicPlayerNames",
    JSON.stringify(players.value.map((player) => player.name))
  );

  // Prepare game state
  const gameState = {
    players: players.value.map((player) => ({
      name: player.name,
      score: startScore.value,
      history: [],
    })),
    currentPlayerIndex: 0,
    gameFinished: false,
  };

  // Save game state to localStorage
  localStorage.setItem("classicGameState", JSON.stringify(gameState));

  // Navigate to the game page
  router.push("/classic");
}
</script>
