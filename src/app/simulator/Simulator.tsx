"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Simulator.css';

import { CardData, Suit } from '@/utils/handUtils';

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
    if (middleSlots < 0) return ['SB', 'BB'].slice(0, count);
    const middleLabels = ['UTG', 'UTG+1', 'LJ', 'HJ', 'CO'].slice(5 - middleSlots - 1, 4);
    return ['SB', 'BB', ...middleLabels, 'BTN'];
}

function getShiftedPositions(count: number, heroPos: string): string[] {
    const base = getPositions(count);
    const heroIdx = base.indexOf(heroPos);
    if (heroIdx === -1) return base;
    return [...base.slice(heroIdx), ...base.slice(0, heroIdx)];
}

function getEvenlySpacedEllipseAngles(numPoints: number, rx: number, ry: number, startAngleDeg: number): number[] {
    const steps = 1000;
    const dt = (2 * Math.PI) / steps;
    const circumferences: number[] = new Array(steps + 1).fill(0);

    for (let i = 1; i <= steps; i++) {
        const t = (i - 0.5) * dt;
        const dx = -rx * Math.sin(t);
        const dy = ry * Math.cos(t);
        const ds = Math.sqrt(dx * dx + dy * dy) * dt;
        circumferences[i] = circumferences[i - 1] + ds;
    }
    const totalLength = circumferences[steps];

    let sRad = (startAngleDeg * Math.PI) / 180;
    sRad = sRad % (2 * Math.PI);
    if (sRad < 0) sRad += 2 * Math.PI;

    const startIdx = Math.floor((sRad / (2 * Math.PI)) * steps);
    const fraction = (sRad / (2 * Math.PI)) * steps - startIdx;
    const sStart = circumferences[startIdx] + fraction * (circumferences[startIdx + 1] - circumferences[startIdx]);

    const angles: number[] = [];
    for (let i = 0; i < numPoints; i++) {
        const targetS = (sStart + (i * totalLength) / numPoints) % totalLength;
        let idx = 0;
        while (idx < steps && circumferences[idx + 1] < targetS) {
            idx++;
        }
        let t = 0;
        if (idx >= steps) {
            t = 2 * Math.PI;
        } else {
            const frac = (targetS - circumferences[idx]) / (circumferences[idx + 1] - circumferences[idx]);
            t = (idx + frac) * dt;
        }
        angles.push(t);
    }
    return angles;
}

// ─── Main Simulator Component ─────────────────────────────────
export interface SimulatorProps {
    heroCards?: [CardData, CardData];
    boardCards?: CardData[];
    potSizeBB?: number;
    numPlayers?: number;
    heroPosition?: string;
    onAction?: (action: 'FOLD' | 'CALL' | 'RAISE', amount?: number) => void;
    onHint?: () => void;
}

export default function Simulator({
    heroCards: propHeroCards,
    boardCards: propBoardCards,
    potSizeBB = 6.0,
    numPlayers: propNumPlayers,
    heroPosition = 'SB',
    onAction,
    onHint
}: SimulatorProps) {
    // Default initial state: A full board and initial blinds
    const [localNumPlayers, setLocalNumPlayers] = useState(6);
    const numPlayers = propNumPlayers ?? localNumPlayers;

    const [raiseAmount, setRaiseAmount] = useState(3);
    const [isPortrait, setIsPortrait] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initial board cards (Flop: Kd Qs Jc, Turn: Th, River: 9d)
    const boardCards = propBoardCards || [
        { rank: 'K', suit: 'diamonds' },
        { rank: 'Q', suit: 'spades' },
        { rank: 'J', suit: 'clubs' },
        { rank: 'T', suit: 'hearts' },
        { rank: '9', suit: 'diamonds' },
    ];

    // Hero cards: As Ah (fixed as default)
    const heroCards = propHeroCards || [
        { rank: 'A', suit: 'spades' },
        { rank: 'A', suit: 'hearts' },
    ];

    // Card dimensions change by orientation
    const heroCardW = isPortrait ? 52 : 64;
    const heroCardH = isPortrait ? 74 : 92;
    const villainCardW = isPortrait ? 32 : 40;
    const villainCardH = isPortrait ? 46 : 58;
    const boardCardW = isPortrait ? 38 : 54;
    const boardCardH = isPortrait ? 54 : 76;

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

    const tableSeats = useMemo(() => {
        const shiftedPositions = getShiftedPositions(numPlayers, heroPosition);

        const rawSeats = Array.from({ length: numPlayers }).map((_, i) => ({
            seatIndex: i,
            isHero: i === 0,
            isFolded: false,
            isDealer: shiftedPositions[i] === 'BTN',
            positionLabel: shiftedPositions[i],
        }));

        // Use approximate logical aspect ratios to calculate perfectly even arc lengths
        const rx = isPortrait ? 38 * 9 : 46 * 16;
        const ry = isPortrait ? 44 * 14 : 46 * 7;

        // Compute evenly spaced T (parametric angles) along the ellipse perimeter
        const angles = getEvenlySpacedEllipseAngles(numPlayers, rx, ry, 90);

        return rawSeats.map((seat, i) => {
            const rad = angles[i];

            // Visual CSS percentages for the Seat Box
            const rPx = isPortrait ? 38 : 46;
            const rPy = isPortrait ? 44 : 46;

            const xPct = 50 + rPx * Math.cos(rad);
            const yPct = 50 + rPy * Math.sin(rad);

            // Unit vector indicating direction right out from center
            const vx = Math.cos(rad);
            const vy = Math.sin(rad);

            // Push chip stack inwards securely over the green felt
            const pushRadiusX = isPortrait ? 40 : 55;
            const pushRadiusY = seat.isHero ? (isPortrait ? 85 : 95) : (isPortrait ? 60 : 70);

            const offsetX = -vx * pushRadiusX;
            const offsetY = -vy * pushRadiusY;

            // Dealer button sits on the right of the player (CCW)
            // CSS Y goes down. Player faces (-vx, -vy). Their Right vector is (vy, -vx).
            const rightVx = vy;
            const rightVy = -vx;
            const dbGap = 30; // 30 pixels Right

            return {
                ...seat,
                style: {
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    transform: 'translate(-50%, -50%)',
                },
                chipStyle: {
                    position: 'absolute' as const,
                    left: '50%',
                    top: '50%',
                    zIndex: 20,
                    transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`
                },
                dealerStyle: {
                    position: 'absolute' as const,
                    left: '50%',
                    top: '50%',
                    zIndex: 40,
                    transform: `translate(calc(-50% + ${offsetX + rightVx * dbGap}px), calc(-50% + ${offsetY + rightVy * dbGap}px))`
                }
            };
        });
    }, [numPlayers, isPortrait]);

    const handleAction = useCallback((action: 'FOLD' | 'CALL' | 'RAISE') => {
        if (onAction) {
            onAction(action, action === 'RAISE' ? raiseAmount : undefined);
        } else {
            console.log(`[Simulator] Hero action: ${action}${action === 'RAISE' ? ` to ${raiseAmount} BB` : ''}`);
        }
    }, [raiseAmount, onAction]);

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
                        disabled={!!propNumPlayers}
                        onChange={e => setLocalNumPlayers(Number(e.target.value))}
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

                            {/* Board & Pot */}
                            <div className="sim-middle-container">
                                <div className="sim-pot">
                                    <div className="sim-pot-label">POT: {potSizeBB} BB</div>
                                </div>
                                <div className="sim-board">
                                    {boardCards.map((card, idx) => (
                                        <SimCard
                                            key={idx}
                                            {...card}
                                            width={boardCardW}
                                            height={boardCardH}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Seats */}
                        {tableSeats.map((seat) => {
                            return (
                                <div
                                    key={seat.seatIndex}
                                    className="sim-seat"
                                    style={seat.style}
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
                                    </div>

                                    {/* Seat Box */}
                                    <div className={`sim-seat-box ${seat.isHero ? 'hero' : ''} ${seat.isFolded ? 'folded' : ''}`}>
                                        <div className="sim-seat-pos">{seat.positionLabel}</div>
                                        <div className="sim-seat-name">{seat.isHero ? 'HERO' : `P${seat.seatIndex}`}</div>
                                    </div>

                                    {/* Player Action Area (Chips & Dealer Button) */}
                                    {(!seat.isFolded || seat.isDealer) && (
                                        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                            {!seat.isFolded && (
                                                <div className="sim-chip-bet" style={seat.chipStyle}>1</div>
                                            )}
                                            {seat.isDealer && (
                                                <div className="sim-dealer-btn" style={seat.dealerStyle}>
                                                    D
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* ── Action Bar ── */}
            <div className="sim-action-bar">
                {onHint && (
                    <button className="sim-btn sim-btn-hint" onClick={onHint} style={{ backgroundColor: '#eab308' }}>
                        HINT
                    </button>
                )}
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
