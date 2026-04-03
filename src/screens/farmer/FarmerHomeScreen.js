import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    Modal,
    FlatList,
} from 'react-native';
import { CartesianChart, Line, Area, useChartPressState, useChartTransformState } from 'victory-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { Circle, matchFont, LinearGradient as SkiaLinearGradient, vec, Text as SkiaText } from '@shopify/react-native-skia';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../../services/firebase';
import {
    collection, query, where, orderBy, limit,
    getDocs, addDoc, serverTimestamp, onSnapshot, getDoc, doc
} from 'firebase/firestore';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import {
    TrendingUp,
    PlusCircle,
    MapPin,
    List,
    Bell,
    Navigation,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    ChevronRight,
    Search,
    ShoppingBag,
    Clock,
    DollarSign,
    Layers,
    CheckCircle,
    X,
    Verified,
    Sprout,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FarmerHomeScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    // State
    const [quantity, setQuantity] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState('National');
    const [districts, setDistricts] = useState([
        'National', 'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
        'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
        'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Moneragala',
        'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
        'Trincomalee', 'Vavuniya'
    ]);
    const [registeredDistrict, setRegisteredDistrict] = useState('National');
    const [registeredPrice, setRegisteredPrice] = useState(850);
    const [isDistrictModalVisible, setIsDistrictModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [farmerStats, setFarmerStats] = useState({
        totalVolume: 0,
        pendingRequests: 0,
        estimatedEarnings: 0,
    });
    const [tooltipData, setTooltipData] = useState({ gr1: 0, gr2: 0, white: 0, label: '' });

    const [chartDataState, setChartDataState] = useState({
        data: [],
        latestGR1: 0,
        latestGR2: 0,
        latestWhite: 0,
        showGR1: false,
        showGR2: false,
        showWhite: false,
        marketSentiment: 'STABLE',
        domain: [800, 1200],
        ticks: [800, 900, 1000, 1100, 1200],
        xDomain: [0, 1],
        actualDataCount: 0,
        visibleSeries: { gr1: true, gr2: true, white: true }
    });

    const { state, isActive } = useChartPressState({ 
        x: 0, 
        y: { gr1: 0, gr2: 0, white: 0 } 
    });
    const transformState = useChartTransformState();

    // Skia Font
    const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
    const font = matchFont({ fontFamily, fontSize: 10, fontWeight: "bold" });

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // 1. Fetch User Profile to get their default district
        const fetchUserProfile = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.district) {
                        setRegisteredDistrict(userData.district);
                        setSelectedDistrict(userData.district);
                    }
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };
        fetchUserProfile();

        // 2. Fetch Available Districts from marketPrices
        const fetchDistricts = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'marketPrices'));
                const dbDistricts = snapshot.docs.map(doc => doc.id);
                const defaultDistricts = [
                    'National', 'Kandy', 'Matale', 'Kegalle', 'Ratnapura',
                    'Badulla', 'Kurunegala', 'Galle', 'Matara'
                ];
                // Merge database districts with defaults and remove duplicates
                const uniqueDistricts = Array.from(new Set([...defaultDistricts, ...dbDistricts]));
                setDistricts(uniqueDistricts);
            } catch (err) {
                console.error("Error fetching districts:", err);
            }
        };
        fetchDistricts();

        // 3. Listen for Farmer's own sale requests
        const qOwner = query(
            collection(db, 'saleRequests'),
            where('userId', '==', user.uid)
        );

        const unsubscribeStats = onSnapshot(qOwner, (snapshot) => {
            let totalVol = 0;
            let pending = 0;

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const qty = Number(data.quantity) || 0;
                totalVol += qty;
                if (data.status === 'pending') pending++;
            });

            setFarmerStats(prev => ({
                ...prev,
                totalVolume: totalVol,
                pendingRequests: pending,
            }));
        });

        return () => unsubscribeStats();
    }, []);

    useEffect(() => {
        fetchPriceHistory();
    }, [selectedDistrict]);

    // Fetch permanent district price for fixed earnings calculation
    useEffect(() => {
        const fetchRegisteredPrice = async () => {
            try {
                const q = query(
                    collection(db, 'priceHistory'),
                    where('district', '==', registeredDistrict),
                    orderBy('timestamp', 'desc'),
                    limit(1)
                );
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const latest = snap.docs[0].data();
                    const price = Number(latest.gr1Avg) || Number(latest.gr1High) || 850;
                    setRegisteredPrice(price);
                }
            } catch (err) {
                console.error("Error fetching registered price:", err);
            }
        };
        fetchRegisteredPrice();
    }, [registeredDistrict]);

    // Re-calculate earnings whenever totalVolume or price changes
    useEffect(() => {
        setFarmerStats(prev => ({
            ...prev,
            estimatedEarnings: prev.totalVolume * registeredPrice
        }));
    }, [farmerStats.totalVolume, registeredPrice]);

    const fetchPriceHistory = async () => {
        setIsLoading(true);
        try {
            const q = query(
                collection(db, 'priceHistory'),
                where('district', '==', selectedDistrict),
                orderBy('timestamp', 'desc'),
                limit(15)
            );

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                setChartDataState(prev => ({ ...prev, data: [] }));
                return;
            }

            const history = querySnapshot.docs.map(doc => doc.data()).reverse();
            const chartData = history.map((item, index) => ({
                x: index,
                gr1: Number(item.gr1Avg) || Number(item.gr1High) || 0,
                gr2: Number(item.gr2Avg) || Number(item.gr2High) || 0,
                white: Number(item.whiteAvg) || Number(item.whiteHigh) || 0,
                label: item.timestamp ? (item.timestamp.toDate ? `${item.timestamp.toDate().getDate()}/${item.timestamp.toDate().getMonth() + 1}` : "N/A") : "N/A",
            }));

            const latest = chartData[chartData.length - 1];
            const prev = chartData.length > 1 ? chartData[chartData.length - 2] : latest;
            const marketSentiment = latest.gr1 > prev.gr1 ? 'BULLISH' : latest.gr1 < prev.gr1 ? 'BEARISH' : 'STABLE';


            const allPrices = chartData.flatMap(d => [d.gr1, d.gr2, d.white]).filter(v => v > 0);

            // Handle cases with no data or zero prices
            if (allPrices.length === 0) {
                setChartDataState(prev => ({ ...prev, data: [] }));
                return;
            }

            const min = Math.min(...allPrices);
            const max = Math.max(...allPrices);
            const padding = (max - min) * 0.2 || 100;

            // If only one point exists, victory-native Line won't render. 
            // We duplicate it with a offset X to force a horizontal segment.
            const finalData = chartData.length === 1
                ? [chartData[0], { ...chartData[0], x: 1 }]
                : chartData;

            setChartDataState(prev => ({
                ...prev,
                data: finalData,
                latestGR1: latest.gr1,
                latestGR2: latest.gr2,
                latestWhite: latest.white,
                showGR1: chartData.some(d => d.gr1 > 0),
                showGR2: chartData.some(d => d.gr2 > 0),
                showWhite: chartData.some(d => d.white > 0),
                marketSentiment,
                domain: [min - padding, max + padding],
                ticks: [min, (min + max) / 2, max],
                xDomain: [0, Math.max(finalData.length - 1, 1)],
                actualDataCount: chartData.length
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitRequest = async () => {
        if (!quantity) {
            Alert.alert('Quantity Required', 'Please enter the amount of pepper you want to sell.');
            return;
        }

        setIsSubmitting(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need location access to schedule a pickup.');
                setIsSubmitting(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});

            await addDoc(collection(db, 'saleRequests'), {
                userId: auth.currentUser?.uid || 'anonymous',
                userName: auth.currentUser?.displayName || 'Farmer',
                quantity: parseFloat(quantity),
                district: selectedDistrict,
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                status: 'pending',
                timestamp: serverTimestamp()
            });

            Alert.alert(t('success'), t('shipmentRegistered'));
            setQuantity('');
        } catch (error) {
            Alert.alert(t('error'), t('submissionError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const dateTooltipStyle = useAnimatedStyle(() => {
        if (!isActive.value || !state?.x?.position) return { opacity: 0 };
        return {
            opacity: withSpring(1),
            transform: [
                { translateX: (state.x.position.value || 0) - 40 },
                { translateY: 0 }
            ]
        };
    });

    const gr1PillStyle = useAnimatedStyle(() => {
        if (!isActive.value || !state?.y?.gr1?.position || !chartDataState.visibleSeries.gr1) return { opacity: 0 };
        return {
            opacity: withSpring(1),
            transform: [
                { translateX: (state.x.position.value || 0) + 12 },
                { translateY: (state.y.gr1.position.value || 0) - 12 }
            ]
        };
    });

    const gr2PillStyle = useAnimatedStyle(() => {
        if (!isActive.value || !state?.y?.gr2?.position || !chartDataState.visibleSeries.gr2) return { opacity: 0 };
        return {
            opacity: withSpring(1),
            transform: [
                { translateX: (state.x.position.value || 0) + 12 },
                { translateY: (state.y.gr2.position.value || 0) - 12 }
            ]
        };
    });

    const whitePillStyle = useAnimatedStyle(() => {
        if (!isActive.value || !state?.y?.white?.position || !chartDataState.visibleSeries.white) return { opacity: 0 };
        return {
            opacity: withSpring(1),
            transform: [
                { translateX: (state.x.position.value || 0) + 12 },
                { translateY: (state.y.white.position.value || 0) - 12 }
            ]
        };
    });

    const toggleSeries = (series) => {
        setChartDataState(prev => ({
            ...prev,
            visibleSeries: {
                ...prev.visibleSeries,
                [series]: !prev.visibleSeries[series]
            }
        }));
    };

    useAnimatedReaction(
        () => ({
            active: isActive?.value ?? false,
            x: state?.x?.value?.value ?? 0,
            gr1: state?.y?.gr1?.value?.value ?? 0,
            gr2: state?.y?.gr2?.value?.value ?? 0,
            white: state?.y?.white?.value?.value ?? 0,
        }),
        (data) => {
            if (data.active) {
                const idx = Math.round(data.x);
                const label = chartDataState.data[idx]?.label || "";
                runOnJS(setTooltipData)({
                    gr1: Math.round(data.gr1),
                    gr2: Math.round(data.gr2),
                    white: Math.round(data.white),
                    label
                });
            }
        },
        [isActive, chartDataState.data]
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* --- PREMIUM HEADER --- */}
                <LinearGradient
                    colors={[COLORS.primary, '#1B4316', '#0F2A0C']}
                    style={styles.header}
                >
                    <View style={styles.hCircle1} />
                    <View style={styles.hCircle2} />

                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerInner}>
                            <View>
                                <Text style={styles.hGreet}>{t('ayubowan')},</Text>
                                <Text style={styles.hName}>{auth.currentUser?.displayName || t('farmer')}</Text>
                                <View style={styles.locationBadge}>
                                    <MapPin size={10} color="#4ADE80" />
                                    <Text style={styles.locationText}>{registeredDistrict} {t('member')}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.notifBtn}
                                onPress={() => navigation.navigate('Notifications')}
                            >
                                <Bell size={22} color="#fff" />
                                <View style={styles.notifDot} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                <View style={styles.body}>
                    {/* --- STATS GRID --- */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                            <View style={[styles.statIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <TrendingUp size={20} color="#10B981" />
                            </View>
                            <Text style={styles.statVal}>LKR {chartDataState.latestGR1}</Text>
                            <Text style={styles.statLbl}>{t('marketPrice')} (GR1)</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                            <View style={[styles.statIconBg, { backgroundColor: 'rgba(51, 153, 255, 0.1)' }]}>
                                <ShoppingBag size={20} color="#3399FF" />
                            </View>
                            <Text style={styles.statVal}>{farmerStats.totalVolume} kg</Text>
                            <Text style={styles.statLbl}>{t('totalSold')}</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: '#FFFBEB' }]}>
                            <View style={[styles.statIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                <Clock size={20} color="#F59E0B" />
                            </View>
                            <Text style={styles.statVal}>{farmerStats.pendingRequests}</Text>
                            <Text style={styles.statLbl}>{t('pendingPickups')}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.statCard, { backgroundColor: '#F5F3FF' }]}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.statIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                                <DollarSign size={20} color="#8B5CF6" />
                            </View>
                            <Text style={styles.statVal}>LKR {farmerStats.estimatedEarnings.toLocaleString()}</Text>
                            <Text style={styles.statLbl}>{t('totalEarnings')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>{t('priceForecast')}</Text>
                            <View style={[styles.sentimentPill, { backgroundColor: chartDataState.marketSentiment === 'BULLISH' ? '#DCFCE7' : '#FEE2E2', alignSelf: 'flex-start' }]}>
                                <Text style={[styles.sentimentText, { color: chartDataState.marketSentiment === 'BULLISH' ? '#166534' : '#991B1B' }]}>
                                    {chartDataState.marketSentiment}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.regionBadge}>
                            <MapPin size={10} color={COLORS.primary} />
                            <Text style={styles.regionText}>{selectedDistrict}</Text>
                        </View>
                    </View>

                    {/* New Robust District Selector (Horizontal Chips) */}
                    <View style={styles.chipContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipScrollContent}
                        >
                            {districts.map((d) => (
                                <TouchableOpacity
                                    key={d}
                                    style={[
                                        styles.chip,
                                        selectedDistrict === d && styles.activeChip
                                    ]}
                                    onPress={() => setSelectedDistrict(d)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        selectedDistrict === d && styles.activeChipText
                                    ]}>
                                        {d}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.chartCard}>
                        <View style={styles.chartInner}>
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.primary} style={{ height: 200 }} />
                            ) : chartDataState.data.length > 0 ? (
                                <CartesianChart
                                    data={chartDataState.data}
                                    xKey="x"
                                    yKeys={["gr1", "gr2", "white"]}
                                    padding={{ left: 40, right: 15, top: 30, bottom: 20 }}
                                    domainPadding={{ top: 50, bottom: 30 }}
                                    axisOptions={{
                                        font,
                                        labelOffset: 12,
                                        labelColor: "#64748B",
                                        lineColor: "rgba(226, 232, 240, 0.5)",
                                        formatYLabel: (v) => `Rs.${v}`,
                                        formatXLabel: (v) => {
                                            const idx = Math.round(v);
                                            return chartDataState.data[idx]?.label || "";
                                        }
                                    }}
                                    chartPressState={state}
                                >
                                    {({ points }) => {
                                        if (!points) return null;
                                        return (
                                            <>
                                                {/* Gr-1 Area & Line */}
                                                {chartDataState.showGR1 && chartDataState.visibleSeries.gr1 && points.gr1 && (
                                                    <>
                                                        <Area 
                                                            points={points.gr1} 
                                                            color="#10B981" 
                                                            opacity={0.15}
                                                            animate={{ type: "timing", duration: 500 }}
                                                        >
                                                            <SkiaLinearGradient
                                                                start={vec(0, 0)}
                                                                end={vec(0, 300)}
                                                                colors={["rgba(16, 185, 129, 0.4)", "rgba(16, 185, 129, 0)"]}
                                                            />
                                                        </Area>
                                                        <Line points={points.gr1} color="#10B981" strokeWidth={3} animate={{ type: "timing", duration: 500 }} curveType="monotoneX" />
                                                    </>
                                                )}

                                                {/* Gr-2 Area & Line */}
                                                {chartDataState.showGR2 && chartDataState.visibleSeries.gr2 && points.gr2 && (
                                                    <>
                                                        <Area 
                                                            points={points.gr2} 
                                                            color="#F59E0B" 
                                                            opacity={0.1}
                                                            animate={{ type: "timing", duration: 500 }}
                                                        >
                                                            <SkiaLinearGradient
                                                                start={vec(0, 0)}
                                                                end={vec(0, 300)}
                                                                colors={["rgba(245, 158, 11, 0.3)", "rgba(245, 158, 11, 0)"]}
                                                        />
                                                        </Area>
                                                        <Line points={points.gr2} color="#F59E0B" strokeWidth={2} animate={{ type: "timing", duration: 500 }} curveType="monotoneX" />
                                                    </>
                                                )}

                                                {/* White Area & Line */}
                                                {chartDataState.showWhite && chartDataState.visibleSeries.white && points.white && (
                                                    <>
                                                        <Area 
                                                            points={points.white} 
                                                            color="#3B82F6" 
                                                            opacity={0.1}
                                                            animate={{ type: "timing", duration: 500 }}
                                                        >
                                                            <SkiaLinearGradient
                                                                start={vec(0, 0)}
                                                                end={vec(0, 300)}
                                                                colors={["rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0)"]}
                                                            />
                                                        </Area>
                                                        <Line points={points.white} color="#3B82F6" strokeWidth={2} animate={{ type: "timing", duration: 500 }} curveType="monotoneX" />
                                                    </>
                                                )}

                                                {/* Vertical Indicator (Crosshair) */}
                                                {isActive.value && state?.x?.position && (
                                                    <>
                                                        <Line
                                                            points={[{ x: state?.x?.position?.value || 0, y: 0 }, { x: state?.x?.position?.value || 0, y: 300 }]}
                                                            color="rgba(148, 163, 184, 0.3)"
                                                            strokeWidth={2}
                                                        />
                                                        {chartDataState.showGR1 && chartDataState.visibleSeries?.gr1 && state?.y?.gr1?.position && (
                                                            <>
                                                                <Circle cx={state?.x?.position} cy={state?.y?.gr1?.position} r={6} color="#10B981" />
                                                                <Circle cx={state?.x?.position} cy={state?.y?.gr1?.position} r={10} color="rgba(16, 185, 129, 0.2)" />
                                                            </>
                                                        )}
                                                        {chartDataState.showGR2 && chartDataState.visibleSeries?.gr2 && state?.y?.gr2?.position && (
                                                            <>
                                                                <Circle cx={state?.x?.position} cy={state?.y?.gr2?.position} r={6} color="#F59E0B" />
                                                                <Circle cx={state?.x?.position} cy={state?.y?.gr2?.position} r={10} color="rgba(245, 158, 11, 0.2)" />
                                                            </>
                                                        )}
                                                        {chartDataState.showWhite && chartDataState.visibleSeries?.white && state?.y?.white?.position && (
                                                            <>
                                                                <Circle cx={state?.x?.position} cy={state?.y?.white?.position} r={6} color="#3B82F6" />
                                                                <Circle cx={state?.x?.position} cy={state?.y?.white?.position} r={10} color="rgba(59, 130, 246, 0.2)" />
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        );
                                    }}
                                </CartesianChart>
                            ) : (
                                <View style={styles.emptyChart}>
                                    <Text style={styles.emptyText}>
                                        {isLoading ? "Updating market data..." : "No market data available for this district"}
                                    </Text>
                                </View>
                            )}

                            {isActive.value && (
                                <>
                                    {/* Date Tooltip Header */}
                                    <Animated.View style={[styles.dateTooltip, dateTooltipStyle]}>
                                        <Text style={styles.dateTooltipText}>{tooltipData.label}</Text>
                                    </Animated.View>

                                    {/* Inline Price Pills */}
                                    {chartDataState.visibleSeries.gr1 && (
                                        <Animated.View style={[styles.pricePill, { backgroundColor: '#10B981' }, gr1PillStyle]}>
                                            <Text style={styles.pricePillText}>Rs.{tooltipData.gr1}</Text>
                                        </Animated.View>
                                    )}
                                    {chartDataState.visibleSeries.gr2 && (
                                        <Animated.View style={[styles.pricePill, { backgroundColor: '#F59E0B' }, gr2PillStyle]}>
                                            <Text style={styles.pricePillText}>Rs.{tooltipData.gr2}</Text>
                                        </Animated.View>
                                    )}
                                    {chartDataState.visibleSeries.white && (
                                        <Animated.View style={[styles.pricePill, { backgroundColor: '#3B82F6' }, whitePillStyle]}>
                                            <Text style={styles.pricePillText}>Rs.{tooltipData.white}</Text>
                                        </Animated.View>
                                    )}
                                </>
                            )}
                        </View>

                        <View style={styles.chartLegend}>
                            <TouchableOpacity 
                                style={[styles.legendItem, !chartDataState.visibleSeries.gr1 && { opacity: 0.4 }]}
                                onPress={() => toggleSeries('gr1')}
                            >
                                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.legendText}>Gr-1</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.legendItem, !chartDataState.visibleSeries.gr2 && { opacity: 0.4 }]}
                                onPress={() => toggleSeries('gr2')}
                            >
                                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                                <Text style={styles.legendText}>Gr-2</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.legendItem, !chartDataState.visibleSeries.white && { opacity: 0.4 }]}
                                onPress={() => toggleSeries('white')}
                            >
                                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                                <Text style={styles.legendText}>White</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.legendItem, { marginLeft: 'auto' }]}
                                onPress={() => {
                                    if (transformState?.zoom && transformState?.pan) {
                                        transformState.zoom.value = withSpring({ x: { side: "center", scale: 1 }, y: { side: "center", scale: 1 } });
                                        transformState.pan.value = withSpring({ x: 0, y: 0 });
                                    }
                                }}
                            >
                                <Activity size={12} color={COLORS.primary} />
                                <Text style={[styles.lastSync, { color: COLORS.primary, fontWeight: '800' }]}>{t('resetZoom')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* --- ACTION CARD --- */}
                    <Text style={styles.sectionTitle}>{t('saleRequest')}</Text>
                    <LinearGradient
                        colors={[COLORS.primary, '#1B4316']}
                        style={styles.actionCard}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.actionIcons}>
                            <View style={styles.actionIconCircle}><Layers size={24} color="#FFF" /></View>
                            <View style={styles.actionPlus}><PlusCircle size={20} color="#4ADE80" /></View>
                        </View>

                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>{t('registerShipment')}</Text>
                            <Text style={styles.actionSub}>{t('submitWeightDesc')}</Text>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.weightInput}
                                    placeholder={t('quantity')}
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    keyboardType="numeric"
                                    value={quantity}
                                    onChangeText={setQuantity}
                                />
                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={handleSubmitRequest}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color={COLORS.primary} size="small" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>{t('requestPickup')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.trustBadge}>
                                <CheckCircle size={10} color="#4ADE80" />
                                <Text style={styles.trustText}>{t('priceGuaranteed')}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* --- PLANT MARKETPLACE SHORTCUT --- */}
                    <Text style={styles.sectionTitle}>{t('buyPlants')}</Text>
                    <TouchableOpacity
                        style={styles.marketPromoCard}
                        onPress={() => navigation.navigate('Marketplace')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#1E293B', '#334155']}
                            style={styles.marketPromoGradient}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.marketPromoInfo}>
                                <View style={styles.marketBadge}>
                                    <Verified size={12} color="#4ADE80" />
                                    <Text style={styles.marketBadgeText}>{t('p2pMarketplace')}</Text>
                                </View>
                                <Text style={styles.marketPromoTitle}>{t('verifiedQuality')}</Text>
                                <Text style={styles.marketPromoSub}>{t('marketPromoDesc')}</Text>
                            </View>
                            <View style={styles.marketPromoIcon}>
                                <Sprout size={32} color="#4ADE80" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* --- RECENT SHIPMENTS --- */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('recentShipments')}</Text>
                        <TouchableOpacity onPress={() => Alert.alert(t('records'), t('recordsHistorySoon'))}>
                            <Text style={styles.viewAll}>{t('viewAll')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.historyCard}>
                        {farmerStats.pendingRequests > 0 ? (
                            <View style={styles.historyItem}>
                                <View style={[styles.historyIcon, { backgroundColor: '#FFFBEB' }]}><Clock size={18} color="#F59E0B" /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.historyTitle}>{t('collectionPending')}</Text>
                                    <Text style={styles.historyMeta}>{t('assignedToAgent')} • {selectedDistrict}</Text>
                                </View>
                                <Text style={styles.historyQty}>50 kg</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyHistory}>
                                <Text style={styles.emptyHistoryText}>{t('noPendingShipments')}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>



            {/* Floating Quick Action */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => Alert.alert(t('sellers'), t('connectingSupport'))}
            >
                <Search size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Header
    header: {
        paddingBottom: 40,
        paddingHorizontal: 22,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
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
        alignItems: 'center', marginTop: 15,
    },
    hGreet: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5 },
    hName: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2 },
    locationBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8, alignSelf: 'flex-start'
    },
    locationText: { color: '#4ADE80', fontSize: 10, fontWeight: '800', marginLeft: 4 },
    notifBtn: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    notifDot: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 2, borderColor: COLORS.primary },

    body: { paddingHorizontal: 20, marginTop: -25 },

    // Stats Grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statCard: {
        width: (width - 52) / 2,
        borderRadius: 24, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    statIconBg: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    statVal: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 2 },
    statLbl: { fontSize: 10, color: '#64748B', fontWeight: '700' },

    // Sections
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
    sentimentPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    sentimentText: { fontSize: 10, fontWeight: '900' },

    districtScroll: { marginBottom: 16 },
    districtChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#F1F5F9'
    },
    districtSelector: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
        borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000',
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, gap: 6,
    },
    selectedDistrictText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },

    regionBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1, borderColor: '#DCFCE7'
    },
    regionText: { fontSize: 11, fontWeight: '800', color: COLORS.primary, marginLeft: 4 },

    chipContainer: { marginBottom: 16 },
    chipScrollContent: { paddingHorizontal: 4, paddingBottom: 8 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
        backgroundColor: '#fff', marginRight: 10, borderWidth: 1.5,
        borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    activeChipText: { color: '#fff' },

    // Chart
    chartCard: {
        backgroundColor: '#fff', borderRadius: 28, padding: 16, marginBottom: 24,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3
    },
    chartInner: { height: 320, position: 'relative' },
    emptyChart: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
    dateTooltip: {
        position: 'absolute', top: 0, left: 0,
        backgroundColor: 'rgba(30, 41, 59, 0.9)', 
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5
    },
    dateTooltipText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    pricePill: {
        position: 'absolute', top: 0, left: 0,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
        minWidth: 50, alignItems: 'center'
    },
    pricePillText: { color: '#fff', fontSize: 11, fontWeight: '900' },
    chartLegend: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexWrap: 'wrap', gap: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
    lastSync: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginLeft: 4 },

    // Action Card
    actionCard: { borderRadius: 32, padding: 24, marginBottom: 24, overflow: 'hidden' },
    actionIcons: { flexDirection: 'row', marginBottom: 16 },
    actionIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    actionPlus: { position: 'absolute', bottom: -2, right: -4, backgroundColor: '#fff', borderRadius: 12, padding: 2 },
    actionTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
    actionSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', gap: 10, marginTop: 24 },
    weightInput: {
        flex: 1, height: 52, backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16, paddingHorizontal: 16, color: '#fff', fontWeight: '700'
    },
    submitBtn: {
        backgroundColor: '#fff', paddingHorizontal: 20,
        borderRadius: 16, justifyContent: 'center'
    },
    submitBtnText: { color: COLORS.primary, fontWeight: '900', fontSize: 14 },
    trustBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 4 },
    trustText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },

    // Market Promo
    marketPromoCard: { borderRadius: 32, marginBottom: 24, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    marketPromoGradient: { padding: 24, flexDirection: 'row', alignItems: 'center' },
    marketPromoInfo: { flex: 1 },
    marketBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74, 222, 128, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8, gap: 5 },
    marketBadgeText: { color: '#4ADE80', fontSize: 10, fontWeight: '900' },
    marketPromoTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
    marketPromoSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, lineHeight: 18, fontWeight: '500' },
    marketPromoIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 15 },

    // History
    historyCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 20 },
    historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
    historyIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    historyTitle: { fontSize: 14, fontWeight: '750', color: '#1E293B' },
    historyMeta: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    historyQty: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
    viewAll: { fontSize: 12, color: COLORS.primary, fontWeight: '800' },
    emptyHistory: { padding: 20, alignItems: 'center' },
    emptyHistoryText: { color: '#94A3B8', fontSize: 12, textAlign: 'center', lineHeight: 18 },

    fab: {
        position: 'absolute', bottom: 100, right: 20, width: 60, height: 60,
        borderRadius: 30, backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 8
    }
});

export default FarmerHomeScreen;
