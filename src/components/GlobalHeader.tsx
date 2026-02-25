"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Menu, Globe, Home, LogOut } from 'lucide-react';

interface GlobalHeaderProps {
    onOpenSidebar: () => void;
    onOpenAuth: () => void;
    currentUser: any;
    onLogout: () => void;
}

export default function GlobalHeader({ onOpenSidebar, onOpenAuth, currentUser, onLogout }: GlobalHeaderProps) {
    const router = useRouter();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    return (
        <header style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            backgroundColor: 'rgba(10, 10, 10, 0.9)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '15px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                    onClick={() => router.push('/')}
                    style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px', color: '#10b981', display: 'flex' }}>
                        <Home size={20} />
                    </div>
                    TZUR<span style={{ color: '#10b981' }}>ACE</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => { }} style={{ fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', color: 'white', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        EN <Globe size={14} />
                    </button>

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => currentUser ? setIsProfileMenuOpen(!isProfileMenuOpen) : onOpenAuth()}
                            style={{
                                padding: '10px',
                                backgroundColor: currentUser ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                border: currentUser ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                color: currentUser ? '#10b981' : 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <User size={18} />
                        </button>

                        {isProfileMenuOpen && currentUser && (
                            <div style={{ position: 'absolute', top: '50px', right: 0, backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', width: '200px', padding: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1100 }}>
                                <div style={{ padding: '8px', borderBottom: '1px solid #1e293b', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Logged in as</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{currentUser.nickname}</div>
                                </div>
                                <button onClick={() => { onLogout(); setIsProfileMenuOpen(false); }} style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>

                    <button onClick={onOpenSidebar} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Menu size={24} /></button>
                </div>
            </div>
        </header>
    );
}
