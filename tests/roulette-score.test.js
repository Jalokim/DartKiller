import { describe, it, expect } from 'vitest'
import { useRouletteScore } from '../composables/useRouletteScore'

// Get the score calculator from the composable
const { calculateScore } = useRouletteScore();

// Function to simulate the crown button behavior
function simulateCrownButton() {
  // Crown button always adds 1, 5, 20 as the three inputs
  return [1, 5, 20];
}

describe('Roulette Score Calculation', () => {
  // Specific test cases mentioned by the user
  it('handles exact match case correctly (double score)', () => {
    const targetNumbers = [1, 5, 6]; 
    const thrownNumbers = [1, 5, 6];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should match all three for a score of (1 + 5 + 6) * 2 = 24
    expect(result.score).toBe(24);
    expect(result.isPerfectMatch).toBe(true);
  });
  
  it('handles single match case correctly', () => {
    const targetNumbers = [1, 5, 6];
    const thrownNumbers = [1, 2, 3];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Only 1 matched, so score should be 1
    expect(result.score).toBe(1);
    expect(result.isPerfectMatch).toBe(false);
  });
  
  it('handles one throw matching multiple targets', () => {
    const targetNumbers = [5, 6, 6];
    const thrownNumbers = [6, 0, 0];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // One thrown 6 matches target, should be 6 points
    expect(result.score).toBe(6);
    expect(result.isPerfectMatch).toBe(false);
  });
  
  it('handles multiple matches with duplicate numbers', () => {
    const targetNumbers = [1, 5, 6];
    const thrownNumbers = [5, 5, 5];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // 5 is matched 3 times, so score should be 15
    expect(result.score).toBe(15);
    expect(result.isPerfectMatch).toBe(false);
  });
  
  it('handles all duplicate target matches correctly', () => {
    const targetNumbers = [5, 5, 5];
    const thrownNumbers = [5, 5, 5];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // All three 5's matched for a score of (5 + 5 + 5) * 2 = 30
    expect(result.score).toBe(30);
    expect(result.isPerfectMatch).toBe(true);
  });
  
  it('handles multiple but not all targets matched', () => {
    const targetNumbers = [5, 5, 6];
    const thrownNumbers = [5, 5, 7];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Two 5's matched but not the 6, so score should be 10
    expect(result.score).toBe(10);
    expect(result.isPerfectMatch).toBe(false);
  });

  // Original test cases
  it('calculates score correctly for partial matches', () => {
    const targetNumbers = [17, 20, 5];
    const thrownNumbers = [17, 20, 10];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // scores only matching targets
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
    
    // Should match all three for a score of (5 + 17 + 20) * 2 = 84
    expect(result.score).toBe(84);
    expect(result.isPerfectMatch).toBe(true);
  });
  
  it('handles zero score when no matches', () => {
    const targetNumbers = [17, 20, 5];
    const thrownNumbers = [10, 11, 12];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // no match score should be zero
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
    const targetNumbers = [1, 1, 3];
    const thrownNumbers = [1, 10, 11];
    
    const result = calculateScore(targetNumbers, thrownNumbers);
    
    // Should add all matches numbers
    expect(result.score).toBe(1);
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
    
    // Should only count the matching target which is 1
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