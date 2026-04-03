import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Star, ShoppingBag, Truck, 
    ShieldCheck, RotateCcw, Share2, Heart, 
    Plus, Minus, Check, Leaf, Info
} from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import pepperFarm from '../assets/pepper_farm.jpg';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    // Find product from static data (or nursery sample data)
    const product = products.find(p => p.id === parseInt(id)) || {
        id: id,
        name: "Premium Nursery Item",
        price: 850,
        category: "Nursery",
        image: pepperFarm,
        description: "A high-yield, disease-resistant variety optimized for Sri Lankan soil conditions. Certified organic and ready for plantation.",
        rating: 4.8,
        district: "Matale",
        harvestDate: "March 2024"
    };

    const handleAdd = () => {
        const itemToAdd = { ...product, name: `${product.name} (${selectedWeight})`, price: product.price * (parseFloat(selectedWeight) || 1) };
        for(let i=0; i<quantity; i++) {
            addToCart(itemToAdd);
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const [selectedWeight, setSelectedWeight] = useState('1kg');
    const weights = ['500g', '1kg', '5kg'];

    return (
        <div className="min-h-screen pt-28 pb-20 overflow-hidden relative">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none z-0">
                <img src={product.image} className="w-full h-full object-cover blur-3xl saturate-200" alt="" />
            </div>

            <div className="container relative z-10">
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-primary transition-colors group">
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5">
                            <ChevronLeft size={16} />
                        </div>
                        Back to Marketplace
                    </Link>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Image Gallery */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative aspect-square rounded-[40px] overflow-hidden glass shadow-2xl border border-white/5">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 right-6">
                                <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex-1 aspect-video rounded-3xl overflow-hidden glass border border-white/10 cursor-pointer hover:border-primary/40 transition-colors opacity-40 hover:opacity-100">
                                    <img src={product.image} className="w-full h-full object-cover" alt="" />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Info */}
                    <div className="space-y-10 py-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <span className="badge badge-primary px-4 py-1.5 uppercase font-black text-[10px] tracking-widest">{product.category}</span>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/20 text-accent font-bold text-sm">
                                    <Star size={14} fill="currentColor" /> {product.rating} (128 Reviews)
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">{product.name}</h1>
                            <p className="text-lg text-white/50 leading-relaxed max-w-lg">
                                {product.description}
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col gap-8 p-8 rounded-[32px] bg-white/[0.03] border border-white/5"
                        >
                            <div className="flex flex-col gap-4">
                                <span className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1 block">Select Weight</span>
                                <div className="flex gap-3">
                                    {weights.map(w => (
                                        <button 
                                            key={w} 
                                            onClick={() => setSelectedWeight(w)}
                                            className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all ${selectedWeight === w ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center justify-between gap-6 p-4 rounded-2xl bg-black/40 border border-white/5 sm:w-40">
                                    <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="text-white/40 hover:text-white transition-colors">
                                        <Minus size={18} />
                                    </button>
                                    <span className="text-lg font-black text-white">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q+1)} className="text-white/40 hover:text-white transition-colors">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <button 
                                    onClick={handleAdd}
                                    className="flex-1 btn-primary !py-5 justify-center text-lg gap-3 shadow-glow"
                                >
                                    {added ? <><Check size={20} /> Item Added!</> : <><ShoppingBag size={20} /> Add to Basket</>}
                                </button>
                            </div>

                            {/* Traceability Feature */}
                            <div className="pt-6 border-t border-white/5">
                                <div className="flex items-center gap-3 text-xs font-bold text-primary-light uppercase tracking-widest mb-2">
                                    <MapPin size={14} /> Origin & Traceability
                                </div>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    Sourced from: <span className="text-white font-black">{product.district || 'Matale'}</span> | Harvest Date: <span className="text-white font-black">{product.harvestDate || 'January 2025'}</span>
                                </p>
                            </div>
                        </motion.div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Truck, title: "Fast Delivery", text: "48 hours Island-wide" },
                                { icon: ShieldCheck, title: "Verified", text: "Quality Guaranteed" },
                                { icon: RotateCcw, title: "Returns", text: "7-day easy returns" },
                                { icon: Info, title: "Support", text: "Farmer assistance" }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all"
                                >
                                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary-light group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm mb-0.5">{item.title}</h4>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{item.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
