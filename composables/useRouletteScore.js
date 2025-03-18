/**
 * Composable for handling roulette game scoring logic
 * @returns {Object} Scoring functions
 */
export function useRouletteScore() {
  /**
   * Calculates the score based on target numbers and thrown numbers
   * @param {Array} targetNumbers - The target numbers to match
   * @param {Array} thrownNumbers - The numbers thrown by the player
   * @returns {Object} Score result with total score and perfect match indicator
   */
  const calculateScore = (targetNumbers, thrownNumbers) => {
    let score = 0;
    let matchCount = 0;
    
    // Find valid scoring numbers (numbers that appear in targets)
    const validScoringNumbers = [...new Set(targetNumbers)];
    
    // Count the matches between target and thrown for match tracking
    const targetCopy = [...targetNumbers];
    
    for (const thrownValue of thrownNumbers) {
      const targetIndex = targetCopy.indexOf(thrownValue);
      if (targetIndex !== -1) {
        // Found a match for tracking perfect match
        matchCount++;
        // Remove this target to prevent matching it again for match tracking
        targetCopy.splice(targetIndex, 1);
      }
      
      // If this thrown number is a valid scoring number, add it to score
      if (validScoringNumbers.includes(thrownValue)) {
        score += thrownValue;
      }
    }
    
    // Double the score for a perfect match (all 3 targets hit)
    const isPerfectMatch = matchCount === 3;
    if (isPerfectMatch) {
      score *= 2;
    }
    
    return {
      score,
      isPerfectMatch,
      matchCount
    };
  };

  return {
    calculateScore
  };
}