"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        mail: '',
        name: '',
        nickname: ''
    });
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);

        const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setAuthError(data.error || 'Authentication failed');
            } else {
                localStorage.setItem('tzurace_user', JSON.stringify(data.user));
                onSuccess(data.user);
                onClose();
                setFormData({ username: '', password: '', mail: '', name: '', nickname: '' });
            }
        } catch (err) {
            setAuthError('Failed to connect to server');
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', backdropFilter: 'blur(8px)' }}
        >
            <div style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '24px',
                padding: '40px',
                width: '100%',
                maxWidth: '450px',
                position: 'relative',
                boxShadow: '0 0 50px rgba(16, 185, 129, 0.15)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>TzurAce Platform</div>
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                </div>

                <div style={{ display: 'flex', backgroundColor: '#020617', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setAuthMode('login')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            backgroundColor: authMode === 'login' ? '#1e293b' : 'transparent',
                            color: authMode === 'login' ? 'white' : '#94a3b8',
                            fontWeight: authMode === 'login' ? 'bold' : 'normal',
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setAuthMode('register')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            backgroundColor: authMode === 'register' ? '#1e293b' : 'transparent',
                            color: authMode === 'register' ? 'white' : '#94a3b8',
                            fontWeight: authMode === 'register' ? 'bold' : 'normal',
                        }}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Username</label>
                        <input
                            type="text"
                            placeholder="Enter username..."
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            style={{ width: '100%', padding: '14px', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white', outline: 'none' }}
                            required
                        />
                    </div>

                    {authMode === 'register' && (
                        <>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '14px', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white', outline: 'none' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.mail}
                                    onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                                    style={{ width: '100%', padding: '14px', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white', outline: 'none' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Nickname</label>
                                <input
                                    type="text"
                                    placeholder="Poker alias..."
                                    value={formData.nickname}
                                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                    style={{ width: '100%', padding: '14px', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white', outline: 'none' }}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ width: '100%', padding: '14px', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: 'white', outline: 'none' }}
                            required
                        />
                    </div>

                    {authError && <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', backgroundColor: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px' }}>{authError}</div>}

                    <button
                        type="submit"
                        disabled={authLoading}
                        style={{
                            marginTop: '12px', padding: '16px', backgroundColor: '#10b981', color: '#000', border: 'none', borderRadius: '12px',
                            fontWeight: 'bold', cursor: authLoading ? 'not-allowed' : 'pointer', opacity: authLoading ? 0.7 : 1, fontSize: '16px'
                        }}
                    >
                        {authLoading ? 'AUTHENTICATING...' : (authMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT')}
                    </button>
                </form>
            </div>
        </div>
    );
}
