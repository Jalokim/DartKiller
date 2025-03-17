import { describe, it, expect } from 'vitest'

// Simplified version of the submitThrows function for testing
function calculateScore(targetNumbers, thrownNumbers) {
  let roundScore = 0;
  let matchedTargets = [false, false, false]; // Track which target numbers were matched
  let matchCount = 0;

  // Check each thrown number
  for (let i = 0; i < thrownNumbers.length; i++) {
    const thrownNumber = thrownNumbers[i];
    let matched = false;

    // See if this thrown number matches any target number
    for (let j = 0; j < targetNumbers.length; j++) {
      if (thrownNumber === targetNumbers[j] && !matchedTargets[j]) {
        roundScore += thrownNumber;
        matchedTargets[j] = true; // Mark this target as matched
        matchCount++;
        matched = true;
        break; // Match one target per throw
      }
    }
  }

  // Check if player matched all three targets exactly
  const isPerfectMatch = matchCount === 3;

  // Double the score for a perfect match
  if (isPerfectMatch) {
    roundScore *= 2;
  }

  return {
    score: roundScore,
    isPerfectMatch
  };
}

// Function to simulate the crown button behavior
function simulateCrownButton() {
  // Crown button always adds 1, 5, 20 as the three inputs
  return [1, 5, 20];
}

describe('Roulette Score Calculation', () => {
  it('calculates score correctly for partial matches', () => {
    const targetNumbers = [17, 20, 5];
    const thrownNumbers = [17, 20, 10];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match 17 and 20 for a score of 37
    expect(result.score).toBe(37);
    expect(result.isPerfectMatch).toBe(false);
  });
  
  it('doubles score for perfect match with unique numbers', () => {
    const targetNumbers = [17, 20, 5];
    const thrownNumbers = [17, 20, 5];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match all three for a score of (17 + 20 + 5) * 2 = 84
    expect(result.score).toBe(84);
    expect(result.isPerfectMatch).toBe(true);
  });
  
  it('doubles score for perfect match with duplicate numbers', () => {
    const targetNumbers = [17, 17, 20];
    const thrownNumbers = [17, 17, 20];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match all three for a score of (17 + 17 + 20) * 2 = 108
    expect(result.score).toBe(108);
    expect(result.isPerfectMatch).toBe(true);
  });
  
  it('handles different order of throws', () => {
    const targetNumbers = [17, 20, 5];
    const thrownNumbers = [5, 17, 20];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match all three for a score of (17 + 20 + 5) * 2 = 84
    expect(result.score).toBe(84);
    expect(result.isPerfectMatch).toBe(true);
  });
  
  it('handles zero score when no matches', () => {
    const targetNumbers = [17, 20, 5];
    const thrownNumbers = [10, 11, 12];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should have no matches for a score of 0
    expect(result.score).toBe(0);
    expect(result.isPerfectMatch).toBe(false);
  });
  
  it('handles multiple duplicate targets correctly', () => {
    const targetNumbers = [17, 17, 17];
    const thrownNumbers = [17, 17, 17];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match all three for a score of (17 + 17 + 17) * 2 = 102
    expect(result.score).toBe(102);
    expect(result.isPerfectMatch).toBe(true);
  });
  
  it('handles partial matches with duplicate targets', () => {
    const targetNumbers = [17, 17, 20];
    const thrownNumbers = [17, 10, 11];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match only one 17 for a score of 17
    expect(result.score).toBe(17);
    expect(result.isPerfectMatch).toBe(false);
  });
  
  it('handles extra throws beyond the required three', () => {
    const targetNumbers = [17, 20, 5];
    const thrownNumbers = [17, 20, 5, 10, 11];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match all three for a score of (17 + 20 + 5) * 2 = 84
    // Extra throws should be ignored
    expect(result.score).toBe(84);
    expect(result.isPerfectMatch).toBe(true);
  });
  
  it('handles fewer than three throws', () => {
    const targetNumbers = [17, 20, 5];
    const thrownNumbers = [17, 20];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match two for a score of 37
    expect(result.score).toBe(37);
    expect(result.isPerfectMatch).toBe(false);
  });
});

describe('Roulette Crown Button', () => {
  it('adds 1, 5, 20 as the three inputs', () => {
    const result = simulateCrownButton();
    expect(result).toEqual([1, 5, 20]);
  });
  
  it('calculates correct score when crown values match targets', () => {
    const targetNumbers = [1, 5, 20];
    const thrownNumbers = simulateCrownButton();
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match all three for a score of (1 + 5 + 20) * 2 = 52
    expect(result.score).toBe(52);
    expect(result.isPerfectMatch).toBe(true);
  });
  
  it('calculates correct score when crown values partially match targets', () => {
    const targetNumbers = [1, 10, 15];
    const thrownNumbers = simulateCrownButton();
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match only the 1 for a score of 1
    expect(result.score).toBe(1);
    expect(result.isPerfectMatch).toBe(false);
  });
  
  it('triggers double score when target is exactly 1, 5, 20 and crown is pressed', () => {
    // Target numbers are exactly 1, 5, 20
    const targetNumbers = [1, 5, 20];
    // Crown button gives 1, 5, 20
    const thrownNumbers = simulateCrownButton();
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should be a perfect match with double score: (1 + 5 + 20) * 2 = 52
    expect(result.score).toBe(52);
    expect(result.isPerfectMatch).toBe(true);
    
    // Verify that the score is indeed doubled
    const singleScore = 1 + 5 + 20;
    expect(result.score).toBe(singleScore * 2);
  });
}); 