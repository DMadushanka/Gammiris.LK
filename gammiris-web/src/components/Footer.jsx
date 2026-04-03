import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Mail, Phone, MapPin, ExternalLink, ArrowUpRight, Globe, Camera, Share2 } from 'lucide-react';
import logoImg from '../assets/icon.png';

const Footer = () => {
    return (
        <footer className="relative w-full pt-24 pb-12 overflow-hidden border-t border-glass-border bg-bg-2">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl bg-primary/10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl bg-accent/5" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 shadow-2xl overflow-hidden p-1">
                                <img src={logoImg} className="w-full h-full object-contain" alt="Logo" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">
                                Gammiris<span className="text-primary-light">.LK</span>
                            </span>
                        </Link>
                        <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                            Direct from the fertile soils of Matale, bringing the world's finest organic Ceylon spices and high-yield nursery products to your doorstep.
                        </p>
                        <div className="flex gap-3">
                            {[Globe, Camera, Share2].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ y: -4, scale: 1.1 }}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl glass hover:border-primary-light transition-colors group"
                                >
                                    <Icon size={18} className="text-text-muted group-hover:text-primary-light transition-colors" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick navigation links */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg">Marketplace</h4>
                        <ul className="space-y-4">
                            {['Shop All', 'Spices', 'Specialty', 'Nursery'].map((item, i) => (
                                <li key={i}>
                                    <Link 
                                        to="/shop" 
                                        className="text-text-muted hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Section */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg">Company</h4>
                        <ul className="space-y-4">
                            {['Our Story', 'Farmers First', 'Shipping & Returns', 'Privacy Policy'].map((item, i) => (
                                <li key={i}>
                                    <Link 
                                        to="/about" 
                                        className="text-text-muted hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent/30 group-hover:bg-accent transition-colors" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-lg">Direct Connect</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0">
                                    <MapPin size={16} className="text-primary-light" />
                                </div>
                                <span className="text-text-muted text-sm leading-snug">Main Hub, Matale, Sri Lanka</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0">
                                    <Phone size={16} className="text-primary-light" />
                                </div>
                                <span className="text-text-muted text-sm">+94 66 123 4567</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0">
                                    <Mail size={16} className="text-primary-light" />
                                 </div>
                                <span className="text-text-muted text-sm">hello@gammiris.lk</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter style bottom row */}
                <div className="glass-card !rounded-3xl p-8 mb-16 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="text-center lg:text-left">
                            <h3 className="text-xl font-bold text-white mb-2">Join the Gammiris.LK Community</h3>
                            <p className="text-text-muted text-sm">Stay updated with weekly market trends and fresh harvest drops.</p>
                        </div>
                        <div className="w-full lg:w-fit flex items-center gap-3">
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                className="input-field !py-3 !px-6 !text-sm lg:min-w-[300px]"
                            />
                            <button className="btn-primary !px-8 !py-3 !text-sm whitespace-nowrap">
                                Subscribe <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="divider mb-8" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-text-dim text-[11px] font-medium tracking-[0.2em] uppercase">
                        © 2026 Gammiris.LK Ecosystem · All Rights Reserved
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-text-dim text-[11px] font-bold uppercase tracking-widest group cursor-pointer hover:text-text-muted transition-colors">
                            Built by Gayan <ExternalLink size={10} />
                        </span>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary-light animate-pulse" />
                            <span className="text-[10px] font-black text-primary-light uppercase tracking-tighter">System Live</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
