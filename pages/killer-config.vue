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
          <h1 class="text-2xl font-bold">Killer</h1>
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
              <strong>Setup:</strong> Each player starts with the selected
              number of lives (1-5).
            </p>
            <p>
              <strong>First Round:</strong> First player must score 21 or higher
              to stay alive.
            </p>
            <p>
              <strong>Subsequent Rounds:</strong> Players must beat the previous
              player's score by at least 1 point. If a player scores less (or
              equal) than the target they lose a life. Next player starts at 21.
            </p>
            <div>
              <strong>Scoring:</strong>
              <ul class="list-disc ml-4 mt-1">
                <li>Use the number grid to enter scores</li>
                <li>Double and Triple buttons multiply your next hit</li>
                <li>Crown button is a shortcut for the sequence 5-20-1</li>
                <li>Skull button instantly loses a life (skip scoring)</li>
                <li>You get three throws per turn</li>
              </ul>
            </div>
            <p>
              <strong>Losing Lives:</strong> Miss your target score and lose a
              life. When all lives are lost, you're out!
            </p>
            <p><strong>Winning:</strong> Last player standing wins the game.</p>
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
                @click="decrementLives"
                class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-l-md flex items-center justify-center"
                :disabled="livesCount <= 1"
                :class="{ 'opacity-50 cursor-not-allowed': livesCount <= 1 }"
              >
                <Icon name="ph:minus" class="w-4 h-4" />
              </button>
              <input
                id="livesCount"
                v-model="livesCount"
                type="text"
                readonly
                class="w-10 h-8 text-center border-y border-gray-300 focus:outline-none"
              />
              <button
                @click="incrementLives"
                class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-r-md flex items-center justify-center"
                :disabled="livesCount >= 5"
                :class="{ 'opacity-50 cursor-not-allowed': livesCount >= 5 }"
              >
                <Icon name="ph:plus" class="w-4 h-4" />
              </button>
            </div>
            <div class="ml-4">
              <label
                for="livesCount"
                class="block text-xs font-medium text-gray-700 mb-1"
              >
                Number of Lives
              </label>
              <Icon
                v-for="life in livesCount"
                :key="life"
                name="ph:heart-fill"
                class="w-5 h-5 text-red-400 inline-block"
              />
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
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-lg font-bold shadow-sm transition-colors touch-manipulation"
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
const livesCount = ref(3);
const showInstructions = ref(false);

// Increment lives count
function incrementLives() {
  if (livesCount.value < 5) {
    livesCount.value++;
  }
}

// Decrement lives count
function decrementLives() {
  if (livesCount.value > 1) {
    livesCount.value--;
  }
}

// Load saved players and lives count from localStorage
onMounted(() => {
  // Load saved lives count
  const savedLivesCount = localStorage.getItem("killerLivesCount");
  if (savedLivesCount) {
    livesCount.value = parseInt(savedLivesCount);
  }

  // Load saved player names
  const savedPlayers = localStorage.getItem("killerPlayerNames");
  if (savedPlayers) {
    const playerNames = JSON.parse(savedPlayers);
    // Create player objects from saved names
    players.value = playerNames.map((name) => ({
      name,
      lives: livesCount.value,
      targetScore: null,
      currentScore: 0,
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

  // Add the player with the specified number of lives and no target score yet
  players.value.push({
    name,
    lives: livesCount.value,
    targetScore: null,
    currentScore: 0,
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

  // Save current lives count to localStorage
  localStorage.setItem("killerLivesCount", livesCount.value.toString());

  // Update all players to have the current lives count
  players.value.forEach((player) => {
    player.lives = livesCount.value;
  });

  // Shuffle the players array
  const shuffledPlayers = [...players.value];
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlayers[i], shuffledPlayers[j]] = [
      shuffledPlayers[j],
      shuffledPlayers[i],
    ];
  }

  // Store shuffled players in localStorage for the game page
  localStorage.setItem("dartPlayers", JSON.stringify(shuffledPlayers));

  // Navigate to the game page
  router.push("/game");
}
</script>
