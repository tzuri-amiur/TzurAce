import React from 'react';
import { getRandomHand, getCardsFromHand } from '@/utils/handUtils';
import TrainerClient from './TrainerClient';

export default function TrainerPage() {
    // Generate random hand on the server
    const initialHand = getRandomHand();
    const initialCards = getCardsFromHand(initialHand);

    return (
        <TrainerClient
            initialHand={initialHand}
            initialCards={initialCards}
        />
    );
}
