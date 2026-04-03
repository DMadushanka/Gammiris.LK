import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
    Dimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../../services/firebase';
import {
    doc, setDoc, addDoc, collection, serverTimestamp,
    query, orderBy, limit, onSnapshot, where, updateDoc
} from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/theme';
import {
    Layers, DollarSign, Target, Users,
    TrendingUp, UploadCloud, ChevronRight,
    Bell, CheckCircle, Clock, Zap, Leaf, Shield
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const COLLECTION_TARGET = 20000;

const AdminDashboard = ({ navigation }) => {
    const { t } = useTranslation();
    const [htmlInput, setHtmlInput] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);

    // Real-time Data States
    const [stats, setStats] = useState([
        { label: t('totalVolume'), value: '0 kg', change: '+0%', up: true, icon: Layers, color: COLORS.primary, bg: '#F0FDF4' },
        { label: t('platformProfit'), value: 'LKR 0', change: '+0%', up: true, icon: DollarSign, color: '#3B82F6', bg: '#EFF6FF' },
        { label: t('pendingReq'), value: '0', change: '0', up: true, icon: Target, color: '#F59E0B', bg: '#FFFBEB' },
        { label: t('activeAgents'), value: '0', change: '0', up: true, icon: Users, color: '#8B5CF6', bg: '#F5F3FF' },
    ]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [districtVolumes, setDistrictVolumes] = useState([]);
    const [collectionActual, setCollectionActual] = useState(0);
    const [sellerRequests, setSellerRequests] = useState([]);
    const [marketplaceStats, setMarketplaceStats] = useState({
        commission: 0,
        tradeValue: 0,
        orderCount: 0
    });

    useEffect(() => {
        // 1. Listen for Active Agents
        const agentsQuery = query(collection(db, 'users'), where('role', '==', 'agent'));
        const unsubAgents = onSnapshot(agentsQuery, (snapshot) => {
            setStats(prev => {
                const newStats = [...prev];
                newStats[3].value = snapshot.size.toString();
                return newStats;
            });
        });

        // 2. Listen for Sale Requests (Total Volume, Pending, District Aggregation)
        const requestsQuery = query(collection(db, 'saleRequests'), orderBy('timestamp', 'desc'));
        const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
            let totalVolume = 0;
            let pendingCount = 0;
            const districtMap = {};
            const activities = [];

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const qty = Number(data.quantity) || 0;

                // Stats
                totalVolume += qty;
                if (data.status === 'pending') pendingCount++;

                // District Aggregation
                if (data.district) {
                    districtMap[data.district] = (districtMap[data.district] || 0) + qty;
                }
            });

            // Activity (Top 2 from requests)
            snapshot.docs.slice(0, 2).forEach(doc => {
                const data = doc.data();
                activities.push({
                    id: doc.id,
                    title: `New sale request — ${data.district || 'Unknown'}`,
                    time: data.timestamp ? formatTime(data.timestamp) : 'Just now',
                    type: 'pending'
                });
            });

            setCollectionActual(totalVolume);

            // Update Stats
            setStats(prev => {
                const newStats = [...prev];
                newStats[0].value = `${totalVolume.toLocaleString()} kg`;
                newStats[2].value = pendingCount.toString();
                return newStats;
            });

            // Update District Volumes
            const sortedDistricts = Object.entries(districtMap)
                .map(([name, kg]) => ({ name, kg, pct: kg / totalVolume || 0 }))
                .sort((a, b) => b.kg - a.kg)
                .slice(0, 5);
            setDistrictVolumes(sortedDistricts);

            setRecentActivities(prev => {
                // Merge with price updates
                const filteredOther = prev.filter(a => a.type === 'success' || a.type === 'info');
                return [...activities, ...filteredOther].slice(0, 4);
            });
        });

        // 3. Listen for Price Updates (Recent Activity)
        const pricesQuery = query(collection(db, 'priceHistory'), orderBy('timestamp', 'desc'), limit(2));
        const unsubPrices = onSnapshot(pricesQuery, (snapshot) => {
            const priceActivities = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: `${data.district} prices updated`,
                    time: data.timestamp ? formatTime(data.timestamp) : 'Just now',
                    type: 'success'
                };
            });

            setRecentActivities(prev => {
                const filteredOther = prev.filter(a => a.type === 'pending' || a.type === 'info');
                return [...priceActivities, ...filteredOther].slice(0, 4);
            });
        });

        // 4. Listen for Seller Requests
        const sellerRequestsQuery = query(collection(db, 'SellerRequests'), where('status', '==', 'pending'));
        const unsubSellers = onSnapshot(sellerRequestsQuery, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSellerRequests(requests);
        });

        // 5. Listen for Marketplace Stats (Commission & Trade Value)
        const revenueQuery = query(collection(db, 'EscrowOrders'));
        const unsubRevenue = onSnapshot(revenueQuery, (snapshot) => {
            let totalCommission = 0;
            let totalTradeValue = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                totalCommission += (data.fee || 0);
                totalTradeValue += (data.amount || 0);
            });
            setMarketplaceStats({
                commission: totalCommission,
                tradeValue: totalTradeValue,
                orderCount: snapshot.size
            });

            // Update stats card for profit
            setStats(prev => {
                const newStats = [...prev];
                newStats[1].value = `LKR ${totalCommission.toLocaleString()}`;
                return newStats;
            });
        });

        return () => {
            unsubAgents();
            unsubRequests();
            unsubPrices();
            unsubSellers();
            unsubRevenue();
        };
    }, []);

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = ts?.toDate ? ts.toDate() : new Date(ts);
        const diff = (new Date() - date) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
        return date.toLocaleDateString();
    };

    const handleSellerAction = async (requestId, userId, status) => {
        try {
            await updateDoc(doc(db, 'SellerRequests', requestId), { status });
            await updateDoc(doc(db, 'users', userId), {
                sellerStatus: status,
                isPlantSeller: status === 'verified'
            });
            Alert.alert('Success', `Seller application ${status}.`);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to process application.');
        }
    };

    const parsePriceTable = (html) => {
        try {
            const rows = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
            if (!rows) return null;
            const clean = (val) => {
                if (!val) return 0;
                const text = val.replace(/<[^>]*>/g, '').replace(/,/g, '').trim();
                if (text === '-') return 0;
                const m = text.match(/[\d.]+/);
                return m ? parseFloat(m[0]) : 0;
            };
            const results = [];
            rows.forEach(row => {
                const cells = row.match(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi);
                if (cells && cells.length >= 7) {
                    const district = cells[0].replace(/<[^>]*>/g, '').trim();
                    if (!district || district.toLowerCase().includes('district')) return;
                    results.push({
                        district,
                        gr1High: clean(cells[1]), gr1Avg: clean(cells[2]),
                        gr2High: clean(cells[3]), gr2Avg: clean(cells[4]),
                        whiteHigh: clean(cells[5]), whiteAvg: clean(cells[6]),
                        updatedAt: new Date().toISOString(),
                    });
                }
            });
            return results;
        } catch (e) {
            console.error('Parse error:', e);
            return null;
        }
    };

    const handleUpdatePrices = async () => {
        if (!htmlInput.trim()) {
            Alert.alert('Empty Input', 'Please paste the pepper price HTML table.');
            return;
        }
        setIsUpdating(true);
        const parsed = parsePriceTable(htmlInput);
        if (!parsed || parsed.length === 0) {
            Alert.alert('Parse Error', 'Could not read the table. Check the HTML format.');
            setIsUpdating(false);
            return;
        }
        try {
            for (const item of parsed) {
                await setDoc(doc(db, 'marketPrices', item.district), item);
                await addDoc(collection(db, 'priceHistory'), { ...item, timestamp: serverTimestamp() });
            }
            Alert.alert('✅ Success', `Updated prices for ${parsed.length} districts.`);
            setHtmlInput('');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to save prices. Check your connection.');
        } finally {
            setIsUpdating(false);
        }
    };

    const activityColor = (type) => ({
        success: { bg: '#F0FDF4', icon: '#10B981', dot: '#10B981' },
        pending: { bg: '#FFFBEB', icon: '#F59E0B', dot: '#F59E0B' },
        info: { bg: '#EFF6FF', icon: '#3B82F6', dot: '#3B82F6' },
    }[type]);

    const activityIcon = (type) => {
        if (type === 'success') return <CheckCircle size={16} color="#10B981" />;
        if (type === 'pending') return <Clock size={16} color="#F59E0B" />;
        return <Zap size={16} color="#3B82F6" />;
    };

    const targetPct = collectionActual / COLLECTION_TARGET;

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* ── HEADER ── */}
                <LinearGradient
                    colors={[COLORS.primary, '#1B4316', '#0F2A0C']}
                    style={styles.header}
                >
                    <View style={styles.hCircle1} />
                    <View style={styles.hCircle2} />

                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerInner}>
                            <View>
                                <Text style={styles.hGreeting}>Admin Panel</Text>
                                <Text style={styles.hTitle}>Market Control Center</Text>
                                <Text style={styles.hSub}>Gammiris.lk • {new Date().toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.notifBtn}
                                onPress={() => navigation.navigate('Notifications')}
                            >
                                <Bell size={20} color="#ffffff" />
                                <View style={styles.notifBadge} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>SYSTEM LIVE</Text>
                            <Text style={styles.liveRight}>Last sync: just now</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={styles.body}>

                    {/* ── STATS GRID ── */}
                    <Text style={styles.sectionLabel}>{t('overview')}</Text>
                    <View style={styles.statsGrid}>
                        {stats.map((s, i) => (
                            <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
                                <View style={[styles.statIconBg, { backgroundColor: s.color + '18' }]}>
                                    <s.icon size={20} color={s.color} />
                                </View>
                                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                                <Text style={styles.statLabel}>{s.label}</Text>
                                <View style={styles.statChangePill}>
                                    <TrendingUp size={10} color={s.up ? '#10B981' : '#EF4444'} />
                                    <Text style={[styles.statChange, { color: s.up ? '#10B981' : '#EF4444' }]}>
                                        {s.change}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* ── MARKETPLACE ADMINISTRATION ── */}
                    {sellerRequests.length > 0 && (
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>{t('pendingSellerApprovals', { count: sellerRequests.length })}</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('AdminSellers')}>
                                    <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '800' }}>{t('viewAll')}</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {sellerRequests.map(item => (
                                    <View key={item.id} style={styles.sellerReqCard}>
                                        <View style={styles.sellerReqInfo}>
                                            <Leaf size={20} color={COLORS.primary} />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={styles.sellerReqName}>{item.nurseryName}</Text>
                                                <Text style={styles.sellerReqSub}>{t('experienceYears', { years: item.experience })}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.sellerReqActions}>
                                            <TouchableOpacity
                                                style={[styles.sellerActionBtn, { backgroundColor: '#FEE2E2' }]}
                                                onPress={() => handleSellerAction(item.id, item.userId, 'rejected')}
                                            >
                                                <Text style={{ color: '#B91C1C', fontWeight: '800', fontSize: 12 }}>{t('reject')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.sellerActionBtn, { backgroundColor: '#DCFCE7' }]}
                                                onPress={() => handleSellerAction(item.id, item.userId, 'verified')}
                                            >
                                                <Text style={{ color: '#15803D', fontWeight: '800', fontSize: 12 }}>{t('verify')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    <Text style={styles.sectionLabel}>{t('marketplacePerformance')}</Text>
                    <View style={[styles.card, { backgroundColor: '#F8FAFC', borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0' }]}>
                        <View style={styles.marketStatRow}>
                            <View style={styles.marketStatItem}>
                                <Text style={styles.marketStatVal}>LKR {marketplaceStats.commission.toLocaleString()}</Text>
                                <Text style={styles.marketStatLbl}>{t('commissionEarned')}</Text>
                            </View>
                            <View style={styles.marketStatDivider} />
                            <View style={styles.marketStatItem}>
                                <Text style={styles.marketStatVal}>LKR {marketplaceStats.tradeValue.toLocaleString()}</Text>
                                <Text style={styles.marketStatLbl}>{t('totalTradeValue')}</Text>
                            </View>
                            <View style={styles.marketStatDivider} />
                            <View style={styles.marketStatItem}>
                                <Text style={styles.marketStatVal}>{marketplaceStats.orderCount}</Text>
                                <Text style={styles.marketStatLbl}>{t('totalOrders')}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── COLLECTION TARGET ── */}
                    <Text style={styles.sectionLabel}>{t('monthlyCollection')}</Text>
                    <View style={styles.targetCard}>
                        <View style={styles.targetHeader}>
                            <View>
                                <Text style={styles.targetTitle}>{t('targetProgress')}</Text>
                                <Text style={styles.targetSub}>{t('goalMonth', { target: COLLECTION_TARGET.toLocaleString() })}</Text>
                            </View>
                            <View style={styles.targetIcon}>
                                <Target size={24} color={COLORS.primary} />
                            </View>
                        </View>
                        <View style={styles.progressTrack}>
                            <LinearGradient
                                colors={[COLORS.primary, '#4ADE80']}
                                style={[styles.progressFill, { width: `${Math.min(targetPct * 100, 100)}%` }]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            />
                        </View>

                        <View style={styles.progressRow}>
                            <Text style={styles.progressLbl}>
                                <Text style={{ fontWeight: '800', color: COLORS.primary }}>
                                    {collectionActual.toLocaleString()} kg
                                </Text>
                                {'  collected'}
                            </Text>
                            <Text style={styles.progressLbl}>
                                {Math.max(COLLECTION_TARGET - collectionActual, 0).toLocaleString()} kg remaining
                            </Text>
                        </View>

                        <View style={{ marginTop: 16 }}>
                            {districtVolumes.length > 0 ? districtVolumes.map((d, i) => (
                                <View key={i} style={styles.districtRow}>
                                    <Text style={styles.districtName}>{d.name}</Text>
                                    <View style={styles.districtBarTrack}>
                                        <View style={[styles.districtBarFill, { width: `${d.pct * 100}%`, backgroundColor: COLORS.primary }]} />
                                    </View>
                                    <Text style={styles.districtKg}>{d.kg.toLocaleString()}</Text>
                                </View>
                            )) : (
                                <Text style={styles.cardSub}>{t('noDataCollectedYet')}</Text>
                            )}
                        </View>
                    </View>

                    {/* ── PRICE UPDATER ── */}
                    <Text style={styles.sectionLabel}>{t('priceUpdater')}</Text>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>{t('livePriceSync')}</Text>
                                <Text style={styles.cardSub}>{t('pasteHtmlTable')}</Text>
                            </View>
                            <View style={styles.syncBadge}>
                                <UploadCloud size={14} color={COLORS.primary} />
                                <Text style={styles.syncBadgeText}>HTML</Text>
                            </View>
                        </View>

                        <View style={[styles.htmlInputWrapper, inputFocused && styles.htmlInputFocused]}>
                            <TextInput
                                style={styles.htmlInput}
                                placeholder={'<table>\n  <tr><td>District</td>...</tr>\n  ...\n</table>'}
                                placeholderTextColor="#94A3B8"
                                multiline
                                value={htmlInput}
                                onChangeText={setHtmlInput}
                                textAlignVertical="top"
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.updateBtn, isUpdating && { opacity: 0.7 }]}
                            onPress={handleUpdatePrices}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Zap size={18} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.updateBtnText}>{t('updateMarketPrices')}</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sourceBtn}
                            onPress={() => Alert.alert('Info', t('getOfficialPrices'))}
                        >
                            <Text style={styles.sourceText}>{t('getOfficialPrices')}</Text>
                            <ChevronRight size={14} color={COLORS.primary} />
                        </TouchableOpacity>
                        <View style={styles.helperRow}>
                            {[{ label: t('clearsOldData'), icon: <CheckCircle size={11} color={COLORS.primary} /> },
                            { label: t('savesToHistory'), icon: <CheckCircle size={11} color={COLORS.primary} /> },
                            { label: t('autoNotifies'), icon: <CheckCircle size={11} color={COLORS.primary} /> }].map((h, i) => (
                                <View key={i} style={styles.helperChip}>
                                    {h.icon}
                                    <Text style={styles.helperText}>{h.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* ── RECENT ACTIVITY ── */}
                    <Text style={styles.sectionLabel}>Recent Activity</Text>
                    <View style={styles.card}>
                        {recentActivities.length > 0 ? recentActivities.map((item, i) => {
                            const c = activityColor(item.type);
                            return (
                                <View key={item.id}>
                                    <View style={styles.activityRow}>
                                        <View style={[styles.activityIconBg, { backgroundColor: c.bg }]}>
                                            {activityIcon(item.type)}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.activityTitle}>{item.title}</Text>
                                            <Text style={styles.activityTime}>{item.time}</Text>
                                        </View>
                                        <View style={[styles.activityDot, { backgroundColor: c.dot }]} />
                                    </View>
                                    {i < recentActivities.length - 1 && <View style={styles.sep} />}
                                </View>
                            );
                        }) : (
                            <Text style={styles.cardSub}>No recent activity</Text>
                        )}

                        <TouchableOpacity style={styles.viewAllBtn}>
                            <Text style={styles.viewAllText}>View All Activity</Text>
                            <ChevronRight size={15} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingBottom: 28,
        paddingHorizontal: 22,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    hCircle1: {
        position: 'absolute', width: 260, height: 260, borderRadius: 130,
        backgroundColor: 'rgba(255,255,255,0.05)', top: -90, right: -70,
    },
    hCircle2: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: -40,
    },
    headerInner: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', marginTop: 10, marginBottom: 18,
    },
    hGreeting: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
    hTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 4 },
    hSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3, fontWeight: '500' },
    notifBtn: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    notifBadge: {
        position: 'absolute', top: 8, right: 9,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: COLORS.primary,
    },
    liveBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14,
        alignSelf: 'flex-start',
    },
    liveDot: {
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: '#4ADE80', marginRight: 7,
    },
    liveText: { fontSize: 11, color: '#4ADE80', fontWeight: '800', letterSpacing: 0.5 },
    liveRight: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 'auto', fontWeight: '500' },

    body: { paddingHorizontal: 20, paddingTop: 24 },
    sectionLabel: {
        fontSize: 12, fontWeight: '800', color: '#64748B',
        textTransform: 'uppercase', letterSpacing: 0.8,
        marginBottom: 12, marginLeft: 2,
    },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statCard: {
        width: (width - 56) / 2,
        borderRadius: 20, padding: 18,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    statIconBg: {
        width: 44, height: 44, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    statValue: { fontSize: 18, fontWeight: '900', marginBottom: 3 },
    statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    statChangePill: {
        flexDirection: 'row', alignItems: 'center', marginTop: 8,
        gap: 3,
    },
    statChange: { fontSize: 11, fontWeight: '700' },

    sellerReqCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        width: width * 0.7,
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sellerReqInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerReqName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    sellerReqSub: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 2,
    },
    sellerReqActions: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10,
    },
    sellerActionBtn: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    marketStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    marketStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    marketStatVal: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.primary,
    },
    marketStatLbl: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '700',
        marginTop: 4,
    },
    marketStatDivider: {
        width: 1,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 15,
    },

    card: {
        backgroundColor: '#fff', borderRadius: 22, padding: 20,
        marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
    cardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    cardSub: { fontSize: 12, color: '#94A3B8', marginTop: 3, fontWeight: '500' },
    pctBadge: {
        fontSize: 22, fontWeight: '900', color: COLORS.primary,
    },

    progressTrack: {
        height: 10, backgroundColor: '#E2E8F0',
        borderRadius: 5, overflow: 'hidden', marginBottom: 10,
    },
    progressFill: { height: '100%', borderRadius: 5 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLbl: { fontSize: 12, color: '#64748B', fontWeight: '500' },

    districtRow: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 10, gap: 10,
    },
    districtName: { width: 72, fontSize: 12, fontWeight: '600', color: '#475569' },
    districtBarTrack: {
        flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden',
    },
    districtBarFill: { height: '100%', borderRadius: 3 },
    districtKg: { width: 44, fontSize: 11, color: '#94A3B8', fontWeight: '600', textAlign: 'right' },

    syncBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: '#F0FDF4', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 5,
        borderWidth: 1, borderColor: COLORS.primary + '40',
    },
    syncBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
    htmlInputWrapper: {
        borderWidth: 1.5, borderColor: '#E2E8F0',
        borderRadius: 16, backgroundColor: '#F8FAFC',
        marginBottom: 16, overflow: 'hidden',
    },
    htmlInputFocused: { borderColor: COLORS.primary, backgroundColor: '#F0FDF4' },
    htmlInput: {
        padding: 14, height: 130,
        fontSize: 13, color: '#1E293B', fontWeight: '500',
        fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    updateBtn: {
        borderRadius: 16, overflow: 'hidden', marginBottom: 14,
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
    },
    updateBtnGradient: {
        height: 52, flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center', gap: 10,
    },
    updateBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
    helperRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    helperChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F0FDF4', borderRadius: 8,
        paddingHorizontal: 9, paddingVertical: 5,
    },
    helperText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

    activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
    activityIconBg: {
        width: 38, height: 38, borderRadius: 11,
        justifyContent: 'center', alignItems: 'center',
    },
    activityTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 3 },
    activityTime: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
    activityDot: { width: 8, height: 8, borderRadius: 4 },
    sep: { height: 1, backgroundColor: '#F1F5F9' },
    viewAllBtn: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingTop: 14, gap: 4,
    },
    viewAllText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
});

export default AdminDashboard;
