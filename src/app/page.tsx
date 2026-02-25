"use client";
import React, { useState } from 'react';
import { User, Menu, Globe, Target, Zap, Shield, X, Settings, LayoutGrid, LogOut } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAction = (name: string) => {
    console.log(`[ACTION]: ${name} clicked`);
    if (name === 'Hamburger Menu') setIsMenuOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#cbd5e1' }}>
      
      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px', 
        backgroundColor: '#020617', borderLeft: '1px solid #1e293b', zIndex: 100,
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out', padding: '24px'
      }}>
        <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '32px' }}>
          <X size={24} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => handleAction("Ranges")} style={{ padding: '16px', textAlign: 'left', background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Ranges</button>
          <button onClick={() => handleAction("Settings")} style={{ padding: '16px', textAlign: 'left', background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Settings</button>
          <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '16px 0' }}></div>
          <button onClick={() => { setIsLoggedIn(!isLoggedIn); handleAction("Auth"); }} style={{ padding: '16px', textAlign: 'left', background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer' }}>
            {isLoggedIn ? "Logout" : "Login / Register"}
          </button>
        </div>
      </div>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(2, 6, 23, 0.9)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'white', fontStyle: 'italic' }}>
            TZUR<span style={{ color: '#10b981' }}>ACE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => handleAction("Lang")} style={{ fontSize: '12px', fontWeight: 'bold', border: '1px solid #334155', padding: '4px 12px', borderRadius: '8px', color: 'white', background: 'none' }}>EN 🌐</button>
            <button onClick={() => handleAction("User")} style={{ padding: '8px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '50%', color: 'white' }}><User size={18} /></button>
            <button onClick={() => handleAction("Hamburger Menu")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Menu size={24} /></button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900', textAlign: 'center', color: 'white', marginBottom: '16px' }}>
          Master the <span style={{ color: '#10b981', fontStyle: 'italic' }}>Science</span> of Poker
        </h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '64px' }}>Elite technical education for serious players.</p>

        {/* Courses Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', marginBottom: '96px' }}>
          {[
            { id: '01', title: 'Advanced GTO Mastery', icon: <Target size={36}/> },
            { id: '02', title: 'Exploitative Blueprint', icon: <Zap size={36}/> },
            { id: '03', title: 'The Mental Edge', icon: <Shield size={36}/> }
          ].map((course) => (
            <div key={course.id} style={{ flex: '1', minWidth: '300px', maxWidth: '360px', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', borderRadius: '40px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '16px', marginBottom: '24px', color: '#10b981' }}>{course.icon}</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{course.title}</h3>
              <code style={{ fontSize: '10px', color: 'rgba(16, 185, 129, 0.5)', marginBottom: '32px' }}>PRO_COURSE_{course.id}</code>
              <button onClick={() => handleAction(`Course ${course.id}`)} style={{ marginTop: 'auto', width: '100%', padding: '16px', backgroundColor: '#10b981', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>LEARN MORE</button>
            </div>
          ))}
        </div>

        {/* Trainer Preview */}
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)', border: '1px solid #1e293b', borderRadius: '48px', padding: '48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>Training Lab</h2>
          <div style={{ aspectRatio: '16/9', maxWidth: '700px', margin: '0 auto 40px auto', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'rgba(16, 185, 129, 0.1)', letterSpacing: '1em', fontSize: '12px' }}>SIMULATION_PREVIEW</span>
          </div>
          <button onClick={() => handleAction("Launch Trainer")} style={{ padding: '16px 48px', border: '2px solid #10b981', color: '#10b981', background: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>LAUNCH TRAINER</button>
        </div>
      </main>
    </div>
  );
}