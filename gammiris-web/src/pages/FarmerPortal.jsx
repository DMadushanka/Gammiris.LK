import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Truck, Calendar, MapPin, 
    ArrowRight, Check, Clock, TrendingUp, 
    ShieldCheck, Package, AlertCircle, Sprout,
    ChevronDown, Plus
} from 'lucide-react';

/* ── Status Tracker Component ──────────────── */
const StatusTracker = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Request Sent',    icon: Clock },
        { id: 2, label: 'Admin Approved',  icon: ShieldCheck },
        { id: 3, label: 'Truck En Route',   icon: Truck },
        { id: 4, label: 'Harvest Collected', icon: Package }
    ];

    return (
        <div className="flex items-center justify-between w-full relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000" 
                 style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />

            {steps.map((step) => {
                const active = step.id <= currentStep;
                const Icon = step.icon;
                return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${active ? 'bg-primary text-white scale-110 shadow-glow' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                            <Icon size={20} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest text-center max-w-[80px] ${active ? 'text-white' : 'text-white/20'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

/* ════════════════════════════════════════════════ */
const FarmerPortal = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'pickup-request'
    const [requestStatus, setRequestStatus] = useState(1); // 1-4 for status tracker

    // Form states
    const [variety, setVariety] = useState('Black');
    const [quantity, setQuantity] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [address, setAddress] = useState('');

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => setView('dashboard'), 2000);
    };

    return (
        <div className="min-h-screen pt-28 pb-20">
            <div className="container">
                <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="badge badge-primary mb-4">Farmer Logistics Hub</div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">Farmer Portal</h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setView('dashboard')} 
                            className={`btn-ghost !rounded-2xl ${view === 'dashboard' ? 'bg-primary/10 border-primary/20 text-primary-light' : ''}`}>
                            <LayoutDashboard size={18} /> Dashboard
                        </button>
                        <button onClick={() => setView('pickup-request')} 
                            className={`btn-primary !rounded-2xl ${view === 'pickup-request' ? 'scale-105' : ''}`}>
                            <Plus size={18} /> New Pickup Request
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'dashboard' ? (
                        <motion.div 
                            key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Greeting & Quick Stats */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="glass-card p-8 group">
                                    <h3 className="text-white/40 text-xs font-black uppercase tracking-widest mb-4">Total Sales</h3>
                                    <div className="text-4xl font-black text-white mb-2">Rs. 142,500</div>
                                    <div className="flex items-center gap-2 text-primary-light text-sm font-bold">
                                        <TrendingUp size={14} /> +12% this month
                                    </div>
                                </div>
                                <div className="glass-card p-8">
                                    <h3 className="text-white/40 text-xs font-black uppercase tracking-widest mb-4">Quantity Sold</h3>
                                    <div className="text-4xl font-black text-white mb-2">128 kg</div>
                                    <div className="text-white/20 text-sm font-bold uppercase tracking-widest">Premium Grade 1</div>
                                </div>
                                <div className="glass-card p-8 border-primary/20 bg-primary/5">
                                    <h3 className="text-primary-light text-xs font-black uppercase tracking-widest mb-4">Next Pickup</h3>
                                    <div className="text-2xl font-black text-white mb-2">Mar 15, 2025</div>
                                    <div className="flex items-center gap-2 text-white/50 text-xs font-bold">
                                        <Truck size={14} /> Route #42 - Matale Central
                                    </div>
                                </div>
                            </div>

                            {/* Active Request Tracker */}
                            <div className="glass-card p-8 md:p-12 overflow-hidden">
                                <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                                    <div>
                                        <h2 className="text-2xl font-black text-white mb-2">Active Logistics Request</h2>
                                        <p className="text-white/40 text-sm">Track your harvest collection in real-time</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-white/20 uppercase tracking-widest block mb-1">Batch ID</span>
                                        <span className="text-white font-black">#GR-9942-LK</span>
                                    </div>
                                </div>
                                <StatusTracker currentStep={requestStatus} />
                                <div className="mt-16 flex justify-center">
                                    <button onClick={() => setRequestStatus(s => s < 4 ? s + 1 : 1)} className="btn-ghost !text-[10px] !py-2 uppercase tracking-widest opacity-20 hover:opacity-100">
                                        Simulate Next Step (Dev)
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="glass-card p-8 md:p-12">
                                <h2 className="text-3xl font-black text-white mb-8">Request Pickup</h2>
                                
                                {isSubmitted ? (
                                    <div className="text-center py-20">
                                        <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-6">
                                            <Check size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-4">Request Sent Successfully!</h3>
                                        <p className="text-white/40 mb-8">Our logistics team will verify your request and approve the pickup within 24 hours.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Variety</label>
                                                <div className="relative">
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20" />
                                                    <select value={variety} onChange={e => setVariety(e.target.value)}
                                                        className="input-field w-full appearance-none">
                                                        <option value="Black">Black Pepper</option>
                                                        <option value="White">White Pepper</option>
                                                        <option value="Plants">Nursery Plants</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Est. Quantity (kg)</label>
                                                <input type="number" placeholder="Enter kg" required value={quantity} onChange={e => setQuantity(e.target.value)}
                                                    className="input-field w-full" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Pickup GPS / Address</label>
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-4 top-4 text-white/20" />
                                                <input placeholder="Enter location or drop a pin" required value={address} onChange={e => setAddress(e.target.value)}
                                                    className="input-field w-full !pl-12" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Preferred Collection Date</label>
                                            <div className="relative">
                                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                                <input type="date" required value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                                                    className="input-field w-full !pl-12" />
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex gap-4">
                                            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 h-fit">
                                                <AlertCircle size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white mb-1">Important Note</h4>
                                                <p className="text-xs text-white/40 leading-relaxed">Please ensure the harvest is packed and ready for weighing at your gate before the scheduled truck arrival time.</p>
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full btn-primary !py-5 justify-center text-lg gap-3">
                                            Submit Logistics Request <ArrowRight size={20} />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FarmerPortal;
