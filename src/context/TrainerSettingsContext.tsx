"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Position = 'SB' | 'BB' | 'UTG' | 'HJ' | 'CO' | 'BTN' | 'RANDOM';
export type Scenario = 'RFI' | 'RESPONSE';

interface TrainerSettings {
    showHandRank: boolean;
    heroPosition: Position;
    scenario: Scenario;
}

interface TrainerSettingsContextType {
    settings: TrainerSettings;
    updateSettings: (newSettings: Partial<TrainerSettings>) => void;
}

const defaultSettings: TrainerSettings = {
    showHandRank: true,
    heroPosition: 'RANDOM',
    scenario: 'RFI',
};

const TrainerSettingsContext = createContext<TrainerSettingsContextType | undefined>(undefined);

export function TrainerSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<TrainerSettings>(defaultSettings);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('tzurace_trainer_settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load settings", e);
            }
        }
    }, []);

    const updateSettings = (newSettings: Partial<TrainerSettings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('tzurace_trainer_settings', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <TrainerSettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </TrainerSettingsContext.Provider>
    );
}

export function useTrainerSettings() {
    const context = useContext(TrainerSettingsContext);
    if (context === undefined) {
        throw new Error('useTrainerSettings must be used within a TrainerSettingsProvider');
    }
    return context;
}
