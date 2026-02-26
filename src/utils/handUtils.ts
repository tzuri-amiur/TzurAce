import { HAND_RANKINGS } from '../data/handRankings';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export interface CardData {
    rank: string;
    suit: Suit;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * Returns a random hand notation from the 169 possible starting hands.
 */
export function getRandomHand(): string {
    const randomIndex = Math.floor(Math.random() * HAND_RANKINGS.length);
    return HAND_RANKINGS[randomIndex].hand;
}

/**
 * Converts a hand notation (e.g., 'AKs', '72o', 'JJ') into a pair of CardData objects.
 */
export function getCardsFromHand(hand: string): [CardData, CardData] {
    const rank1 = hand[0];
    const rank2 = hand[1];
    const type = hand[2]; // 's', 'o', or undefined (for pairs)

    if (!type) { // Pair (e.g., 'JJ')
        const suit1 = SUITS[Math.floor(Math.random() * SUITS.length)];
        let suit2 = SUITS[Math.floor(Math.random() * SUITS.length)];
        while (suit2 === suit1) {
            suit2 = SUITS[Math.floor(Math.random() * SUITS.length)];
        }
        return [
            { rank: rank1 === 'T' ? '10' : rank1, suit: suit1 },
            { rank: rank2 === 'T' ? '10' : rank2, suit: suit2 }
        ];
    }

    if (type === 's') { // Suited (e.g., 'AKs')
        const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
        return [
            { rank: rank1 === 'T' ? '10' : rank1, suit },
            { rank: rank2 === 'T' ? '10' : rank2, suit }
        ];
    }

    // Offsuit (e.g., '72o')
    const suit1 = SUITS[Math.floor(Math.random() * SUITS.length)];
    let suit2 = SUITS[Math.floor(Math.random() * SUITS.length)];
    while (suit2 === suit1) {
        suit2 = SUITS[Math.floor(Math.random() * SUITS.length)];
    }
    return [
        { rank: rank1 === 'T' ? '10' : rank1, suit: suit1 },
        { rank: rank2 === 'T' ? '10' : rank2, suit: suit2 }
    ];
}
