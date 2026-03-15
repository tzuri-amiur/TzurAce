"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Menu, Globe, Home, LogOut, Settings } from 'lucide-react';
import { useUI } from '../context/UIContext';

export default function Header() {
    const router = useRouter();
    const { setSidebarOpen, setAuthModalOpen, currentUser, logout } = useUI();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 1000,
            flexShrink: 0,
            width: '100%',
            height: '60px',
            position: 'sticky',
            top: 0
        }}>
            {/* Left: Logo */}
            <div
                onClick={() => router.push('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <div style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    padding: '8px',
                    borderRadius: '10px',
                    color: '#10b981',
                    display: 'flex'
                }}>
                    <Home size={20} />
                </div>
                <div style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '22px',
                    letterSpacing: '1px'
                }}>
                    TZUR<span style={{ color: '#10b981' }}>ACE</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => setSidebarOpen(true)}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    className="mobile-menu-btn"
                >
                    <Menu size={20} />
                </button>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => currentUser ? setIsProfileMenuOpen(!isProfileMenuOpen) : setAuthModalOpen(true)}
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: currentUser ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            border: currentUser ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
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
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{currentUser.nickname || currentUser.username}</div>
                            </div>
                            <button onClick={() => { logout(); setIsProfileMenuOpen(false); }} style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setSidebarOpen(true)}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
}
