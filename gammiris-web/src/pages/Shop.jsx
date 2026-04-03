import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ShoppingCart, Star, X, ChevronDown, Filter } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Spices', 'Specialty', 'Nursery'];
const SORTS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Highest Rated'];

const Shop = () => {
    const { addToCart, cart } = useCart();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('Featured');
    const [addedId, setAddedId] = useState(null);

    const filtered = useMemo(() => {
        let list = products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase());
            const matchCat = category === 'All' || p.category === category;
            return matchSearch && matchCat;
        });
        if (sort === 'Price: Low to High') list = [...list].sort((a, b) => a.price - b.price);
        else if (sort === 'Price: High to Low') list = [...list].sort((a, b) => b.price - a.price);
        else if (sort === 'Highest Rated') list = [...list].sort((a, b) => b.rating - a.rating);
        return list;
    }, [search, category, sort]);

    const handleAdd = (product) => {
        addToCart(product);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1400);
    };

    const inCart = (id) => cart.some(c => c.id === id);

    return (
        <div className="min-h-screen pt-24" style={{ backgroundColor: '#080F0A' }}>
            {/* ── HERO BANNER ───────────────────────────── */}
            <div className="relative overflow-hidden py-20">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-15 float"
                        style={{ background: 'radial-gradient(circle, #3A7D44, transparent)', top: '-10%', right: '5%' }} />
                    <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-10 float"
                        style={{ background: 'radial-gradient(circle, #C8A84B, transparent)', bottom: '-5%', left: '10%', animationDelay: '3s' }} />
                </div>
                <div className="container relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}>
                        <div className="badge badge-primary inline-flex mb-4">Our Marketplace</div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                            Premium <span className="serif italic gradient-text-green">Spice</span> Collection
                        </h1>
                        <p className="text-lg max-w-xl mx-auto" style={{ color: '#7A8B7D' }}>
                            Curated from Matale's finest farms — explore our full range of certified organic spices and nursery plants.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* ── FILTER BAR ────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="container mb-10"
            >
                <div className="glass-card !rounded-2xl p-4 flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-56 relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#7A8B7D' }} />
                        <input
                            type="text"
                            placeholder="Search spices, plants..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input-field !pl-11 !py-3 !text-sm"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon !w-6 !h-6 !rounded-md" style={{ border: 'none' }}>
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Category Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)}
                                className={`tag ${category === cat ? 'active' : ''}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="relative ml-auto">
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            className="input-field !py-3 !pr-10 !text-sm appearance-none cursor-pointer"
                            style={{ minWidth: 180 }}
                        >
                            {SORTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7A8B7D' }} />
                    </div>
                </div>

                {/* Result count */}
                <div className="mt-3 ml-1 text-sm" style={{ color: '#7A8B7D' }}>
                    Showing <span className="text-white font-semibold">{filtered.length}</span> products
                    {category !== 'All' && <> in <span className="text-green-400 font-semibold">{category}</span></>}
                    {search && <> matching "<span className="text-white">{search}</span>"</>}
                </div>
            </motion.div>

            {/* ── PRODUCT GRID ──────────────────────────── */}
            <div className="container pb-24">
                <AnimatePresence mode="popLayout">
                    {filtered.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7"
                        >
                            {filtered.map((product, i) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.92 }}
                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                >
                                    <div className="product-card group h-full flex flex-col relative">
                                        {/* Main card link area */}
                                        <Link to={`/product/${product.id}`} className="block flex-1 flex flex-col no-underline">
                                            {/* Image */}
                                            <div className="relative overflow-hidden" style={{ height: 220 }}>
                                                <img
                                                    src={product.image} alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,15,10,0.75) 0%, transparent 60%)' }} />

                                            {/* Category badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className="badge badge-accent !py-1 !px-3">{product.category}</span>
                                            </div>

                                            {/* Rating */}
                                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold"
                                                style={{ background: 'rgba(8,15,10,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <Star size={10} fill="#C8A84B" color="#C8A84B" />
                                                <span>{product.rating}</span>
                                            </div>

                                            {/* Quick add - shown on hover */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                whileHover={{ opacity: 1, y: 0 }}
                                                className="absolute bottom-3 left-3 right-3 transition-all duration-300 translate-y-2 pointer-events-auto"
                                                style={{ opacity: 0 }}
                                            >
                                                <button
                                                    onClick={() => handleAdd(product)}
                                                    className="w-full btn-primary !py-2.5 !text-sm justify-center !rounded-xl"
                                                    style={addedId === product.id ? { background: 'linear-gradient(135deg, #C8A84B, #A07828)', boxShadow: '0 4px 20px rgba(200,168,75,0.4)' } : {}}
                                                >
                                                    {addedId === product.id ? '✓ Added!' : <><ShoppingCart size={15} /> Add to Cart</>}
                                                </button>
                                            </motion.div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <span className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#52A85E' }}>{product.category}</span>
                                            <h3 className="font-bold text-white leading-snug mb-2 flex-1"
                                                style={{ fontSize: '0.95rem' }}>
                                                {product.name}
                                            </h3>
                                                <p className="text-xs line-clamp-2 mb-4" style={{ color: '#7A8B7D' }}>{product.description}</p>
                                            </div>
                                        </Link>

                                        <div className="p-5 pt-0">
                                            <div className="flex items-center justify-between pt-3"
                                                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                                <div>
                                                    <span className="text-xl font-black text-white">Rs.{product.price.toFixed(0)}</span>
                                                    <span className="text-xs ml-1" style={{ color: '#7A8B7D' }}>/kg</span>
                                                </div>
                                                <button
                                                    onClick={() => handleAdd(product)}
                                                    className="btn-icon transition-all"
                                                    style={
                                                        addedId === product.id
                                                            ? { background: 'rgba(200,168,75,0.2)', borderColor: 'rgba(200,168,75,0.4)', color: '#C8A84B' }
                                                            : inCart(product.id)
                                                                ? { background: 'rgba(58,125,68,0.2)', borderColor: 'rgba(58,125,68,0.4)', color: '#52A85E' }
                                                                : {}
                                                    }
                                                >
                                                    <ShoppingCart size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="py-32 flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <Filter size={32} style={{ color: '#3E4D40' }} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
                            <p className="mb-6" style={{ color: '#7A8B7D' }}>Try adjusting your search or filter to find what you're looking for.</p>
                            <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn-ghost">
                                Clear Filters <X size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Shop;
