"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, X, LogOut, LayoutGrid, Settings, Target } from 'lucide-react';

interface GlobalSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
    onLogout: () => void;
    onOpenAuth: () => void;
}

export default function GlobalSidebar({ isOpen, onClose, currentUser, onLogout, onOpenAuth }: GlobalSidebarProps) {
    const router = useRouter();

    const handleNav = (path: string) => {
        router.push(path);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px',
            backgroundColor: '#0a0a0a', borderLeft: '1px solid #1e293b', zIndex: 1500,
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out', padding: '24px',
            boxShadow: isOpen ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none'
        }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '32px' }}>
                <X size={24} />
            </button>

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
                <button onClick={() => { }} style={itemStyle}>
                    <Target size={18} /> Ranges
                </button>
                <button onClick={() => { }} style={itemStyle}>
                    <Settings size={18} /> Settings
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
