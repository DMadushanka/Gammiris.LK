import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, TrendingDown, Info, Calendar, 
    Zap, Activity, MapPin, Search, Plus, 
    ArrowRight, Globe, BarChart3, Clock,
    LayoutGrid, List
} from 'lucide-react';
import PriceChart from '../components/PriceChart';

/* ── Rate Card Component ──────────────────── */
const RateCard = ({ label, buy, sell, trend, color }) => {
    const bull = trend >= 0;
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-6">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{label} Pepper</span>
                <div className={`px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1 ${bull ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {bull ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {bull ? '+' : ''}{trend}%
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-white/20 text-[9px] uppercase font-black block mb-1">Buying Rate</span>
                        <div className="text-3xl font-black text-white">Rs.{buy}</div>
                    </div>
                    <div className="text-right">
                        <span className="text-white/20 text-[9px] uppercase font-black block mb-1">Selling Rate</span>
                        <div className="text-xl font-black text-white/60">Rs.{sell}</div>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Pricing Updated 2 Hours Ago</p>
                </div>
            </div>
        </motion.div>
    );
};

/* ════════════════════════════════════════════════ */
const MarketAnalytics = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('Matale');

    const regions = [
        { name: 'Matale', production: 'High', rate: 'Normal' },
        { name: 'Kandy', production: 'Medium', rate: 'Premium' },
        { name: 'Ratnapura', production: 'Medium', rate: 'Normal' },
        { name: 'Kegalle', production: 'Medium', rate: 'Normal' },
        { name: 'Badulla', production: 'Low', rate: 'Premium' },
    ];

    return (
        <div className="min-h-screen pt-28 pb-24">
            <div className="container">
                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <div className="badge badge-accent mb-4">Intelligence Center</div>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tight mb-6">
                        Market<br />
                        <span className="serif italic gradient-text-green">Analytics</span>
                    </h1>
                    <p className="text-lg text-white/40 leading-relaxed max-w-xl">
                        Real-time price tracking, market trends, and regional production insights across the island. 
                        Trade with confidence, backed by data.
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Rate Cards (Intelligence Highlight) */}
                    <RateCard label="Black (G1)" buy={1150} sell={1320} trend={4.2} color="#3A7D44" />
                    <RateCard label="White (Premium)" buy={1480} sell={1700} trend={2.1} color="#C8A84B" />
                    
                    {/* Market Insights Snippet */}
                    <div className="glass-card p-10 bg-primary/5 border-primary/20 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 text-primary-light mb-6">
                                <Zap size={20} />
                                <span className="font-black text-xs uppercase tracking-widest">Market Insights ⚡</span>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 leading-tight">Prices surged 5% this week!</h3>
                            <p className="text-sm text-white/50 leading-relaxed mb-6">
                                High demand from European markets and a localized shortage in Matale has pushed Grade 1 prices to a 12-month high. Recommendations: <span className="text-white font-bold italic">Stock for future trades.</span>
                            </p>
                        </div>
                        <button className="btn-primary !py-3 !text-xs justify-center !rounded-xl">Subscribe to Daily Alerts</button>
                    </div>

                    {/* Chart Section (The main visual) */}
                    <div className="lg:col-span-2">
                        <PriceChart />
                    </div>

                    {/* Regional Variation Map / List */}
                    <div className="glass-card p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white mb-1">Production Map</h3>
                                <p className="text-xs text-white/30 uppercase font-black tracking-widest">By District</p>
                            </div>
                            <Globe size={24} className="text-white/20" />
                        </div>

                        <div className="space-y-6">
                            {regions.map((region) => (
                                <button 
                                    key={region.name}
                                    onClick={() => setSelectedDistrict(region.name)}
                                    className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all group ${selectedDistrict === region.name ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent hover:bg-white/[0.02]'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${region.production === 'High' ? 'bg-primary' : 'bg-orange-500'}`} />
                                        <div className="text-left">
                                            <span className="text-white font-black text-sm block">{region.name}</span>
                                            <span className="text-white/20 text-[10px] font-black uppercase">{region.production} Production</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-primary-light text-xs font-black block tracking-widest">{region.rate}</span>
                                        <span className="text-white/20 text-[10px] font-black uppercase">Rate</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-10 p-6 rounded-2xl bg-black/40 border border-white/5 text-center">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Live Hotspot Tracking</p>
                            <div className="flex justify-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-1 h-3 rounded-full bg-primary/20" style={{ height: Math.random() * 20 + 5 }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Weekly Report & CTA */}
                    <div className="lg:col-span-3 flex flex-col md:flex-row items-center gap-10 p-12 bg-white/[0.02] border border-white/5 rounded-[40px] mt-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary-light flex-shrink-0">
                            <BarChart3 size={40} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-black text-white mb-2">Download Weekly Report</h2>
                            <p className="text-white/40 leading-relaxed max-w-lg mb-0 text-sm">
                                Get a deep dive into the export analytics and farm-level statistics updated for March 2025. 
                                Includes supply chain heatmaps and price projections.
                            </p>
                        </div>
                        <button className="btn-primary px-12 !py-5 gap-3 shadow-glow whitespace-nowrap">Get Report (PDF) <ArrowRight size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketAnalytics;
