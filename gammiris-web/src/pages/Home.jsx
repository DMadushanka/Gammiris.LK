import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ShoppingCart, ArrowRight, ShieldCheck, Truck, Sprout, Star, Award, Users, Leaf, ChevronRight, Zap } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import PriceChart from '../components/PriceChart';
import heroBg from '../assets/pepper_black.jpg';
import ctaBg  from '../assets/pepper_farm.jpg';

/* ── Reusable Fade-In Animation ─────────────────── */
const FadeIn = ({ children, delay = 0, direction = 'up', className = '' }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    const variants = {
        hidden: { opacity: 0, y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0, x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0 },
        visible: { opacity: 1, y: 0, x: 0 },
    };
    return (
        <motion.div ref={ref} variants={variants} initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
            className={className}>
            {children}
        </motion.div>
    );
};

/* ── Counter Stat ─────────────────────────────── */
const StatBox = ({ value, label, delay }) => (
    <FadeIn delay={delay} className="stat-item">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
    </FadeIn>
);

/* ── Feature Card ─────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, color, delay }) => (
    <FadeIn delay={delay}>
        <div className="glass-card p-8 h-full flex flex-col gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={26} style={{ color }} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7A8B7D' }}>{desc}</p>
            </div>
        </div>
    </FadeIn>
);

/* ── Product Card ─────────────────────────────── */
const ProductCard = ({ product, onAdd, delay }) => (
    <FadeIn delay={delay}>
        <div className="product-card group h-full flex flex-col relative">
            <Link to={`/product/${product.id}`} className="block flex-1 flex flex-col no-underline">
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: 240 }}>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,15,10,0.7) 0%, transparent 60%)' }} />
                    {/* Badges */}
                    <div className="absolute top-4 left-4">
                        <span className="badge badge-accent">{product.category}</span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                        style={{ background: 'rgba(8,15,10,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Star size={11} fill="#C8A84B" color="#C8A84B" />
                        <span>{product.rating}</span>
                    </div>
                </div>
                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-white text-base leading-tight mb-2 group-hover:text-green-400 transition-colors" style={{ '--tw-text-opacity': 1 }}>{product.name}</h3>
                    <p className="text-xs line-clamp-2 flex-1 mb-4" style={{ color: '#7A8B7D' }}>{product.description}</p>
                </div>
            </Link>

            {/* Shopping buttons (separate from Link to allow direct add-to-cart) */}
            <div className="p-5 pt-0">
                {/* Add to cart overlay btn (positioned absolute over the image but we keep it here in DOM for clarity if needed, though it works better inside the image container if it needs absolute positioning) */}
                <div className="relative">
                    <div className="absolute bottom-60 left-0 right-0 pointer-events-none">
                         <div className="relative container pointer-events-auto">
                            <motion.button
                                initial={{ opacity: 0, y: 12 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-48 left-4 right-4 btn-primary justify-center !rounded-xl z-20"
                                onClick={() => onAdd(product)}
                            >
                                <ShoppingCart size={16} /> Add to Cart
                            </motion.button>
                         </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                        <span className="text-xl font-bold text-white">Rs. {product.price.toFixed(0)}</span>
                        <span className="text-xs ml-1" style={{ color: '#7A8B7D' }}>/ kg</span>
                    </div>
                    <button
                        onClick={() => onAdd(product)}
                        className="btn-icon z-20 relative"
                        style={{ background: 'rgba(58,125,68,0.12)', borderColor: 'rgba(58,125,68,0.3)', color: '#52A85E' }}
                    >
                        <ShoppingCart size={16} />
                    </button>
                </div>
            </div>
        </div>
    </FadeIn>
);

/* ══════════════════════════════════════════════ */
const Home = () => {
    const { addToCart } = useCart();
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, 120]);
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const featured = products.slice(0, 3);

    return (
        <div className="w-full flex flex-col">

            {/* ── HERO ─────────────────────────────────── */}
            <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
                {/* Parallax BG Image */}
                <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
                    <img
                        src={heroBg}
                        alt="Black Pepper Farm"
                        className="w-full h-full object-cover"
                        style={{ filter: 'brightness(0.25) saturate(0.8)' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,15,10,0.95) 40%, rgba(8,15,10,0.4) 100%)' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,15,10,1) 0%, transparent 50%)' }} />
                </motion.div>

                {/* Floating orbs */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 float"
                        style={{ background: 'radial-gradient(circle, #3A7D44, transparent)', top: '10%', right: '10%' }} />
                    <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-15"
                        style={{ background: 'radial-gradient(circle, #C8A84B, transparent)', bottom: '20%', right: '25%', animationDelay: '3s' }} />
                </div>

                <motion.div style={{ opacity: heroOpacity }}
                    className="container relative z-10 pt-32 pb-24">
                    <div className="max-w-3xl">
                        <FadeIn delay={0}>
                            <div className="badge badge-accent mb-6 inline-flex">
                                <Leaf size={12} /> Premium Ceylon Spices & Nursery
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.1}>
                            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight text-white mb-6">
                                Sri Lanka’s Premier<br />
                                <span className="serif italic gradient-text-green">Digital Pepper</span><br />
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65em' }}>Marketplace</span>
                            </h1>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <p className="text-lg max-w-xl leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                Experience the world's finest Ceylon black pepper — grown by local farmers in the misty hills of Matale, Sri Lanka. Traceable, organic, and delivered to your door.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <div className="flex flex-wrap gap-4 mb-16">
                                <Link to="/shop" className="btn-primary px-10">
                                    Shop Now <ArrowRight size={18} />
                                </Link>
                                <Link to="/seller-registration" className="btn-ghost px-10">
                                    Sell My Harvest <Sprout size={18} />
                                </Link>
                            </div>
                        </FadeIn>

                        {/* Stats row */}
                        <FadeIn delay={0.45}>
                            <div className="flex flex-wrap gap-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                <StatBox value="2,400+" label="Farmers Supported" delay={0.5} />
                                <StatBox value="98%" label="Organic Certified" delay={0.55} />
                                <StatBox value="48hr" label="Express Delivery" delay={0.6} />
                                <StatBox value="4.9★" label="Customer Rating" delay={0.65} />
                            </div>
                        </FadeIn>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                    style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', letterSpacing: '0.1em' }}
                >
                    <span>SCROLL</span>
                    <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
                </motion.div>
            </section>

            {/* ── MARQUEE STRIP ─────────────────────────── */}
            <div className="overflow-hidden py-4" style={{ background: 'rgba(58,125,68,0.08)', borderTop: '1px solid rgba(58,125,68,0.15)', borderBottom: '1px solid rgba(58,125,68,0.15)' }}>
                <motion.div
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                    className="flex gap-12 whitespace-nowrap"
                    style={{ color: '#52A85E', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em' }}
                >
                    {Array(8).fill(['✦ PREMIUM BLACK PEPPER', '✦ ORGANIC CERTIFIED', '✦ FARMER DIRECT', '✦ FAST DELIVERY', '✦ MATALE HERITAGE', '✦ EXPORT QUALITY']).flat().map((t, i) => (
                        <span key={i}>{t}</span>
                    ))}
                </motion.div>
            </div>

            {/* ── WHY CHOOSE US ─────────────────────────── */}
            <section className="section">
                <div className="container">
                    <div className="text-center mb-16">
                        <FadeIn>
                            <div className="badge badge-primary mb-4 inline-flex">Why Gammiris.LK</div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                                Built for the <span className="gradient-text">Modern Farmer</span>
                            </h2>
                            <p className="max-w-xl mx-auto" style={{ color: '#7A8B7D' }}>
                                We bridge the gap between Matale's finest pepper farms and your kitchen — with transparency, quality, and speed.
                            </p>
                        </FadeIn>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard icon={ShieldCheck} color="#52A85E" delay={0.0}
                            title="100% Organic & Certified"
                            desc="Every batch is tested and certified by Sri Lanka's national standards. No chemicals, no fillers — just pure Ceylon pepper." />
                        <FeatureCard icon={Truck} color="#C8A84B" delay={0.1}
                            title="48-Hour Express Delivery"
                            desc="Island-wide delivery within 48 hours. Premium packaging ensures your spices arrive fresh and sealed." />
                        <FeatureCard icon={Users} color="#7B9FE0" delay={0.2}
                            title="Farmer-First Marketplace"
                            desc="90% of every sale goes directly to our Matale farming families. Buy good, feel good." />
                        <FeatureCard icon={Award} color="#E07B7B" delay={0.3}
                            title="Award-Winning Quality"
                            desc="Our black pepper has won regional quality awards for 3 consecutive years, recognized globally." />
                        <FeatureCard icon={Sprout} color="#52A85E" delay={0.4}
                            title="Premium Nursery Plants"
                            desc="Source high-yield pepper vine seedlings directly from expert nurseries to start your own cultivation." />
                        <Link to="/nursery" className="block">
                            <FeatureCard icon={Zap} color="#C8A84B" delay={0.5}
                                title="Peer-to-Peer Nursery"
                                desc="Join Sri Lanka's largest decentralized pepper network. Buy and sell vines with zero middleman commission." />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── PRICE ANALYTICS ─────────────────────── */}
            <section className="section py-32 relative overflow-hidden">
                <div className="container">
                    <FadeIn delay={0.2}>
                        <PriceChart />
                    </FadeIn>
                </div>
            </section>

            {/* ── FEATURED PRODUCTS ─────────────────────── */}
            <section className="section-sm" style={{ paddingBottom: 120 }}>
                <div className="container">
                    <div className="flex items-end justify-between mb-12">
                        <FadeIn>
                            <div className="badge badge-primary mb-3 inline-flex">Featured</div>
                            <h2 className="text-4xl font-black text-white">Top Selections</h2>
                        </FadeIn>
                        <FadeIn direction="left">
                            <Link to="/shop" className="btn-ghost !py-2.5 !px-5 !text-sm">
                                Browse All <ArrowRight size={16} />
                            </Link>
                        </FadeIn>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {featured.map((p, i) => (
                            <ProductCard key={p.id} product={p} onAdd={addToCart} delay={i * 0.12} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FULL-WIDTH CTA BANNER ─────────────────── */}
            <section className="relative overflow-hidden py-24 mx-6 rounded-3xl mb-24">
                <div className="absolute inset-0 z-0">
                    <img
                        src={ctaBg}
                        alt="Spice market"
                        className="w-full h-full object-cover"
                        style={{ filter: 'brightness(0.2) saturate(0.6)' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,15,10,0.95) 0%, rgba(58,125,68,0.15) 100%)' }} />
                </div>
                <div className="relative z-10 container text-center">
                    <FadeIn>
                        <div className="badge badge-accent inline-flex mb-6">Limited Supply</div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 max-w-2xl mx-auto leading-tight">
                            Fresh Harvest.<br />
                            <span className="serif italic gradient-text-green">Just Arrived.</span>
                        </h2>
                        <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            The 2024 premium Matale black pepper harvest is here. Order now before stocks sell out.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link to="/shop" className="btn-accent"><ShoppingCart size={18} /> Shop the Harvest</Link>
                            <Link to="/about" className="btn-ghost">Learn About Origin</Link>
                        </div>
                    </FadeIn>
                </div>
            </section>

        </div>
    );
};

export default Home;
