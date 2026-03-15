"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getHandRank, getRecommendation, RFI_RANGES } from '@/utils/rangeUtils';
import { getRandomHand, getCardsFromHand, CardData, Suit } from '@/utils/handUtils';
import { useTrainerSettings, Position as TrainingPosition } from '@/context/TrainerSettingsContext';
import HandGrid from './HandGrid';
import Simulator from '../simulator/Simulator';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

function getRandomCard(exclude: CardData[]): CardData {
    while (true) {
        const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
        const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
        const isDuplicate = exclude.some(c =>
            (c.rank === '10' ? 'T' : c.rank) === (rank === '10' ? 'T' : rank) && c.suit === suit
        );
        if (!isDuplicate) {
            return { rank: rank === 'T' ? '10' : rank, suit };
        }
    }
}

type Position = 'SB' | 'BB' | 'UTG' | 'HJ' | 'CO' | 'BTN';

// Standard Poker positions in clockwise order
const POSITIONS: Position[] = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];



interface TrainerClientProps {
    initialHand: string;
    initialCards: [CardData, CardData];
}

export default function TrainerClient({ initialHand, initialCards }: TrainerClientProps) {
    const router = useRouter();
    const { settings } = useTrainerSettings();
    const [mounted, setMounted] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const isPortrait = windowSize.height > windowSize.width;
    const [showHint, setShowHint] = useState(false);
    const [modalData, setModalData] = useState<{
        type: 'ERROR' | 'HINT';
        message: string;
    } | null>(null);

    const isLandscapeMobile = mounted && windowSize.width <= 932 && windowSize.width > windowSize.height;

    useEffect(() => {
        setMounted(true);
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // heroGamePosition tracking (index in POSITIONS array)
    const [heroGamePosition, setHeroGamePosition] = useState(5);

    // Use props for initial state to ensure Server/Client sync
    const [currentHand, setCurrentHand] = useState<string>(initialHand);
    const [heroCards, setHeroCards] = useState<[CardData, CardData]>(initialCards);
    const [boardCards, setBoardCards] = useState<CardData[]>([]);
    const [potSizeBB, setPotSizeBB] = useState<number>(1.5);
    const [currentScenario, setCurrentScenario] = useState<'RFI' | 'FACING_OPEN'>('RFI');
    const [raiserPosition, setRaiserPosition] = useState<Position | null>(null);

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

    const generateScenario = () => {
        let newHeroPosIndex = heroGamePosition;
        if (settings.heroPosition === 'RANDOM') {
            const rfiIndices = [0, 2, 3, 4, 5]; // Excluding index 1 (BB)
            newHeroPosIndex = rfiIndices[Math.floor(Math.random() * rfiIndices.length)];
            setHeroGamePosition(newHeroPosIndex);
        }

        const heroPosLabel = POSITIONS[newHeroPosIndex];
        const heroActionIdx = ACTION_ORDER.indexOf(heroPosLabel);

        // Determine Scenario: RFI or FACING_OPEN based on settings
        let scenario: 'RFI' | 'FACING_OPEN' = 'RFI';
        let raiser: Position | null = null;

        const trainingMode = settings.scenario || 'RANDOM';

        if (trainingMode === 'RESPONSE') {
            if (heroPosLabel !== 'UTG') {
                scenario = 'FACING_OPEN';
            } else {
                scenario = 'RFI'; // UTG cannot face an open
            }
        } else if (trainingMode === 'RFI') {
            scenario = 'RFI';
        } else {
            // RANDOM Mode: 50/50 if not UTG
            if (heroPosLabel !== 'UTG' && Math.random() > 0.5) {
                scenario = 'FACING_OPEN';
            } else {
                scenario = 'RFI';
            }
        }

        if (scenario === 'FACING_OPEN') {
            // Pick a raiser from players who act BEFORE Hero in ACTION_ORDER
            const validRaisers = ACTION_ORDER.slice(0, heroActionIdx);
            if (validRaisers.length > 0) {
                raiser = validRaisers[Math.floor(Math.random() * validRaisers.length)];
            } else {
                scenario = 'RFI'; // Fallback
            }
        }

        setCurrentScenario(scenario);
        setRaiserPosition(raiser);

        const newHand = getRandomHand();
        const newHeroCards = getCardsFromHand(newHand);
        setCurrentHand(newHand);
        setHeroCards(newHeroCards);

        // Generate Random Board
        const streets = [0, 3, 4, 5];
        const numBoardCards = streets[Math.floor(Math.random() * streets.length)];

        let currentBoard: CardData[] = [];
        let usedCards = [...newHeroCards];
        for (let i = 0; i < numBoardCards; i++) {
            const card = getRandomCard(usedCards);
            currentBoard.push(card);
            usedCards.push(card);
        }
        setBoardCards(currentBoard);

        // Pot handled by useMemo for Pre-flop, but for post-flop we might need this:
        if (numBoardCards > 0) {
            if (numBoardCards === 3) setPotSizeBB(+(Math.random() * 10 + 4).toFixed(1));
            else if (numBoardCards === 4) setPotSizeBB(+(Math.random() * 25 + 12).toFixed(1));
            else setPotSizeBB(+(Math.random() * 60 + 25).toFixed(1));
        }

        console.log(`[Action] Generated Scenario - Hand: ${newHand}, Scenario: ${scenario}, Hero: ${heroPosLabel}, Raiser: ${raiser || 'None'}`);
    };

    // Shuffle and Action Logic
    const handleAction = (userAction?: 'FOLD' | 'CALL' | 'RAISE') => {
        const pos = getPositionLabel(5);

        // Define correct GTO move using prioritized recommendation logic
        const correctAction = getRecommendation(currentHand, pos, currentScenario, raiserPosition || undefined);

        // Validation Logic
        if (userAction) {
            if (userAction !== correctAction) {
                let errorExplanation = '';
                if (userAction === 'CALL') {
                    if (currentScenario === 'RFI') {
                        errorExplanation = `Limping is not part of a GTO strategy. You should have ${correctAction}ed instead.`;
                    } else {
                        errorExplanation = `Calling a raise here is not optimal GTO play. You should have ${correctAction}ed.`;
                    }
                } else if (userAction === 'FOLD' && correctAction === 'RAISE') {
                    const actionName = currentScenario === 'RFI' ? 'Open Raise' : '3-Bet';
                    errorExplanation = `This hand is strong enough to ${actionName} from ${pos}. You missed value by folding.`;
                } else if (userAction === 'RAISE' && correctAction === 'FOLD') {
                    const actionName = currentScenario === 'RFI' ? 'Open Raise' : '3-Bet';
                    errorExplanation = `This hand is too weak to ${actionName} from ${pos}. It should be a clean fold.`;
                } else if (userAction === 'FOLD' && correctAction === 'CALL') {
                    errorExplanation = `This hand is strong enough to Call the raise from ${pos}. Folding is too tight.`;
                } else if (userAction === 'RAISE' && correctAction === 'CALL') {
                    errorExplanation = `This hand is a good Call, but too weak to 3-Bet. You are overplaying it.`;
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

        generateScenario();
    };

    const toggleHint = () => {
        if (!showHint) {
            const message = currentScenario === 'RFI'
                ? `Study the GTO opening range for ${getPositionLabel(5)}.`
                : `Study the 3-Bet defense range for ${getPositionLabel(5)} vs ${raiserPosition} raise.`;
            setModalData({
                type: 'HINT',
                message
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

    const LANDSCAPE_SEATS = [
        { id: 0, bottom: '12%', left: '5%' },
        { id: 1, top: '12%', left: '5%' },
        { id: 2, top: '2%', left: '42%', translate: '-50%, 0' },
        { id: 3, top: '12%', right: '5%' },
        { id: 4, bottom: '12%', right: '5%' },
        { id: 5, bottom: '0%', left: '42%', translate: '-50%, 50%' },
    ];

    // Portrait: vertical ellipse — hero at bottom, Player 2 at top, Players 0&1 left, Players 3&4 right
    const PORTRAIT_SEATS = [
        { id: 0, bottom: '28%', left: '4%' },
        { id: 1, top: '25%', left: '4%' },
        { id: 2, top: '1%', left: '50%', translate: '-50%, 0' },
        { id: 3, top: '25%', right: '4%' },
        { id: 4, bottom: '28%', right: '4%' },
        { id: 5, bottom: '-17%', left: '50%', translate: '-50%, 0' },
    ];

    const seats = isPortrait ? PORTRAIT_SEATS : LANDSCAPE_SEATS;

    // 7XL Style seat dimensions
    const seatWidth = isLandscapeMobile ? 90 : (isPortrait ? 100 : 120);
    const seatHeight = isLandscapeMobile ? 45 : (isPortrait ? 50 : 60);

    // --- Mobile Scaling ---
    // On mobile, compute explicit table dimensions and scale seats proportionally.
    // On desktop (width >= 1024), CSS handles layout via maxWidth + aspectRatio.
    const isMobile = windowSize.width > 0 && windowSize.width < 1024;
    let tableW = 0, tableH = 0;
    if (isMobile) {
        if (isPortrait) {
            // Portrait: width-constrained, height capped by viewport
            tableW = windowSize.width - 16;
            tableH = Math.min(tableW * (1.2), windowSize.height - 200);
        } else if (isLandscapeMobile) {
            // 7XL Landscape: space for right sidebar (160px)
            const availW = windowSize.width - 170;
            const availH = windowSize.height - 40;
            tableH = Math.min(availH, 450);
            tableW = Math.min(tableH * (16 / 9), availW);
        } else {
            // Normal Landscape: height-constrained (action bar + title takes ~150px)
            const availH = windowSize.height - 150;
            tableH = Math.min(availH, 380);
            tableW = Math.min(tableH * (16 / 9), windowSize.width - 40);
        }
    } else {
        // Desktop: dynamic but max 950x420, leaving space for header and buttons
        const availH = windowSize.height - 250;
        tableH = Math.min(availH, 420);
        tableW = tableH * (950 / 420);
    }
    // Scale seats relative to their natural desktop positioning
    const seatScale = !isMobile ? 1.0
        : isPortrait
            ? Math.min(1.0, tableW / 420)
            : Math.min(1.0, tableW / 950);

    // Precise Dealer Button and Bet positioning rules (Seat Class Architecture)
    const getDealerButtonStyles = (seatId: number): React.CSSProperties => {
        if (isPortrait) {
            switch (seatId) {
                case 5: return { top: '-58px', left: 'calc(50% - 110px)', transform: 'translateX(-50%)' };
                case 2: return { bottom: '-35px', left: '50%', transform: 'translateX(-50%)' };
                case 0: return { bottom: '15px', right: '-40px' };
                case 1: return { bottom: '15px', right: '-40px' };
                case 3: return { bottom: '15px', left: '-40px' };
                case 4: return { bottom: '15px', left: '-40px' };
                default: return {};
            }
        }
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
        if (isPortrait) {
            switch (seatId) {
                case 5: return { top: '-85px', left: '50%', transform: 'translateX(-50%)' };
                case 2: return { bottom: '-85px', left: '50%', transform: 'translateX(-50%)' };
                case 0: return { top: '50%', left: 'unset', right: '-70px', transform: 'translateY(-50%)' };
                case 1: return { top: '50%', left: 'unset', right: '-70px', transform: 'translateY(-50%)' };
                case 3: return { top: '50%', left: '-70px', transform: 'translateY(-50%)' };
                case 4: return { top: '50%', left: '-70px', transform: 'translateY(-50%)' };
                default: return {};
            }
        }
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

    const ACTION_ORDER: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

    const calculatedSeats = React.useMemo(() => {
        const currentHeroPos = POSITIONS[heroGamePosition];
        const heroActionIdx = ACTION_ORDER.indexOf(currentHeroPos);
        const heroIdxInPositions = heroGamePosition;
        const visuallyShifted = [...POSITIONS.slice(heroIdxInPositions), ...POSITIONS.slice(0, heroIdxInPositions)];

        return Array.from({ length: 6 }).map((_, i) => {
            const posLabel = visuallyShifted[i];
            const actionIdx = ACTION_ORDER.indexOf(posLabel);
            const isHero = i === 0;

            let status: 'active' | 'folded' | 'hero' = 'active';
            let betAmount = 0;

            if (isHero) {
                status = 'hero';
            } else {
                // Determine status based on scenario
                if (currentScenario === 'RFI') {
                    // Everyone before Hero has folded
                    if (actionIdx !== -1 && actionIdx < heroActionIdx && posLabel !== 'SB' && posLabel !== 'BB') {
                        status = 'folded';
                    }
                } else if (currentScenario === 'FACING_OPEN' && raiserPosition) {
                    const raiserActionIdx = ACTION_ORDER.indexOf(raiserPosition);

                    if (posLabel === raiserPosition) {
                        status = 'active';
                        betAmount = 3.0;
                    } else if (actionIdx < heroActionIdx) {
                        // Everyone else before Hero is folded
                        status = 'folded';
                    }
                }
            }

            if (posLabel === 'SB') betAmount = Math.max(betAmount, 0.5);
            else if (posLabel === 'BB') betAmount = Math.max(betAmount, 1.0);

            return {
                seatIndex: i,
                status,
                positionLabel: posLabel,
                betAmount
            };
        });
    }, [heroGamePosition, currentScenario, raiserPosition]);

    const totalPot = React.useMemo(() => {
        return calculatedSeats.reduce((sum, seat) => sum + (seat.betAmount || 0), 0);
    }, [calculatedSeats]);

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
        <div
            className="trainer-page-container"
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: isLandscapeMobile ? '#111111' : '#020617',
                color: 'white',
                fontFamily: 'Inter, system-ui, sans-serif',
                display: 'flex',
                flexDirection: isLandscapeMobile ? 'row' : 'column',
                padding: 0,
                overflow: 'hidden',
            }}
        >
            {/* Feedback Modal Overlay */}
            {showHint && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(2, 6, 23, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1200, /* Higher than Simulator's fixed z-index if any */
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '550px',
                        maxHeight: '90dvh',
                        overflowY: 'auto',
                        backgroundColor: '#0f172a',
                        borderRadius: '24px',
                        border: `2px solid ${modalData?.type === 'ERROR' ? '#ef4444' : '#10b981'}`,
                        padding: isMobile ? '20px' : '32px',
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

                        <HandGrid
                            currentPosition={getPositionLabel(5)}
                            currentHandNotation={currentHand}
                            scenario={currentScenario}
                            raiserPos={raiserPosition || undefined}
                        />

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

            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: 0 }}>
                {/* Lab Title Banner (Sub-header) */}
                <div style={{
                    paddingTop: '15px',
                    paddingBottom: '5px',
                    textAlign: 'center',
                    zIndex: 100,
                    width: '100%',
                    flexShrink: 0,
                    minHeight: 0
                }}>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px', letterSpacing: '2px', textShadow: '0 2px 5px rgba(0,0,0,1)' }}>
                        TRAINING LAB <span style={{ color: 'white' }}>| {currentScenario === 'RFI' ? 'RFI' : '3-BET'}</span>
                    </div>
                </div>

                {/* Simulator Area - Perfectly centered in available space with scaling protection */}
                <div
                    className="table-container-fixed"
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        overflow: 'hidden',
                        position: 'relative',
                        minHeight: 0 /* Important for flexbox to allow shrinking */
                    }}
                >
                    <div style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        transform: (showHint && isMobile) ? 'scale(0.6)' : 'none',
                        transition: 'transform 0.3s ease'
                    }}>
                        <Simulator
                            heroHand={heroCards}
                            boardCards={boardCards}
                            potSizeBB={totalPot}
                            numPlayers={6}
                            position={POSITIONS[heroGamePosition]}
                            showHeader={false}
                            seats={calculatedSeats}
                            gameState="PRE_FLOP"
                        />
                    </div>
                </div>

                {/* ── Action Bar ── Pinned at the very bottom, minimal padding */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isMobile ? '8px' : '12px',
                    padding: isMobile ? '8px 10px 10px' : '10px 20px 12px',
                    flexShrink: 0,
                    background: 'rgba(2, 6, 23, 0.95)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 110,
                    minHeight: 0
                }}>
                    <button
                        onClick={() => handleAction('FOLD')}
                        style={{ ...buttonStyle, padding: isMobile ? '12px 0' : '12px 24px', backgroundColor: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255, 255, 255, 0.1)', flex: isMobile ? 1 : 'none', minWidth: isMobile ? '0' : '130px' }}
                    >FOLD</button>
                    <button
                        onClick={() => handleAction('CALL')}
                        style={{ ...buttonStyle, padding: isMobile ? '12px 0' : '12px 24px', backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.3)', flex: isMobile ? 1 : 'none', minWidth: isMobile ? '0' : '130px' }}
                    >CALL</button>
                    <button
                        onClick={() => handleAction('RAISE')}
                        style={{ ...buttonStyle, padding: isMobile ? '12px 0' : '12px 24px', backgroundColor: '#10b981', color: '#000', flex: isMobile ? 1 : 'none', minWidth: isMobile ? '0' : '130px' }}
                    >RAISE</button>
                    <button
                        onClick={toggleHint}
                        style={{ ...buttonStyle, padding: isMobile ? '12px 0' : '12px 24px', backgroundColor: '#fbbf24', color: '#000', flex: isMobile ? 1 : 'none', minWidth: isMobile ? '0' : '130px' }}
                    >HINT</button>
                </div>
            </div>

            <style jsx>{`
                @keyframes modalSlideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
