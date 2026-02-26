import { HAND_RANKINGS } from '../data/handRankings';

/**
 * Maps standard poker positions to their typical opening range percentages.
 * (Mocked values for 6-max GTO-ish ranges)
 */
export const POSITIONAL_RANGES: Record<string, number> = {
    UTG: 0.15, // 15% top hands
    HJ: 0.20,  // 20%
    CO: 0.26,  // 26%
    BTN: 0.45, // 45%
    SB: 0.50,  // 50%
    BB: 1.00   // Defending range (context specific, but 100% for this logic)
};

/**
 * Returns the numerical rank (1-169) of a given hand notation.
 * @param hand Notation like 'AA', 'AKs', '72o'
 */
export function getHandRank(hand: string): number {
    const match = HAND_RANKINGS.find(h => h.hand === hand);
    return match ? match.rank : 170; // 170 if not found (invalid hand)
}

/**
 * Determines if a specific hand is within the opening range of a given position.
 * Calculation: (rank / 169) <= rangePercentage
 * @param hand Notation like 'AA', 'AKs', '72o'
 * @param position Position like 'UTG', 'BTN'
 */
export function isHandInRange(hand: string, position: string): boolean {
    const rank = getHandRank(hand);
    const rangePercent = POSITIONAL_RANGES[position] || 0;

    // Normalized calculation: rank 1 (AA) is the strongest, rank 169 (72o) is weakest.
    // A hand is "in range" if its relative strength index is within the top X% of hands.
    return (rank / 169) <= rangePercent;
}
