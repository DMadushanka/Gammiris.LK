import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogIn, Search, Menu, X, ChevronDown, User, LogOut, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/icon.png';

const Navbar = () => {
    const { cartCount, toggleCart } = useCart();
    const { user, userData, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setIsMenuOpen(false); setSearchOpen(false); }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Marketplace', path: '/shop' },
        { name: 'Nursery', path: '/nursery' },
        { name: 'Analytics', path: '/analytics' },
        { name: 'Farmers', path: '/farmer-portal' },
    ];

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 100,
                    transition: 'all 0.5s ease',
                    paddingTop: scrolled ? '10px' : '18px',
                    paddingBottom: scrolled ? '10px' : '18px',
                    background: scrolled ? 'rgba(8, 15, 10, 0.92)' : 'rgba(8, 15, 10, 0.4)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}
            >
                <div className="flex items-center justify-between px-6 md:px-16 mx-auto w-full">
                    {/* ── Left Branding ── */}
                    <Link to="/" className="flex items-center gap-3.5 group no-underline">
                        <div
                            style={{ 
                                width: '44px', 
                                height: '44px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                overflow: 'hidden',
                                padding: '6px'
                            }}
                        >
                            <img src={logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-white">
                            Gammiris<span className="text-primary-light">.lk</span>
                        </span>
                    </Link>

                    {/* ── Center Links ── */}
                    <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
                        {navLinks.map((link) => {
                            const active = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 no-underline ${
                                        active ? 'text-white' : 'text-white/40 hover:text-white/80'
                                    }`}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="nav-selection"
                                            className="absolute inset-0 bg-accent/25 border border-accent/40 rounded-full shadow-[0_0_20px_rgba(200,168,75,0.25)]"
                                            transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Right Actions ── */}
                    <div className="flex items-center gap-6">
                        <button onClick={toggleCart} className="relative text-white/40 hover:text-white transition-colors">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-[10px] font-black flex items-center justify-center text-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        
                        <div className="w-px h-8 bg-white/10 mx-1 hidden md:block" />

                        {user ? (
                            <div className="flex items-center gap-5">
                                <Link 
                                    to="/profile" 
                                    className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-primary-light/40 bg-primary/10 text-white font-black text-lg tracking-tighter shadow-glow hover:scale-110 transition-all no-underline"
                                    title="My Intelligence Hub"
                                >
                                    {(userData?.fullName?.split(' ').map(n => n[0]).join('') || user.email?.charAt(0)).toUpperCase()}
                                </Link>
                                <button onClick={logout} className="text-white/10 hover:text-red-400 transition-colors hidden xl:block" title="Sign Out">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn-primary !py-3 !px-8 !text-[11px] !rounded-full !uppercase !tracking-widest">Sign In</Link>
                        )}
                        
                        <button className="lg:hidden text-white" onClick={() => setIsMenuOpen(v => !v)}>
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu (Glass Overlay) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-x-0 top-0 z-40 pt-28 pb-10 px-8"
                        style={{ background: 'rgba(8,15,10,0.98)', backdropFilter: 'blur(32px)' }}
                    >
                        <div className="flex flex-col gap-3">
                            {navLinks.map((link, i) => (
                                <motion.div key={link.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                                    <Link
                                        to={link.path}
                                        className={`flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest no-underline ${
                                            location.pathname === link.path ? 'bg-primary/10 text-primary-light border border-primary/20' : 'text-white/40 border border-transparent'
                                        }`}
                                    >
                                        {link.name}
                                        <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                                    </Link>
                                </motion.div>
                            ))}
                            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
                                {user ? (
                                    <>
                                        <Link to="/profile" className="btn-primary w-full justify-center !rounded-2xl py-4">
                                            <User size={18} /> Account Dashboard
                                        </Link>
                                        <button onClick={logout} className="btn-ghost w-full justify-center text-red-400 !rounded-2xl py-4 border-none bg-red-400/5">
                                            <LogOut size={18} /> Terminate Session
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="btn-primary w-full justify-center !rounded-2xl py-4">
                                        <LogIn size={18} /> Sign In to Gammiris Hub
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
