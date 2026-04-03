import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../../services/firebase';
import {
    collection, query, where, onSnapshot,
    doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/theme';
import {
    Truck, CheckCircle, Clipboard, Scaling,
    Droplets, MapPin, ChevronRight, X,
    Calendar, User, Box, Bell
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const AgentHomeScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [moisture, setMoisture] = useState('');
    const [weight, setWeight] = useState('');
    const [grade, setGrade] = useState('Grade A');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, 'saleRequests'),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reqData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(reqData);
            setIsLoading(false);
        }, (error) => {
            console.error(error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleConfirmPickup = async () => {
        if (!moisture || !weight) {
            Alert.alert(t('error'), t('missingMoistureWeight'));
            return;
        }

        setIsSubmitting(true);
        try {
            const requestRef = doc(db, 'saleRequests', selectedRequest.id);
            await updateDoc(requestRef, {
                status: 'verified',
                verifiedWeight: parseFloat(weight),
                moistureContent: parseFloat(moisture),
                grade: grade,
                verifiedAt: serverTimestamp(),
                // In a real app, we'd add the agent's ID here too
            });

            Alert.alert(t('success'), t('pickupConfirmedReceipt'));
            setSelectedRequest(null);
            setMoisture('');
            setWeight('');
        } catch (error) {
            console.error(error);
            Alert.alert(t('error'), t('failedToConfirmPickup'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.requestCard}
            onPress={() => setSelectedRequest(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardTop}>
                <View style={styles.farmerIconBg}>
                    <User size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.farmerName}>{item.userName || 'Anonymous Farmer'}</Text>
                    <View style={styles.metaRow}>
                        <MapPin size={12} color="#94A3B8" />
                        <Text style={styles.metaText}>{item.district}</Text>
                        <View style={styles.dot} />
                        <Calendar size={12} color="#94A3B8" />
                        <Text style={styles.metaText}>Today</Text>
                    </View>
                </View>
                <ChevronRight size={20} color="#CBD5E1" />
            </View>

            <View style={styles.cardBottom}>
                <View style={styles.qtyBox}>
                    <Box size={14} color={COLORS.primary} />
                    <Text style={styles.qtyText}>{item.quantity} kg</Text>
                </View>
                <View style={styles.statusPill}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>READY</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* --- HEADER --- */}
            <LinearGradient
                colors={[COLORS.primary, '#1B4316', '#0F2A0C']}
                style={styles.header}
            >
                <View style={styles.hCircle1} />
                <View style={styles.hCircle2} />
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.welcomeText}>Agent Portal</Text>
                            <Text style={styles.titleText}>Assigned Collections</Text>
                        </View>
                        <View style={styles.headerIcons}>
                            <TouchableOpacity
                                style={[styles.badgeContainer, { marginRight: 12 }]}
                                onPress={() => navigation.navigate('Notifications')}
                            >
                                <Bell size={22} color="#fff" />
                                <View style={styles.notifBadge} />
                            </TouchableOpacity>
                            <View style={styles.badgeContainer}>
                                <Truck size={24} color="#fff" />
                                {requests.length > 0 && <View style={styles.notifBadge}><Text style={styles.notifCount}>{requests.length}</Text></View>}
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* --- LIST --- */}
            <View style={styles.listContainer}>
                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Fetching nearby requests...</Text>
                    </View>
                ) : requests.length > 0 ? (
                    <FlatList
                        data={requests}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={<Text style={styles.listLabel}>Pending Verification ({requests.length})</Text>}
                    />
                ) : (
                    <View style={styles.center}>
                        <View style={styles.emptyIconBg}>
                            <CheckCircle size={40} color="#94A3B8" />
                        </View>
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptySub}>No pending collections in your area right now.</Text>
                    </View>
                )}
            </View>

            {/* --- VERIFICATION MODAL --- */}
            <Modal
                visible={!!selectedRequest}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedRequest(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.dragHandle} />
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setSelectedRequest(null)}
                            >
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                            <Text style={styles.modalTitle}>Verify Pickup</Text>

                            <View style={styles.profileSummary}>
                                <View style={styles.largeIconBg}>
                                    <User size={30} color={COLORS.primary} />
                                </View>
                                <View>
                                    <Text style={styles.summaryName}>{selectedRequest?.userName}</Text>
                                    <Text style={styles.summaryDistrict}>{selectedRequest?.district} • Requested {selectedRequest?.quantity}kg</Text>
                                </View>
                            </View>

                            <View style={styles.inputSection}>
                                <View style={styles.inputGroup}>
                                    <View style={styles.labelRow}>
                                        <Droplets size={16} color={COLORS.primary} />
                                        <Text style={styles.inputLabel}>{t('moisture')} (%)</Text>
                                    </View>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g. 12.5"
                                        keyboardType="numeric"
                                        placeholderTextColor="#94A3B8"
                                        value={moisture}
                                        onChangeText={setMoisture}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={styles.labelRow}>
                                        <Scaling size={16} color={COLORS.primary} />
                                        <Text style={styles.inputLabel}>Final Net Weight (kg)</Text>
                                    </View>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder={`Requested: ${selectedRequest?.quantity}kg`}
                                        keyboardType="numeric"
                                        placeholderTextColor="#94A3B8"
                                        value={weight}
                                        onChangeText={setWeight}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={styles.labelRow}>
                                        <Clipboard size={16} color={COLORS.primary} />
                                        <Text style={styles.inputLabel}>{t('grade')}</Text>
                                    </View>
                                    <View style={styles.gradeContainer}>
                                        {['Grade A', 'Grade B', 'White'].map(g => (
                                            <TouchableOpacity
                                                key={g}
                                                style={[styles.gradeButton, grade === g && styles.activeGrade]}
                                                onPress={() => setGrade(g)}
                                            >
                                                <Text style={[styles.gradeText, grade === g && styles.activeGradeText]}>{g}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.confirmButton, isSubmitting && { opacity: 0.7 }]}
                                onPress={handleConfirmPickup}
                                disabled={isSubmitting}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, '#1B4316']}
                                    style={styles.confirmGradient}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
                                            <Text style={styles.confirmButtonText}>Confirm & Sync Receipt</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <Text style={styles.disclaimer}>
                                By confirming, you verify that the weight and quality measurements are accurate according to market standards.
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        paddingBottom: 28,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    hCircle1: {
        position: 'absolute', width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -60,
    },
    hCircle2: {
        position: 'absolute', width: 140, height: 140, borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: -40,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    welcomeText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
    titleText: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2 },
    badgeContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    notifBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary },
    notifCount: { color: '#fff', fontSize: 10, fontWeight: '900' },

    listContainer: { flex: 1 },
    listContent: { padding: 20, paddingBottom: 100 },
    listLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },

    requestCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    farmerIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    farmerName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    metaText: { fontSize: 12, color: '#94A3B8', marginLeft: 4 },
    dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },

    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    qtyText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
    statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D97706', marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: '900', color: '#D97706' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loadingText: { marginTop: 12, color: '#64748B', fontSize: 14, fontWeight: '500' },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155' },
    emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 8, lineHeight: 20 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
    dragHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    modalTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
    profileSummary: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 24 },
    largeIconBg: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
    summaryName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    summaryDistrict: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },

    inputSection: { gap: 18, marginBottom: 30 },
    inputGroup: {},
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
    modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, fontSize: 16, color: '#1E293B' },
    gradeContainer: { flexDirection: 'row', gap: 8 },
    gradeButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
    activeGrade: { borderColor: COLORS.primary, backgroundColor: '#F0FDF4' },
    gradeText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
    activeGradeText: { color: COLORS.primary },

    confirmButton: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
    confirmGradient: { height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    disclaimer: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 16, lineHeight: 18, fontWeight: '500' },
});

export default AgentHomeScreen;
