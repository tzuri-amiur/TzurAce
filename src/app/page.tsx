"use client";
import React, { useState } from 'react';
import { User, Menu, Globe, Target, Zap, Shield, X, Settings, LayoutGrid, LogOut, Mic, Video, Cpu, UserCircle } from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mail: '',
    name: '',
    nickname: ''
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAction = (name: string) => {
    console.log(`[ACTION]: ${name} clicked`);
    if (name === 'Hamburger Menu') setIsMenuOpen(true);
    if (name === 'Auth' || name === 'User') {
      if (!currentUser) {
        setIsAuthModalOpen(true);
      } else {
        setIsProfileMenuOpen(!isProfileMenuOpen);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    console.log("User logged out");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
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
        console.log(`User ${authMode} successful:`, data.user);
        setCurrentUser(data.user);
        setIsAuthModalOpen(false);
        setFormData({ username: '', password: '', mail: '', name: '', nickname: '' });
      }
    } catch (err) {
      setAuthError('Failed to connect to server');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#cbd5e1',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>

      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px',
        backgroundColor: '#0a0a0a', borderLeft: '1px solid #1e293b', zIndex: 100,
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out', padding: '24px'
      }}>
        <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '32px' }}>
          <X size={24} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentUser && (
            <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Connected as</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{currentUser.nickname || currentUser.username}</div>
            </div>
          )}
          <button onClick={() => handleAction("Ranges")} style={{ padding: '16px', textAlign: 'left', background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Ranges</button>
          <button onClick={() => handleAction("Settings")} style={{ padding: '16px', textAlign: 'left', background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Settings</button>
          <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '16px 0' }}></div>
          {currentUser ? (
            <button onClick={handleLogout} style={{ padding: '16px', textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} style={{ padding: '16px', textAlign: 'left', background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer' }}>
              Login / Register
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(10, 10, 10, 0.9)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '25px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', letterSpacing: '1px' }}>
            TZUR<span style={{ color: '#10b981' }}>ACE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => handleAction("Lang")} style={{ fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', color: 'white', background: 'none', cursor: 'pointer' }}>EN 🌐</button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => handleAction("User")}
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
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <User size={18} />
              </button>

              {isProfileMenuOpen && currentUser && (
                <div style={{ position: 'absolute', top: '50px', right: 0, backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', width: '200px', padding: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 100 }}>
                  <div style={{ padding: '8px', borderBottom: '1px solid #1e293b', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Logged in as</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{currentUser.nickname}</div>
                  </div>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => handleAction("Hamburger Menu")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Menu size={24} /></button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', color: 'white', marginBottom: '12px', letterSpacing: '-1px' }}>
            Master the <span style={{ color: '#10b981', fontStyle: 'italic' }}>Science</span> of Poker
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>Elite technical education for serious players.</p>
        </div>

        {/* Courses Grid */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {[
            { id: '01', title: 'Advanced GTO Mastery', icon: <Target size={28} /> },
            { id: '02', title: 'Exploitative Blueprint', icon: <Zap size={28} /> },
            { id: '03', title: 'The Mental Edge', icon: <Shield size={28} /> }
          ].map((course) => (
            <div key={course.id} style={{
              flex: '1',
              minWidth: '280px',
              maxWidth: '320px',
              background: 'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '24px',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 0 10px rgba(16, 185, 129, 0.05)'
            }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '16px', color: '#10b981' }}>{course.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{course.title}</h3>
              <code style={{ fontSize: '9px', color: 'rgba(16, 185, 129, 0.5)', marginBottom: '20px' }}>PRO_COURSE_{course.id}</code>
              <button onClick={() => handleAction(`Course ${course.id}`)} style={{
                marginTop: 'auto',
                width: '100%',
                padding: '10px',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                color: '#000',
                cursor: 'pointer',
                fontSize: '14px'
              }}>LEARN MORE</button>
            </div>
          ))}
        </div>

        {/* Training Lab */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '16px', textAlign: 'left' }}>Training Lab</h2>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
            {[
              { title: 'Pre-Flop Trainer', icon: <LayoutGrid size={24} /> },
              { title: 'Post-Flop Lab', icon: <Settings size={24} /> },
              { title: 'ICM Simulator', icon: <Target size={24} /> }
            ].map((trainer, i) => (
              <div key={i} style={{
                width: '280px',
                height: '180px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ color: '#10b981' }}>{trainer.icon}</div>
                <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>{trainer.title}</h4>
                <button onClick={() => handleAction(`Trainer ${trainer.title}`)} style={{
                  padding: '8px 24px',
                  backgroundColor: '#10b981',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '13px',
                  alignSelf: 'flex-start'
                }}>LAUNCH</button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Resources */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mic size={18} className="text-emerald-500" /> Top Poker Podcasts
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
              {[
                { name: 'Thinking Poker', sub: 'Andrew Brokos & Nate Meyvis', url: 'https://www.thinkingpoker.net/' },
                { name: 'The PokerNews Podcast', sub: 'Industry news & interviews', url: 'https://www.pokernews.com/podcast/' },
                { name: 'Chasing Poker Greatness', sub: 'Technical growth & MDA', url: 'https://chasingpokergreatness.com/' }
              ].map((item, i) => (
                <li key={i} style={{ marginBottom: '16px' }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#94a3b8', transition: 'color 0.2s', display: 'block' }} onMouseEnter={(e) => e.currentTarget.style.color = '#34d399'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                    <div style={{ fontWeight: 'bold', color: '#cbd5e1' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{item.sub}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Video size={18} className="text-emerald-500" /> YouTube Channels
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
              {[
                { name: 'Doug Polk Poker', sub: 'Strategic breakdowns', url: 'https://www.youtube.com/@DougPolkPoker' },
                { name: 'Jonathan Little', sub: 'PokerCoaching Hand Reviews', url: 'https://www.youtube.com/@pokercoaching' },
                { name: 'Brad Owen', sub: 'Modern Poker Vlogging', url: 'https://www.youtube.com/@BradOwenPoker' }
              ].map((item, i) => (
                <li key={i} style={{ marginBottom: '16px' }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#94a3b8', transition: 'color 0.2s', display: 'block' }} onMouseEnter={(e) => e.currentTarget.style.color = '#34d399'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                    <div style={{ fontWeight: 'bold', color: '#cbd5e1' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{item.sub}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={18} className="text-emerald-500" /> Recommended Solvers
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
              {[
                { name: 'GTO Wizard', sub: 'Leading web-based trainer', url: 'https://gtowizard.com/' },
                { name: 'PioSolver', sub: 'Classic Study Software', url: 'https://www.piosolver.com/' },
                { name: 'GTO+', sub: 'Cost-effective GTO trees', url: 'https://www.gtoplus.com/' }
              ].map((item, i) => (
                <li key={i} style={{ marginBottom: '16px' }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#94a3b8', transition: 'color 0.2s', display: 'block' }} onMouseEnter={(e) => e.currentTarget.style.color = '#34d399'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                    <div style={{ fontWeight: 'bold', color: '#cbd5e1' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{item.sub}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Auth Modal (Login/Register) */}
      {isAuthModalOpen && (
        <div
          onClick={(e) => e.target === e.currentTarget && setIsAuthModalOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(8px)' }}
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
              onClick={() => setIsAuthModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>TzurAce Platform</div>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', backgroundColor: '#020617', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
              <button
                onClick={() => setAuthMode('login')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  backgroundColor: authMode === 'login' ? '#1e293b' : 'transparent',
                  color: authMode === 'login' ? 'white' : '#94a3b8',
                  fontWeight: authMode === 'login' ? 'bold' : 'normal',
                  transition: 'all 0.2s'
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
                  transition: 'all 0.2s'
                }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
      )}
    </div>
  );
}