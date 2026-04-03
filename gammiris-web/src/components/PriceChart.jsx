import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, MapPin, ChevronDown, RefreshCcw, Activity, Minus } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

/* ── Districts ──────────────────────────────────────────────── */
const DISTRICTS = [
    'National','Kandy','Matale','Kegalle','Ratnapura',
    'Badulla','Kurunegala','Galle','Matara'
];

/* ── Dummy fallback data ────────────────────────────────────── */
const makeDummy = () => {
    const base = { gr1: 920, gr2: 760, white: 1180 };
    return Array.from({ length: 12 }, (_, i) => {
        const noise = () => (Math.random() - 0.5) * 80;
        const d = new Date();
        d.setDate(d.getDate() - (11 - i) * 3);
        return {
            gr1:   Math.round(base.gr1   + noise()),
            gr2:   Math.round(base.gr2   + noise()),
            white: Math.round(base.white + noise()),
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
    });
};

/* ── Smooth SVG path helper ─────────────────────────────────── */
const smooth = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1], p1 = pts[i];
        const cpx = (p0.x + p1.x) / 2;
        d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
};

/* ── Stat pill ──────────────────────────────────────────────── */
const StatPill = ({ label, value, color, series, active, onClick }) => (
    <button onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
            borderRadius: 12, border: `1.5px solid ${active ? color + '50' : 'rgba(255,255,255,0.07)'}`,
            background: active ? color + '12' : 'rgba(255,255,255,0.03)',
            cursor: 'pointer', transition: 'all 0.2s', opacity: active ? 1 : 0.45,
        }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: active ? `0 0 10px ${color}` : 'none' }} />
        <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: active ? '#fff' : 'rgba(255,255,255,0.4)', lineHeight: 1 }}>Rs.{value}</div>
        </div>
    </button>
);

/* ══════════════════════════════════════════════════════════════ */
const PriceChart = () => {
    const [district, setDistrict]     = useState('National');
    const [history,  setHistory]      = useState([]);
    const [loading,  setLoading]      = useState(true);
    const [hover,    setHover]        = useState(null);
    const [menuOpen, setMenuOpen]     = useState(false);
    const [visible,  setVisible]      = useState({ gr1: true, gr2: true, white: true });
    const svgRef = useRef(null);

    /* ── Fetch data ─────────────────────────────────────────── */
    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, 'priceHistory'),
            where('district', '==', district),
            orderBy('timestamp', 'desc'),
            limit(12)
        );
        const unsub = onSnapshot(q, (snap) => {
            if (snap.empty) {
                setHistory(makeDummy());
            } else {
                const rows = snap.docs.map(d => {
                    const v = d.data();
                    const ts = v.timestamp?.toDate?.() ?? new Date();
                    return {
                        gr1:   Number(v.gr1Avg)   || Number(v.gr1High)   || 0,
                        gr2:   Number(v.gr2Avg)   || Number(v.gr2High)   || 0,
                        white: Number(v.whiteAvg) || Number(v.whiteHigh) || 0,
                        label: ts.toLocaleDateString('en-US', { month:'short', day:'numeric' }),
                    };
                }).reverse();
                setHistory(rows);
            }
            setLoading(false);
        }, () => { setHistory(makeDummy()); setLoading(false); });
        return () => unsub();
    }, [district]);

    /* ── Chart geometry ─────────────────────────────────────── */
    const W = 800, H = 280;
    const PAD = { top: 20, right: 24, bottom: 36, left: 56 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top  - PAD.bottom;

    const geo = useMemo(() => {
        if (!history.length) return null;
        const all = history.flatMap(d => [
            visible.gr1   ? d.gr1   : null,
            visible.gr2   ? d.gr2   : null,
            visible.white ? d.white : null,
        ]).filter(Boolean);
        if (!all.length) return null;

        const rawMin = Math.min(...all);
        const rawMax = Math.max(...all);
        const pad    = Math.max((rawMax - rawMin) * 0.18, 50);
        const yMin   = rawMin - pad;
        const yMax   = rawMax + pad;
        const yRange = yMax - yMin;

        const xOf = i  => PAD.left + (history.length > 1 ? (i / (history.length - 1)) * innerW : innerW / 2);
        const yOf = val => PAD.top  + innerH - ((val - yMin) / yRange) * innerH;

        const pts = (key) => history.map((d, i) => ({ x: xOf(i), y: yOf(d[key]) }));

        const areaPath = (key, color) => {
            const p = pts(key);
            if (!p.length) return '';
            const line = smooth(p);
            const bot  = PAD.top + innerH;
            return `${line} L ${p[p.length-1].x} ${bot} L ${p[0].x} ${bot} Z`;
        };

        // 4 y-axis tick values evenly spaced
        const ticks = [0,1,2,3].map(i => Math.round(yMin + (i / 3) * yRange));

        return { xOf, yOf, pts, areaPath, ticks, yMin, yMax };
    }, [history, visible]);

    const latest = history[history.length - 1] ?? { gr1: 0, gr2: 0, white: 0 };
    const prev   = history[history.length - 2] ?? latest;
    const diff   = latest.gr1 - prev.gr1;
    const pct    = prev.gr1 ? ((diff / prev.gr1) * 100).toFixed(1) : '0.0';
    const bull   = diff >= 0;

    /* ── SVG mouse handler ──────────────────────────────────── */
    const handleMouseMove = (e) => {
        if (!geo || !svgRef.current || !history.length) return;
        const rect = svgRef.current.getBoundingClientRect();
        const svgX  = ((e.clientX - rect.left) / rect.width) * W;
        const idx   = Math.round(((svgX - PAD.left) / innerW) * (history.length - 1));
        const clamped = Math.max(0, Math.min(history.length - 1, idx));
        setHover(clamped);
    };

    const SERIES = [
        { key: 'gr1',   label: 'Grade 1', color: '#3A7D44', gradId: 'g1' },
        { key: 'gr2',   label: 'Grade 2', color: '#52A85E', gradId: 'g2' },
        { key: 'white', label: 'White',   color: '#C8A84B', gradId: 'gw' },
    ];

    /* ═══════════════════════════════════════════════════════════ */
    return (
        <div style={{ fontFamily: 'Inter,system-ui,sans-serif', width: '100%' }}>

            {/* ── Card ──────────────────────────────────────── */}
            <div style={{
                borderRadius: 28, overflow: 'hidden',
                background: 'linear-gradient(145deg, rgba(16,30,18,0.9), rgba(10,20,12,0.95))',
                border: '1px solid rgba(58,125,68,0.18)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>

                {/* ── Header strip ────────────────────────────── */}
                <div style={{ padding: '24px 28px 0', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    {/* Title */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(58,125,68,0.2)', border: '1px solid rgba(58,125,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={15} color="#52A85E" />
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Market Analytics</h2>
                            {/* Trend badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: bull ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', border: `1px solid ${bull ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                                {bull ? <TrendingUp size={12} color="#10B981" /> : <TrendingDown size={12} color="#EF4444" />}
                                <span style={{ fontSize: 11, fontWeight: 800, color: bull ? '#10B981' : '#EF4444' }}>{bull ? '+':''}{pct}%</span>
                            </div>
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Live pepper price index — {district} district</p>
                    </div>

                    {/* District picker */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setMenuOpen(o => !o)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${menuOpen ? 'rgba(58,125,68,0.5)' : 'rgba(255,255,255,0.1)'}`, background: menuOpen ? 'rgba(58,125,68,0.08)' : 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                            <MapPin size={13} color="#52A85E" />
                            {district}
                            <ChevronDown size={13} color="rgba(255,255,255,0.4)" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
                                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 50, borderRadius: 14, overflow: 'hidden', background: 'rgba(10,20,12,0.98)', border: '1.5px solid rgba(58,125,68,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', minWidth: 160 }}>
                                    {DISTRICTS.map(d => (
                                        <button key={d} onClick={() => { setDistrict(d); setMenuOpen(false); }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', color: d === district ? '#52A85E' : 'rgba(255,255,255,0.55)', fontWeight: d === district ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            {d}
                                            {d === district && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#52A85E' }} />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Stat pills ──────────────────────────────── */}
                <div style={{ padding: '20px 28px 0', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {SERIES.map(s => (
                        <StatPill key={s.key}
                            label={s.label} value={latest[s.key] || '–'} color={s.color} series={s.key}
                            active={visible[s.key]}
                            onClick={() => setVisible(v => ({ ...v, [s.key]: !v[s.key] }))} />
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
                            {hover !== null ? history[hover]?.label : history[history.length - 1]?.label}
                        </span>
                    </div>
                </div>

                {/* ── SVG Chart ───────────────────────────────── */}
                <div style={{ padding: '16px 0 0', position: 'relative' }}>
                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(10,20,12,0.6)', backdropFilter: 'blur(4px)', borderRadius: 16 }}>
                            <RefreshCcw size={22} color="#52A85E" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    )}

                    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
                        onMouseMove={handleMouseMove} onMouseLeave={() => setHover(null)}>
                        <defs>
                            {SERIES.map(s => (
                                <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
                                    <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                                </linearGradient>
                            ))}
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>

                        {/* Grid lines + Y labels */}
                        {geo && geo.ticks.map((tick, i) => {
                            const y = geo.yOf(tick);
                            return (
                                <g key={i}>
                                    <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                                        stroke="rgba(255,255,255,0.055)" strokeDasharray="4 4" />
                                    <text x={PAD.left - 8} y={y + 4} textAnchor="end"
                                        style={{ fontSize: 10, fontWeight: 600, fill: 'rgba(255,255,255,0.25)', fontFamily: 'Inter,sans-serif' }}>
                                        {tick.toLocaleString()}
                                    </text>
                                </g>
                            );
                        })}

                        {/* X axis labels — every 2nd point */}
                        {geo && history.map((d, i) => {
                            if (i % Math.ceil(history.length / 6) !== 0 && i !== history.length - 1) return null;
                            return (
                                <text key={i} x={geo.xOf(i)} y={H - 6} textAnchor="middle"
                                    style={{ fontSize: 10, fontWeight: 600, fill: 'rgba(255,255,255,0.25)', fontFamily: 'Inter,sans-serif' }}>
                                    {d.label}
                                </text>
                            );
                        })}

                        {/* Area + Line per series */}
                        {geo && SERIES.map(s => {
                            if (!visible[s.key]) return null;
                            const pts = geo.pts(s.key);
                            return (
                                <g key={s.key}>
                                    <motion.path d={geo.areaPath(s.key)} fill={`url(#${s.gradId})`}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
                                    <motion.path d={smooth(pts)} fill="none" stroke={s.color} strokeWidth={s.key === 'gr1' ? 2.5 : 1.8}
                                        strokeLinecap="round" strokeLinejoin="round"
                                        filter={s.key === 'gr1' ? 'url(#glow)' : undefined}
                                        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 1.4, ease: 'easeInOut' }} />
                                </g>
                            );
                        })}

                        {/* Hover crosshair + dots + tooltip */}
                        {geo && hover !== null && (
                            <g>
                                {/* Vertical line */}
                                <line x1={geo.xOf(hover)} y1={PAD.top} x2={geo.xOf(hover)} y2={PAD.top + innerH}
                                    stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 3" />

                                {/* Dots per visible series */}
                                {SERIES.filter(s => visible[s.key]).map(s => (
                                    <g key={s.key}>
                                        <circle cx={geo.xOf(hover)} cy={geo.yOf(history[hover][s.key])} r={8} fill={s.color} opacity={0.15} />
                                        <circle cx={geo.xOf(hover)} cy={geo.yOf(history[hover][s.key])} r={4} fill={s.color} stroke="#fff" strokeWidth={1.5} />
                                    </g>
                                ))}

                                {/* Tooltip box */}
                                {(() => {
                                    const tx = geo.xOf(hover);
                                    const flip = tx > W * 0.65;
                                    const bx = flip ? tx - 148 : tx + 14;
                                    const by = PAD.top + 8;
                                    const row = history[hover];
                                    return (
                                        <g>
                                            <rect x={bx} y={by} width={136} height={SERIES.filter(s=>visible[s.key]).length * 22 + 34}
                                                rx={10} ry={10} fill="rgba(10,22,13,0.96)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                                            <text x={bx+10} y={by+16} style={{ fontSize:10, fontWeight:700, fill:'rgba(255,255,255,0.45)', fontFamily:'Inter,sans-serif', letterSpacing:'0.05em', textTransform:'uppercase' }}>{row.label}</text>
                                            {SERIES.filter(s=>visible[s.key]).map((s,i) => (
                                                <g key={s.key}>
                                                    <circle cx={bx+14} cy={by+30+(i*22)} r={4} fill={s.color} />
                                                    <text x={bx+24} y={by+34+(i*22)} style={{ fontSize:11, fontWeight:600, fill:'rgba(255,255,255,0.5)', fontFamily:'Inter,sans-serif' }}>{s.label}</text>
                                                    <text x={bx+126} y={by+34+(i*22)} textAnchor="end" style={{ fontSize:12, fontWeight:800, fill:'#fff', fontFamily:'Inter,sans-serif' }}>
                                                        {(row[s.key]||0).toLocaleString()}
                                                    </text>
                                                </g>
                                            ))}
                                        </g>
                                    );
                                })()}
                            </g>
                        )}
                    </svg>
                </div>

                {/* ── Bottom legend ────────────────────────────── */}
                <div style={{ padding: '12px 28px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    {SERIES.map(s => (
                        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 24, height: 2.5, borderRadius: 99, background: visible[s.key] ? s.color : 'rgba(255,255,255,0.1)' }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: visible[s.key] ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}>{s.label} Pepper</span>
                        </div>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Rs. / kg · Updated live
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PriceChart;
