"use client";
import React from 'react';
import { getHandRank, isHandInRange, RFI_RANGES } from '@/utils/rangeUtils';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

interface HandGridProps {
    currentPosition: string;
    currentHandNotation?: string;
}

const HandGrid: React.FC<HandGridProps> = ({ currentPosition, currentHandNotation }) => {
    const rangePercent = RFI_RANGES[currentPosition] || 0;

    const renderCell = (rowIndex: number, colIndex: number) => {
        const rank1 = RANKS[rowIndex];
        const rank2 = RANKS[colIndex];
        let hand: string;

        if (rowIndex === colIndex) {
            hand = rank1 + rank2; // Pair
        } else if (rowIndex < colIndex) {
            hand = rank1 + rank2 + 's'; // Suited (Row < Col e.g. Row A, Col K)
        } else {
            hand = rank2 + rank1 + 'o'; // Offsuit (Row > Col e.g. Row K, Col A)
        }

        const isInRange = isHandInRange(hand, currentPosition);
        const isCurrentHand = hand === currentHandNotation;
        const rank = getHandRank(hand);

        return (
            <div
                key={hand}
                title={`${hand} (Rank: ${rank})`}
                style={{
                    aspectRatio: '1/1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    backgroundColor: isInRange ? '#10b981' : 'rgba(255,255,255,0.05)',
                    color: isInRange ? 'white' : 'rgba(255,255,255,0.3)',
                    border: isCurrentHand ? '2px solid #fbbf24' : '1px solid rgba(0,0,0,0.2)',
                    boxShadow: isCurrentHand ? '0 0 10px #fbbf24' : 'none',
                    zIndex: isCurrentHand ? 2 : 1,
                    transition: 'all 0.2s',
                    cursor: 'default',
                    userSelect: 'none',
                    position: 'relative'
                }}
            >
                {isCurrentHand && (
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '8px',
                        color: '#fbbf24'
                    }}>●</div>
                )}
                <span style={{ fontSize: 'min(1.5vw, 10px)' }}>{hand}</span>
            </div>
        );
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(13, 1fr)',
                gap: '1px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.05)'
            }}>
                {RANKS.map((_, rowIndex) => (
                    RANKS.map((_, colIndex) => renderCell(rowIndex, colIndex))
                ))}
            </div>

            <div style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
                    <span style={{ color: '#94a3b8' }}>In Range</span>
                </div>
                <div style={{ fontWeight: 'bold', color: '#10b981' }}>
                    {currentPosition}: {rangePercent}%
                </div>
            </div>
        </div>
    );
};

export default HandGrid;
