import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft,
    Verified,
    MapPin,
    MessageCircle,
    Leaf,
    CheckCircle2,
    ShieldCheck,
    AlertTriangle,
    ShoppingBag,
    Plus,
    Minus
} from 'lucide-react-native';
import { db, auth } from '../../services/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, runTransaction, updateDoc } from 'firebase/firestore';
import { COLORS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PlantDetailsScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { plantId } = route.params;
    const [plant, setPlant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchPlantDetails();
    }, [plantId]);

    const fetchPlantDetails = async () => {
        try {
            const plantDoc = await getDoc(doc(db, 'PlantListings', plantId));
            if (plantDoc.exists()) {
                setPlant({ id: plantDoc.id, ...plantDoc.data() });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReserve = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Login Required', 'You must be logged in to reserve plants.');
            return;
        }

        if (user.uid === plant.sellerId) {
            Alert.alert('Invalid Action', 'You cannot buy your own listings.');
            return;
        }

        const totalAmount = plant.price * quantity;

        Alert.alert(
            t('secureReservation'),
            t('buyQuantityPlants', { count: quantity, price: totalAmount.toLocaleString() }) + '\n\n' + t('fundsHeldSecurely'),
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('confirmPay'), onPress: processEscrowPayment }
            ]
        );
    };

    const processEscrowPayment = async () => {
        setIsPurchasing(true);
        const user = auth.currentUser;
        try {
            // Mock payment success and create order
            const totalAmount = plant.price * quantity;
            const fee = totalAmount * 0.05; // 5% commission deducted from seller

            // Update stock and create order in a transaction (simulated here for simplicity, or direct updates)
            const plantRef = doc(db, 'PlantListings', plant.id);
            await updateDoc(plantRef, {
                stockCount: plant.stockCount - quantity
            });

            const orderRef = await addDoc(collection(db, 'EscrowOrders'), {
                plantId: plant.id,
                buyerId: user.uid,
                sellerId: plant.sellerId,
                nurseryName: plant.nurseryName,
                amount: totalAmount,
                quantity: quantity,
                fee: fee,
                status: 'Paid',
                variety: plant.variety,
                timestamp: serverTimestamp(),
                qrCodeValue: `PKP-${Math.random().toString(36).substring(7).toUpperCase()}`
            });

            Alert.alert(
                t('paymentSuccessful'),
                t('paymentSuccessDesc'),
                [{ text: t('ok'), onPress: () => navigation.navigate('GrowthTracker') }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert(t('error'), t('transactionFailedDesc'));
        } finally {
            setIsPurchasing(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                {/* Image Gallery Slider */}
                <View style={styles.imageContainer}>
                    <FlatList
                        data={plant.images && plant.images.length > 0 ? plant.images : ['https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=1000']}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveImage(newIndex);
                        }}
                        renderItem={({ item: img }) => (
                            <Image source={{ uri: img }} style={styles.mainImage} />
                        )}
                        keyExtractor={(_, index) => index.toString()}
                    />

                    <SafeAreaView style={styles.headerOverlay} edges={['top']}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ChevronLeft size={24} color="#1E293B" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    <View style={styles.badgeContainer}>
                        {plant.verifiedSeller && (
                            <View style={styles.verifiedBadge}>
                                <Verified size={14} color="#fff" />
                                <Text style={styles.verifiedText}>Verified Nursery</Text>
                            </View>
                        )}
                        <View style={styles.stockBadge}>
                            <Text style={styles.stockText}>{plant.stockCount} Plants Available</Text>
                        </View>
                    </View>

                    {plant.images?.length > 1 && (
                        <View style={styles.detailsPagination}>
                            {plant.images.map((_, i) => (
                                <View key={i} style={[styles.detailDot, activeImage === i && styles.activeDetailDot]} />
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.detailsContent}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.varietyName}>{plant.variety}</Text>
                            <View style={styles.locationRow}>
                                <MapPin size={14} color="#64748B" />
                                <Text style={styles.locationText}>{plant.district || 'Matale District'}</Text>
                            </View>
                        </View>
                        <Text style={styles.priceText}>LKR {plant.price}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.quantitySection}>
                        <View>
                            <Text style={styles.sectionTitle}>{t('selectQuantity')}</Text>
                            <Text style={styles.stockInfo}>{t('plantsAvailable', { count: plant.stockCount })}</Text>
                        </View>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity
                                style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                            >
                                <Minus size={20} color={quantity <= 1 ? '#CBD5E1' : '#1E293B'} />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{quantity}</Text>
                            <TouchableOpacity
                                style={[styles.qtyBtn, quantity >= plant.stockCount && styles.qtyBtnDisabled]}
                                onPress={() => quantity < plant.stockCount && setQuantity(quantity + 1)}
                            >
                                <Plus size={20} color={quantity >= plant.stockCount ? '#CBD5E1' : '#1E293B'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.divider} />
                    <Text style={styles.descriptionText}>
                        {plant.description || "Premium quality pepper plants ready for transplanting. Grown in controlled nursery conditions with organic fertilizers."}
                    </Text>

                    <View style={styles.sellerMiniCard}>
                        <View style={styles.sellerAvatar}>
                            <Text style={styles.avatarText}>{plant.nurseryName?.[0] || 'S'}</Text>
                        </View>
                        <View style={styles.sellerInfo}>
                            <Text style={styles.sellerName}>{plant.nurseryName || 'Standard Nursery'}</Text>
                            <Text style={styles.sellerSub}>{t('verifiedPlantProvider')}</Text>
                        </View>
                        <TouchableOpacity style={styles.chatBtn}>
                            <MessageCircle size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.privacyNotice}>
                        <ShieldCheck size={20} color={COLORS.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.privacyTitle}>{t('safetyPrivacy')}</Text>
                            <Text style={styles.privacySub}>{t('safetyPrivacyDesc')}</Text>
                        </View>
                    </View>

                    <View style={styles.supportCard}>
                        <Leaf size={20} color="#166534" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.supportTitle}>{t('growthSupportTitle')}</Text>
                            <Text style={styles.supportSub}>{t('growthSupportDesc')}</Text>
                        </View>
                    </View>

                    <View style={styles.bypassWarning}>
                        <AlertTriangle size={18} color="#991B1B" />
                        <Text style={styles.bypassText}>{t('offPlatformWarningDesc')}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.priceContainer}>
                    <Text style={styles.totalLabel}>{t('totalPriceCount', { count: quantity })}</Text>
                    <Text style={styles.totalPrice}>LKR {(plant.price * quantity).toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                    style={styles.reserveBtn}
                    onPress={handleReserve}
                    disabled={isPurchasing}
                >
                    <LinearGradient
                        colors={[COLORS.primary, '#1B4316']}
                        style={styles.reserveGradient}
                    >
                        {isPurchasing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <ShoppingBag size={20} color="#fff" />
                                <Text style={styles.reserveText}>{t('reserveBuy')}</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: width,
        height: width,
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20,
        marginTop: 10,
    },
    badgeContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        gap: 10,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    verifiedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
    },
    stockBadge: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    stockText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    detailsPagination: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    detailDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeDetailDot: {
        backgroundColor: '#fff',
        width: 20,
    },
    // Quantity Styles
    quantitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    stockInfo: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 2,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 14,
        padding: 4,
    },
    qtyBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    qtyBtnDisabled: {
        backgroundColor: '#F8FAFC',
        opacity: 0.5,
    },
    qtyText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginHorizontal: 20,
    },
    detailsContent: {
        padding: 24,
        paddingBottom: 120,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    varietyName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    priceText: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.primary,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
        fontWeight: '500',
    },
    sellerMiniCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 20,
        marginTop: 25,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sellerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    sellerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    sellerName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    sellerSub: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    chatBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    privacyNotice: {
        flexDirection: 'row',
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        gap: 12,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    privacyTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#166534',
        marginBottom: 2,
    },
    privacySub: {
        fontSize: 12,
        color: '#15803d',
        lineHeight: 18,
        fontWeight: '500',
    },
    supportCard: {
        flexDirection: 'row',
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 16,
        marginTop: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    supportTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#166534',
        marginBottom: 2,
    },
    supportSub: {
        fontSize: 12,
        color: '#15803d',
        lineHeight: 18,
        fontWeight: '500',
    },
    bypassWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginTop: 20,
        gap: 8,
    },
    bypassText: {
        flex: 1,
        fontSize: 10,
        color: '#991B1B',
        fontWeight: '700',
        fontStyle: 'italic',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 35 : 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 10,
    },
    priceContainer: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '700',
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
    },
    reserveBtn: {
        flex: 1.5,
        borderRadius: 16,
        overflow: 'hidden',
    },
    reserveGradient: {
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    reserveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});

export default PlantDetailsScreen;
