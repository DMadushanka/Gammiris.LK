import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('gammiris-cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            return [];
        }
    });

    const [toast, setToast] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('gammiris-cart', JSON.stringify(cart));
    }, [cart]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        showToast(`${product.name} added to cart!`);
        openCart();
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return removeFromCart(productId);
        setCart(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, toast, isCartOpen, openCart, closeCart, toggleCart }}>
            {children}
            
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
                        style={{ background: 'rgba(8,15,10,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(58,125,68,0.3)' }}
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-light">
                            <ShoppingBag size={16} />
                        </div>
                        <span className="text-sm font-bold text-white">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Sidebar Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeCart}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-bg z-[200] shadow-2xl flex flex-col border-l border-white/5"
                            style={{ background: '#080F0A' }}
                        >
                            <div className="p-6 flex items-center justify-between border-b border-white/5">
                                <h2 className="text-xl font-black text-white">Your Basket ({cartCount})</h2>
                                <button onClick={closeCart} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <ShoppingBag size={48} className="mb-4" />
                                        <p className="text-sm font-medium">Your basket is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                                                <p className="text-xs text-white/40 mt-1">Rs.{item.price.toFixed(0)} × {item.quantity}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-3 bg-black/40 rounded-lg px-2 py-1">
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-white/40 hover:text-white">-</button>
                                                        <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-white/40 hover:text-white">+</button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-[10px] uppercase font-bold text-red-400/80 hover:text-red-400 transition-colors">Remove</button>
                                                </div>
                                            </div>
                                            <div className="text-sm font-black text-white">
                                                Rs.{(item.price * item.quantity).toFixed(0)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-6 border-t border-white/5 bg-white/[0.02] space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-sm text-white/40 font-bold uppercase tracking-widest">Subtotal</span>
                                        <span className="text-2xl font-black text-white">Rs.{cartTotal.toFixed(0)}</span>
                                    </div>
                                    <div className="grid gap-3">
                                        <Link 
                                            to="/cart" 
                                            onClick={closeCart}
                                            className="btn-primary w-full justify-center !py-4 font-bold"
                                        >
                                            View Full Cart
                                        </Link>
                                        <button className="btn-ghost w-full justify-center text-xs opacity-60 hover:opacity-100" onClick={closeCart}>
                                            Continue Shopping
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
