import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { db } from '../../services/firebase';
import {
    collection,
    query,
    onSnapshot,
    doc,
    updateDoc,
    orderBy
} from 'firebase/firestore';
import { COLORS } from '../../constants/theme';
import {
    ChevronLeft,
    CheckCircle,
    XCircle,
    Clock,
    Leaf,
    User,
    Info,
    ExternalLink
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ManageSellersScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [filter, setFilter] = useState('pending'); // 'pending', 'verified', 'rejected'

    useEffect(() => {
        const q = query(collection(db, 'SellerRequests'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(requestData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAction = async (requestId, userId, status) => {
        try {
            await updateDoc(doc(db, 'SellerRequests', requestId), { status });
            await updateDoc(doc(db, 'users', userId), {
                sellerStatus: status,
                isPlantSeller: status === 'verified'
            });
            // The original instruction had an incorrect insertion here.
            // The `if (!moisture || !weight)` block seems to be from a different context.
            // I will assume the intent was to add the Alert.alert for success after the updateDoc.
            // If the `if (!moisture || !weight)` block was intended, please provide the full context for it.
            Alert.alert(t('success'), t('sellerStatusUpdated', { status }));
            setIsModalVisible(false);
        } catch (error) {
            console.error(error);
            Alert.alert(t('error'), t('failedToUpdateStatus'));
        }
    };

    const filteredRequests = requests.filter(req => req.status === filter);

    const RequestCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                setSelectedRequest(item);
                setIsModalVisible(true);
            }}
        >
            <View style={styles.cardHeader}>
                <View style={styles.nurseryInfo}>
                    <Text style={styles.nurseryName}>{item.nurseryName}</Text>
                    <Text style={styles.experienceText}>{t('experienceYears', { years: item.experience })}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'verified' ? '#DCFCE7' : item.status === 'rejected' ? '#FEE2E2' : '#EFF6FF' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'verified' ? '#166534' : item.status === 'rejected' ? '#991B1B' : '#1D4ED8' }
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardFooter}>
                <View style={styles.userMeta}>
                    <User size={14} color="#94A3B8" />
                    <Text style={styles.userMetaText}>ID: {item.userId.substring(0, 8)}...</Text>
                </View>
                <TouchableOpacity style={styles.viewDetailBtn}>
                    <Text style={styles.viewDetailText}>Review Details</Text>
                    <ExternalLink size={14} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Seller Management</Text>
                <Text style={styles.headerSub}>Verify nurseries and manage plant sellers</Text>
            </View>

            <View style={styles.filterBar}>
                {['pending', 'verified', 'rejected'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredRequests}
                    renderItem={RequestCard}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Clock size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No {filter} applications found.</Text>
                        </View>
                    }
                />
            )}

            {/* Application Detail Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seller Application</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <XCircle size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {selectedRequest && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Image
                                    source={{ uri: selectedRequest.nurseryImage || 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=1000' }}
                                    style={styles.modalImage}
                                    resizeMode="cover"
                                />

                                <View style={styles.modalBody}>
                                    <View style={styles.detailRow}>
                                        <Leaf size={20} color={COLORS.primary} />
                                        <View style={styles.detailTextContainer}>
                                            <Text style={styles.detailLabel}>Nursery Name</Text>
                                            <Text style={styles.detailValue}>{selectedRequest.nurseryName}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Info size={20} color="#3B82F6" />
                                        <View style={styles.detailTextContainer}>
                                            <Text style={styles.detailLabel}>Experience</Text>
                                            <Text style={styles.detailValue}>{selectedRequest.experience} Years in Pepper Cultivation</Text>
                                        </View>
                                    </View>

                                    <View style={styles.descriptionSection}>
                                        <Text style={styles.sectionLabel}>About Nursery</Text>
                                        <Text style={styles.descriptionText}>{selectedRequest.description}</Text>
                                    </View>

                                    {selectedRequest.status === 'pending' && (
                                        <View style={styles.actionRow}>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.rejectBtn]}
                                                onPress={() => handleAction(selectedRequest.id, selectedRequest.userId, 'rejected')}
                                            >
                                                <XCircle size={20} color="#fff" />
                                                <Text style={styles.actionBtnText}>Reject</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.approveBtn]}
                                                onPress={() => handleAction(selectedRequest.id, selectedRequest.userId, 'verified')}
                                            >
                                                <CheckCircle size={20} color="#fff" />
                                                <Text style={styles.actionBtnText}>Verify Seller</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {selectedRequest.status !== 'pending' && (
                                        <View style={[
                                            styles.finalStatusBanner,
                                            { backgroundColor: selectedRequest.status === 'verified' ? '#DCFCE7' : '#FEE2E2' }
                                        ]}>
                                            <Text style={{
                                                color: selectedRequest.status === 'verified' ? '#166534' : '#991B1B',
                                                fontWeight: '800',
                                                textAlign: 'center'
                                            }}>
                                                This application has been {selectedRequest.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1E293B',
    },
    headerSub: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '500',
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        paddingBottom: 15,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    filterTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 18,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nurseryName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1E293B',
    },
    experienceText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 15,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userMetaText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    viewDetailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    viewDetailText: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 15,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 15,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: height * 0.85,
        paddingTop: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
    },
    modalImage: {
        width: width - 40,
        height: 220,
        borderRadius: 24,
        marginHorizontal: 20,
        marginBottom: 24,
    },
    modalBody: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 20,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginTop: 2,
    },
    descriptionSection: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '800',
        color: '#64748B',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    approveBtn: {
        backgroundColor: COLORS.primary,
    },
    rejectBtn: {
        backgroundColor: '#EF4444',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },
    finalStatusBanner: {
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
    }
});

export default ManageSellersScreen;
