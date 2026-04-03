import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, MapPin, LogOut, 
    ChevronRight, Bell, Shield, Languages, 
    Edit3, Star, TrendingUp, CreditCard, 
    Home as HomeIcon, CheckCircle, Package,
    Clock, Award, Settings, Heart, History,
    ShieldCheck, Zap, Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── REUSABLE COMPONENTS ───────────────────────── */

const HeroStat = ({ label, value, icon: Icon, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="glass-card flex-1 p-6 flex flex-col gap-3 group cursor-default hover:border-white/20 transition-all"
    >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" 
             style={{ background: `${color}15`, color }}>
            <Icon size={20} />
        </div>
        <div>
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-white/30">{label}</div>
        </div>
    </motion.div>
);

const SettingRow = ({ icon: Icon, label, value, color, onClick, danger }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group text-left"
    >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" 
             style={{ background: `${color}12`, border: `1px solid ${color}20`, color }}>
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <div className={`text-sm font-bold ${danger ? 'text-red-400' : 'text-white'}`}>{label}</div>
            {value && <div className="text-xs text-white/40 mt-0.5">{value}</div>}
        </div>
        <ChevronRight size={16} className="text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
    </button>
);

/* ════════════════════════════════════════════════ */

const Profile = () => {
    const { userData, logout, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-14 h-14 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!userData) {
        navigate('/login');
        return null;
    }

    const stats = userData.stats || {
        totalSold: 0,
        rating: 5.0,
        activeListings: 0,
        joinedDate: 'March 2025'
    };

    const ROLE_THEMES = {
        farmer:  { label: 'Licensed Farmer',  color: '#10B981', icon: Zap },
        agent:   { label: 'Collection Agent', color: '#F59E0B', icon: Activity },
        admin:   { label: 'System Admin',     color: '#EF4444', icon: ShieldCheck },
        default: { label: 'Member',           color: 'var(--accent)', icon: User }
    };
    const theme = ROLE_THEMES[userData.role] || ROLE_THEMES.default;

    return (
        <div className="min-h-screen pt-28 pb-24 bg-[#080F0A]">
            {/* Cinematic Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] opacity-20" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] opacity-10" />
            </div>

            <div className="container relative z-10">
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    
                    {/* LEFT PANEL: PROFILE SUMMARY */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-10 text-center relative overflow-hidden"
                        >
                            {/* Accent Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                            
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <motion.div 
                                    animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20" 
                                />
                                <div className="absolute inset-2 rounded-full border border-white/5 bg-white/[0.02]" />
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/10 to-primary-dark/30 flex items-center justify-center text-4xl font-black text-white shadow-2xl relative z-10">
                                    {userData.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#080F0A] border-4 border-[#080F0A] flex items-center justify-center text-primary-light z-20">
                                    <CheckCircle size={24} fill="#080F0A" />
                                    <div className="absolute inset-0 text-primary-light flex items-center justify-center">
                                        <CheckCircle size={20} />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-3xl font-black text-white mb-2">{userData.fullName}</h2>
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[2px] mb-8"
                                style={{ background: `${theme.color}15`, color: theme.color, border: `1px solid ${theme.color}30` }}>
                                <theme.icon size={12} className="animate-pulse" />
                                {theme.label}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <HeroStat label="Accuracy" value="98%" icon={TrendingUp} color="#10B981" delay={0.1} />
                                <HeroStat label="Verified" value="Gold" icon={Award} color="#C8A84B" delay={0.2} />
                            </div>

                            <div className="mt-10 flex gap-3">
                                <button className="flex-1 btn-primary !py-4 justify-center !rounded-2xl shadow-glow">
                                    <Edit3 size={18} /> Edit Profile
                                </button>
                                <button onClick={logout} className="btn-icon !w-14 !h-14 !rounded-2xl text-red-400/60 border-red-400/20 bg-red-400/5 hover:bg-red-400 hover:text-white transition-all">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Quick Metrics */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="glass-card p-8"
                        >
                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-6">Account Trust</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-widest">
                                        <span className="text-white/50 text-[10px]">Verification Progress</span>
                                        <span className="text-primary-light">100%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-primary" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <ShieldCheck size={20} className="text-primary-light" />
                                    <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">Two-Factor Authentication Active</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT PANEL: DETAILS & NAVIGATION */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* ── Section: Activity Dashboard ── */}
                        <motion.section 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <h3 className="text-[12px] font-black text-white/30 uppercase tracking-[4px] ml-4 flex items-center gap-3">
                                <LayoutGrid size={14} /> Hub Activity
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Link to={userData.role === 'farmer' ? '/farmer-portal' : '/shop'} className="glass-card group p-8 flex flex-col gap-6 hover:border-primary/40 transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-light group-hover:bg-primary group-hover:text-white transition-all shadow-glow">
                                        <TrendingUp size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white mb-2">Commerce Manager</h4>
                                        <p className="text-sm text-white/40 leading-relaxed">Access your specialized dashboard to manage {userData.role === 'farmer' ? 'harvest logistics' : 'marketplace orders'}.</p>
                                    </div>
                                </Link>
                                <div className="glass-card group p-8 flex flex-col gap-6 hover:border-accent/40 cursor-pointer transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                                        <History size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white mb-2">Recent History</h4>
                                        <p className="text-sm text-white/40 leading-relaxed">View your past transactions, completed pickups, and certified trade reports.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* ── Section: Information ── */}
                        <motion.section 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            <h3 className="text-[12px] font-black text-white/30 uppercase tracking-[4px] ml-4 flex items-center gap-3">
                                <User size={14} /> Personal Identity
                            </h3>
                            <div className="glass-card overflow-hidden">
                                <div className="flex flex-wrap p-2">
                                    <div className="w-full md:w-1/2 p-2"><SettingRow icon={Mail} label="Email Address" value={userData.email} color="var(--primary-light)" /></div>
                                    <div className="w-full md:w-1/2 p-2"><SettingRow icon={Phone} label="Phone Number" value={userData.phoneNumber} color="#10B981" /></div>
                                    <div className="w-full p-2"><SettingRow icon={MapPin} label="Primary Address" value={`${userData.address}, ${userData.district}`} color="var(--accent)" /></div>
                                    <div className="w-full md:w-1/2 p-2"><SettingRow icon={CreditCard} label="NIC / Identification" value={userData.idNumber} color="var(--accent-light)" /></div>
                                    <div className="w-full md:w-1/2 p-2"><SettingRow icon={Clock} label="Member Since" value={stats.joinedDate} color="#F59E0B" /></div>
                                </div>
                            </div>
                        </motion.section>

                        {/* ── Section: Preferences ── */}
                        <motion.section 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                            className="space-y-6"
                        >
                            <h3 className="text-[12px] font-black text-white/30 uppercase tracking-[4px] ml-4 flex items-center gap-3">
                                <Settings size={14} /> Global Preferences
                            </h3>
                            <div className="glass-card overflow-hidden divide-y divide-white/5">
                                <div className="p-2 grid md:grid-cols-2 gap-2">
                                    <SettingRow icon={Bell} label="Notifications" value="Push & Email active" color="#EC4899" />
                                    <SettingRow icon={Languages} label="Display Language" value="English (United Kingdom)" color="var(--primary-light)" />
                                    <SettingRow icon={Shield} label="Security Core" value="2FA & Password protection" color="var(--accent)" />
                                    <SettingRow icon={Heart} label="Support Centre" value="Chat with our advisors" color="#EF4444" />
                                </div>
                            </div>
                        </motion.section>

                        {/* Sign Out Warning Area */}
                        <div className="pt-10 flex flex-col items-center">
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-[10px] uppercase font-black tracking-widest text-white/10 mb-6">
                                Platform Security version 2.4.0-c5
                            </motion.p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── HELPERS ── */
const LayoutGrid = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);

export default Profile;
