<template>
  <div class="flex flex-col bg-emerald-800">
    <!-- Current player and score area -->
    <div
      class="bg-emerald-800 text-white flex flex-col items-center h-[45vh] overflow-auto"
    >
      <!-- Player name and back button -->
      <div class="flex items-center gap-2 mb-4 w-full p-4">
        <button
          @click="backToHome"
          class="text-white opacity-70 hover:opacity-100 mr-2"
          title="Back to Home"
        >
          <Icon name="ph:arrow-left" class="w-5 h-5" />
        </button>
        <h1 class="text-xl font-bold flex-grow">{{ currentPlayer.name }}</h1>
        <div class="text-xl font-bold">{{ currentRound }}</div>
      </div>

      <!-- Score and target info -->
      <div class="grid grid-cols-3 gap-2 w-full pb-5">
        <!-- Current score -->
        <div class="text-center flex flex-col justify-center">
          <div class="text-base">Score</div>
          <div class="text-4xl font-bold">
            {{ currentPlayer.score - currentTurnTotal }}
          </div>
        </div>

        <!-- Average in center -->
        <div class="text-center flex flex-col justify-center">
          <div class="text-base">Avg</div>
          <div class="text-xl font-bold">{{ playerAverage }}</div>
        </div>

        <!-- Current turn -->
        <div class="text-center flex flex-col justify-center">
          <div class="text-base">This turn</div>
          <div class="text-xl font-bold">
            {{ currentTurnTotal }}
          </div>
        </div>
      </div>

      <!-- Checkout hint on its own line -->
      <div
        v-if="checkoutHint && currentPlayer.score <= 170"
        class="w-full px-4 py-2 text-sm text-center mt-1 bg-gray-900/70 bg-opacity-60"
      >
        <span class="opacity-80">Checkout:</span>
        <span class="font-medium ml-2">{{ checkoutHint }}</span>
      </div>

      <!-- All other players scores -->
      <div class="w-full bg-emerald-900 py-2 px-4">
        <h3 class="text-sm opacity-80 mb-1">Other Players:</h3>
        <div
          v-for="player in otherPlayers"
          :key="player.name"
          class="flex justify-between py-1 text-sm"
        >
          <span class="font-medium">{{ player.name }}</span>
          <span>{{ player.score }}</span>
        </div>
      </div>
    </div>

    <!-- Controls area - fixed to bottom -->
    <div
      class="flex-grow flex flex-col bg-white fixed bottom-0 left-0 right-0 z-10 p-5"
    >
      <!-- Score brackets and undo button -->
      <div class="flex gap-4 justify-center items-center pb-5">
        <div
          v-for="(score, index) in scores"
          :key="index"
          class="w-14 h-14 border-2 border-emerald-600 rounded-md flex items-center justify-center text-xl font-bold bg-white"
        >
          {{ score === null ? "" : score }}
        </div>

        <!-- Smart undo button -->
        <button
          @click="smartUndo"
          class="bg-amber-500 hover:bg-amber-600 text-white h-10 px-3 rounded-lg text-base font-bold shadow-sm transition-colors touch-manipulation flex items-center justify-center gap-1"
          :disabled="!canUndo"
          :class="{ 'opacity-50 cursor-not-allowed': !canUndo }"
          title="Undo last throw"
        >
          <Icon name="ph:arrow-left" class="w-5 h-5" />
          Undo
        </button>
      </div>

      <!-- Game buttons component -->
      <GameButtons
        :multiplier="multiplier"
        :current-score-index="scores.filter((score) => score !== null).length"
        @add-score="addScore"
        @add-crown-score="addCrownScore"
        @toggle-multiplier="toggleMultiplier"
        @lose-life="skipTurn"
      />
    </div>

    <!-- Add spacer to prevent content from being hidden under fixed controls -->
    <div class="h-[55vh]"></div>

    <!-- Win animation -->
    <div
      v-if="showWinAnimation"
      class="fixed inset-0 z-50 bg-emerald-800 flex flex-col items-center justify-center p-6"
    >
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
      <div class="animate-bounce mb-6">
        <Icon name="ph:trophy-fill" class="text-yellow-400 text-[36vw]" />
      </div>
      <h2 class="text-white text-4xl font-bold mb-2 text-center">
        {{ winner.name }} Wins!
      </h2>
      <div class="text-white text-xl mb-8 opacity-80 text-center">
        Game finished in {{ gameRounds }} rounds
      </div>
      <button
        @click="newGame"
        class="w-64 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-lg font-bold shadow-sm transition-colors"
      >
        New Game
      </button>
      <button
        @click="backToConfig"
        class="w-64 mt-3 bg-white text-indigo-600 py-3 rounded-lg text-lg font-bold shadow-sm transition-colors"
      >
        Back to Setup
      </button>
    </div>

    <!-- Bust animation -->
    <div
      v-if="showBustAnimation"
      class="fixed inset-0 z-40 bg-red-600 animate-bust-bg pointer-events-none"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-white text-7xl font-bold animate-bust-text">BUST!</div>
      </div>
    </div>

    <!-- Score animation -->
    <div
      v-if="showScoreAnimation"
      class="fixed inset-0 z-40 bg-emerald-600 animate-score-bg pointer-events-none"
    >
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div class="text-white text-7xl font-bold animate-score-text">
          {{ animationScore }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useScoreSpeech } from "~/composables/useScoreSpeech";
import ConfettiExplosion from "vue-confetti-explosion";

const router = useRouter();
const { speak, speakScore } = useScoreSpeech();

// Game state
const players = ref([]);
const currentPlayerIndex = ref(0);
const gameRounds = ref(1);
const gameFinished = ref(false);

// Current turn tracking
const scores = ref([null, null, null]);
const multiplier = ref(1);
const showWinAnimation = ref(false);
const showBustAnimation = ref(false);
const showScoreAnimation = ref(false);
const winner = ref(null);
const animationScore = ref(0);

// Computed properties
const currentPlayer = computed(
  () => players.value[currentPlayerIndex.value] || { name: "", score: 0 }
);
const nextPlayerIndex = computed(
  () => (currentPlayerIndex.value + 1) % players.value.length
);
const nextPlayer = computed(
  () => players.value[nextPlayerIndex.value] || { name: "", score: 0 }
);
const currentRound = computed(() => `Round ${gameRounds.value}`);

// Get all players except current player
const otherPlayers = computed(() => {
  return players.value.filter((_, index) => index !== currentPlayerIndex.value);
});

// Calculate player average per round
const playerAverage = computed(() => {
  const player = currentPlayer.value;
  let totalDarts = 0;
  let totalScore = 0;

  // Add up all historical turns
  if (player.history && player.history.length > 0) {
    // Calculate total score from history
    player.history.forEach((turn) => {
      const validDarts = turn.filter((score) => score !== null);
      totalDarts += validDarts.length;
      totalScore += validDarts.reduce((sum, score) => sum + score, 0);
    });
  }

  // Add current turn's darts
  const currentDarts = scores.value.filter((score) => score !== null);
  totalDarts += currentDarts.length;
  totalScore += currentDarts.reduce((sum, score) => sum + score, 0);

  // If no darts have been thrown, return placeholder
  if (totalDarts === 0) return "-";

  // Return average per dart
  return (totalScore / totalDarts).toFixed(1);
});

// Calculate current turn total
const currentTurnTotal = computed(() => {
  return scores.value
    .filter((score) => score !== null)
    .reduce((total, score) => total + score, 0);
});

// Track if we can undo
const canUndo = computed(() => {
  // Can undo if there are scores in the current turn
  if (scores.value.some((score) => score !== null)) {
    return true;
  }

  // Can also undo if:
  // 1. There's more than one player
  // 2. The previous player has history
  if (players.value.length > 1) {
    const prevPlayerIndex =
      (currentPlayerIndex.value - 1 + players.value.length) %
      players.value.length;
    const prevPlayer = players.value[prevPlayerIndex];
    return prevPlayer && prevPlayer.history && prevPlayer.history.length > 0;
  }

  return false;
});

// Checkout suggestions for common scores
const checkoutHint = computed(() => {
  const score = currentPlayer.value.score - currentTurnTotal.value;

  // Common checkout patterns
  const checkouts = {
    170: "T20, T20, Bull",
    167: "T20, T19, Bull",
    164: "T20, T18, Bull",
    161: "T20, T17, Bull",
    160: "T20, T20, D20",
    158: "T20, T20, D19",
    157: "T20, T19, D20",
    156: "T20, T20, D18",
    155: "T20, T19, D19",
    154: "T20, T18, D20",
    153: "T20, T19, D18",
    152: "T20, T20, D16",
    151: "T20, T17, D20",
    150: "T20, T18, D18",
    149: "T20, T19, D16",
    148: "T20, T20, D14",
    147: "T20, T17, D18",
    146: "T20, T18, D16",
    145: "T20, T19, D14",
    144: "T20, T20, D12",
    143: "T20, T17, D16",
    142: "T20, T14, D20",
    141: "T20, T19, D12",
    140: "T20, T20, D10",
    139: "T20, T13, D20",
    138: "T20, T18, D12",
    137: "T20, T19, D10",
    136: "T20, T20, D8",
    135: "T20, T17, D12",
    134: "T20, T14, D16",
    133: "T20, T19, D8",
    132: "T20, T16, D12",
    131: "T20, T13, D16",
    130: "T20, T18, D8",
    129: "T19, T16, D12",
    128: "T20, T20, D4",
    127: "T20, T17, D8",
    126: "T20, T14, D12",
    125: "25, T20, D20",
    124: "T20, T16, D8",
    123: "T20, T13, D12",
    122: "T18, T18, D7",
    121: "T20, T11, D14",
    120: "T20, 20, D20",
    119: "T19, T12, D13",
    118: "T20, 18, D20",
    117: "T20, 17, D20",
    116: "T20, 16, D20",
    115: "T20, 15, D20",
    114: "T20, 14, D20",
    113: "T20, 13, D20",
    112: "T20, 12, D20",
    111: "T20, 11, D20",
    110: "T20, 10, D20",
    109: "T20, 9, D20",
    108: "T20, 8, D20",
    107: "T19, 10, D20",
    106: "T20, 6, D20",
    105: "T20, 5, D20",
    104: "T18, 10, D20",
    103: "T19, 6, D20",
    102: "T20, 2, D20",
    101: "T20, 1, D20",
    100: "T20, D20",
    99: "T19, 10, D16",
    98: "T20, D19",
    97: "T19, D20",
    96: "T20, D18",
    95: "T19, D19",
    94: "T18, D20",
    93: "T19, D18",
    92: "T20, D16",
    91: "T17, D20",
    90: "T18, D18",
    89: "T19, D16",
    88: "T20, D14",
    87: "T17, D18",
    86: "T18, D16",
    85: "T15, D20",
    84: "T20, D12",
    83: "T17, D16",
    82: "T14, D20",
    81: "T19, D12",
    80: "T20, D10",
    79: "T19, 10, D11",
    78: "T18, D12",
    77: "T19, D10",
    76: "T20, D8",
    75: "T17, D12",
    74: "T14, D16",
    73: "T19, D8",
    72: "T16, D12",
    71: "T13, D16",
    70: "T18, D8",
    69: "T19, D6",
    68: "T20, D4",
    67: "T17, D8",
    66: "T10, D18",
    65: "T19, D4",
    64: "T16, D8",
    63: "T13, D12",
    62: "T10, D16",
    61: "T15, D8",
    60: "20, D20",
    59: "19, D20",
    58: "18, D20",
    57: "17, D20",
    56: "16, D20",
    55: "15, D20",
    54: "14, D20",
    53: "13, D20",
    52: "12, D20",
    51: "11, D20",
    50: "10, D20",
    49: "9, D20",
    48: "8, D20",
    47: "15, D16",
    46: "6, D20",
    45: "5, D20",
    44: "4, D20",
    43: "3, D20",
    42: "10, D16",
    41: "9, D16",
    40: "D20",
    39: "7, D16",
    38: "D19",
    37: "5, D16",
    36: "D18",
    35: "3, D16",
    34: "D17",
    33: "1, D16",
    32: "D16",
    31: "15, D8",
    30: "D15",
    29: "13, D8",
    28: "D14",
    27: "11, D8",
    26: "D13",
    25: "9, D8",
    24: "D12",
    23: "7, D8",
    22: "D11",
    21: "5, D8",
    20: "D10",
    19: "3, D8",
    18: "D9",
    17: "1, D8",
    16: "D8",
    15: "7, D4",
    14: "D7",
    13: "5, D4",
    12: "D6",
    11: "3, D4",
    10: "D5",
    9: "1, D4",
    8: "D4",
    7: "3, D2",
    6: "D3",
    5: "1, D2",
    4: "D2",
    3: "1, D1",
    2: "D1",
  };

  return checkouts[score] || "";
});

// Initialize the game
onMounted(() => {
  loadGameState();
});

// Load game state from localStorage
function loadGameState() {
  const savedState = localStorage.getItem("classicGameState");

  if (savedState) {
    const state = JSON.parse(savedState);
    players.value = state.players;
    currentPlayerIndex.value = state.currentPlayerIndex;
    gameFinished.value = state.gameFinished;
    gameRounds.value = state.gameRounds || 1;

    // If the game is already finished, show the win animation
    if (gameFinished.value && state.winner) {
      winner.value = state.winner;
      showWinAnimation.value = true;
    }
  } else {
    // If no saved state, redirect to config
    router.push("/classic-config");
  }
}

// Save the current game state
function saveGameState() {
  const state = {
    players: players.value,
    currentPlayerIndex: currentPlayerIndex.value,
    gameFinished: gameFinished.value,
    gameRounds: gameRounds.value,
    winner: winner.value,
  };

  localStorage.setItem("classicGameState", JSON.stringify(state));
}

// Add a score to the current turn
function addScore(value) {
  // Find the first empty score slot
  const index = scores.value.findIndex((score) => score === null);
  if (index === -1) return; // All slots filled

  // Add the score
  scores.value[index] = value;

  // Calculate new potential score
  const turnTotal = scores.value
    .filter((score) => score !== null)
    .reduce((sum, score) => sum + score, 0);
  const potentialScore = currentPlayer.value.score - turnTotal;

  // Check for exact checkout with a double
  if (potentialScore === 0) {
    // Get the last dart that was thrown (which is the current one)
    const isDartADouble = isDoubleScore(index);

    if (isDartADouble) {
      // If this is a checkout, process the turn to register the win
      setTimeout(() => {
        processTurn();
      }, 300);
      return;
    }
  }

  // Check if the player has busted after this throw
  if (isBust()) {
    setTimeout(() => {
      processTurn();
    }, 300);
    return;
  }

  // After adding the third dart, process the turn
  if (index === 2) {
    setTimeout(() => {
      processTurn();
    }, 500);
  }

  // Reset multiplier after use
  multiplier.value = 1;
}

// Function to play the score animation
async function playScoreAnimation() {
  showScoreAnimation.value = true;

  // Use a Promise to ensure animations complete before proceeding
  await new Promise((resolve) => setTimeout(resolve, 1200));
  showScoreAnimation.value = false;
}

// Add the crown score (5-20-1)
function addCrownScore() {
  // Crown only works if we're at the start of a turn
  if (scores.value[0] !== null) return;

  // Set the three throws
  scores.value = [5, 20, 1];

  // Calculate total score and check for win
  const turnTotal = scores.value.reduce((sum, score) => sum + score, 0);
  const potentialScore = currentPlayer.value.score - turnTotal;

  // Check for exact checkout with the last dart being a double (1 is not a double)
  if (potentialScore === 0) {
    // Last dart of crown is 1, which is not a double, so this can't be a checkout
    // But we should still process the turn for consistency
    setTimeout(() => {
      processTurn();
    }, 300);
    return;
  }

  // Check if the player has busted
  if (isBust()) {
    setTimeout(() => {
      processTurn();
    }, 300);
    return;
  }

  // Process the turn after a short delay
  setTimeout(() => {
    processTurn();
  }, 500);
}

// Toggle the multiplier (double or triple)
function toggleMultiplier(value) {
  if (multiplier.value === value) {
    // If already set to this value, clear it
    multiplier.value = 1;
  } else {
    // Otherwise set to the new value
    multiplier.value = value;
  }
}

// Smart undo for scores
function smartUndo() {
  // Check if there are any scores in the current turn
  if (scores.value.some((score) => score !== null)) {
    // If there are, just undo the last dart
    const index = scores.value
      .slice()
      .reverse()
      .findIndex((score) => score !== null);
    if (index === -1) return; // No scores to undo (shouldn't happen here)

    // Clear that score (converting from reverse index to normal index)
    const normalIndex = 2 - index;
    scores.value[normalIndex] = null;
  } else {
    // If no darts thrown yet, check if we can go back to previous player
    if (players.value.length <= 1) return; // Only one player, nothing to undo

    // Get the previous player's index
    const prevPlayerIndex =
      (currentPlayerIndex.value - 1 + players.value.length) %
      players.value.length;

    // Confirm with the user
    if (!confirm(`Undo ${players.value[prevPlayerIndex].name}'s last turn?`)) {
      return;
    }

    // Get previous player's history
    const prevPlayer = players.value[prevPlayerIndex];
    if (!prevPlayer.history || prevPlayer.history.length === 0) {
      return; // No history to restore
    }

    // Get their last turn scores
    const lastTurn = prevPlayer.history.pop();

    // Calculate the score to add back
    const turnTotal = lastTurn.reduce((sum, score) => sum + score, 0);

    // Add the score back to the player
    prevPlayer.score += turnTotal;

    // Set current player back to previous player
    currentPlayerIndex.value = prevPlayerIndex;

    // Set the scores to show the last turn with last dart removed
    const lastTurnWithoutLast = [...lastTurn];

    // Find the last non-null score (going from the end)
    const lastNonNullIndex = lastTurnWithoutLast
      .slice()
      .reverse()
      .findIndex((s) => s !== null);

    // If found, clear that score (converting from reverse index)
    if (lastNonNullIndex !== -1) {
      lastTurnWithoutLast[2 - lastNonNullIndex] = null;
    }

    scores.value = lastTurnWithoutLast;

    // Save the game state
    saveGameState();
  }
}

// Process the current turn
function processTurn() {
  const totalScore = scores.value
    .filter((score) => score !== null)
    .reduce((sum, score) => sum + score, 0);

  // If we're not busting, show the total score animation and speak it
  if (!isBust() && scores.value.filter((s) => s !== null).length > 0) {
    animationScore.value = totalScore;
    playScoreAnimation();
    speakScore(totalScore);
  }

  // Check if the score is valid
  if (!isBust()) {
    // Update the player's score
    const newScore = currentPlayer.value.score - totalScore;
    currentPlayer.value.score = newScore;

    // Record the history for this turn
    if (!currentPlayer.value.history) {
      currentPlayer.value.history = [];
    }
    currentPlayer.value.history.push([...scores.value]);

    // Check for a win - Important: check AFTER updating the score
    // This ensures we check if the score is now exactly 0
    if (newScore === 0) {
      // Get the last dart that was thrown
      const lastDart = scores.value.filter((s) => s !== null).pop();
      const lastDartIndex = scores.value.lastIndexOf(lastDart);

      // Check if the last dart was a double when finishing
      const isDartADouble = isDoubleScore(lastDartIndex);

      if (isDartADouble) {
        winGame();
        return;
      }
    }

    // Next player
    advanceToNextPlayer();
  } else {
    // Show bust animation and speak
    showBustAnimation.value = true;
    speak("Bust!");

    // Wait for animation to complete before advancing
    setTimeout(() => {
      // Reset the score (no change) and advance to next player
      showBustAnimation.value = false;
      // Need to wait until animation is fully gone before advancing
      // to prevent animation glitches
      setTimeout(() => {
        advanceToNextPlayer();
      }, 100);
    }, 1500);

    // Save the game state now, not after animation
    saveGameState();
    return; // Exit function early to prevent double saveGameState
  }

  // Save the game state
  saveGameState();
}

// Check if the current turn would be a bust
function isBust() {
  const currentScore = currentPlayer.value.score;
  const turnTotal = currentTurnTotal.value;

  // Bust if turn score is greater than remaining score
  if (turnTotal > currentScore) {
    return true;
  }

  // Bust if score would be exactly 1 (can't finish on 1)
  if (currentScore - turnTotal === 1) {
    return true;
  }

  // Bust if score would be 0 but last dart wasn't a double
  if (currentScore - turnTotal === 0) {
    // Get the last dart that was thrown
    const lastDart = scores.value.filter((s) => s !== null).pop();
    const lastDartIndex = scores.value.lastIndexOf(lastDart);

    // Check if the last dart was a double when finishing
    const isDartADouble = isDoubleScore(lastDartIndex);

    return !isDartADouble;
  }

  return false;
}

// Check if the specified dart is a double score
function isDoubleScore(dartIndex) {
  // If no dart at this index, it's not a double
  if (scores.value[dartIndex] === null) return false;

  // Special case: double bull (50) is considered a double
  if (scores.value[dartIndex] === 50) return true;

  // For the calculation we need to know if this was a double
  // We can check if the score is even and equals 2*n where n is 1-20
  const score = scores.value[dartIndex];
  const isDouble =
    score % 2 === 0 && score <= 40 && score > 0 && score / 2 <= 20;

  return isDouble;
}

// Check if the game is won
function isGameWon() {
  const currentScore = currentPlayer.value.score;
  const turnTotal = currentTurnTotal.value;

  // Game is won if score would be exactly 0
  if (currentScore - turnTotal === 0) {
    // Get the last dart that was thrown
    const lastDart = scores.value.filter((s) => s !== null).pop();
    const lastDartIndex = scores.value.lastIndexOf(lastDart);

    // Check if the last dart was a double (required for checkout)
    const isDartADouble = isDoubleScore(lastDartIndex);

    return isDartADouble;
  }

  return false;
}

// Handle game win
function winGame() {
  gameFinished.value = true;
  winner.value = { ...currentPlayer.value };
  speak(`Game Over`);
  showWinAnimation.value = true;
  saveGameState();
}

// Advance to the next player
function advanceToNextPlayer() {
  // Reset scores for the next player
  scores.value = [null, null, null];

  // Move to the next player
  currentPlayerIndex.value =
    (currentPlayerIndex.value + 1) % players.value.length;

  // If we've gone through all players, increment the round counter
  if (currentPlayerIndex.value === 0) {
    gameRounds.value++;
  }
}

// Back to home/config
function backToHome() {
  // Confirm before leaving if game in progress
  if (!gameFinished.value) {
    if (!confirm("Leave the current game? Your progress will be saved.")) {
      return;
    }
  }

  router.push("/");
}

// Start a new game with the same players
function newGame() {
  // Reset all player scores to the starting value
  const startScore = players.value[0].score; // Assume all players started with the same score

  players.value = players.value.map((player) => ({
    ...player,
    score: startScore,
    history: [],
  }));

  // Reset game state
  currentPlayerIndex.value = 0;
  gameFinished.value = false;
  showWinAnimation.value = false;
  winner.value = null;
  gameRounds.value = 1;
  scores.value = [null, null, null];

  // Save the new game state
  saveGameState();
}

// Go back to the config page
function backToConfig() {
  router.push("/classic-config");
}

// Add the skipTurn function to handle skull button click
function skipTurn() {
  // Set all darts to 0
  scores.value = [0, 0, 0];

  // Speak a message
  speak("Triple Zero!");

  // Process the turn
  setTimeout(() => {
    processTurn();
  }, 500);
}
</script>

<style>
.animate-bust-bg {
  animation: pulseBg 1.2s ease-in-out;
}

.animate-bust-text {
  animation: pulseText 1.2s ease-in-out;
}

.animate-score-pop {
  animation: scorePop 0.3s ease-out;
}

.animate-score-bg {
  animation: scoreBg 1.2s ease-in-out forwards;
}

.animate-score-text {
  animation: scoreText 1.2s ease-in-out forwards;
}

@keyframes pulseBg {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
  }
}

@keyframes pulseText {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes scorePop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
    color: yellow;
  }
  100% {
    transform: scale(1);
  }
}

@keyframes scoreBg {
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

@keyframes scoreText {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  30% {
    transform: scale(1.3);
    opacity: 1;
  }
  70% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>
