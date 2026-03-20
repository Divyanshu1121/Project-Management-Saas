import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, ArrowRight, BarChart3, Bot, Check,
    ChevronRight, Layers, LayoutDashboard, Menu,
    MessageSquare, PlayCircle, Shield, X, Zap
} from 'lucide-react';

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const theme = {
        bg: '#ffffff',
        bgSubtle: '#f8fafc', // Slate 50
        bgAccent: '#f1f5f9', // Slate 100
        primary: '#4f46e5',  // Indigo 600
        primaryHover: '#4338ca', // Indigo 700
        primaryLight: '#e0e7ff', // Indigo 100
        textDark: '#0f172a', // Slate 900
        textMuted: '#475569', // Slate 600
        border: '#e2e8f0',   // Slate 200
        success: '#10b981',
    };

    return (
        <div style={{ backgroundColor: theme.bg, color: theme.textDark, minHeight: '100vh', fontFamily: '"Inter", system-ui, sans-serif' }}>
            <style>{`
                html { scroll-behavior: smooth; }
                .nav-link {
                    color: ${theme.textMuted};
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .nav-link:hover { color: ${theme.textDark}; }
                
                .glass-nav {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid ${theme.border};
                }

                .btn-primary {
                    background-color: ${theme.primary};
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 999px; /* Pill shape for different feel */
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -2px rgba(79, 70, 229, 0.2);
                }
                .btn-primary:hover {
                    background-color: ${theme.primaryHover};
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -4px rgba(79, 70, 229, 0.3);
                }

                .btn-outline {
                    background-color: white;
                    color: ${theme.textDark};
                    padding: 0.75rem 1.5rem;
                    border-radius: 999px;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1px solid ${theme.border};
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }
                .btn-outline:hover {
                    background-color: ${theme.bgSubtle};
                    border-color: #cbd5e1;
                }

                .feature-pill {
                    background-color: ${theme.primaryLight};
                    color: ${theme.primary};
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: inline-block;
                    margin-bottom: 1rem;
                    letter-spacing: 0.025em;
                }

                /* Soft light mode card shadow */
                .hover-card {
                    background: white;
                    border: 1px solid ${theme.border};
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }
                .hover-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                    transform: translateY(-4px);
                    border-color: #cbd5e1;
                }
                
                /* Decorative background blobs */
                .blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: 0;
                    opacity: 0.4;
                }
            `}</style>

            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, width: '100%', zIndex: 50,
                transition: 'all 0.3s'
            }} className={scrolled ? 'glass-nav' : ''}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, backgroundColor: theme.primary, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-10deg)' }}>
                            <Layers size={20} color="#FFF" style={{ transform: 'rotate(10deg)' }} />
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: theme.textDark }}>
                            NexusSync
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div style={{ display: 'none', gap: '2.5rem', alignItems: 'center' }} className="desktop-menu">
                        <a href="#product" className="nav-link">Product</a>
                        <a href="#solutions" className="nav-link">Solutions</a>
                        <a href="#pricing" className="nav-link">Pricing</a>
                        <div style={{ width: '1px', height: '24px', backgroundColor: theme.border }}></div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link to="/login" className="nav-link" style={{ color: theme.textDark, fontWeight: 600 }}>Login</Link>
                            <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                                Start Free <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button style={{ border: 'none', background: 'none', color: theme.textDark, cursor: 'pointer' }} className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                    <style>{`
                        @media (min-width: 860px) {
                            .desktop-menu { display: flex !important; }
                            .mobile-menu-btn { display: none !important; }
                        }
                    `}</style>
                </div>

                {/* Mobile Dropdown */}
                {mobileMenuOpen && (
                    <div style={{ backgroundColor: 'white', borderBottom: `1px solid ${theme.border}`, padding: '1rem 1.5rem 2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <a href="#product" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Product</a>
                            <a href="#solutions" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
                            <a href="#pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                            <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                            <Link to="/signup" className="btn-primary" style={{ width: '100%' }}>Start Free Trial</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Split Hero Section */}
            <header style={{ paddingTop: '8rem', paddingBottom: '4rem', overflow: 'hidden', position: 'relative' }}>
                <div className="blob" style={{ top: '-10%', right: '-5%', width: '600px', height: '600px', backgroundColor: '#e0e7ff' }}></div>
                <div className="blob" style={{ bottom: '10%', left: '-10%', width: '500px', height: '500px', backgroundColor: '#fce7f3' }}></div>

                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '4rem', position: 'relative', zIndex: 10 }} className="hero-container">
                    <style>{`
                        .hero-container { flex-direction: column; text-align: center; }
                        .hero-content { max-width: 600px; margin: 0 auto; }
                        .hero-visual { width: 100%; margin-top: 3rem; }
                        @media (min-width: 1024px) {
                            .hero-container { flex-direction: row; text-align: left; }
                            .hero-content { flex: 1; padding-right: 2rem; margin: 0; }
                            .hero-visual { flex: 1.2; margin-top: 0; }
                        }
                    `}</style>

                    <div className="hero-content">
                        <div className="feature-pill" style={{ marginBottom: '1.5rem', backgroundColor: '#fef3c7', color: '#d97706' }}>
                            ✨ NexusSync Version 2.0 is live
                        </div>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: theme.textDark }}>
                            Organize work. <br />
                            <span style={{ color: theme.primary }}>Execute brilliantly.</span>
                        </h1>
                        <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', color: theme.textMuted, marginBottom: '2.5rem', lineHeight: 1.6 }}>
                            A modern, lightweight workspace that brings your teams, tasks, and chats into one fluid platform. Cut the noise and focus on shipping.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }} className="hero-buttons">
                            <style>{`
                                .hero-buttons { justify-content: center; }
                                @media (min-width: 1024px) { .hero-buttons { justify-content: flex-start; } }
                            `}</style>
                            <Link to="/signup" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1.1rem' }}>
                                Get Started Free <ArrowRight size={20} />
                            </Link>
                            <a href="#product" className="btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1.1rem' }}>
                                <PlayCircle size={20} style={{ color: theme.textMuted }} /> See how it works
                            </a>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: theme.textMuted, marginTop: '1.5rem' }}>No credit card required. Free 14-day trial on Pro.</p>
                    </div>

                    {/* Highly stylized, floating light-mode mockup */}
                    <div className="hero-visual" style={{ position: 'relative' }}>
                        <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', borderRadius: '24px', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', border: `1px solid ${theme.border}`, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>

                            {/* Browser header */}
                            <div style={{ position: 'absolute', top: 0, width: '100%', height: '3rem', backgroundColor: 'white', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '0.5rem', zIndex: 2 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#e2e8f0' }}></div>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#e2e8f0' }}></div>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#e2e8f0' }}></div>
                                <div style={{ flex: 1 }}></div>
                                <div style={{ backgroundColor: theme.bgSubtle, padding: '4px 16px', borderRadius: '12px', fontSize: '0.75rem', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={12} /> app.nexussync.com
                                </div>
                                <div style={{ flex: 1 }}></div>
                            </div>

                            {/* App Content Fake */}
                            <div style={{ position: 'absolute', top: '3rem', left: 0, right: 0, bottom: 0, display: 'flex', backgroundColor: '#f4f7f9' }}>
                                {/* Sidebar */}
                                <div style={{ width: '25%', backgroundColor: 'white', borderRight: `1px solid ${theme.border}`, padding: '1.5rem 1rem' }}>
                                    <div style={{ height: 20, width: '60%', backgroundColor: theme.bgSubtle, borderRadius: 4, marginBottom: '2rem' }}></div>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: i === 2 ? theme.primaryLight : theme.bgSubtle }}></div>
                                            <div style={{ height: 12, flex: 1, backgroundColor: i === 2 ? theme.primaryLight : theme.bgSubtle, borderRadius: 4 }}></div>
                                        </div>
                                    ))}
                                </div>
                                {/* Main Content */}
                                <div style={{ flex: 1, padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                        <div style={{ height: 28, width: '40%', backgroundColor: 'white', borderRadius: 6, border: `1px solid ${theme.border}` }}></div>
                                        <div style={{ width: 32, height: 32, backgroundColor: theme.primary, borderRadius: '50%', border: '4px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                                    </div>
                                    {/* Kanban columns */}
                                    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
                                        {['bg-white', 'bg-white', 'bg-slate-50'].map((bg, idx) => (
                                            <div key={idx} style={{ flex: 1, backgroundColor: 'white', border: `1px solid ${theme.border}`, borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                <div style={{ height: 16, width: '50%', backgroundColor: theme.bgSubtle, borderRadius: 4, marginBottom: '0.5rem' }}></div>
                                                <div style={{ height: 70, backgroundColor: theme.bgSubtle, borderRadius: 8, border: `1px solid #f1f5f9` }}></div>
                                                {idx === 0 && <div style={{ height: 90, backgroundColor: theme.bgSubtle, borderRadius: 8, border: `1px solid #f1f5f9` }}></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating notification element to break the grid */}
                        <div style={{ position: 'absolute', bottom: '-1rem', left: '-2rem', backgroundColor: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid ${theme.border}`, zIndex: 10, animation: 'float 6s ease-in-out infinite' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={20} color="#16a34a" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.textDark, margin: 0 }}>Sprint Deployed</p>
                                <p style={{ fontSize: '0.75rem', color: theme.textMuted, margin: 0 }}>Just now by Sarah</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Asymmetrical Z-Pattern Features (Replaces old grid) */}
            <section id="product" style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 6rem' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)', fontWeight: 800, color: theme.textDark, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                            Everything connects.
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: theme.textMuted, lineHeight: 1.6 }}>
                            Unlike heavily fractured legacy tools, NexusSync is built as a single, unified workspace where context is never lost.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>

                        {/* Feature 1: Left Text, Right Visual */}
                        <div className="z-section">
                            <style>{`
                                .z-section { display: flex; flex-direction: column; gap: 3rem; align-items: center; }
                                @media (min-width: 1024px) { .z-section { flex-direction: row; gap: 6rem; } }
                                .z-text { flex: 1; }
                                .z-visual { flex: 1.2; width: 100%; position: relative; }
                            `}</style>
                            <div className="z-text">
                                <div className="feature-pill">Real-time collaboration</div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>Chat built natively into your tasks.</h3>
                                <p style={{ fontSize: '1.125rem', color: theme.textMuted, lineHeight: 1.6, marginBottom: '2rem' }}>
                                    Stop bouncing between Slack and your project manager. Discuss, iterate, and type <code>/assign</code> directly in the chat to instantly spawn tracked work items.
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        'Global and Project-specific chat rooms',
                                        'Mentions, threads, and typing indicators',
                                        'Slash Command architecture'
                                    ].map((item, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, color: theme.textDark }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Check size={14} color={theme.primary} />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="z-visual">
                                <div style={{ backgroundColor: theme.bgSubtle, padding: '2rem', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                                        <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <MessageSquare size={16} color="white" />
                                            </div>
                                            <div style={{ fontWeight: 600 }}>Frontend Team</div>
                                        </div>
                                        <div style={{ padding: '1.5rem', backgroundColor: '#fcfcfd', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fcd34d' }}></div>
                                                <div style={{ backgroundColor: 'white', padding: '0.75rem 1rem', borderRadius: '0 12px 12px 12px', border: `1px solid ${theme.border}`, fontSize: '0.875rem' }}>
                                                    The login page needs a light theme.
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#60a5fa' }}></div>
                                                <div style={{ backgroundColor: theme.primary, color: 'white', padding: '0.75rem 1rem', borderRadius: '0 12px 12px 12px', fontSize: '0.875rem' }}>
                                                    <strong>/assign</strong> @alex Build light theme landing page
                                                </div>
                                            </div>
                                            <div style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '1rem', backgroundColor: 'white', marginLeft: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: 4, height: 32, backgroundColor: theme.success, borderRadius: 2 }}></div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Task Created Automatically</div>
                                                    <div style={{ color: theme.textMuted, fontSize: '0.75rem' }}>Assigned to Alex • Due Tomorrow</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Right Text, Left Visual */}
                        <div className="z-section" style={{ flexDirection: 'column-reverse' }}>
                            <style>{`
                                @media (min-width: 1024px) { .z-section:nth-of-type(2) { flex-direction: row; } }
                            `}</style>
                            <div className="z-visual">
                                <div style={{ backgroundColor: '#fdf4ff', padding: '2rem', borderRadius: '24px', border: `1px solid #fce7f3` }}>
                                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', padding: '2rem', border: `1px solid ${theme.border}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                            <div style={{ width: 120, height: 16, backgroundColor: theme.bgSubtle, borderRadius: 4 }}></div>
                                            <div style={{ backgroundColor: '#f3e8ff', color: '#9333ea', padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Bot size={12} /> AI Generaton
                                            </div>
                                        </div>
                                        <div style={{ borderLeft: `2px solid ${theme.border}`, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                            <div style={{ height: 12, width: '100%', backgroundColor: theme.bgSubtle, borderRadius: 4, marginBottom: '0.5rem' }}></div>
                                            <div style={{ height: 12, width: '85%', backgroundColor: theme.bgSubtle, borderRadius: 4, marginBottom: '0.5rem' }}></div>
                                            <div style={{ height: 12, width: '90%', backgroundColor: theme.bgSubtle, borderRadius: 4 }}></div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} style={{ border: `1px solid ${theme.border}`, padding: '0.75rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: 16, height: 16, border: `1px solid #cbd5e1`, borderRadius: 4 }}></div>
                                                    <div style={{ height: 8, flex: 1, backgroundColor: theme.bgSubtle, borderRadius: 4 }}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="z-text">
                                <div className="feature-pill" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>Groq AI Integration</div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>Let AI write your tickets.</h3>
                                <p style={{ fontSize: '1.125rem', color: theme.textMuted, lineHeight: 1.6, marginBottom: '2rem' }}>
                                    Stop staring at blank task descriptions. NexusSync's integrated Groq AI automatically generates definitions of done, expands project scopes, and auto-generates actionable subtasks in milliseconds.
                                </p>
                                <Link to="/signup" className="nav-link" style={{ color: theme.primary, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                    Explore AI Features <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Platform Analytics & Scale (3 columns) */}
            <section style={{ padding: '6rem 0', backgroundColor: theme.bgSubtle, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: theme.textDark, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Designed for directors.</h2>
                        <p style={{ fontSize: '1.125rem', color: theme.textMuted }}>Complete oversight across the entire company hierarchy, without micromanaging.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { title: 'Time Logging', desc: 'Track billable hours inherently tied to tasks without ugly third-party extensions.', icon: Activity },
                            { title: 'Leave Management', desc: 'Integrated HR workflows for handling employee PTO and availability visually natively.', icon: LayoutDashboard },
                            { title: 'Executive Dashboards', desc: 'Roll-up reports for CEOs and Owners to instantly gauge team workload and sprint velocity.', icon: BarChart3 }
                        ].map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div key={idx} className="hover-card" style={{ padding: '2rem' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 16, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <Icon size={24} color={theme.textDark} />
                                    </div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: theme.textDark }}>{feature.title}</h4>
                                    <p style={{ color: theme.textMuted, lineHeight: 1.6 }}>{feature.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Modern 3-Column Pricing */}
            <section id="pricing" style={{ padding: '8rem 0', backgroundColor: 'white' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)', fontWeight: 800, color: theme.textDark, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                            Simple, predictable pricing.
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: theme.textMuted }}>No hidden fees. Scale when you are ready.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                        {/* Free Tier */}
                        <div style={{ padding: '3rem 2rem', border: `1px solid ${theme.border}`, borderRadius: '24px', backgroundColor: 'white' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.textMuted, marginBottom: '1rem' }}>Basic Setup</h3>
                            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: theme.textDark, marginBottom: '0.5rem', lineHeight: 1 }}>$0</div>
                            <p style={{ color: theme.textMuted, marginBottom: '2rem', height: '48px' }}>Forever free for small teams getting started.</p>
                            <Link to="/signup" className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: '2rem' }}>Get Started</Link>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {['Up to 5 Users', 'Basic Kanban Boards', 'Standard Global Chat', 'Community Support'].map((feat, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: theme.textMuted, fontSize: '0.95rem' }}>
                                        <Check size={18} color={theme.textMuted} /> {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro Tier (Highlighted light mode) */}
                        <div style={{ padding: '3rem 2rem', border: `2px solid ${theme.primary}`, borderRadius: '24px', backgroundColor: 'white', position: 'relative', boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.15)' }}>
                            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme.primary, color: 'white', padding: '4px 16px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Most Popular</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.primary, marginBottom: '1rem' }}>Pro Plan</h3>
                            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: theme.textDark, marginBottom: '0.5rem', lineHeight: 1 }}>$19<span style={{ fontSize: '1rem', color: theme.textMuted, fontWeight: 400 }}>/user</span></div>
                            <p style={{ color: theme.textMuted, marginBottom: '2rem', height: '48px' }}>For scaling organizations that need power tools.</p>
                            <Link to="/signup" className="btn-primary" style={{ width: '100%', marginBottom: '2rem', paddingTop: '1rem', paddingBottom: '1rem' }}>Start 14-day Free Trial</Link>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {['Unlimited Users & Projects', 'Groq AI Task Auto-scoping', 'Advanced Executive Reports', 'Leave & Time Management', 'Priority 24/7 Support'].map((feat, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: theme.textDark, fontSize: '0.95rem', fontWeight: 500 }}>
                                        <Check size={18} color={theme.primary} /> {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Enterprise Tier */}
                        <div style={{ padding: '3rem 2rem', border: `1px solid ${theme.border}`, borderRadius: '24px', backgroundColor: theme.bgSubtle }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.textDark, marginBottom: '1rem' }}>Enterprise</h3>
                            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: theme.textDark, marginBottom: '0.5rem', lineHeight: 1 }}>Custom</div>
                            <p style={{ color: theme.textMuted, marginBottom: '2rem', height: '48px' }}>For large enterprises requiring SSO and strict compliance.</p>
                            <a href="#" className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: '2rem', backgroundColor: 'transparent', borderColor: '#cbd5e1' }}>Contact Sales</a>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {['Custom SAML SSO', 'Dedicated Success Manager', 'On-Premise Deployment Options', 'Custom API Rate Limits'].map((feat, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: theme.textMuted, fontSize: '0.95rem' }}>
                                        <Check size={18} color={theme.textMuted} /> {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Clean Final Banner */}
            <section style={{ padding: '6rem 1.5rem', backgroundColor: theme.primaryLight }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 800, color: theme.primaryHover, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                        Ready to clear the chaos?
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: theme.primary, marginBottom: '2.5rem' }}>
                        Join thousands of teams who have already switched to a better way of working.
                    </p>
                    <Link to="/signup" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
                        Create your workspace today
                    </Link>
                </div>
            </section>

            {/* Footer Light Mode */}
            <footer style={{ backgroundColor: 'white', borderTop: `1px solid ${theme.border}`, paddingTop: '5rem', paddingBottom: '2rem' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 32, height: 32, backgroundColor: theme.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-10deg)' }}>
                                <Layers size={16} color="#FFF" style={{ transform: 'rotate(10deg)' }} />
                            </div>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: theme.textDark }}>NexusSync</span>
                        </div>
                        <p style={{ color: theme.textMuted, lineHeight: 1.6 }}>The modern standard for project management, built for teams that move fast.</p>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 600, marginBottom: '1.5rem', color: theme.textDark, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h4>
                        <ul style={{ listStyle: 'none', padding: 0, gap: '1rem', display: 'flex', flexDirection: 'column' }}>
                            {['Features', 'Integrations', 'Pricing', 'Changelog'].map(item => <li key={item}><a href="#" className="nav-link">{item}</a></li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 600, marginBottom: '1.5rem', color: theme.textDark, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0, gap: '1rem', display: 'flex', flexDirection: 'column' }}>
                            {['About Us', 'Careers', 'Blog', 'Contact'].map(item => <li key={item}><a href="#" className="nav-link">{item}</a></li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 600, marginBottom: '1.5rem', color: theme.textDark, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal</h4>
                        <ul style={{ listStyle: 'none', padding: 0, gap: '1rem', display: 'flex', flexDirection: 'column' }}>
                            {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map(item => <li key={item}><a href="#" className="nav-link">{item}</a></li>)}
                        </ul>
                    </div>
                </div>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center', borderTop: `1px solid ${theme.border}`, paddingTop: '2.5rem', color: theme.textMuted, fontSize: '0.875rem' }}>
                    &copy; {new Date().getFullYear()} NexusSync Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
