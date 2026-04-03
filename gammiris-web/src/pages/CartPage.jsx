import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trash2, Plus, Minus, CreditCard, ShoppingBag, 
    ArrowRight, ShieldCheck, Truck, RotateCcw, 
    Check, MapPin, Phone, User, Landmark, 
    Wallet, ChevronLeft, Receipt
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const DISTRICT_SHIPPING = {
    'National': 500, 'Colombo': 350, 'Gampaha': 350, 'Kalutara': 400,
    'Kandy': 450, 'Matale': 450, 'Nuwara Eliya': 500,
    'Galle': 450, 'Matara': 500, 'Hambantota': 550,
    'Jaffna': 750, 'Kilinochchi': 700, 'Mannar': 700, 'Vavuniya': 650, 'Mullaitivu': 700,
    'Batticaloa': 600, 'Ampara': 650, 'Trincomalee': 600,
    'Kurunegala': 400, 'Puttalam': 450,
    'Anuradhapura': 550, 'Polonnaruwa': 550,
    'Badulla': 600, 'Moneragala': 650,
    'Ratnapura': 500, 'Kegalle': 400
};

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'confirmation'
    
    // Checkout states
    const [district, setDistrict] = useState('Colombo');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'bank' | 'online'
    const [orderId, setOrderId] = useState('');

    const shippingCost = useMemo(() => DISTRICT_SHIPPING[district] || 500, [district]);
    const total = cartTotal + shippingCost;

    const handleCheckout = (e) => {
        e.preventDefault();
        const id = 'GR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        setOrderId(id);
        setStep('confirmation');
        clearCart();
    };

    if (step === 'confirmation') {
        return (
            <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 max-w-lg w-full flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-8 shadow-glow">
                        <Check size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">Order Confirmed!</h1>
                    <p className="text-white/40 mb-8">Thank you for your purchase. Your order has been received and is being processed.</p>
                    
                    <div className="w-full p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4 mb-10 text-left">
                        <div className="flex justify-between">
                            <span className="text-white/20 text-xs font-black uppercase tracking-widest">Order ID</span>
                            <span className="text-white font-black">{orderId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/20 text-xs font-black uppercase tracking-widest">Payment</span>
                            <span className="text-white font-black uppercase">{paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/20 text-xs font-black uppercase tracking-widest">Delivery To</span>
                            <span className="text-white font-bold">{district}</span>
                        </div>
                    </div>

                    <Link to="/shop" className="btn-primary w-full justify-center">Return to Shop <ArrowRight size={18} /></Link>
                </motion.div>
                <div className="mt-8 flex gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
                    <span>Email Sent</span>
                    <div className="w-1 h-1 rounded-full bg-white/10 mt-1.5" />
                    <span>SMS Notification Sent</span>
                </div>
            </div>
        );
    }

    if (cart.length === 0 && step !== 'confirmation') {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
                    <ShoppingBag size={40} className="text-white/10" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4">Your cart is empty</h1>
                <Link to="/shop" className="btn-primary">Explore Marketplace <ArrowRight size={18} /></Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-24">
            <div className="container">
                <div className="mb-12">
                    {step === 'checkout' && (
                        <button onClick={() => setStep('cart')} className="flex items-center gap-2 text-white/40 mb-6 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                            <ChevronLeft size={16} /> Back to Cart
                        </button>
                    )}
                    <div className="badge badge-primary mb-4">{step === 'cart' ? 'Shopping Cart' : 'Checkout Flow'}</div>
                    <h1 className="text-4xl md:text-6xl font-black text-white">{step === 'cart' ? 'Your Basket' : 'Shipping & Payment'}</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* LEFT CONTENT */}
                    <div className="flex-[2] w-full space-y-6">
                        {step === 'cart' ? (
                            <AnimatePresence>
                                {cart.map((item, i) => (
                                    <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                                        className="glass-card !p-0 overflow-hidden flex flex-col sm:flex-row items-center border-white/5 bg-white/[0.02]">
                                        <div className="w-full sm:w-40 h-32 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 p-6 flex flex-wrap items-center justify-between gap-6">
                                            <div>
                                                <h3 className="text-white font-black text-lg mb-1">{item.name}</h3>
                                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{item.category}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-4 bg-black/20 rounded-xl px-2 py-1 border border-white/5">
                                                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="text-white/40 hover:text-white p-2">
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="font-black text-white w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-white/40 hover:text-white p-2">
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <div className="text-xl font-black text-white min-w-[100px] text-right">
                                                    Rs.{(item.price * item.quantity).toFixed(0)}
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-red-400/40 hover:text-red-400 p-2 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="glass-card p-8 md:p-12 space-y-10">
                                {/* Shipping Form */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light">
                                            <MapPin size={20} />
                                        </div>
                                        <h2 className="text-2xl font-black text-white">Delivery Details</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Full Name</label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                                <input placeholder="Enter name" required value={name} onChange={e => setName(e.target.value)} className="input-field w-full !pl-12" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                                <input placeholder="+94 XX XXX XXXX" required value={phone} onChange={e => setPhone(e.target.value)} className="input-field w-full !pl-12" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Shipping Address</label>
                                        <textarea placeholder="Enter full address" required value={address} onChange={e => setAddress(e.target.value)} className="input-field w-full h-24 pt-4" />
                                    </div>
                                </section>

                                {/* Payment Methods */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                            <CreditCard size={20} />
                                        </div>
                                        <h2 className="text-2xl font-black text-white">Payment Method</h2>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'cod', label: 'COD', icon: Wallet, desc: 'Cash on Delivery' },
                                            { id: 'bank', label: 'Bank', icon: Landmark, desc: 'Transfer' },
                                            { id: 'online', label: 'Online', icon: CreditCard, desc: 'Visa/Master' }
                                        ].map(method => (
                                            <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                                                className={`p-6 rounded-2xl border text-left transition-all ${paymentMethod === method.id ? 'bg-primary/10 border-primary/40 text-white' : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/10'}`}>
                                                <method.icon size={24} className={`mb-4 ${paymentMethod === method.id ? 'text-primary' : 'text-white/20'}`} />
                                                <div className="font-black text-sm uppercase tracking-widest">{method.label}</div>
                                                <div className="text-[10px] font-bold opacity-60 mt-1">{method.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR - ORDER SUMMARY & SHIPPING CALC */}
                    <div className="lg:w-[400px] w-full sticky top-32">
                        <div className="glass-card p-8 space-y-8">
                            <h2 className="text-2xl font-black text-white">Order Summary</h2>
                            
                            {/* Shipping Calculator */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1 flex justify-between">
                                    Shipping Destination <span className="text-primary-light">Calculator</span>
                                </label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <select value={district} onChange={e => setDistrict(e.target.value)} className="input-field w-full !pl-12 !py-4 appearance-none cursor-pointer">
                                        {Object.keys(DISTRICT_SHIPPING).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Costs */}
                            <div className="space-y-4 pt-4 px-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40 font-bold">Subtotal</span>
                                    <span className="text-white font-black">Rs. {cartTotal.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40 font-bold">Shipping ({district})</span>
                                    <span className="text-white font-black">Rs. {shippingCost}</span>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex justify-between">
                                    <span className="text-lg font-black text-white">Total</span>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-primary">Rs. {total.toFixed(0)}</div>
                                        <div className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Inclusive of Taxes</div>
                                    </div>
                                </div>
                            </div>

                            {step === 'cart' ? (
                                <button onClick={() => setStep('checkout')} className="w-full btn-primary !py-5 justify-center text-lg gap-3 shadow-glow mt-4">
                                    Proceed to Checkout <ArrowRight size={20} />
                                </button>
                            ) : (
                                <button onClick={handleCheckout} className="w-full btn-primary !py-5 justify-center text-lg gap-3 shadow-glow mt-4">
                                    Complete Order <Check size={20} />
                                </button>
                            )}

                            {/* Trust Badge */}
                            <div className="pt-6 text-center border-t border-white/5">
                                <div className="flex items-center justify-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-primary-light" /> Encrypted Transaction SSL
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
