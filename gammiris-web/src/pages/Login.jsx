import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, Eye, EyeOff, Leaf, ArrowRight, ArrowLeft,
    User, Phone, CreditCard, MapPin, Home as HomeIcon,
    Check, X, Sprout, Truck, Shield, ChevronDown, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/pepper_black.jpg';

/* ── Palette ────────────────────────────────────────────────── */
const C = {
    bg:         '#07110A',
    surface:    'rgba(255,255,255,0.04)',
    border:     'rgba(255,255,255,0.09)',
    borderFoc:  '#3A7D44',
    primary:    '#3A7D44',
    primaryLt:  '#52A85E',
    accent:     '#C8A84B',
    text:       '#E2E8F0',
    muted:      'rgba(255,255,255,0.38)',
    errorBg:    'rgba(239,68,68,0.08)',
    errorBdr:   'rgba(239,68,68,0.3)',
    errorTxt:   '#FCA5A5',
};

const DISTRICTS = [
    'National','Ampara','Anuradhapura','Badulla','Batticaloa','Colombo',
    'Galle','Gampaha','Hambantota','Jaffna','Kalutara','Kandy','Kegalle',
    'Kilinochchi','Kurunegala','Mannar','Matale','Matara','Moneragala',
    'Mullaitivu','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura',
    'Trincomalee','Vavuniya'
];
const ROLES = [
    { id:'farmer', label:'Farmer', sub:'Sell your harvest',    icon: Sprout, clr:'#10B981' },
    { id:'agent',  label:'Agent',  sub:'Manage collections',  icon: Truck,  clr:'#3B82F6' },
    { id:'admin',  label:'Admin',  sub:'Platform admin',      icon: Shield, clr:'#8B5CF6' },
];

/* ── Password strength ──────────────────────────────────────── */
const pwStrength = (pw) => {
    let s = 0;
    if (pw.length >= 6)          s++;
    if (pw.length >= 10)         s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const map = ['','Weak','Fair','Good','Strong','Very Strong'];
    const clrs = ['','#EF4444','#F59E0B','#10B981','#3A7D44','#2D6A35'];
    return { s, label: map[s]||'', color: clrs[s]||'' };
};

/* ── Input ──────────────────────────────────────────────────── */
const Field = ({ id, label, type='text', value, onChange, placeholder, Icon, error, right, autoComplete }) => {
    const [foc, setFoc] = useState(false);
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label htmlFor={id} style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#94A3B8' }}>
                {label}
            </label>
            <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: foc ? C.primaryLt : error ? '#EF4444' : '#475569', pointerEvents:'none' }}>
                    <Icon size={16} />
                </div>
                <input
                    id={id} type={type} value={value}
                    onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
                    onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
                    style={{
                        width:'100%', boxSizing:'border-box',
                        height:48, paddingLeft:42, paddingRight: right ? 42 : 14,
                        borderRadius:12, fontSize:14, fontWeight:500, color: C.text,
                        background: foc ? 'rgba(58,125,68,0.08)' : error ? 'rgba(239,68,68,0.05)' : C.surface,
                        border: `1.5px solid ${foc ? C.borderFoc : error ? 'rgba(239,68,68,0.5)' : C.border}`,
                        outline:'none', transition:'all 0.2s',
                    }}
                />
                {right && (
                    <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center' }}>
                        {right}
                    </div>
                )}
            </div>
            {error && (
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color: C.errorTxt }}>
                    <AlertCircle size={11} /> {error}
                </div>
            )}
        </div>
    );
};

/* ── Step bar ───────────────────────────────────────────────── */
const StepBar = ({ step, total }) => (
    <div style={{ display:'flex', gap:6, marginBottom:24 }}>
        {Array.from({length:total}).map((_,i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i < step ? `linear-gradient(90deg,${C.primary},${C.primaryLt})` : C.border, transition:'all 0.4s' }} />
        ))}
    </div>
);

/* ══════ PAGE ════════════════════════════════════════════════ */
export default function Login() {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode]     = useState('login');   // 'login' | 'register'
    const [step, setStep]     = useState(1);
    const [loading, setLoading] = useState(false);
    const [apiErr, setApiErr] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [distOpen, setDistOpen] = useState(false);
    const [distSearch, setDistSearch] = useState('');
    const [errors, setErrors] = useState({});

    /* form */
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone,    setPhone]    = useState('');
    const [address,  setAddress]  = useState('');
    const [nic,      setNic]      = useState('');
    const [district, setDistrict] = useState('National');
    const [role,     setRole]     = useState('farmer');

    const strength = pwStrength(password);

    const resetForm = (m) => {
        setMode(m); setStep(1); setErrors({}); setApiErr('');
        setEmail(''); setPassword(''); setFullName('');
        setPhone(''); setAddress(''); setNic('');
        setDistrict('National'); setRole('farmer'); setShowPw(false);
    };

    const validate1 = useCallback(() => {
        const e = {};
        if (!email)                              e.email    = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.';
        if (!password)                           e.password = 'Password is required.';
        else if (password.length < 6)            e.password = 'Minimum 6 characters.';
        return e;
    }, [email, password]);

    const validate2 = useCallback(() => {
        const e = {};
        if (!fullName.trim()) e.fullName = 'Full name is required.';
        if (!phone.trim())    e.phone    = 'Phone number is required.';
        if (!nic.trim())      e.nic      = 'NIC is required.';
        if (!address.trim())  e.address  = 'Address is required.';
        return e;
    }, [fullName, phone, nic, address]);

    const handleNext = () => {
        const e = validate1();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({}); setStep(2);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setApiErr('');
        let errs = {};
        if (mode === 'login') errs = validate1();
        else errs = validate2();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email.trim(), password);
            } else {
                await register(email.trim(), password, { fullName, phoneNumber: phone, address, idNumber: nic, district, role });
            }
            navigate('/');
        } catch (err) {
            const map = {
                'auth/user-not-found':     'No account with this email.',
                'auth/wrong-password':     'Incorrect password.',
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/email-already-in-use':'Email already registered.',
                'auth/weak-password':      'Password needs 6+ characters.',
                'auth/invalid-email':      'Invalid email address.',
                'auth/too-many-requests':  'Too many attempts. Try later.',
            };
            setApiErr(map[err.code] || err.message);
        } finally { setLoading(false); }
    };

    const filteredDist = DISTRICTS.filter(d => d.toLowerCase().includes(distSearch.toLowerCase()));

    /* ─── shared button style ─────────────────────────────── */
    const btnPrimary = {
        width:'100%', height:48, borderRadius:12, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
        background: loading ? 'rgba(58,125,68,0.35)' : `linear-gradient(135deg,${C.primary},#1E5C28)`,
        boxShadow: loading ? 'none' : '0 6px 24px rgba(58,125,68,0.3)',
        color:'#fff', fontWeight:700, fontSize:14,
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'all 0.2s',
    };

    /* ═══════════════════════════════════════════════════════ */
    return (
        <div style={{ minHeight:'100vh', display:'flex', background: C.bg, fontFamily:'Inter,system-ui,sans-serif' }}>

            {/* ── LEFT PANEL ──────────────────────────────── */}
            <div style={{ width:420, flexShrink:0, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px 40px', background:'#0A1A0D' }}
                className="hidden lg:flex">
                {/* bg image */}
                <div style={{ position:'absolute', inset:0 }}>
                    <img src={heroBg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.08) saturate(0.3)' }} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(7,17,10,0.98),rgba(20,55,28,0.5))' }} />
                </div>
                {/* glow blobs */}
                <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(58,125,68,0.15),transparent 70%)', top:'-5%', left:'-15%', filter:'blur(50px)', pointerEvents:'none' }} />
                <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,168,75,0.1),transparent 70%)', bottom:'0%', right:'-10%', filter:'blur(50px)', pointerEvents:'none' }} />

                {/* Logo */}
                <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#3A7D44,#1E5C28)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(58,125,68,0.4)' }}>
                        <Leaf size={20} color="#fff" />
                    </div>
                    <span style={{ fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>
                        Gammiris<span style={{ color:C.primaryLt }}>.LK</span>
                    </span>
                </div>

                {/* Main copy */}
                <div style={{ position:'relative', zIndex:2 }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(58,125,68,0.12)', border:'1px solid rgba(58,125,68,0.3)', borderRadius:99, padding:'6px 14px', marginBottom:24 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ADE80', animation:'pulse 2s infinite' }} />
                        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:C.primaryLt }}>Live Market Platform</span>
                    </div>
                    <h2 style={{ fontSize:38, fontWeight:900, color:'#fff', lineHeight:1.15, marginBottom:16, letterSpacing:'-0.02em' }}>
                        Sri Lanka's<br />
                        <span style={{ background:`linear-gradient(135deg,${C.primaryLt},${C.accent})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                            Pepper Exchange
                        </span>
                    </h2>
                    <p style={{ fontSize:14, lineHeight:1.7, color:'rgba(255,255,255,0.4)', marginBottom:40, maxWidth:300 }}>
                        Connect directly with farmers, track live market prices, and trade Ceylon's finest spices — all in one platform.
                    </p>

                    {/* Stats grid */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        {[['2,400+','Registered Farmers'],['Rs.850+','Avg GR1 Price / kg'],['48hr','Express Delivery'],['100%','Organic Certified']].map(([v,l]) => (
                            <div key={l} style={{ padding:'16px 18px', borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize:20, fontWeight:900, color:'#fff', marginBottom:2 }}>{v}</div>
                                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:500 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer note */}
                <p style={{ position:'relative', zIndex:2, fontSize:11, color:'rgba(255,255,255,0.2)' }}>
                    © 2025 Gammiris.LK · Empowering Sri Lankan Pepper Farmers
                </p>
            </div>

            {/* ── RIGHT PANEL ─────────────────────────────── */}
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px', overflowY:'auto', position:'relative' }}>
                {/* bg glow */}
                <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(58,125,68,0.05),transparent 70%)', top:'-15%', right:'-10%', filter:'blur(60px)', pointerEvents:'none' }} />

                <AnimatePresence mode="wait">
                    <motion.div key={`${mode}-${step}`}
                        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
                        transition={{ duration:0.32, ease:[0.4,0,0.2,1] }}
                        style={{ width:'100%', maxWidth:400, position:'relative', zIndex:2 }}>

                        {/* Mobile logo */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:40, justifyContent:'center' }} className="lg:hidden">
                            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#3A7D44,#1E5C28)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Leaf size={17} color="#fff" />
                            </div>
                            <span style={{ fontWeight:900, fontSize:18, color:'#fff' }}>Gammiris<span style={{ color:C.primaryLt }}>.LK</span></span>
                        </div>

                        {/* ── Mode tabs ──────────────────────────── */}
                        <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.07)', borderRadius:14, padding:4, marginBottom:28 }}>
                            {[['login','Sign In'],['register','Create Account']].map(([m,label]) => (
                                <button key={m} type="button" onClick={() => resetForm(m)}
                                    style={{ flex:1, position:'relative', padding:'10px 0', borderRadius:10, border:'none', cursor:'pointer', background:'transparent', color: mode===m ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight:700, fontSize:13, transition:'color 0.2s', zIndex:1 }}>
                                    {mode === m && (
                                        <motion.div layoutId="modeTab"
                                            style={{ position:'absolute', inset:0, borderRadius:10, background:'linear-gradient(135deg,#3A7D44,#1E5C28)', boxShadow:'0 4px 16px rgba(58,125,68,0.35)', zIndex:-1 }}
                                            transition={{ type:'spring', bounce:0.2, duration:0.45 }} />
                                    )}
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Step progress (register only) */}
                        {mode === 'register' && (
                            <div style={{ marginBottom:6 }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                                    <span style={{ fontSize:11, fontWeight:700, color: C.primaryLt, textTransform:'uppercase', letterSpacing:'0.08em' }}>Step {step} of 2</span>
                                    <span style={{ fontSize:11, color: C.muted }}>{step===1 ? 'Credentials' : 'Your details'}</span>
                                </div>
                                <StepBar step={step} total={2} />
                            </div>
                        )}

                        {/* Heading */}
                        <div style={{ marginBottom:24 }}>
                            <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', marginBottom:6, letterSpacing:'-0.02em' }}>
                                {mode==='login' ? 'Welcome back 👋' : step===1 ? 'Create account ✨' : 'Almost done 🎉'}
                            </h1>
                            <p style={{ fontSize:13, color: C.muted, lineHeight:1.5 }}>
                                {mode==='login' ? 'Sign in to access your Gammiris.LK account.' : step===1 ? 'Set up your login credentials to continue.' : 'Tell us a bit about yourself.'}
                            </p>
                        </div>

                        {/* API Error */}
                        <AnimatePresence>
                            {apiErr && (
                                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                                    style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:12, border:`1px solid ${C.errorBdr}`, background: C.errorBg, color: C.errorTxt, fontSize:13, marginBottom:20 }}>
                                    <AlertCircle size={15} style={{ flexShrink:0, marginTop:1 }} />
                                    {apiErr}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ══ LOGIN ════════════════════════════════ */}
                        {mode === 'login' && (
                            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }} noValidate>
                                <Field id="email" label="Email address" type="email" value={email}
                                    onChange={e => { setEmail(e.target.value); setErrors(p=>({...p,email:''})); }}
                                    placeholder="you@example.com" Icon={Mail} error={errors.email} autoComplete="email" />

                                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                    <Field id="password" label="Password" type={showPw ? 'text' : 'password'} value={password}
                                        onChange={e => { setPassword(e.target.value); setErrors(p=>({...p,password:''})); }}
                                        placeholder="Enter your password" Icon={Lock} error={errors.password} autoComplete="current-password"
                                        right={
                                            <button type="button" onClick={() => setShowPw(v=>!v)} style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex', padding:4 }}>
                                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        } />
                                    <div style={{ textAlign:'right' }}>
                                        <button type="button" style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, color: C.primaryLt }}>
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} style={btnPrimary}>
                                    {loading ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Signing in…</> : <>Sign In <ArrowRight size={16} /></>}
                                </button>
                            </form>
                        )}

                        {/* ══ REGISTER STEP 1 ══════════════════════ */}
                        {mode === 'register' && step === 1 && (
                            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                                <Field id="email" label="Email address" type="email" value={email}
                                    onChange={e => { setEmail(e.target.value); setErrors(p=>({...p,email:''})); }}
                                    placeholder="you@example.com" Icon={Mail} error={errors.email} autoComplete="email" />

                                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                    <Field id="password" label="Password" type={showPw ? 'text' : 'password'} value={password}
                                        onChange={e => { setPassword(e.target.value); setErrors(p=>({...p,password:''})); }}
                                        placeholder="Min. 6 characters" Icon={Lock} error={errors.password} autoComplete="new-password"
                                        right={
                                            <button type="button" onClick={() => setShowPw(v=>!v)} style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex', padding:4 }}>
                                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        } />
                                    {/* Strength bar */}
                                    {password.length > 0 && (
                                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ display:'flex', alignItems:'center', gap:5 }}>
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= strength.s ? strength.color : C.border, transition:'all 0.3s' }} />
                                            ))}
                                            <span style={{ fontSize:10, fontWeight:700, color: strength.color, minWidth:44, textAlign:'right' }}>{strength.label}</span>
                                        </motion.div>
                                    )}
                                </div>

                                <button type="button" onClick={handleNext} style={btnPrimary}>
                                    Continue <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* ══ REGISTER STEP 2 ══════════════════════ */}
                        {mode === 'register' && step === 2 && (
                            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }} noValidate>
                                <Field id="fullName" label="Full name" value={fullName}
                                    onChange={e => { setFullName(e.target.value); setErrors(p=>({...p,fullName:''})); }}
                                    placeholder="Kamal Perera" Icon={User} error={errors.fullName} autoComplete="name" />

                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                    <Field id="phone" label="Phone" type="tel" value={phone}
                                        onChange={e => { setPhone(e.target.value); setErrors(p=>({...p,phone:''})); }}
                                        placeholder="+94 7X XXX XXXX" Icon={Phone} error={errors.phone} autoComplete="tel" />
                                    <Field id="nic" label="NIC / ID" value={nic}
                                        onChange={e => { setNic(e.target.value); setErrors(p=>({...p,nic:''})); }}
                                        placeholder="000000000V" Icon={CreditCard} error={errors.nic} />
                                </div>

                                <Field id="address" label="Address" value={address}
                                    onChange={e => { setAddress(e.target.value); setErrors(p=>({...p,address:''})); }}
                                    placeholder="No. 12, Kandy Road, Matale" Icon={HomeIcon} error={errors.address} autoComplete="street-address" />

                                {/* District picker */}
                                <div style={{ position:'relative' }}>
                                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#94A3B8', marginBottom:6 }}>District</label>
                                    <button type="button" onClick={() => setDistOpen(o=>!o)}
                                        style={{ width:'100%', height:48, paddingLeft:42, paddingRight:14, borderRadius:12, border:`1.5px solid ${distOpen ? C.borderFoc : C.border}`, background: distOpen ? 'rgba(58,125,68,0.08)' : C.surface, color: C.text, fontSize:14, fontWeight:500, display:'flex', alignItems:'center', cursor:'pointer', position:'relative', textAlign:'left', transition:'all 0.2s' }}>
                                        <MapPin size={16} style={{ position:'absolute', left:14, color:'#475569' }} />
                                        <span style={{ flex:1 }}>{district}</span>
                                        <ChevronDown size={14} style={{ color:'#475569', transform: distOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }} />
                                    </button>
                                    <AnimatePresence>
                                        {distOpen && (
                                            <motion.div initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.18 }}
                                                style={{ position:'absolute', left:0, right:0, top:'calc(100% + 6px)', zIndex:100, borderRadius:14, overflow:'hidden', background:'rgba(8,18,10,0.98)', border:`1.5px solid rgba(58,125,68,0.3)`, backdropFilter:'blur(24px)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
                                                <div style={{ padding:'8px 8px 4px' }}>
                                                    <input value={distSearch} onChange={e => setDistSearch(e.target.value)}
                                                        placeholder="Search…"
                                                        style={{ width:'100%', boxSizing:'border-box', padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', color: C.text, fontSize:13, outline:'none' }} />
                                                </div>
                                                <div style={{ maxHeight:200, overflowY:'auto', padding:'4px 6px 8px' }}>
                                                    {filteredDist.map(d => (
                                                        <button key={d} type="button"
                                                            onClick={() => { setDistrict(d); setDistOpen(false); setDistSearch(''); }}
                                                            style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'none', background:'transparent', color: d===district ? C.primaryLt : 'rgba(255,255,255,0.55)', fontWeight: d===district ? 700 : 500, fontSize:13, textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'background 0.15s' }}
                                                            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                                                            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                                            {d}
                                                            {d === district && <Check size={13} color={C.primaryLt} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Role selector */}
                                <div>
                                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#94A3B8', marginBottom:8 }}>Your Role</label>
                                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                                        {ROLES.map(({ id, label, sub, icon: Icon, clr }) => {
                                            const active = role === id;
                                            return (
                                                <button key={id} type="button" onClick={() => setRole(id)}
                                                    style={{ padding:'14px 8px', borderRadius:14, border:`1.5px solid ${active ? clr+'60' : C.border}`, background: active ? clr+'14' : C.surface, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:8, transition:'all 0.2s', position:'relative', boxShadow: active ? `0 4px 20px ${clr}18` : 'none' }}>
                                                    {active && <div style={{ position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background: clr, display:'flex', alignItems:'center', justifyContent:'center' }}><Check size={9} color="#fff" /></div>}
                                                    <div style={{ width:36, height:36, borderRadius:10, background: active ? `${clr}22` : 'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                        <Icon size={17} color={active ? clr : '#64748B'} />
                                                    </div>
                                                    <div style={{ textAlign:'center' }}>
                                                        <div style={{ fontSize:12, fontWeight:700, color: active ? clr : 'rgba(255,255,255,0.5)' }}>{label}</div>
                                                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.22)', marginTop:2, lineHeight:1.3 }}>{sub}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display:'flex', gap:10, marginTop:4 }}>
                                    <button type="button" onClick={() => setStep(1)} style={{ height:48, padding:'0 18px', borderRadius:12, border:`1.5px solid ${C.border}`, background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.45)', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                                        <ArrowLeft size={15} /> Back
                                    </button>
                                    <button type="submit" disabled={loading} style={{ ...btnPrimary, flex:1, width:'auto' }}>
                                        {loading ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Creating…</> : <>Create Account <ArrowRight size={15} /></>}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Switch link */}
                        <p style={{ textAlign:'center', fontSize:13, color: C.muted, marginTop:24 }}>
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button type="button" onClick={() => resetForm(mode==='login' ? 'register' : 'login')}
                                style={{ background:'none', border:'none', cursor:'pointer', fontWeight:700, fontSize:13, color: C.primaryLt }}>
                                {mode === 'login' ? 'Sign up free' : 'Sign in'}
                            </button>
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Spinner keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
