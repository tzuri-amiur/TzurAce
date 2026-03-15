"use client";
import React from 'react';
import { UIProvider, useUI } from '../context/UIContext';
import { TrainerSettingsProvider } from '../context/TrainerSettingsContext';
import GlobalSidebar from './GlobalSidebar';
import AuthModal from './AuthModal';

export default function GlobalWrapper({ children }: { children: React.ReactNode }) {
    return (
        <UIProvider>
            <TrainerSettingsProvider>
                <GlobalSidebarWrapper />
                <AuthModalWrapper />
                {children}
            </TrainerSettingsProvider>
        </UIProvider>
    );
}

// Wrapper components to provide UI context to components that need it
function GlobalSidebarWrapper() {
    const { isSidebarOpen, setSidebarOpen, currentUser, logout, setAuthModalOpen } = useUI();
    return (
        <GlobalSidebar
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentUser={currentUser}
            onLogout={logout}
            onOpenAuth={() => setAuthModalOpen(true)}
        />
    );
}

function AuthModalWrapper() {
    const { isAuthModalOpen, setAuthModalOpen, setCurrentUser } = useUI();
    return (
        <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={setCurrentUser}
        />
    );
}
