import React, { useState } from 'react';
import { 
    User, Mail, Phone, MapPin, Warehouse, 
    Upload, CheckCircle, ArrowRight, ShieldCheck, 
    Camera, Info, Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SellerRegistration = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        nurseryName: '',
        district: '',
        address: '',
        permitNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 2000);
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-12 max-w-xl text-center flex flex-col items-center gap-8"
                >
                    <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light">
                        <CheckCircle size={48} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white mb-4">Application Received!</h2>
                        <p className="text-white/60 mb-8 max-w-sm mx-auto leading-relaxed">
                            Thank you for applying to become a verified seller. Our team will review your application and contact you within 2-3 business days.
                        </p>
                        <div className="flex flex-col gap-4">
                            <Link to="/" className="btn-primary w-full justify-center">Return to Home</Link>
                            <Link to="/nursery" className="btn-ghost">Explore the Marketplace</Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 bg-primary pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 bg-accent pointer-events-none" />

            <div className="container relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-5 gap-12 items-start">
                        {/* Sidebar Info */}
                        <div className="lg:col-span-2 space-y-10">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="badge badge-accent mb-6 inline-flex uppercase">Seller Program</div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                                    Join the <span className="gradient-text">Elite Seller</span> Network
                                </h1>
                                <p className="text-white/50 text-lg leading-relaxed">
                                    Gammiris.LK is more than just a store — it's a movement. We empower nurseries and farmers to reach buyers across the nation.
                                </p>
                            </motion.div>

                            <div className="space-y-6">
                                {[
                                    { icon: ShieldCheck, title: "Verified Trust", text: "Gain buyer confidence with our official verification badge." },
                                    { icon: Info, title: "No Commision", text: "Keep 100% of your listed plant price. We take zero cut." },
                                    { icon: Lock, title: "Secure Payments", text: "Payments are processed directly and securely to your account." }
                                ].map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/5"
                                    >
                                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary-light">
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-white/40">{item.text}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Registration Form */}
                        <div className="lg:col-span-3">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="glass-card p-8 md:p-12"
                            >
                                {/* Steps Indicator */}
                                <div className="flex items-center justify-between mb-12">
                                    {[1, 2, 3].map((s) => (
                                        <div key={s} className="flex items-center gap-3">
                                            <div 
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500`}
                                                style={{ 
                                                    background: step >= s ? 'linear-gradient(135deg, #3A7D44, #1E5C28)' : '#1A231D',
                                                    color: step >= s ? 'white' : '#475569',
                                                    border: step >= s ? '1px solid rgba(58,125,68,0.3)' : '1px solid #1e293b'
                                                }}
                                            >
                                                {s}
                                            </div>
                                            <span className={`text-xs uppercase font-bold tracking-widest hidden sm:block ${step >= s ? 'text-white' : 'text-white/20'}`}>
                                                {s === 1 ? 'Personal' : s === 2 ? 'Nursery' : 'Verification'}
                                            </span>
                                            {s < 3 && <div className="w-10 h-px bg-white/10 mx-2 hidden sm:block" />}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {step === 1 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                            <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
                                            <div className="grid gap-5">
                                                <div className="relative">
                                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                                    <input required type="text" name="fullName" placeholder="Full Legal Name" className="input-field !pl-12" value={formData.fullName} onChange={handleChange} />
                                                </div>
                                                <div className="relative">
                                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                                    <input required type="email" name="email" placeholder="Email Address" className="input-field !pl-12" value={formData.email} onChange={handleChange} />
                                                </div>
                                                <div className="relative">
                                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                                    <input required type="tel" name="phone" placeholder="Mobile Number" className="input-field !pl-12" value={formData.phone} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <button type="button" onClick={nextStep} className="btn-primary w-full justify-center mt-4">
                                                Next Step <ArrowRight size={18} />
                                            </button>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                            <h3 className="text-xl font-bold text-white mb-6">Nursery Details</h3>
                                            <div className="grid gap-5">
                                                <div className="relative">
                                                    <Warehouse size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                                    <input required type="text" name="nurseryName" placeholder="Business / Nursery Name" className="input-field !pl-12" value={formData.nurseryName} onChange={handleChange} />
                                                </div>
                                                <div className="relative">
                                                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                                    <input required type="text" name="district" placeholder="District" className="input-field !pl-12" value={formData.district} onChange={handleChange} />
                                                </div>
                                                <textarea name="address" placeholder="Complete physical address of the nursery" className="input-field !h-32 !py-4" value={formData.address} onChange={handleChange} />
                                            </div>
                                            <div className="flex gap-4 mt-4">
                                                <button type="button" onClick={prevStep} className="btn-ghost flex-1 justify-center">Back</button>
                                                <button type="button" onClick={nextStep} className="btn-primary flex-1 justify-center">Next Step <ArrowRight size={18} /></button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                            <h3 className="text-xl font-bold text-white mb-6">Verification Documents</h3>
                                            <p className="text-sm text-white/40 mb-6">Please upload proof of business or agricultural permit if available.</p>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="border-2 border-dashed border-white/10 rounded-[20px] p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/40 transition-colors cursor-pointer group bg-black/20">
                                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                                        <Upload size={24} />
                                                    </div>
                                                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Upload NIC Front</span>
                                                </div>
                                                <div className="border-2 border-dashed border-white/10 rounded-[20px] p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/40 transition-colors cursor-pointer group bg-black/20">
                                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                                        <Camera size={24} />
                                                    </div>
                                                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Upload NIC Back</span>
                                                </div>
                                            </div>

                                            <div className="relative mt-2">
                                                <Info size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                                <input type="text" name="permitNumber" placeholder="Permit Number (Optional)" className="input-field !pl-12" value={formData.permitNumber} onChange={handleChange} />
                                            </div>

                                            <div className="flex gap-4 mt-8">
                                                <button type="button" onClick={prevStep} className="btn-ghost flex-1 justify-center">Back</button>
                                                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center relative overflow-hidden group">
                                                    {loading ? (
                                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                                    ) : (
                                                        <>Submit Application <ArrowRight size={18} /></>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerRegistration;
