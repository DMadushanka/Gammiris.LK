import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    FlatList,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Plus,
    Clock,
    MapPin,
    Leaf,
    Verified,
    Filter,
    ArrowRight,
    ShoppingBag,
    Search as SearchIcon
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../../services/firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const PlantCard = ({ item }) => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [activeIndex, setActiveIndex] = useState(0);
    const images = item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=1000'];

    return (
        <TouchableOpacity
            style={styles.plantCard}
            onPress={() => navigation.navigate('PlantDetails', { plantId: item.id })}
            activeOpacity={0.9}
        >
            <View style={styles.cardImageContainer}>
                <FlatList
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                        const newIndex = Math.round(e.nativeEvent.contentOffset.x / ((width - 45) / 2));
                        setActiveIndex(newIndex);
                    }}
                    renderItem={({ item: img }) => (
                        <Image source={{ uri: img }} style={styles.plantImage} resizeMode="cover" />
                    )}
                    keyExtractor={(_, index) => index.toString()}
                />
                {images.length > 1 && (
                    <View style={styles.paginationDots}>
                        {images.map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, activeIndex === i && styles.activeDot]}
                            />
                        ))}
                    </View>
                )}
            </View>
            <View style={styles.plantInfo}>
                <View style={styles.plantHeader}>
                    <Text style={styles.plantVariety} numberOfLines={1}>{item.variety}</Text>
                    {item.verifiedSeller && <Verified size={14} color={COLORS.primary} />}
                </View>
                <Text style={styles.plantPrice}>LKR {item.price}</Text>
                <View style={styles.plantFooter}>
                    <View style={styles.locationContainer}>
                        <MapPin size={10} color="#64748B" />
                        <Text style={styles.locationText}>{item.district || 'Kandy'}</Text>
                    </View>
                    <Text style={styles.stockText}>{item.stockCount} {t('left')}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const PlantMarketplaceScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [plants, setPlants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSeller, setIsSeller] = useState(false);
    const [sellerStatus, setSellerStatus] = useState(null); // 'pending', 'verified', null

    useEffect(() => {
        checkSellerStatus();
        const unsubscribe = onSnapshot(collection(db, 'PlantListings'), (snapshot) => {
            const plantData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPlants(plantData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const checkSellerStatus = async () => {
        const user = auth.currentUser;
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setIsSeller(userData.isPlantSeller || false);
                setSellerStatus(userData.sellerStatus || null);
            }
        }
    };

    // Moved outside to fix hook error

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSubtitle}>{t('p2pMarketplace')}</Text>
                    <Text style={styles.headerTitle}>{t('pepperPlants')}</Text>
                </View>
                <TouchableOpacity
                    style={styles.cartBtn}
                    onPress={() => navigation.navigate('GrowthTracker')}
                >
                    <Leaf size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <SearchIcon size={18} color="#94A3B8" />
                    <TextInput
                        placeholder={t('searchVarieties')}
                        placeholderTextColor="#94A3B8"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Seller section */}
                {sellerStatus === 'pending' ? (
                    <View style={styles.sellerWarning}>
                        <Clock size={16} color="#B45309" />
                        <Text style={styles.sellerWarningText}>{t('verificationPending')}</Text>
                    </View>
                ) : !isSeller ? (
                    <LinearGradient
                        colors={[COLORS.primary, '#1B4316']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sellerBanner}
                    >
                        <View style={styles.sellerBannerContent}>
                            <Text style={styles.sellerBannerTitle}>{t('earnFromNursery')}</Text>
                            <Text style={styles.sellerBannerSub}>{t('becomeVerifiedSeller')}</Text>
                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => navigation.navigate('SellerRegistration')}
                            >
                                <Text style={styles.applyBtnText}>{t('applyNow')}</Text>
                                <ArrowRight size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.bannerIcon}>
                            <Plus size={40} color="rgba(255,255,255,0.2)" />
                        </View>
                    </LinearGradient>
                ) : (
                    <TouchableOpacity
                        style={styles.sellerBanner}
                        onPress={() => navigation.navigate('SellerDashboard')}
                    >
                        <LinearGradient
                            colors={['#0F172A', '#334155']}
                            style={styles.sellerGradient}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                            <View>
                                <Text style={styles.sellerTitle}>{t('manageListings')}</Text>
                                <Text style={styles.sellerSub}>{t('applyNow')}</Text>
                            </View>
                            <ArrowRight size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Varieties</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.plantList}>
                        {plants.length > 0 ? (
                            <View style={styles.listWrapper}>
                                {plants.map((item) => (
                                    <PlantCard key={item.id} item={item} />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <ShoppingBag size={48} color="#CBD5E1" />
                                <Text style={styles.emptyText}>{t('noPlantsYet')}</Text>
                            </View>
                        )}
                    </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1E293B',
    },
    cartBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 52,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    filterBtn: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellerBanner: {
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: 25,
    },
    sellerBannerContent: {
        flex: 1,
        zIndex: 1,
    },
    sellerBannerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    sellerBannerSub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 15,
    },
    applyBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
    },
    applyBtnText: {
        color: COLORS.primary,
        fontWeight: '800',
        fontSize: 13,
    },
    bannerIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        opacity: 0.5,
    },
    manageListingsBtn: {
        marginHorizontal: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        height: 54,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 25,
    },
    manageListingsText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    viewAll: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
    },
    plantList: {
        paddingHorizontal: 15,
        paddingBottom: 100,
    },
    listWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    plantCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: (width - 45) / 2,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardImageContainer: {
        width: '100%',
        height: 120,
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
    },
    plantImage: {
        width: (width - 45) / 2 - 16,
        height: 120,
        borderRadius: 15,
    },
    paginationDots: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 12,
    },
    plantVariety: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
        flex: 1,
    },
    plantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    plantPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.primary,
        marginBottom: 8,
    },
    plantFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    locationText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '600',
    },
    stockText: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        width: width - 40,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
    },
});

export default PlantMarketplaceScreen;
