import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, MapPin, Leaf, BadgeCheck, 
    ArrowRight, ShoppingBag, Plus, Clock, 
    ChevronRight, Star, Info, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import pepperFarm  from '../assets/pepper_farm.jpg';
import pepperBlack from '../assets/pepper_black.jpg';

/* ── Sample Data (Simulating Firebase) ──────────────── */
const SAMPLE_PLANTS = [
    {
        id: 'p1',
        variety: 'Panniyur-1',
        price: 85,
        stockCount: 1200,
        district: 'Matale',
        verifiedSeller: true,
        nurseryName: 'Green Hills Nursery',
        rating: 4.8,
        images: [pepperFarm]
    },
    {
        id: 'p2',
        variety: 'Kuching',
        price: 95,
        stockCount: 850,
        district: 'Kandy',
        verifiedSeller: true,
        nurseryName: 'Central Spices Nursery',
        rating: 4.9,
        images: [pepperFarm]
    },
    {
        id: 'p3',
        variety: 'Ceylon High-Yield',
        price: 75,
        stockCount: 3000,
        district: 'Kurunegala',
        verifiedSeller: false,
        nurseryName: 'Local Farmer Nursery',
        rating: 4.5,
        images: [pepperFarm]
    },
    {
        id: 'p4',
        variety: 'Panniyur-5',
        price: 110,
        stockCount: 450,
        district: 'Ratnapura',
        verifiedSeller: true,
        nurseryName: 'Premium Vine Nursery',
        rating: 5.0,
        images: [pepperBlack]
    }
];

const Nursery = () => {
    const { addToCart } = useCart();
    const [plants, setPlants] = useState(SAMPLE_PLANTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const filteredPlants = plants.filter(p => 
        p.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nurseryName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pt-24 pb-20">
            {/* ── HEADER SECTION ────────────────────────── */}
            <section className="mb-12">
                <div className="container">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="badge badge-primary mb-4 inline-flex"
                            >
                                <Leaf size={12} className="mr-2" /> P2P Nursery Marketplace
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-6xl font-black text-white leading-tight"
                            >
                                Premium <span className="serif italic gradient-text-green">Pepper Vines</span>
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-4 text-lg max-w-xl" 
                                style={{ color: 'rgba(255,255,255,0.5)' }}
                            >
                                Source high-yield, disease-resistant pepper vine seedlings directly from certified nurseries across Sri Lanka.
                            </motion.p>
                        </div>

                        {/* Search & Filter */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
                        >
                            <div className="relative flex-1 sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#7A8B7D' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search variety or nursery..." 
                                    className="input-field !pl-12"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="btn-icon !w-14 !h-14 !rounded-xl">
                                <Filter size={20} />
                            </button>
                        </motion.div>
                    </div>

                    {/* Banner for Sellers */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="relative overflow-hidden p-8 md:p-12 rounded-[32px] mb-16"
                    >
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={pepperFarm}
                                alt="Nursery background" 
                                className="w-full h-full object-cover"
                                style={{ filter: 'brightness(0.3) saturate(0.7)' }}
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,15,10,0.9) 0%, rgba(58,125,68,0.3) 100%)' }} />
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-xl text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Have your own nursery?</h2>
                                <p className="text-white/60 mb-8 max-w-md">Become a verified supplier and sell your high-yield pepper vines to thousands of farmers nationwide.</p>
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    <Link to="/seller-registration" className="btn-primary">
                                        Become a Seller <ArrowRight size={18} />
                                    </Link>
                                    <Link to="/login" className="btn-ghost">
                                        Manager Dashboard
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden lg:grid grid-cols-2 gap-4">
                                <div className="glass-card p-6 flex flex-col items-center text-center gap-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(58,125,68,0.2)', border: '1px solid rgba(58,125,68,0.3)' }}>
                                        <Plus size={20} className="text-green-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-white">0%</div>
                                    <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Commission</div>
                                </div>
                                <div className="glass-card p-6 flex flex-col items-center text-center gap-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,168,75,0.2)', border: '1px solid rgba(200,168,75,0.3)' }}>
                                        <ShieldCheck size={20} className="text-accent" />
                                    </div>
                                    <div className="text-2xl font-bold text-white">100%</div>
                                    <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Verified</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── PLANT LISTING ─────────────────────────── */}
            <section>
                <div className="container">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-white">Available Varieties</h3>
                        <span className="text-sm text-white/40">{filteredPlants.length} items found</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
                            />
                        </div>
                    ) : filteredPlants.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filteredPlants.map((plant, idx) => (
                                    <motion.div
                                        key={plant.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    >
                                        <div className="product-card group h-full flex flex-col">
                                            {/* Image */}
                                            <div className="relative h-64 overflow-hidden rounded-t-[24px]">
                                                <img 
                                                    src={plant.images[0]} 
                                                    alt={plant.variety} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                                
                                                {/* Top Badges */}
                                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                                    <span className="badge badge-primary backdrop-blur-md">
                                                        <MapPin size={10} className="mr-1" /> {plant.district}
                                                    </span>
                                                    <div className="flex flex-col gap-2 items-end">
                                                        {plant.verifiedSeller && (
                                                            <div className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-primary-light">
                                                                <BadgeCheck size={16} />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-black/60 backdrop-blur-md border border-white/10 text-white">
                                                            <Star size={10} fill="#C8A84B" color="#C8A84B" />
                                                            {plant.rating}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price Overlay */}
                                                <div className="absolute bottom-4 left-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Price per Vine</span>
                                                        <span className="text-2xl font-black text-white">Rs. {plant.price}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h4 className="text-lg font-bold text-white group-hover:text-primary-light transition-colors mb-1">{plant.variety}</h4>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-xs text-white/40 italic">at {plant.nurseryName}</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-white/5">
                                                    <div>
                                                        <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Stock</div>
                                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            {plant.stockCount.toLocaleString()} units
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Status</div>
                                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                                            Ready to Ship
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex gap-2">
                                                    <button 
                                                        className="btn-primary flex-1 !py-3 !rounded-xl"
                                                        onClick={() => addToCart({
                                                            id: plant.id,
                                                            name: `${plant.variety} (Vine)`,
                                                            price: plant.price,
                                                            image: plant.images[0]
                                                        })}
                                                    >
                                                        <ShoppingBag size={16} /> Add to Order
                                                    </button>
                                                    <button className="btn-icon !rounded-xl">
                                                        <Info size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-20 px-6 glass-card">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-white/20" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
                            <p className="text-white/40 max-w-sm mx-auto">We couldn't find any plant varieties matching your search. Try different keywords or browse all.</p>
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="mt-8 btn-ghost"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Nursery;
