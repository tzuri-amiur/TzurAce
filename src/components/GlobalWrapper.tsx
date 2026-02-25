"use client";
import React, { useState, useEffect } from 'react';
import GlobalHeader from './GlobalHeader';
import GlobalSidebar from './GlobalSidebar';
import AuthModal from './AuthModal';

export default function GlobalWrapper({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('tzurace_user');
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('tzurace_user');
            }
        }
    }, []);

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('tzurace_user');
    };

    const handleAuthSuccess = (user: any) => {
        setCurrentUser(user);
        setIsAuthModalOpen(false);
    };

    return (
        <>
            <GlobalHeader
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                currentUser={currentUser}
                onLogout={handleLogout}
            />
            <GlobalSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenAuth={() => setIsAuthModalOpen(true)}
            />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />
            {children}
        </>
    );
}
