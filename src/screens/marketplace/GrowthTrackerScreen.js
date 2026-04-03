import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    QrCode,
    Droplets,
    Sprout,
    ShieldCheck,
    History,
    Calendar,
    ArrowRight
} from 'lucide-react-native';
import { db, auth } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { COLORS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const GrowthTrackerScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'EscrowOrders'),
            where('buyerId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orderData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(orderData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const OrderCard = ({ item }) => (
        <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Completed' ? '#DCFCE7' : '#EFF6FF' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Completed' ? '#166534' : '#1D4ED8' }]}>
                        {item.status}
                    </Text>
                </View>
                <Text style={styles.orderDate}>{item.timestamp?.toDate().toLocaleDateString() || 'Recent'}</Text>
            </View>

            <View style={styles.orderBody}>
                <View style={styles.plantIconBg}>
                    <Sprout size={24} color={COLORS.primary} />
                </View>
                <View style={styles.orderInfo}>
                    <Text style={styles.plantName}>{item.variety}</Text>
                    <Text style={styles.orderId}>ID: {item.qrCodeValue || 'PENDING'}</Text>
                </View>
                <Text style={styles.orderPrice}>LKR {item.amount}</Text>
            </View>

            {item.status === 'Paid' && (
                <TouchableOpacity style={styles.collectBtn}>
                    <QrCode size={18} color="#fff" />
                    <Text style={styles.collectBtnText}>Scan to Complete Collection</Text>
                </TouchableOpacity>
            )}

            {item.status === 'Completed' && (
                <View style={styles.maintenanceRow}>
                    <View style={styles.maintenanceItem}>
                        <Droplets size={16} color="#3B82F6" />
                        <Text style={styles.maintenanceText}>Next Water: Today</Text>
                    </View>
                    <View style={styles.maintenanceDivider} />
                    <View style={styles.maintenanceItem}>
                        <Calendar size={16} color="#F59E0B" />
                        <Text style={styles.maintenanceText}>Fertilizer: 4 Days</Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Plant Growth</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={['#1E293B', '#334155']}
                    style={styles.statsBanner}
                >
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{orders.filter(o => o.status === 'Completed').length}</Text>
                        <Text style={styles.statLbl}>Active Plants</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{orders.filter(o => o.status === 'Paid').length}</Text>
                        <Text style={styles.statLbl}>Pending Collection</Text>
                    </View>
                </LinearGradient>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Plant Digital IDs</Text>
                    <TouchableOpacity style={styles.historyBtn}>
                        <History size={16} color={COLORS.primary} />
                        <Text style={styles.historyText}>History</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={orders}
                        renderItem={OrderCard}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <ShieldCheck size={48} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>Secure Marketplace Transactions</Text>
                                <Text style={styles.emptySub}>
                                    Plants purchased via GammirisLK will appear here with unique Digital IDs and growth support tools.
                                </Text>
                                <TouchableOpacity
                                    style={styles.browseBtn}
                                    onPress={() => navigation.navigate('PlantMarketplace')}
                                >
                                    <Text style={styles.browseText}>Browse Marketplace</Text>
                                    <ArrowRight size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
    },
    scrollContent: {
        padding: 20,
    },
    statsBanner: {
        flexDirection: 'row',
        borderRadius: 24,
        padding: 24,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
    statLbl: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '700',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    historyText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },
    orderDate: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    orderBody: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    plantIconBg: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderInfo: {
        flex: 1,
        marginLeft: 15,
    },
    plantName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    orderId: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '800',
        marginTop: 2,
    },
    orderPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1E293B',
    },
    collectBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        gap: 8,
    },
    collectBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
    },
    maintenanceRow: {
        flexDirection: 'row',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    maintenanceItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    maintenanceText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    maintenanceDivider: {
        width: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySub: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 10,
        marginBottom: 30,
    },
    browseBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
        gap: 10,
    },
    browseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});

export default GrowthTrackerScreen;
