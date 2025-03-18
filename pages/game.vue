<template>
  <div class="flex flex-col bg-emerald-800">
    <!-- Current player and score area -->
    <div class="bg-emerald-800 text-white flex flex-col items-center">
      <!-- Player name with hearts and back button -->
      <div class="flex items-center gap-2 mb-4 w-full p-4">
        <button
          @click="backToHome"
          class="text-white opacity-70 hover:opacity-100 mr-2"
          title="Back to Home"
        >
          <Icon name="ph:arrow-left" class="w-5 h-5" />
        </button>
        <h1 class="text-xl font-bold flex-grow">{{ currentPlayer.name }}</h1>
        <div class="flex gap-1">
          <Icon
            v-for="life in currentPlayer.lives"
            :key="life"
            name="ph:heart-fill"
            class="w-5 h-5 text-red-400"
          />
        </div>
      </div>

      <!-- Target and Current score in two columns -->
      <div class="grid grid-cols-5 gap-6 w-full">
        <!-- Target to beat -->
        <div class="text-center col-span-2">
          <div class="text-base">Target to beat</div>
          <div class="text-2xl font-bold">{{ targetToReach }}</div>
        </div>

        <div class="text-center col-span-1 flex justify-center items-center">
          <button
            @click="showPlayerOrderOverlay = true"
            class="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center transition-colors"
            title="Show player order"
          >
            <Icon name="ph:caret-down-bold" class="w-4 h-4 text-white" />
          </button>
        </div>
        <!-- Current score -->
        <div class="text-center col-span-2">
          <div class="text-base">Current score</div>
          <div class="text-3xl font-bold">{{ currentScore }}</div>
        </div>
      </div>

      <!-- Next player indicator -->
      <div
        class="w-full mt-4 -mx-10 py-1 px-4 bg-emerald-900 text-sm flex items-center"
      >
        <span class="opacity-80">Next:</span>
        <span class="font-medium ml-2">{{ nextPlayer.name }}</span>
        <div class="ml-auto flex gap-1">
          <Icon
            v-for="life in nextPlayer.lives"
            :key="life"
            name="ph:heart-fill"
            class="w-4 h-4 text-emerald-600 opacity-70"
          />
        </div>
      </div>
    </div>

    <!-- Controls area -->
    <div class="flex-grow p-3 flex flex-col bg-white">
      <!-- Score brackets and undo button -->
      <div class="flex gap-4 justify-center mb-4 items-center">
        <div
          v-for="(score, index) in scores"
          :key="index"
          class="w-14 h-14 border-2 border-emerald-600 rounded-md flex items-center justify-center text-xl font-bold bg-white"
        >
          {{ score === null ? "" : score }}
        </div>

        <!-- Smart undo button that handles both bracket and turn undo -->
        <button
          @click="smartUndo"
          class="bg-amber-500 hover:bg-amber-600 text-white h-10 px-3 rounded-lg text-base font-bold shadow-sm transition-colors touch-manipulation flex items-center justify-center gap-1"
          :disabled="!canUndo"
          :class="{ 'opacity-50 cursor-not-allowed': !canUndo }"
          :title="undoButtonTitle"
        >
          <Icon name="ph:arrow-left" class="w-5 h-5" />
          Undo
        </button>
      </div>

      <!-- Using the GameButtons component -->
      <GameButtons
        :multiplier="multiplier"
        :current-score-index="scores.filter((score) => score !== null).length"
        @add-score="addScore"
        @add-crown-score="addCrownScore"
        @lose-life="loseLifeInstantly"
        @toggle-multiplier="toggleMultiplier"
      />
    </div>

    <!-- Heart loss animation -->
    <div
      v-if="showHeartLossAnimation"
      class="fixed inset-0 z-40 pointer-events-none"
      :class="{
        'animate-heart-loss-bg bg-red-600':
          showHeartLossAnimation && !isLastLife,
        'animate-death-bg bg-black': showHeartLossAnimation && isLastLife,
      }"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <!-- Death animation with skull -->
        <div v-if="isLastLife" class="relative">
          <Icon
            name="ph:skull-fill"
            class="text-white text-[36vw] animate-skull-pulse"
          />
        </div>

        <!-- Heart loss animation with broken heart -->
        <div v-else class="relative">
          <Icon
            name="ph:heart-break-fill"
            class="text-white text-[36vw] animate-heart-pulse"
          />
        </div>
      </div>
    </div>

    <!-- Player order overlay -->
    <div
      v-if="showPlayerOrderOverlay"
      class="fixed inset-0 z-50 bg-emerald-800 animate-player-order-overlay"
    >
      <div
        class="absolute inset-0 flex flex-col items-center justify-center p-6"
      >
        <h2 class="text-white text-3xl font-bold mb-6">Player Order</h2>
        <div class="bg-white rounded-lg p-4 w-full max-w-sm">
          <div
            v-for="(player, index) in players"
            :key="player.name"
            class="flex items-center py-2 border-b last:border-b-0 border-gray-200"
          >
            <div
              class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mr-3"
            >
              {{ index + 1 }}
            </div>
            <div class="font-medium">{{ player.name }}</div>
            <div class="ml-auto flex">
              <Icon
                v-for="life in player.lives"
                :key="life"
                name="ph:heart-fill"
                class="w-5 h-5 text-red-400"
              />
            </div>
          </div>

          <!-- OK button to dismiss overlay -->
          <div class="mt-4 flex justify-center">
            <button
              @click="dismissPlayerOrderOverlay"
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg font-bold shadow-sm transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Game over modal -->
    <div
      v-if="gameOver"
      class="fixed inset-0 bg-emerald-800 bg-opacity-90 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm w-full relative">
        <h2 class="text-xl font-bold mb-4 text-center">Game Over!</h2>
        <p class="text-lg text-center mb-6">{{ winner.name }} wins!</p>
        <div class="flex justify-center gap-4">
          <button
            @click="backToHome"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold"
          >
            Back to Home
          </button>
          <button
            @click="restartGame"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold"
          >
            Restart Game
          </button>
        </div>
      </div>
      <div
        class="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
      >
        <ConfettiExplosion
          :particleCount="130"
          :particleSize="30"
          :force="0.5"
          :duration="3000"
          :stageWidth="440"
          :stageHeight="1000"
          :shouldDestroyAfterDone="false"
          :colors="[
            '#26a69a',
            '#00897b',
            '#00796b',
            '#00695c',
            '#004d40',
            '#ffffff',
            '#e0f2f1',
            '#b2dfdb',
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import ConfettiExplosion from "vue-confetti-explosion";
import { useScoreSpeech } from "../composables/useScoreSpeech";
import GameButtons from "../components/GameButtons.vue";

const router = useRouter();

// Initialize the speech composable
const { speak, speakScore } = useScoreSpeech();

// Array of insults for when a player doesn't reach target score is now in the composable

const players = ref([]);
const currentPlayerIndex = ref(0);
const scores = ref([null, null, null]);
const gameOver = ref(false);
const winner = ref(null);
const multiplier = ref(1);
const previousPlayerLostLife = ref(false);
const originalPlayers = ref([]); // Store original players for restart
const showHeartLossAnimation = ref(false);
const isLastLife = ref(false);
const turnHistory = ref([]); // Store history of turns for undo functionality
const showPlayerOrderOverlay = ref(false);

// Calculate current score from brackets
const currentScore = computed(() => {
  return scores.value.reduce((total, score) => total + (score || 0), 0);
});

// Get current player
const currentPlayer = computed(() => {
  return (
    players.value[currentPlayerIndex.value] || {
      name: "Player",
      lives: 3,
      targetScore: null,
      currentScore: 0,
    }
  );
});

// Get next player
const nextPlayer = computed(() => {
  if (players.value.length < 2) return { name: "None", lives: 0 };

  const nextIndex = (currentPlayerIndex.value + 1) % players.value.length;
  return players.value[nextIndex];
});

// Get previous player
const previousPlayer = computed(() => {
  if (players.value.length < 2) return null;

  const prevIndex =
    currentPlayerIndex.value === 0
      ? players.value.length - 1
      : currentPlayerIndex.value - 1;

  return players.value[prevIndex];
});

// Calculate target score to beat
const targetToReach = computed(() => {
  if (previousPlayerLostLife.value) {
    return 21;
  } else if (previousPlayer.value?.targetScore) {
    // Target is 1 more than the previous player's score
    return previousPlayer.value.targetScore + 1;
  } else {
    return 21;
  }
});

// Check if score can be confirmed
const canConfirmScore = computed(() => {
  // Need at least one score to confirm (including 0)
  return scores.value.some((score) => score !== null);
});

// Check if there's any score to clear
const hasAnyScore = computed(() => {
  return scores.value.some((score) => score !== null);
});

// Check if any undo action is available
const canUndo = computed(() => {
  return hasAnyScore.value || turnHistory.value.length > 0;
});

// Dynamic undo button title
const undoButtonTitle = computed(() => {
  if (hasAnyScore.value) {
    return "Undo last score";
  } else if (turnHistory.value.length > 0) {
    const lastTurn = turnHistory.value[turnHistory.value.length - 1];
    return `Undo last turn (${lastTurn.playerName}: ${lastTurn.score})`;
  }
  return "Nothing to undo";
});

// Load players from localStorage
onMounted(() => {
  const savedPlayers = localStorage.getItem("dartPlayers");

  if (savedPlayers) {
    const parsedPlayers = JSON.parse(savedPlayers);
    players.value = parsedPlayers;
    // Store a deep copy of the original players
    originalPlayers.value = JSON.parse(JSON.stringify(parsedPlayers));

    // Shuffle players when starting a new game
    shufflePlayers();

    // Set previousPlayerLostLife to true if this is a new game
    // This ensures the first player needs to score at least 21
    previousPlayerLostLife.value = true;

    // Show player order overlay when game starts
    showPlayerOrderOverlay.value = true;
  } else {
    // Redirect back to player selection if no players found
    router.push("/killer-config");
  }
});

// Add score to the first empty bracket
function addScore(value) {
  const emptyIndex = scores.value.findIndex((score) => score === null);
  if (emptyIndex !== -1) {
    scores.value[emptyIndex] = value;
    // Reset multiplier after use
    multiplier.value = 1;

    // Auto-confirm if this was the last bracket
    if (scores.value.every((score) => score !== null)) {
      confirmScore();
    }
  }
}

// Crown button shortcut (5, 20, 1)
function addCrownScore() {
  // Only allow if all brackets are empty
  if (!scores.value.some((score) => score !== null)) {
    // Fill all three brackets with the crown pattern
    scores.value = [5, 20, 1];
    // Auto-confirm after filling all brackets
    confirmScore("Congratulations. A Crown!");
  }
}

// Toggle multiplier
function toggleMultiplier(value) {
  multiplier.value = multiplier.value === value ? 1 : value;
}

// Clear last score in brackets
function clearLastScore() {
  // Find the last filled bracket (from right to left)
  for (let i = scores.value.length - 1; i >= 0; i--) {
    if (scores.value[i] !== null) {
      scores.value[i] = null;
      break;
    }
  }

  // Reset multiplier
  multiplier.value = 1;
}

// Play heart loss animation
async function playHeartLossAnimation(lastLife = false) {
  isLastLife.value = lastLife;
  showHeartLossAnimation.value = true;

  // Use a Promise to ensure animations complete before proceeding
  return new Promise((resolve) => {
    setTimeout(
      () => {
        showHeartLossAnimation.value = false;
        isLastLife.value = false;
        resolve();
      },
      lastLife ? 2000 : 1500
    );
  });
}

// Confirm the current score
async function confirmScore(specialMessage) {
  if (!canConfirmScore.value) return;

  // Save current state to history before making changes
  const currentState = {
    playerIndex: currentPlayerIndex.value,
    playerName: currentPlayer.value.name,
    score: currentScore.value,
    players: JSON.parse(JSON.stringify(players.value)),
    previousPlayerLostLife: previousPlayerLostLife.value,
    scores: [...scores.value], // Save the current scores
  };

  // Try to speak the current score, but don't block if it fails
  try {
    if (specialMessage) {
      speak(specialMessage);
    } else {
      speakScore(currentScore.value, {
        isFailure: currentScore.value < targetToReach.value,
      });
    }
  } catch (error) {
    console.error("Error speaking score:", error);
  }

  // Check if player beat the required target
  if (currentScore.value < targetToReach.value) {
    // Player loses a life
    currentPlayer.value.lives--;
    previousPlayerLostLife.value = true;

    // Check if player is eliminated
    if (currentPlayer.value.lives <= 0) {
      // Play death animation for last life
      await playHeartLossAnimation(true);
      handlePlayerElimination();

      // Add to history after changes
      turnHistory.value.push(currentState);
      return;
    } else {
      // Play regular heart loss animation
      await playHeartLossAnimation(false);
    }
  } else {
    // Set new target score
    currentPlayer.value.targetScore = currentScore.value;
    previousPlayerLostLife.value = false;
  }

  // Add to history after changes
  turnHistory.value.push(currentState);

  // Save game state
  localStorage.setItem("dartPlayers", JSON.stringify(players.value));

  // Clear scores for next turn
  scores.value = [null, null, null];
  multiplier.value = 1;

  // Move to next player
  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;
}

// Handle player elimination
function handlePlayerElimination() {
  // Remove player from the game
  players.value.splice(currentPlayerIndex.value, 1);

  // If only one player remains, they win
  if (players.value.length === 1) {
    winner.value = players.value[0];
    gameOver.value = true;
    return;
  }

  // Adjust current player index if needed
  if (currentPlayerIndex.value >= players.value.length) {
    currentPlayerIndex.value = 0;
  }

  // Save game state
  localStorage.setItem("dartPlayers", JSON.stringify(players.value));

  // Clear scores for next turn
  scores.value = [null, null, null];
  multiplier.value = 1;
}

// Smart undo function that handles both bracket and turn undo
function smartUndo() {
  // First priority: undo the current player's last score if any
  if (hasAnyScore.value) {
    clearLastScore();
  }
  // Second priority: undo the previous player's turn
  else if (turnHistory.value.length > 0) {
    undoLastTurn();
  }
}

// Undo the last player's turn
function undoLastTurn() {
  if (turnHistory.value.length === 0) return;

  // Get the last turn from history
  const lastTurn = turnHistory.value.pop();

  // Restore the game state
  players.value = JSON.parse(JSON.stringify(lastTurn.players));
  previousPlayerLostLife.value = lastTurn.previousPlayerLostLife;

  // Set current player to the player who just played
  currentPlayerIndex.value = lastTurn.playerIndex;

  // Restore the scores from the last turn, but remove the last score
  // This simulates as if the player had entered all but the last score
  if (lastTurn.scores && lastTurn.scores.length === 3) {
    // Find the last non-null score
    let lastScoreIndex = 2;
    while (lastScoreIndex >= 0 && lastTurn.scores[lastScoreIndex] === null) {
      lastScoreIndex--;
    }

    if (lastScoreIndex >= 0) {
      // Create a copy of the scores
      const restoredScores = [...lastTurn.scores];
      // Clear the last score
      restoredScores[lastScoreIndex] = null;
      // Set the restored scores
      scores.value = restoredScores;
    } else {
      // If no scores were found, clear all
      scores.value = [null, null, null];
    }
  } else {
    // Fallback to clearing all scores if the format is unexpected
    scores.value = [null, null, null];
  }

  multiplier.value = 1;

  // Save the restored game state
  localStorage.setItem("dartPlayers", JSON.stringify(players.value));
}

// Restart the game with the same players
function restartGame() {
  // Save current player names to localStorage
  updateSavedPlayerNames();

  // Reset game state
  gameOver.value = false;
  winner.value = null;
  turnHistory.value = []; // Clear turn history

  // Restore players from original state with their original lives
  players.value = JSON.parse(JSON.stringify(originalPlayers.value));

  // Shuffle players
  shufflePlayers();

  // Reset current player to first player
  currentPlayerIndex.value = 0;

  // Reset scores
  scores.value = [null, null, null];
  multiplier.value = 1;
  previousPlayerLostLife.value = true;

  // Save game state
  localStorage.setItem("dartPlayers", JSON.stringify(players.value));

  // Show player order overlay when game restarts
  showPlayerOrderOverlay.value = true;
  // Auto-dismiss after 4 seconds if not manually dismissed
  setTimeout(() => {
    if (showPlayerOrderOverlay.value) {
      showPlayerOrderOverlay.value = false;
    }
  }, 4000);
}

// Shuffle players array
function shufflePlayers() {
  for (let i = players.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players.value[i], players.value[j]] = [players.value[j], players.value[i]];
  }
}

// Go back to home screen
function backToHome() {
  // Save current player names to localStorage before navigating away
  updateSavedPlayerNames();

  // Navigate to the home page (index)
  router.push("/");
}

// Update saved player names in localStorage
function updateSavedPlayerNames() {
  // Get existing saved player names
  const savedPlayersJson = localStorage.getItem("killerPlayerNames");
  let savedPlayers = savedPlayersJson ? JSON.parse(savedPlayersJson) : [];

  // Get current player names
  const currentPlayerNames = players.value.map((player) => player.name);

  // Get original player names (including eliminated players)
  const originalPlayerNames = originalPlayers.value.map(
    (player) => player.name
  );

  // Combine all unique player names
  const allPlayerNames = [
    ...new Set([
      ...savedPlayers,
      ...currentPlayerNames,
      ...originalPlayerNames,
    ]),
  ];

  // Save back to localStorage
  localStorage.setItem("killerPlayerNames", JSON.stringify(allPlayerNames));
}

// Dismiss player order overlay
function dismissPlayerOrderOverlay() {
  showPlayerOrderOverlay.value = false;
}

// New function to lose life instantly
async function loseLifeInstantly() {
  // Save current state to history before making changes
  const currentState = {
    playerIndex: currentPlayerIndex.value,
    playerName: currentPlayer.value.name,
    score: 0, // We're setting score to 0 as this is an instant loss
    players: JSON.parse(JSON.stringify(players.value)),
    previousPlayerLostLife: previousPlayerLostLife.value,
    scores: [null, null, null], // Empty scores as we're skipping score entry
  };

  // Try to speak "zero", but don't block if it fails
  try {
    speakScore(0);
  } catch (error) {
    console.error("Error speaking zero:", error);
  }

  // Player loses a life
  currentPlayer.value.lives--;
  previousPlayerLostLife.value = true;

  // Check if player is eliminated
  if (currentPlayer.value.lives <= 0) {
    // Play death animation for last life
    await playHeartLossAnimation(true);
    handlePlayerElimination();
  } else {
    // Play regular heart loss animation
    await playHeartLossAnimation(false);
  }

  // Add to history after changes
  turnHistory.value.push(currentState);

  // Save game state
  localStorage.setItem("dartPlayers", JSON.stringify(players.value));

  // Reset scores and move to next player
  scores.value = [null, null, null];
  multiplier.value = 1;

  // Skip to next player if the current player isn't eliminated
  if (currentPlayer.value.lives > 0) {
    currentPlayerIndex.value =
      (currentPlayerIndex.value + 1) % players.value.length;
  }
}
</script>

<style>
.animate-heart-loss-bg {
  animation: heart-loss-bg 1.5s ease-in-out forwards;
}

.animate-death-bg {
  animation: death-bg 2s ease-in-out forwards;
}

.animate-heart-pulse {
  animation: heart-pulse 1.5s ease-in-out forwards;
}

.animate-skull-pulse {
  animation: skull-pulse 2s ease-in-out forwards;
}

.animate-player-order-overlay {
  animation: player-order-overlay 0.3s ease-in-out forwards;
}

@keyframes player-order-overlay {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes death-bg {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes heart-pulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  20% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(0deg);
  }
  65% {
    transform: scale(1.1) rotate(-5deg);
  }
  80% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes skull-pulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  20% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  80% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes heart-loss-bg {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 0.9;
  }
  80% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
}
</style>
