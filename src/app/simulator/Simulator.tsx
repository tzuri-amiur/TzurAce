"use client";
import React, { useState, useEffect, useCallback } from 'react';
import './Simulator.css';

// ─── Types ───────────────────────────────────────────────────
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

interface CardData {
    rank: Rank;
    suit: Suit;
}

// ─── Card Component ───────────────────────────────────────────
const SUIT_ICONS: Record<Suit, string> = {
    hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠'
};

function SimCard({ rank, suit, width = 42, height = 60 }: CardData & { width?: number; height?: number }) {
    const isRed = suit === 'hearts' || suit === 'diamonds';
    return (
        <div className={`sim-card ${isRed ? 'red' : 'black'}`} style={{ width, height }}>
            <div className="sim-card-rank-top">{rank}</div>
            <div className="sim-card-suit">{SUIT_ICONS[suit]}</div>
            <div className="sim-card-rank-bot">{rank}</div>
        </div>
    );
}

function SimCardBack({ width = 42, height = 60 }: { width?: number; height?: number }) {
    return (
        <div className="sim-card-back" style={{ width, height }}>
            <div className="sim-card-back-inner">
                <span className="sim-card-back-label">TA</span>
            </div>
        </div>
    );
}

// ─── Chip Stack ───────────────────────────────────────────────
function ChipStack({ count = 3 }: { count?: number }) {
    return (
        <div className="sim-pot-chips">
            {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                <div key={i} className="sim-chip">●</div>
            ))}
        </div>
    );
}

// ─── Positions ────────────────────────────────────────────────
const POSITION_NAMES = ['SB', 'BB', 'UTG', 'UTG+1', 'LJ', 'HJ', 'CO', 'BTN', 'P9', 'P10'];

function getPositions(count: number): string[] {
    // Always: first=SB, second=BB, last=BTN
    const middleSlots = count - 3; // positions between BB and BTN
    const middleLabels = ['UTG', 'UTG+1', 'LJ', 'HJ', 'CO'].slice(5 - middleSlots - 1, 4);
    return ['SB', 'BB', ...middleLabels, 'BTN'];
}

// ─── Seat Layouts ─────────────────────────────────────────────
// Landscape (desktop + landscape mobile): seats positioned on a horizontal ellipse.
// Numbers relative to the stage container (percent or offset string).
// seatId 0 = hero (bottom-center). Others go clockwise.

function getSeatStyles(
    seatIndex: number,
    totalSeats: number,
    isPortrait: boolean
): React.CSSProperties {
    // Hero is always at index 0 (bottom center) of the rendered array.
    // We map: hero=seat0=bottom-center, then go clockwise.

    if (!isPortrait) {
        // ---- LANDSCAPE: horizontal ellipse ---
        // Position as angle around ellipse. Hero at 90° (bottom).
        const startAngle = 90; // degrees — bottom
        const angleStep = 360 / totalSeats;
        const angleDeg = startAngle + seatIndex * angleStep;
        const angleRad = (angleDeg * Math.PI) / 180;

        // Rx, Ry as fraction of the stage (stage is 16:7 ratio)
        const rx = 46; // % of stage width, half
        const ry = 46; // % of stage height, half

        const cx = 50; // center x %
        const cy = 50; // center y %

        const xPct = cx + rx * Math.cos(angleRad);
        const yPct = cy + ry * Math.sin(angleRad);

        return {
            left: `${xPct}%`,
            top: `${yPct}%`,
            transform: 'translate(-50%, -50%)',
        };
    } else {
        // ---- PORTRAIT: vertical ellipse ---
        // Hero at bottom-center (270° if we think of it as normal circle but stage is portrait).
        const startAngle = 90; // 90° = bottom of a vertical ellipse (sin(90°)=1)
        const angleStep = 360 / totalSeats;
        const angleDeg = startAngle + seatIndex * angleStep;
        const angleRad = (angleDeg * Math.PI) / 180;

        // Smaller rx (narrow), larger ry (tall)
        const rx = 38; // % of stage width
        const ry = 44; // % of stage height

        const cx = 50;
        const cy = 50;

        const xPct = cx + rx * Math.cos(angleRad);
        const yPct = cy + ry * Math.sin(angleRad);

        return {
            left: `${xPct}%`,
            top: `${yPct}%`,
            transform: 'translate(-50%, -50%)',
        };
    }
}

// ─── Main Simulator Component ─────────────────────────────────
export default function Simulator() {
    const [numPlayers, setNumPlayers] = useState(6);
    const [raiseAmount, setRaiseAmount] = useState(3);
    const [isPortrait, setIsPortrait] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Hero cards: As Ah (fixed as default)
    const heroCards: [CardData, CardData] = [
        { rank: 'A', suit: 'spades' },
        { rank: 'A', suit: 'hearts' },
    ];

    // Card dimensions change by orientation
    const heroCardW = isPortrait ? 52 : 64;
    const heroCardH = isPortrait ? 74 : 92;
    const villainCardW = isPortrait ? 32 : 40;
    const villainCardH = isPortrait ? 46 : 58;

    // Responsive detection
    useEffect(() => {
        setMounted(true);
        const update = () => {
            setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth <= 768);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const positions = getPositions(numPlayers);

    // Build seat list: hero first (index 0), rest follow clockwise.
    // Hero = last position label ("BTN area") but we put him at visual bottom.
    const seats = Array.from({ length: numPlayers }, (_, i) => ({
        seatIndex: i, // 0 = hero (bottom center)
        isHero: i === 0,
        positionLabel: positions[i],
        isFolded: false, // static for now
        isDealer: positions[i] === 'BTN',
    }));

    const handleAction = useCallback((action: 'FOLD' | 'CALL' | 'RAISE') => {
        console.log(`[Simulator] Hero action: ${action}${action === 'RAISE' ? ` to ${raiseAmount} BB` : ''}`);
        // Future: trigger game state update here
    }, [raiseAmount]);

    if (!mounted) return null;

    return (
        <div className="sim-root">
            {/* ── Header ── */}
            <header className="sim-header">
                <div className="sim-brand">Tzur<span>Ace</span> <span style={{ fontWeight: 400, fontSize: '0.9rem', color: '#64748b' }}>| Simulator</span></div>
                <div className="sim-controls-row">
                    <span className="sim-players-label">Players:</span>
                    <select
                        className="sim-players-select"
                        value={numPlayers}
                        onChange={e => setNumPlayers(Number(e.target.value))}
                    >
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* ── Main Body ── */}
            <main className="sim-body">
                {/* ── Table Wrapper ── */}
                <div className="sim-table-wrapper">
                    <div className={`sim-stage`} style={isPortrait ? { aspectRatio: '9 / 14' } : {}}>

                        {/* Ellipse */}
                        <div className="sim-table-ellipse">
                            <div className="sim-table-inner-ring" />
                            <div className="sim-table-watermark">TZURACE</div>
                            {/* Pot */}
                            <div className="sim-pot">
                                <div className="sim-pot-label">POT: 1.5 BB</div>
                            </div>
                        </div>

                        {/* Seats */}
                        {seats.map((seat) => {
                            const seatStyle = getSeatStyles(seat.seatIndex, numPlayers, isPortrait);
                            return (
                                <div
                                    key={seat.seatIndex}
                                    className="sim-seat"
                                    style={seatStyle}
                                >
                                    {/* Cards above the seat box */}
                                    <div className="sim-seat-cards">
                                        {seat.isHero ? (
                                            <>
                                                <div style={{ transform: 'rotate(-4deg)' }}>
                                                    <SimCard {...heroCards[0]} width={heroCardW} height={heroCardH} />
                                                </div>
                                                <div style={{ transform: 'rotate(4deg)', marginLeft: isPortrait ? '-14px' : '-18px' }}>
                                                    <SimCard {...heroCards[1]} width={heroCardW} height={heroCardH} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ transform: 'rotate(-4deg)' }}>
                                                    <SimCardBack width={villainCardW} height={villainCardH} />
                                                </div>
                                                <div style={{ transform: 'rotate(4deg)', marginLeft: isPortrait ? '-10px' : '-12px' }}>
                                                    <SimCardBack width={villainCardW} height={villainCardH} />
                                                </div>
                                            </>
                                        )}

                                        {/* Dealer Button */}
                                        {seat.isDealer && (
                                            <div className="sim-dealer-btn" style={{ position: 'absolute', top: '-4px', right: '-30px' }}>
                                                D
                                            </div>
                                        )}
                                    </div>

                                    {/* Seat Box */}
                                    <div className={`sim-seat-box ${seat.isHero ? 'hero' : ''} ${seat.isFolded ? 'folded' : ''}`}>
                                        <div className="sim-seat-pos">{seat.positionLabel}</div>
                                        <div className="sim-seat-name">{seat.isHero ? 'HERO' : `P${seat.seatIndex}`}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* ── Action Bar ── */}
            <div className="sim-action-bar">
                <button className="sim-btn sim-btn-fold" onClick={() => handleAction('FOLD')}>FOLD</button>
                <button className="sim-btn sim-btn-call" onClick={() => handleAction('CALL')}>CALL</button>
                <button className="sim-btn sim-btn-raise" onClick={() => handleAction('RAISE')}>RAISE</button>
                <input
                    type="number"
                    className="sim-raise-input"
                    value={raiseAmount}
                    min={2}
                    max={200}
                    onChange={e => setRaiseAmount(Number(e.target.value))}
                    aria-label="Raise amount in BB"
                />
            </div>
        </div>
    );
}
