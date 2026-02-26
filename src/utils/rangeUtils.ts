import { HAND_RANKINGS } from '../data/handRankings';
import { CardData } from './handUtils';

/**
 * Maps standard 6-Max poker positions to GTO opening percentages (RFI).
 */
export const RFI_RANGES: Record<string, number> = {
    UTG: 15,
    HJ: 18,
    CO: 26,
    BTN: 42,
    SB: 45,
    BB: 100 // Default defending, though not usually RFI
};

const RANK_VALUES: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

/**
 * Converts two cards into standard notation (e.g., Ah, Kh -> AKs; 7d, 2c -> 72o)
 */
export function getNotationFromCards(card1: CardData, card2: CardData): string {
    const r1 = card1.rank === '10' ? 'T' : card1.rank;
    const r2 = card2.rank === '10' ? 'T' : card2.rank;
    const v1 = RANK_VALUES[r1];
    const v2 = RANK_VALUES[r2];

    const [high, low] = v1 >= v2 ? [r1, r2] : [r2, r1];

    if (r1 === r2) return high + low; // Pair (AA, JJ)
    const suited = card1.suit === card2.suit ? 's' : 'o';
    return high + low + suited;
}

/**
 * Returns the numerical rank (1-169) of a given hand notation or two cards.
 */
export function getHandRank(handOrCard1: string | CardData, card2?: CardData): number {
    let notation: string;

    if (typeof handOrCard1 === 'string') {
        notation = handOrCard1;
    } else if (card2) {
        notation = getNotationFromCards(handOrCard1, card2);
    } else {
        return 170;
    }

    return HAND_RANKINGS[notation] || 170;
}

/**
 * Determines if a specific hand is within the opening range of a given position.
 */
export function isHandInRange(hand: string, position: string): boolean {
    const rank = getHandRank(hand);
    const rangePercent = RFI_RANGES[position] || 0;
    // Calculate percentage: (rank / 169) * 100
    return (rank / 169) * 100 <= rangePercent;
}
