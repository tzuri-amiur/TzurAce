"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, X, LogOut, LayoutGrid, Settings, Target, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useTrainerSettings, Position, Scenario } from '../context/TrainerSettingsContext';

interface GlobalSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
    onLogout: () => void;
    onOpenAuth: () => void;
}

export default function GlobalSidebar({ isOpen, onClose, currentUser, onLogout, onOpenAuth }: GlobalSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { settings, updateSettings } = useTrainerSettings();
    const [isTrainerSettingsOpen, setIsTrainerSettingsOpen] = useState(pathname === '/trainer');

    // Automatically open/close settings when navigating
    useEffect(() => {
        setIsTrainerSettingsOpen(pathname === '/trainer');
    }, [pathname]);

    const handleNav = (path: string) => {
        router.push(path);
        onClose();
    };

    const positions: Position[] = ['RANDOM', 'UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    const scenarios: { value: Scenario; label: string }[] = [
        { value: 'RFI', label: 'RFI (Unopened)' },
        { value: 'RESPONSE', label: 'Face RFI / 3-Bet' }
    ];

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px',
            backgroundColor: '#0a0a0a', borderLeft: '1px solid #1e293b', zIndex: 1500,
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out', padding: '24px',
            boxShadow: isOpen ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
            overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Menu</div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentUser && (
                    <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Connected as</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{currentUser.nickname || currentUser.username}</div>
                    </div>
                )}

                <button onClick={() => handleNav('/')} style={itemStyle}>
                    <Home size={18} /> Home
                </button>
                <button onClick={() => handleNav('/trainer')} style={itemStyle}>
                    <LayoutGrid size={18} /> Training Lab
                </button>

                {/* Trainer Settings Section */}
                <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                    <button
                        onClick={() => setIsTrainerSettingsOpen(!isTrainerSettingsOpen)}
                        style={{ ...itemStyle, width: '100%', justifyContent: 'space-between', color: '#10b981' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Settings size={18} /> <span>Trainer Settings</span>
                        </div>
                        {isTrainerSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isTrainerSettingsOpen && (
                        <div style={{ paddingLeft: '12px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Show Hand Rank Toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px' }}>
                                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Show Hand Rank</span>
                                <button
                                    onClick={() => updateSettings({ showHandRank: !settings.showHandRank })}
                                    style={{ background: 'none', border: 'none', color: settings.showHandRank ? '#10b981' : '#64748b', cursor: 'pointer' }}
                                >
                                    {settings.showHandRank ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>

                            {/* Hero Position Selection */}
                            <div style={{ padding: '4px 16px' }}>
                                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Hero Position</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                    {positions.map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => updateSettings({ heroPosition: pos })}
                                            style={{
                                                padding: '8px 4px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                backgroundColor: settings.heroPosition === pos ? '#10b981' : '#1e293b',
                                                color: settings.heroPosition === pos ? 'black' : 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {pos}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scenario Selection */}
                            <div style={{ padding: '4px 16px' }}>
                                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Scenario</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {scenarios.map((scen) => (
                                        <button
                                            key={scen.value}
                                            onClick={() => updateSettings({ scenario: scen.value })}
                                            style={{
                                                padding: '12px',
                                                fontSize: '13px',
                                                fontWeight: 'bold',
                                                textAlign: 'left',
                                                backgroundColor: settings.scenario === scen.value ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                                color: settings.scenario === scen.value ? '#10b981' : '#94a3b8',
                                                border: settings.scenario === scen.value ? '1px solid #10b981' : '1px solid #1e293b',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {scen.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={() => { }} style={itemStyle}>
                    <Target size={18} /> Ranges
                </button>

                <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '16px 0' }}></div>

                {currentUser ? (
                    <button onClick={onLogout} style={{ ...itemStyle, color: '#ef4444' }}>
                        <LogOut size={18} /> Logout
                    </button>
                ) : (
                    <button onClick={() => { onOpenAuth(); onClose(); }} style={{ ...itemStyle, color: '#10b981' }}>
                        Login / Register
                    </button>
                )}
            </div>
        </div>
    );
}

const itemStyle: React.CSSProperties = {
    padding: '16px',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderRadius: '12px',
    transition: 'background 0.2s',
};
