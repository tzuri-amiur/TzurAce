"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type Position = 'SB' | 'BB' | 'UTG' | 'HJ' | 'CO' | 'BTN';

const POSITIONS: Position[] = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];

export default function TrainerPage() {
    const router = useRouter();
    const [heroPositionIndex] = useState(5); // BTN by default (Seat 5)

    // Map 6-max positions clockwise starting from Hero at Bottom Center (Seat 5)
    // Seat Indices: 5:Bottom, 0:Lower-Left, 1:Upper-Left, 2:Top, 3:Upper-Right, 4:Lower-Right
    const getPositionLabel = (seatIndex: number) => {
        // Standard clockwise seats: 5 (Hero) -> 0 -> 1 -> 2 -> 3 -> 4
        const clockwiseSeats = [5, 0, 1, 2, 3, 4];
        const relativeSeatIndex = clockwiseSeats.indexOf(seatIndex);
        const positionIndex = (heroPositionIndex + relativeSeatIndex) % 6;
        return POSITIONS[positionIndex];
    };

    const seats = [
        { id: 0, bottom: '12%', left: '5%', translate: '0 0' },     // Lower Left (SB)
        { id: 1, top: '12%', left: '5%', translate: '0 0' },        // Upper Left (BB)
        { id: 2, top: '2%', left: '42%', translate: '-50% 0' },     // Top (UTG) - SHIFTED LEFT
        { id: 3, top: '12%', right: '5%', translate: '0 0' },       // Upper Right (HJ)
        { id: 4, bottom: '12%', right: '5%', translate: '0 0' },    // Lower Right (CO)
        { id: 5, bottom: '2%', left: '42%', translate: '-50% 0' },  // Bottom (Hero/BTN) - SHIFTED LEFT
    ];

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#020617',
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <button
                    onClick={() => router.push('/')}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px' }}>
                    TRAINING LAB <span style={{ color: 'white' }}>| 6-MAX</span>
                </div>
                <div style={{ width: '100px' }}></div> {/* Spacer */}
            </div>

            {/* Table Container */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 0'
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
                                    zIndex: 10
                                }}
                            >
                                {/* Dealer Button */}
                                {isDealer && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-15px',
                                        ...(seat.left && !isHero ? { right: '-25px' } : { left: '-25px' }),
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
                                        zIndex: 20
                                    }}>D</div>
                                )}

                                {/* Seat UI */}
                                <div style={{
                                    backgroundColor: isHero ? '#0f172a' : '#1e293b',
                                    border: isHero ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    minWidth: '100px',
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

            <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        @media (max-width: 768px) {
          .table-container {
            transform: scale(0.8);
          }
        }
      `}</style>
        </div>
    );
}
