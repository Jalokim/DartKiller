<template>
  <div class="flex flex-col overflow-hidden">
    <!-- Current player and score area -->
    <div
      class="bg-emerald-800 text-white flex flex-col items-center relative z-10"
    >
      <!-- Player name with hearts and back button -->
      <div class="flex items-center gap-2 w-full p-4">
        <NuxtLink
          to="/"
          class="text-white opacity-70 hover:opacity-100 mr-2"
          title="Back to Home"
        >
          <Icon name="ph:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <h1 class="text-xl font-bold flex-grow">
          Roulette Game ({{ targetToReach }})
        </h1>
      </div>

      <!-- Score Display -->
      <div class="w-full px-4 pb-4">
        <div class="grid grid-cols-5 gap-6 w-full">
          <!-- Current player and Score -->
          <div class="text-center col-span-2">
            <div class="text-base font-bold">{{ currentPlayer.name }}</div>
            <div class="text-2xl font-bold">{{ currentPlayer.score }}</div>
            <div class="text-sm">Score</div>
          </div>

          <div class="text-center col-span-1 flex justify-center items-center">
            <button
              @click="showPlayerOrderOverlay = true"
              class="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center transition-colors"
              title="Show player order"
            >
              <Icon name="ph:caret-right-bold" class="w-4 h-4 text-white" />
            </button>
          </div>

          <!-- Next player info -->
          <div class="text-center col-span-2">
            <div class="text-base">Next: {{ nextPlayer.name }}</div>
            <div class="text-2xl font-bold">{{ nextPlayer.score }}</div>
            <div class="text-sm">Score</div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="relative z-0 transition-transform duration-500 ease-in-out"
      :class="gameInProgress ? '-translate-y-[35%]' : '-translate-y-[23%]'"
    >
      <div class="max-w-sm mx-auto">
        <div class="relative">
          <img
            src="/dartboard.svg"
            ref="dartboardRef"
            :style="{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
                : 'none',
            }"
            class="w-full"
          />
        </div>

        <div class="mt-2 flex flex-col items-center">
          <!-- Target and Thrown Numbers with Spin Button -->
          <div class="flex gap-4 mb-6">
            <!-- Left side: Target and Thrown Numbers -->
            <div class="flex flex-col gap-4">
              <!-- Target Numbers Display -->
              <div class="flex gap-4 justify-center">
                <div
                  v-for="(number, index) in targetNumbers"
                  :key="'target-' + index"
                  class="w-14 h-14 border-2 border-emerald-600 rounded-md flex items-center justify-center text-xl font-bold"
                  :class="{
                    'bg-white': number !== null,
                    'bg-gray-100 opacity-50': number === null,
                  }"
                >
                  {{ number }}
                </div>
              </div>

              <!-- Thrown Numbers Display -->
              <div class="flex gap-4 justify-center">
                <div
                  v-for="(number, index) in thrownNumbers"
                  :key="'thrown-' + index"
                  class="w-14 h-14 border-2 border-emerald-600 rounded-md flex items-center justify-center text-xl font-bold"
                  :class="{
                    'bg-emerald-100': number !== null,
                    'bg-white': number === null && gameInProgress,
                    'bg-gray-100 opacity-50':
                      number === null && !gameInProgress,
                  }"
                >
                  {{ number === null ? "" : number }}
                </div>
              </div>
            </div>

            <!-- Right side: Action Buttons -->
            <div class="flex flex-col gap-2">
              <!-- Conditionally show either Spin or Submit button -->
              <button
                v-if="!gameInProgress"
                @click="spinDartboard"
                class="w-20 h-32 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-base shadow-md transition-colors flex items-center justify-center"
                :disabled="isSpinning"
                :class="{
                  'opacity-50 cursor-not-allowed': isSpinning,
                }"
              >
                Spin
              </button>
              <button
                v-else
                @click="submitThrows"
                class="w-20 h-20 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-base shadow-md transition-colors flex items-center justify-center"
                :disabled="!canSubmit"
                :class="{ 'opacity-50 cursor-not-allowed': !canSubmit }"
              >
                Submit
              </button>

              <!-- Undo button (always visible but with reduced opacity when disabled) -->
              <button
                v-if="gameInProgress"
                @click="undoThrow"
                class="w-20 h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center justify-center"
                :disabled="!canUndo"
                :class="{ 'opacity-30 cursor-not-allowed': !canUndo }"
              >
                Undo
              </button>
            </div>
          </div>

          <!-- Throw Input Section (only shown when we have targets) -->
          <div
            class="w-full"
            :class="
              gameInProgress ? 'opacity-100' : 'opacity-0 pointer-events-none'
            "
          >
            <!-- Using GameButtons component -->
            <GameButtons
              :disabled="allThrowsComplete"
              :current-score-index="currentThrowIndex"
              :show-special-buttons="true"
              :show-multipliers="false"
              :show-undo-button="false"
              :can-undo="canUndo"
              @add-score="addThrow"
              @undo="undoThrow"
              @add-crown-score="addCrownScore"
              @lose-life="loseLife"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Player order overlay -->
    <div
      v-if="showPlayerOrderOverlay"
      class="fixed inset-0 z-50 bg-emerald-800 bg-opacity-95 animate-player-order-overlay"
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
            :class="{ 'font-bold': index === currentPlayerIndex }"
          >
            <div
              class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mr-3"
            >
              {{ index + 1 }}
            </div>
            <div>{{ player.name }}</div>
            <div class="ml-auto font-bold">
              {{ player.score }}/{{ targetToReach }}
            </div>
          </div>

          <!-- OK button to dismiss overlay -->
          <div class="mt-4 flex justify-center">
            <button
              @click="showPlayerOrderOverlay = false"
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg font-bold shadow-sm transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Perfect match bonus animation -->
    <div
      v-if="showBonusAnimation"
      class="fixed inset-0 z-40 pointer-events-none animate-bonus-bg bg-yellow-500"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="relative">
          <Icon
            name="ph:star-fill"
            class="text-yellow-300 text-[36vw] animate-star-pulse"
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-red-500 font-bold text-4xl animate-bonus-text">
              DOUBLE SCORE!
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Score animation -->
    <div
      v-if="showScoreAnimation"
      class="fixed inset-0 z-40 pointer-events-none animate-score-bg bg-emerald-600"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="relative">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-white font-bold text-4xl animate-score-text">
              +{{ animationScore }}
            </div>
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
      <ConfettiExplosion
        class="absolute inset-0 z-10"
        :particleCount="130"
        :particleSize="30"
        :force="0.5"
        :stageWidth="1600"
        :stageHeight="1600"
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
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ConfettiExplosion from "vue-confetti-explosion";
import { useScoreSpeech } from "../composables/useScoreSpeech";

const router = useRouter();
const rotation = ref(0);
const isSpinning = ref(false);
const selectedField = ref(null);
const dartboardRef = ref(null);
const finalDegree = ref(null);

// Initialize the speech composable
const { speak, speakScore } = useScoreSpeech();

// Players and game state
const players = ref([]);
const currentPlayerIndex = ref(0);
const gameOver = ref(false);
const winner = ref(null);
const originalPlayers = ref([]); // Store original players for restart
const showPlayerOrderOverlay = ref(false);
const targetToReach = ref(101); // Target to reach for all players

// Game state for dartboard
const targetNumbers = ref([null, null, null]);
const thrownNumbers = ref([null, null, null]);
const gameInProgress = ref(false);
const currentThrowIndex = ref(0);

// Add these refs for animations
const showBonusAnimation = ref(false);
const showScoreAnimation = ref(false);
const animationScore = ref(0);

// Current and next player computed properties
const currentPlayer = computed(() => {
  return (
    players.value[currentPlayerIndex.value] || {
      name: "Player",
      score: 0,
    }
  );
});

const nextPlayer = computed(() => {
  if (players.value.length < 2) return { name: "None", score: 0 };

  const nextIndex = (currentPlayerIndex.value + 1) % players.value.length;
  return players.value[nextIndex];
});

// Dartboard has 20 fields, each 18 degrees
// Field 20 is at 0 degrees, then 1, 18, 4, etc. following standard dartboard layout
const fieldMapping = {
  0: 20, // 0 degrees = field 20
  18: 1, // 18 degrees = field 1
  36: 18, // 36 degrees = field 18
  54: 4, // and so on...
  72: 13,
  90: 6,
  108: 10,
  126: 15,
  144: 2,
  162: 17,
  180: 3,
  198: 19,
  216: 7,
  234: 16,
  252: 8,
  270: 11,
  288: 14,
  306: 9,
  324: 12,
  342: 5,
};

// Computed values for game logic
const canUndo = computed(() => {
  return currentThrowIndex.value > 0;
});

const canSubmit = computed(() => {
  return currentThrowIndex.value === 3;
});

const allThrowsComplete = computed(() => {
  return currentThrowIndex.value >= 3;
});

// Load players from localStorage
onMounted(() => {
  // Get players from localStorage
  const savedPlayers = localStorage.getItem("killerPlayerNames");

  if (savedPlayers) {
    const playerNames = JSON.parse(savedPlayers);

    if (playerNames.length < 2) {
      // Redirect to home if not enough players
      router.push("/roulette-config");
      return;
    }

    // Create player objects with scores initialized to 0
    players.value = playerNames.map((name) => ({
      name,
      score: 0,
    }));

    // Load target score if available
    const savedTargetScore = localStorage.getItem("rouletteTargetScore");
    if (savedTargetScore) {
      targetToReach.value = parseInt(savedTargetScore);
    }

    // Store a deep copy for restart
    originalPlayers.value = JSON.parse(JSON.stringify(players.value));

    // Shuffle players for random order
    shufflePlayers();

    // Show player order at start
    showPlayerOrderOverlay.value = true;

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      if (showPlayerOrderOverlay.value) {
        showPlayerOrderOverlay.value = false;
      }
    }, 3000);
  } else {
    // Redirect to player selection if no players found
    router.push("/roulette-config");
  }
});

function spinDartboard() {
  if (isSpinning.value) return;

  // Reset for new spin
  isSpinning.value = true;
  selectedField.value = null;
  finalDegree.value = null;
  targetNumbers.value = [null, null, null];

  // Also clear the thrown numbers when starting a new spin
  thrownNumbers.value = [null, null, null];
  currentThrowIndex.value = 0;

  // First spin
  spinOnce(0);
}

function spinOnce(spinIndex) {
  // Generate random number of full rotations (2-5) plus a random position
  const fullRotations = 2 + Math.floor(Math.random() * 4); // 2-5 full rotations
  const randomDegree = Math.floor(Math.random() * 20) * 18; // Random multiple of 18 degrees (0-342)

  // Calculate total rotation (current + new rotations + random position)
  const targetRotation = rotation.value + fullRotations * 360 + randomDegree;
  rotation.value = targetRotation;

  // After spinning completes
  setTimeout(() => {
    // Calculate the final position (normalized to 0-359 degrees)
    const finalPosition = targetRotation % 360;
    finalDegree.value = finalPosition;

    // When the dartboard rotates clockwise by X degrees,
    // the field that shows at the bottom (180 deg) is what was originally at (180 - X) % 360 degrees
    let bottomField = (180 - finalPosition) % 360;
    if (bottomField < 0) {
      bottomField += 360;
    }

    // Find the closest field for the calculated position
    const closestField = Math.round(bottomField / 18) * 18;
    const normalizedField = closestField === 360 ? 0 : closestField;

    const fieldNumber = fieldMapping[normalizedField];
    selectedField.value = fieldNumber;

    // Speak the selected field number
    speakScore(fieldNumber);

    // Save the target number
    targetNumbers.value[spinIndex] = fieldNumber;

    // If we haven't spun 3 times yet, spin again
    if (spinIndex < 2) {
      setTimeout(() => {
        spinOnce(spinIndex + 1);
      }, 500); // Short delay before next spin
    } else {
      // All spins complete
      isSpinning.value = false;
      gameInProgress.value = true;
      resetThrows();
    }
  }, 1000); // 1 second spin duration
}

function addThrow(number) {
  if (currentThrowIndex.value < 3) {
    thrownNumbers.value[currentThrowIndex.value] = number;
    currentThrowIndex.value++;
  }
}

function undoThrow() {
  if (currentThrowIndex.value > 0) {
    currentThrowIndex.value--;
    thrownNumbers.value[currentThrowIndex.value] = null;
  }
}

function submitThrows() {
  // Calculate score based on matching numbers
  let roundScore = 0;
  let matchedTargets = [false, false, false]; // Track which target numbers were matched
  let matchCount = 0;

  // Check each thrown number
  for (let i = 0; i < currentThrowIndex.value; i++) {
    const thrownNumber = thrownNumbers.value[i];
    let matched = false;

    // See if this thrown number matches any target number
    for (let j = 0; j < targetNumbers.value.length; j++) {
      if (thrownNumber === targetNumbers.value[j] && !matchedTargets[j]) {
        roundScore += thrownNumber;
        matchedTargets[j] = true; // Mark this target as matched
        matchCount++;
        matched = true;
        break; // Match one target per throw
      }
    }
  }

  // Check if player matched all three targets exactly
  // This requires all 3 target numbers to be matched
  const isPerfectMatch = matchCount === 3;

  // Double the score for a perfect match
  if (isPerfectMatch) {
    roundScore *= 2;
    // Set the animation score before playing the bonus animation
    animationScore.value = roundScore;
    // Add round score to player's total score
    currentPlayer.value.score += roundScore;

    // Check if player has reached the target
    if (currentPlayer.value.score >= targetToReach.value) {
      handleWin();
      return;
    }

    // Play the bonus animation
    playBonusAnimation();
  } else {
    // Add round score to player's total score
    currentPlayer.value.score += roundScore;

    // Check if player has reached the target
    if (currentPlayer.value.score >= targetToReach.value) {
      handleWin();
      return;
    }

    // Show score animation for non-perfect matches
    animationScore.value = roundScore;
    playScoreAnimation();
  }
}

function resetThrows() {
  thrownNumbers.value = [null, null, null];
  currentThrowIndex.value = 0;
  gameInProgress.value = true;
}

function resetGame() {
  // Reset game state
  gameOver.value = false;
  winner.value = null;

  // Restore players from original state
  players.value = JSON.parse(JSON.stringify(originalPlayers.value));

  // Shuffle players
  shufflePlayers();

  // Reset current player to first player
  currentPlayerIndex.value = 0;

  // Reset dartboard state
  targetNumbers.value = [null, null, null];
  thrownNumbers.value = [null, null, null];
  currentThrowIndex.value = 0;
  gameInProgress.value = false;
  isSpinning.value = false;
  selectedField.value = null;
  finalDegree.value = null;

  // Show player order overlay when game restarts
  showPlayerOrderOverlay.value = true;

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    if (showPlayerOrderOverlay.value) {
      showPlayerOrderOverlay.value = false;
    }
  }, 3000);
}

function handleWin() {
  // Set winner and show game over screen
  winner.value = currentPlayer.value;
  gameOver.value = true;
}

function shufflePlayers() {
  for (let i = players.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players.value[i], players.value[j]] = [players.value[j], players.value[i]];
  }
}

function backToHome() {
  // Navigate back to home screen
  router.push("/");
}

// Function to play the bonus animation
async function playBonusAnimation() {
  showBonusAnimation.value = true;

  // Speak the bonus message
  speak("Double score! Perfect match!");

  // Use a Promise to ensure animations complete before proceeding
  return new Promise((resolve) => {
    setTimeout(() => {
      showBonusAnimation.value = false;
      moveToNextPlayer(); // Move to next player instead of just resetting game state
      resolve();
    }, 1500);
  });
}

// Function to move to the next player
function moveToNextPlayer() {
  // Move to next player
  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;

  // Reset game state
  gameInProgress.value = false;

  // Automatically spin for the next player after a short delay
  setTimeout(() => {
    spinDartboard();
  }, 800);
}

// Function to play the score animation
async function playScoreAnimation() {
  showScoreAnimation.value = true;

  // Speak the score
  speakScore(animationScore.value, { prefix: "You scored " });

  // Use a Promise to ensure animations complete before proceeding
  return new Promise((resolve) => {
    setTimeout(() => {
      showScoreAnimation.value = false;
      // Move to next player after animation completes
      moveToNextPlayer();
      resolve();
    }, 1200);
  });
}

function addCrownScore() {
  // Crown button is a shortcut to add 1, 5, 20 as the three inputs
  thrownNumbers.value = [1, 5, 20]; // Fill all three throws with crown values
  currentThrowIndex.value = 3; // Mark all throws as complete
}

function loseLife() {
  // "Lose life" button - fills all throws with zeros
  thrownNumbers.value = [0, 0, 0]; // Fill all three throws with zeros
  currentThrowIndex.value = 3; // Mark all throws as complete
}
</script>

<style>
@keyframes player-order-overlay {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.animate-player-order-overlay {
  animation: player-order-overlay 0.3s ease-in-out forwards;
}

@keyframes bonus-bg {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 0.8;
  }
  80% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}

.animate-bonus-bg {
  animation: bonus-bg 1.5s ease-in-out forwards;
}

@keyframes star-pulse {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(0deg);
  }
  20% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.3) rotate(30deg);
  }
  80% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) rotate(-30deg);
  }
}

.animate-star-pulse {
  animation: star-pulse 1.5s ease-in-out forwards;
}

@keyframes bonus-text {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
  70% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

.animate-bonus-text {
  animation: bonus-text 1.5s ease-in-out forwards;
}

@keyframes score-bg {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 0.7;
  }
  80% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
  }
}

.animate-score-bg {
  animation: score-bg 1.2s ease-in-out forwards;
}

@keyframes score-icon {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  20% {
    opacity: 1;
    transform: scale(1);
  }
  80% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

.animate-score-icon {
  animation: score-icon 1.2s ease-in-out forwards;
}

@keyframes score-text {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  20% {
    opacity: 1;
    transform: scale(1.1);
  }
  80% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

.animate-score-text {
  animation: score-text 1.2s ease-in-out forwards;
}
</style>
