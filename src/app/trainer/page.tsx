"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type Position = 'SB' | 'BB' | 'UTG' | 'HJ' | 'CO' | 'BTN';

// Standard Poker positions in clockwise order
const POSITIONS: Position[] = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];

// Placeholder for future logic: 169 possible hand combinations ranked by strength
const HAND_RANKINGS = [
    { hand: 'AA', rank: 1 },
    { hand: 'KK', rank: 2 },
    { hand: 'QQ', rank: 3 },
    // ... rest of the 169 combinations
];

export default function TrainerPage() {
    const router = useRouter();

    // heroGamePosition tracking (index in POSITIONS array)
    // 5 means Hero is BTN, 0 means Hero is SB, etc.
    const [heroGamePosition, setHeroGamePosition] = useState(5);

    // Shuffle logic: rotate the game positions around the Hero
    const handleAction = () => {
        // Simply move to the next position in the clockwise sequence
        setHeroGamePosition((prev) => (prev + 1) % 6);
    };

    // Static visual seats (Hero is always visual seat 5)
    // Mapping: 5:Bottom, 0:Lower-Left, 1:Upper-Left, 2:Top, 3:Upper-Right, 4:Lower-Right
    const getPositionLabel = (seatIndex: number) => {
        const clockwiseSeats = [5, 0, 1, 2, 3, 4];
        const relativeSeatIndex = clockwiseSeats.indexOf(seatIndex);
        const positionIndex = (heroGamePosition + relativeSeatIndex) % 6;
        return POSITIONS[positionIndex];
    };

    const seats = [
        { id: 0, bottom: '12%', left: '5%', translate: '0 0' },     // Lower Left
        { id: 1, top: '12%', left: '5%', translate: '0 0' },        // Upper Left
        { id: 2, top: '2%', left: '42%', translate: '-50% 0' },     // Top
        { id: 3, top: '12%', right: '5%', translate: '0 0' },       // Upper Right
        { id: 4, bottom: '12%', right: '5%', translate: '0 0' },    // Lower Right
        { id: 5, bottom: '2%', left: '42%', translate: '-50% 0' },  // Bottom (HERO ANCHOR)
    ];

    // Precise Dealer Button positioning rules for each seat
    const getDealerButtonStyles = (seatId: number): React.CSSProperties => {
        switch (seatId) {
            case 5: // Bottom Pole
                return { top: '-40px', left: '50%', transform: 'translateX(-50%)' };
            case 2: // Top Pole
                return { bottom: '-40px', left: '50%', transform: 'translateX(-50%)' };
            case 0: // Lower Left
                return { top: '-20px', right: '-30px' };
            case 1: // Upper Left
                return { bottom: '-20px', right: '-30px' };
            case 3: // Upper Right
                return { bottom: '-20px', left: '-30px' };
            case 4: // Lower Right
                return { top: '-20px', left: '-30px' };
            default:
                return {};
        }
    };

    const buttonStyle: React.CSSProperties = {
        padding: '16px 32px',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        minWidth: '140px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#020617',
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            overflow: 'hidden'
        }}>
            {/* Page Title */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px' }}>
                    TRAINING LAB <span style={{ color: 'white' }}>| 6-MAX</span>
                </div>
            </div>

            {/* Table Container - Shifted Higher */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 0 100px 0',
                marginTop: '-40px'
            }}>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '1000px',
                    aspectRatio: '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>

                    {/* The Poker Table */}
                    <div style={{
                        width: '80%',
                        height: '70%',
                        backgroundColor: '#065f46',
                        borderRadius: '1000px',
                        border: '12px solid #111827',
                        boxShadow: '0 0 60px rgba(0,0,0,0.8), inset 0 0 120px rgba(0,0,0,0.6)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {/* Watermark */}
                        <div style={{
                            fontSize: '48px',
                            fontWeight: '900',
                            color: 'rgba(255,255,255,0.03)',
                            userSelect: 'none',
                            letterSpacing: '10px'
                        }}>
                            TZURACE
                        </div>

                        {/* Table inner line */}
                        <div style={{
                            position: 'absolute',
                            inset: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '1000px'
                        }}></div>
                    </div>

                    {/* Seats */}
                    {seats.map((seat) => {
                        const label = getPositionLabel(seat.id);
                        const isHero = seat.id === 5;
                        const isDealer = label === 'BTN';

                        return (
                            <div
                                key={seat.id}
                                style={{
                                    position: 'absolute',
                                    top: seat.top,
                                    left: seat.left,
                                    right: seat.right,
                                    bottom: seat.bottom,
                                    transform: seat.translate ? `translate(${seat.translate})` : 'none',
                                    zIndex: 10,
                                    transition: 'all 0.5s ease-in-out'
                                }}
                            >
                                {/* Dealer Button */}
                                {isDealer && (
                                    <div style={{
                                        position: 'absolute',
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: 'white',
                                        color: 'black',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: '900',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
                                        border: '2px solid #10b981',
                                        zIndex: 20,
                                        ...getDealerButtonStyles(seat.id)
                                    }}>D</div>
                                )}

                                {/* Seat UI */}
                                <div style={{
                                    backgroundColor: isHero ? '#0f172a' : '#1e293b',
                                    border: isHero ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    minWidth: isHero ? '150px' : '100px',
                                    textAlign: 'center',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                                    transition: 'all 0.2s',
                                    animation: isHero ? 'pulse 2s infinite' : 'none',
                                    width: 'fit-content'
                                }}>
                                    <div style={{ fontSize: '10px', color: isHero ? '#10b981' : '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>
                                        {label}
                                    </div>
                                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                                        {isHero ? 'HERO' : `Player ${seat.id}`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons Bar */}
            <div style={{
                position: 'fixed',
                bottom: '60px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '20px',
                zIndex: 50
            }}>
                <button
                    onClick={handleAction}
                    style={{ ...buttonStyle, backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171' }}
                    className="action-btn"
                >
                    FOLD
                </button>
                <button
                    onClick={handleAction}
                    style={{ ...buttonStyle, backgroundColor: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#60a5fa' }}
                    className="action-btn"
                >
                    CALL
                </button>
                <button
                    onClick={handleAction}
                    style={{ ...buttonStyle, backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399' }}
                    className="action-btn"
                >
                    RAISE / 3BET
                </button>
            </div>

            <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .action-btn:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 8px 25px rgba(0,0,0,0.5);
          filter: brightness(1.2);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .action-btn {
            padding: 12px 20px;
            min-width: 100px;
            font-size: 14px;
          }
        }
      `}</style>
        </div>
    );
}
