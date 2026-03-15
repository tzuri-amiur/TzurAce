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

// ─── Chip Stacking Logic ──────────────────────────────────────
const CHIP_DENOMINATIONS = [
    { value: 100, color: '#1f2937', textColor: 'white' },
    { value: 10, color: '#3b82f6', textColor: 'white' },
    { value: 5, color: '#22c55e', textColor: 'white' },
    { value: 1, color: '#ef4444', textColor: 'white' },
    { value: 0.5, color: '#facc15', textColor: '#1e293b' },
];

function calculateChips(amount: number) {
    let remaining = amount;
    const chips: typeof CHIP_DENOMINATIONS = [];
    const sorted = [...CHIP_DENOMINATIONS].sort((a, b) => b.value - a.value);

    for (const den of sorted) {
        while (remaining >= den.value - 0.001) {
            chips.push(den);
            remaining -= den.value;
        }
    }
    return chips;
}

function ChipStack({ amount, showLabel = true }: { amount: number; showLabel?: boolean }) {
    if (amount <= 0) return null;
    const chips = calculateChips(amount);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ position: 'relative', width: 'var(--chip-size)', height: 'var(--chip-size)', marginBottom: (chips.length - 1) * 3 }}>
                {chips.slice(0, 10).map((chip, i) => (
                    <div
                        key={i}
                        className="sim-chip-bet"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            transform: `translateY(${-i * 3}px)`,
                            background: chip.color,
                            color: chip.textColor,
                            zIndex: 10 + i,
                            margin: 0,
                            border: `1px solid rgba(0,0,0,0.2)`,
                            boxShadow: i === 0 ? '0 4px 8px rgba(0,0,0,0.5)' : 'none'
                        }}
                    >
                        {chip.value}
                    </div>
                ))}
            </div>
            {showLabel && (
                <div style={{
                    background: 'rgba(2, 6, 23, 0.9)',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: '900',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    marginTop: (chips.length > 1 ? -2 : 2), // Adjust for stack height
                    zIndex: 50,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    letterSpacing: '0.5px'
                }}>
                    {amount}
                </div>
            )}
        </div>
    );
}

// ─── Positions ────────────────────────────────────────────────
const POSITION_NAMES = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];

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

export interface SeatData {
    seatIndex: number;
    status: 'active' | 'folded' | 'hero';
    positionLabel: string;
    betAmount?: number;
}

export interface SimulatorProps {
    heroHand?: [CardData, CardData];
    boardCards?: CardData[];
    potSizeBB?: number;
    numPlayers?: number;
    position?: string; // Keep for banner/back-compat
    feedback?: { msg: string; type: 'success' | 'error' | null };
    showHeader?: boolean;
    onAction?: (action: 'FOLD' | 'CALL' | 'RAISE', amount?: number) => void;
    onHint?: () => void;
    seats?: SeatData[];
    gameState?: 'PRE_FLOP' | 'POST_FLOP';
}

export default function Simulator({
    heroHand: propHeroHand,
    boardCards: propBoardCards,
    potSizeBB = 6.0,
    numPlayers: propNumPlayers,
    position = 'SB',
    feedback,
    showHeader = true,
    seats: propSeats,
    gameState = 'POST_FLOP'
}: SimulatorProps) {
    // Default initial state: A full board and initial blinds
    const [localNumPlayers, setLocalNumPlayers] = useState(6);
    const numPlayers = propNumPlayers ?? localNumPlayers;

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
    const heroHand = propHeroHand || [
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
        const rx = isPortrait ? 38 * 9 : 46 * 16;
        const ry = isPortrait ? 44 * 14 : 46 * 7;
        const angles = getEvenlySpacedEllipseAngles(numPlayers, rx, ry, 90);

        // Use provided seats or construct default active seats
        const rawSeats = propSeats || Array.from({ length: numPlayers }).map((_, i) => {
            const shifted = getShiftedPositions(numPlayers, position);
            return {
                seatIndex: i,
                status: (i === 0 ? 'hero' : 'active') as 'hero' | 'active' | 'folded',
                positionLabel: shifted[i],
                betAmount: 0
            };
        });

        return rawSeats.map((seat, i) => {
            const rad = angles[i];
            const betVal = seat.betAmount || 0;

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
            const pushRadiusY = seat.status === 'hero' ? (isPortrait ? 85 : 95) : (isPortrait ? 60 : 70);

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
                },
                betAmount: betVal
            };
        });
    }, [numPlayers, isPortrait, position, propSeats]);

    if (!mounted) return null;

    return (
        <div className="sim-root">
            {/* ── Header ── */}
            {showHeader && (
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
            )}

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
                                    {gameState !== 'PRE_FLOP' && <ChipStack amount={potSizeBB} showLabel={false} />}
                                    <div className="sim-pot-label">POT: {potSizeBB} BB</div>
                                </div>
                                {gameState !== 'PRE_FLOP' && (
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
                                )}
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
                                    {/* Player Cards */}
                                    <div className="sim-seat-cards">
                                        {seat.status === 'hero' ? (
                                            <>
                                                <div style={{ transform: 'rotate(-4deg)' }}>
                                                    <SimCard {...heroHand[0]} width={heroCardW} height={heroCardH} />
                                                </div>
                                                <div style={{ transform: 'rotate(4deg)', marginLeft: isPortrait ? '-14px' : '-18px' }}>
                                                    <SimCard {...heroHand[1]} width={heroCardW} height={heroCardH} />
                                                </div>
                                            </>
                                        ) : seat.status === 'active' ? (
                                            <>
                                                <div style={{ transform: 'rotate(-4deg)' }}>
                                                    <SimCardBack width={villainCardW} height={villainCardH} />
                                                </div>
                                                <div style={{ transform: 'rotate(4deg)', marginLeft: isPortrait ? '-10px' : '-12px' }}>
                                                    <SimCardBack width={villainCardW} height={villainCardH} />
                                                </div>
                                            </>
                                        ) : null}
                                    </div>

                                    {/* Seat Box */}
                                    <div className={`sim-seat-box ${seat.status === 'hero' ? 'hero' : ''} ${seat.status === 'folded' ? 'folded' : ''}`}>
                                        <div className="sim-seat-pos">{seat.positionLabel}</div>
                                        <div className="sim-seat-name">{seat.status === 'hero' ? 'HERO' : `P${seat.seatIndex}`}</div>
                                    </div>

                                    {/* Player Action Area (Chips & Dealer Button) - Logic moved: render if status allows or is BTN */}
                                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                        {seat.status !== 'folded' && seat.betAmount && seat.betAmount > 0 ? (
                                            <div style={{ ...seat.chipStyle }}>
                                                <ChipStack amount={seat.betAmount} />
                                            </div>
                                        ) : null}
                                        {seat.positionLabel === 'BTN' && (
                                            <div className="sim-dealer-btn" style={seat.dealerStyle}>
                                                D
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Feedback Toast */}
            {feedback?.msg && (
                <div className={`sim-feedback-toast ${feedback.type}`}>
                    {feedback.msg}
                </div>
            )}
        </div>
    );
}
