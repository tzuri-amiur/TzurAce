"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getHandRank, isHandInRange, RFI_RANGES } from '@/utils/rangeUtils';
import { getRandomHand, getCardsFromHand, CardData } from '@/utils/handUtils';
import { useTrainerSettings, Position as TrainingPosition } from '@/context/TrainerSettingsContext';
import HandGrid from './HandGrid';

type Position = 'SB' | 'BB' | 'UTG' | 'HJ' | 'CO' | 'BTN';

// Standard Poker positions in clockwise order
const POSITIONS: Position[] = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];

const Card = ({ rank, suit, width = 45, height = 65 }: CardData & { width?: number, height?: number }) => {
    const isRed = suit === 'hearts' || suit === 'diamonds';
    const suitIcons: Record<string, string> = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    };

    return (
        <div style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: 'white',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: width > 50 ? '8px' : '4px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            position: 'relative',
            userSelect: 'none',
            border: '1px solid rgba(0,0,0,0.1)'
        }}>
            <div style={{
                fontSize: width > 50 ? '20px' : '14px',
                fontWeight: '900',
                color: isRed ? '#ef4444' : '#111827',
                lineHeight: '1'
            }}>
                {rank}
            </div>
            <div style={{
                fontSize: width > 50 ? '32px' : '20px',
                alignSelf: 'center',
                color: isRed ? '#ef4444' : '#111827',
                marginBottom: '4px'
            }}>
                {suitIcons[suit]}
            </div>
            <div style={{
                fontSize: width > 50 ? '20px' : '14px',
                fontWeight: '900',
                color: isRed ? '#ef4444' : '#111827',
                transform: 'rotate(180deg)',
                lineHeight: '1'
            }}>
                {rank}
            </div>
        </div>
    );
};

const CardBack = ({ width = 45, height = 65 }: { width?: number, height?: number }) => {
    return (
        <div style={{
            width: `${width}px`,
            height: `${height}px`,
            background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            position: 'relative',
            border: '2px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
        }}>
            <div style={{
                width: '80%',
                height: '80%',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)'
            }}>
                <span style={{
                    fontSize: width > 50 ? '24px' : '14px',
                    fontWeight: '900',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '1px'
                }}>TA</span>
            </div>
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '10px 10px'
            }}></div>
        </div>
    );
};

const ChipStack = ({ count = 1, size = 26, amount }: { count?: number, size?: number, amount?: string }) => {
    return (
        <div style={{ position: 'relative', width: size, height: size + (count - 1) * 2 }}>
            {[...Array(count)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    bottom: i * 2, // 2px vertical offset for 3D effect
                    width: size,
                    height: size,
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px dashed rgba(255,255,255,0.4)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '900',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    zIndex: i
                }}>
                    {/* Numerical label on top chip face (always "0.5" per image_5) */}
                    {(i === count - 1 || count === 1) && (
                        <div style={{ transform: 'scale(0.9)', pointerEvents: 'none' }}>0.5</div>
                    )}
                    {/* Inner ring decoration */}
                    <div style={{
                        position: 'absolute',
                        inset: '4px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%'
                    }} />
                </div>
            ))}
        </div>
    );
};

const BetArea = ({ amount, label }: { amount: string, label: string }) => {
    const chipCount = amount === '0.5' ? 1 : 2;
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1px',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <ChipStack count={chipCount} />
            <div style={{
                fontSize: '9px', // Slightly smaller for neatness
                fontWeight: '900',
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '1px 4px',
                borderRadius: '3px',
                marginTop: '1px',
                whiteSpace: 'nowrap'
            }}>
                {label}
            </div>
        </div>
    );
};

interface TrainerClientProps {
    initialHand: string;
    initialCards: [CardData, CardData];
}

export default function TrainerClient({ initialHand, initialCards }: TrainerClientProps) {
    const router = useRouter();
    const { settings } = useTrainerSettings();
    const [mounted, setMounted] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [modalData, setModalData] = useState<{
        type: 'ERROR' | 'HINT';
        message: string;
    } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // heroGamePosition tracking (index in POSITIONS array)
    const [heroGamePosition, setHeroGamePosition] = useState(5);

    // Use props for initial state to ensure Server/Client sync
    const [currentHand, setCurrentHand] = useState<string>(initialHand);
    const [heroCards, setHeroCards] = useState<[CardData, CardData]>(initialCards);

    // Initial Rank Logging
    useEffect(() => {
        const rank = getHandRank(initialHand);
        console.log(`[Session Start] Hero dealt: ${initialHand} (Rank: ${rank}/169)`);
    }, [initialHand]);

    // Sync position with settings if not RANDOM
    useEffect(() => {
        if (settings.heroPosition !== 'RANDOM') {
            const index = POSITIONS.indexOf(settings.heroPosition as Position);
            if (index !== -1) setHeroGamePosition(index);
        }
    }, [settings.heroPosition]);

    // Accessibility: ESC to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowHint(false);
                setModalData(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Shuffle and Action Logic
    const handleAction = (userAction?: 'FOLD' | 'CALL' | 'RAISE') => {
        const pos = getPositionLabel(5);
        const isInRange = isHandInRange(currentHand, pos);

        // Define correct GTO move based on scenario
        // In RFI, we only Open Raise or Fold. Call should be caught as Limp error.
        let correctAction: 'FOLD' | 'CALL' | 'RAISE' = isInRange ? 'RAISE' : 'FOLD';

        // Validation Logic
        if (userAction) {
            if (userAction !== correctAction) {
                let errorExplanation = '';
                if (userAction === 'CALL') {
                    errorExplanation = `Limping is not part of a GTO strategy. You should have ${correctAction}ed instead.`;
                } else if (userAction === 'FOLD' && correctAction === 'RAISE') {
                    errorExplanation = `This hand is strong enough to Open Raise from ${pos}. You missed value by folding.`;
                } else if (userAction === 'RAISE' && correctAction === 'FOLD') {
                    errorExplanation = `This hand is too weak to Open Raise from ${pos}. It should be a clean fold.`;
                }

                setModalData({
                    type: 'ERROR',
                    message: errorExplanation
                });
                setShowHint(true);
                return; // Don't shuffle yet, let them see the error
            }
        }

        // Success move - hide hint and shuffle
        setShowHint(false);
        setModalData(null);

        if (settings.heroPosition === 'RANDOM') {
            const rfiIndices = [0, 2, 3, 4, 5]; // Excluding index 1 (BB)
            const randomIdx = rfiIndices[Math.floor(Math.random() * rfiIndices.length)];
            setHeroGamePosition(randomIdx);
        }

        // Randomize hand on every action
        const newHand = getRandomHand();
        setCurrentHand(newHand);
        setHeroCards(getCardsFromHand(newHand));

        // Log rank for verification
        const rank = getHandRank(newHand);
        console.log(`[Action] New hand: ${newHand} (Rank: ${rank}/169)`);
    };

    const toggleHint = () => {
        if (!showHint) {
            setModalData({
                type: 'HINT',
                message: `Study the GTO opening range for ${getPositionLabel(5)}.`
            });
            setShowHint(true);
        } else {
            setShowHint(false);
            setModalData(null);
        }
    };

    // Static visual seats (Hero is always visual seat 5)
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
        { id: 5, bottom: '0%', left: '42%', translate: '-50% 50%' },  // Bottom (HERO ANCHOR)
    ];

    // Precise Dealer Button and Bet positioning rules (Seat Class Architecture)
    const getDealerButtonStyles = (seatId: number): React.CSSProperties => {
        switch (seatId) {
            case 5: return { top: '-45px', left: '-35px' }; // Baseline near bottom center
            case 2: return { bottom: '-45px', left: '50%', transform: 'translateX(-50%)' };
            case 0: return { top: '-15px', right: '-25px' };
            case 1: return { bottom: '-15px', right: '-25px' };
            case 3: return { bottom: '-15px', left: '-25px' };
            case 4: return { top: '-15px', left: '-25px' };
            default: return {};
        }
    };

    const getBetStyles = (seatId: number): React.CSSProperties => {
        // Implementing User's "PokerSeat" logic with 25px vertical bias
        switch (seatId) {
            case 5: // Hero: Top-Left reference + (-50px, -25px) to clear cards
                return { top: '-45px', left: '-45px' };
            case 2: // Top center: Mid-Bottom reference + (0, 45px)
                return { bottom: '-45px', left: '50%', transform: 'translateX(-50%)' };
            case 0: // Player 0 (Lower Left): Top-Right reference + (50px Right, 25px Higher)
                return { top: '-25px', right: '-50px' };
            case 1: // Player 1 (Upper Left): Bottom-Right reference + (50px Right, 25px Lower)
                return { bottom: '-25px', right: '-50px' };
            case 3: // Player 3 (Upper Right): Bottom-Left reference + (50px Left, 25px Lower)
                return { bottom: '-25px', left: '-50px' };
            case 4: // Player 4 (Lower Right): Top-Left reference + (50px Left, 25px Higher)
                return { top: '-25px', left: '-50px' };
            default: return {};
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
            {/* Feedback Modal Overlay */}
            {showHint && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(2, 6, 23, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '550px',
                        backgroundColor: '#0f172a',
                        borderRadius: '24px',
                        border: `2px solid ${modalData?.type === 'ERROR' ? '#ef4444' : '#10b981'}`,
                        padding: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        position: 'relative',
                        animation: 'modalSlideUp 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{
                                backgroundColor: modalData?.type === 'ERROR' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: modalData?.type === 'ERROR' ? '#ef4444' : '#10b981',
                                padding: '6px 12px',
                                borderRadius: '100px',
                                fontSize: '12px',
                                fontWeight: '900',
                                letterSpacing: '1px'
                            }}>
                                {modalData?.type || 'HINT'}
                            </div>
                            <button
                                onClick={() => { setShowHint(false); setModalData(null); }}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}
                            >✕</button>
                        </div>

                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
                                {modalData?.type === 'ERROR' ? 'Wrong Move!' : `${getPositionLabel(5)} Range`}
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5' }}>
                                {modalData?.message}
                            </p>
                        </div>

                        <HandGrid currentPosition={getPositionLabel(5)} currentHandNotation={currentHand} />

                        <button
                            onClick={() => { setShowHint(false); setModalData(null); }}
                            style={{
                                ...buttonStyle,
                                width: '100%',
                                backgroundColor: '#10b981',
                                color: 'white',
                                marginTop: '8px'
                            }}
                        >
                            GOT IT
                        </button>
                    </div>
                </div>
            )}

            {/* Page Title */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px' }}>
                    TRAINING LAB <span style={{ color: 'white' }}>| {settings.scenario === 'RFI' ? 'RFI' : 'RESPONSE'}</span>
                </div>
            </div>

            {/* Table Container */}
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
                        width: '85%',
                        height: '75%',
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

                        {/* Pot Area */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            zIndex: 5
                        }}>
                            <ChipStack count={3} />
                            <div style={{
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                padding: '4px 12px',
                                borderRadius: '100px',
                                color: '#10b981',
                                fontSize: '14px',
                                fontWeight: '900',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                backdropFilter: 'blur(4px)',
                                letterSpacing: '1px'
                            }}>
                                POT: 1.5 BB
                            </div>
                        </div>
                    </div>

                    {/* Action Order for Fold States: UTG, HJ, CO, BTN, SB, BB */}
                    {/* Position Indices: SB:0, BB:1, UTG:2, HJ:3, CO:4, BTN:5 */}
                    {/* Action Order Indices: 2, 3, 4, 5, 0, 1 */}

                    {/* Seats */}
                    {seats.map((seat) => {
                        const ACTION_ORDER = [2, 3, 4, 5, 0, 1];
                        const label = getPositionLabel(seat.id);
                        const posIndex = POSITIONS.indexOf(label as Position);
                        const isHero = seat.id === 5;
                        const isDealer = label === 'BTN';
                        const isSB = label === 'SB';
                        const isBB = label === 'BB';

                        // Fold Logic: Players between BB and Hero act before Hero
                        const actionIndex = ACTION_ORDER.indexOf(posIndex);
                        const heroActionIndex = ACTION_ORDER.indexOf(heroGamePosition);
                        const isFolded = !isHero && actionIndex < heroActionIndex;

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
                                {/* CHILD ANCHORED Bet Area */}
                                {(isSB || isBB) && (
                                    <div style={{
                                        position: 'absolute',
                                        zIndex: 30,
                                        ...getBetStyles(seat.id)
                                    }}>
                                        <BetArea
                                            amount={isSB ? '0.5' : '1.0'}
                                            label={isSB ? '0.5 BB' : '1.0 BB'}
                                        />
                                    </div>
                                )}

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
                                        zIndex: 40,
                                        ...getDealerButtonStyles(seat.id)
                                    }}>D</div>
                                )}

                                {!isFolded && (
                                    isHero ? (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-135px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            display: 'flex',
                                            gap: '0px',
                                            zIndex: 15
                                        }}>
                                            <div style={{ transform: 'rotate(-5deg)' }}>
                                                <Card {...heroCards[0]} width={85} height={125} />
                                            </div>
                                            <div style={{ transform: 'rotate(5deg)', marginLeft: '-25px' }}>
                                                <Card {...heroCards[1]} width={85} height={125} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-55px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            display: 'flex',
                                            gap: '4px',
                                            zIndex: 15
                                        }}>
                                            <div style={{ transform: 'rotate(-3deg)' }}><CardBack /></div>
                                            <div style={{ transform: 'rotate(3deg)', marginLeft: '-15px' }}><CardBack /></div>
                                        </div>
                                    )
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
                                    transition: 'all 0.5s',
                                    animation: isHero ? 'pulse 2s infinite' : 'none',
                                    width: 'fit-content',
                                    opacity: isFolded ? 0.4 : 1,
                                    filter: isFolded ? 'grayscale(0.5)' : 'none'
                                }}>
                                    <div style={{ fontSize: '10px', color: isHero ? '#10b981' : '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>
                                        {label}
                                    </div>
                                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                                        {isHero ? 'HERO' : `Player ${seat.id}`}
                                    </div>
                                    {isHero && (
                                        <div style={{
                                            marginTop: '8px',
                                            fontSize: '11px',
                                            color: '#10b981',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            paddingTop: '8px',
                                            fontWeight: 'bold'
                                        }}>
                                            Hand: <span style={{ color: 'white' }}>
                                                {currentHand} {mounted && settings.showHandRank ? `(${getHandRank(currentHand)}/169)` : ''}
                                            </span>
                                        </div>
                                    )}
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
                alignItems: 'center',
                gap: '20px',
                zIndex: 50
            }}>
                <button
                    onClick={() => handleAction('FOLD')}
                    style={{ ...buttonStyle, backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171' }}
                    className="action-btn"
                >
                    FOLD
                </button>
                <button
                    onClick={() => handleAction('CALL')}
                    style={{ ...buttonStyle, backgroundColor: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#60a5fa' }}
                    className="action-btn"
                >
                    CALL
                </button>
                <button
                    onClick={() => handleAction('RAISE')}
                    style={{ ...buttonStyle, backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399' }}
                    className="action-btn"
                >
                    RAISE
                </button>

                {/* Hint Button */}
                <button
                    onClick={toggleHint}
                    style={{
                        ...buttonStyle,
                        minWidth: '60px',
                        padding: '12px',
                        backgroundColor: showHint ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: showHint ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: showHint ? '#fbbf24' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    className="action-btn"
                    title="Toggle Range Hint"
                >
                    <span style={{ fontSize: '20px' }}>💡</span>
                    <span style={{ fontSize: '12px' }}>{showHint ? 'HIDE' : 'HINT'}</span>
                </button>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                @keyframes modalSlideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
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
