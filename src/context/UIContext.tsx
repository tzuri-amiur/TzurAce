"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UIContextType {
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
    currentUser: any;
    setCurrentUser: (user: any) => void;
    logout: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
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

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('tzurace_user');
    };

    return (
        <UIContext.Provider value={{
            isSidebarOpen,
            setSidebarOpen,
            isAuthModalOpen,
            setAuthModalOpen,
            currentUser,
            setCurrentUser,
            logout
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}
