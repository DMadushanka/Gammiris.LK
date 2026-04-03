import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    FlatList,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Plus,
    Trash2,
    Tag,
    Layers,
    Warehouse,
    Verified,
    Clock,
    DollarSign,
    Box,
    Camera,
    X
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, auth } from '../../services/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const SellerDashboardScreen = ({ navigation }) => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // New listing state
    const [variety, setVariety] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [images, setImages] = useState([]);
    const [nurseryData, setNurseryData] = useState(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        fetchNurseryData();

        const q = query(collection(db, 'PlantListings'), where('sellerId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setListings(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchNurseryData = async () => {
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            setNurseryData(userDoc.data());
        }
    };

    const pickImages = async () => {
        if (images.length >= 3) {
            Alert.alert('Limit Reached', 'You can only upload up to 3 images.');
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need storage permissions to upload plant photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: 3 - images.length
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages(prev => [...prev, ...newImages].slice(0, 3));
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddListing = async () => {
        if (!variety || !price || !stock) {
            Alert.alert('Missing Info', 'Please fill in all plant details.');
            return;
        }

        setIsAdding(true);
        try {
            const user = auth.currentUser;
            await addDoc(collection(db, 'PlantListings'), {
                sellerId: user.uid,
                nurseryName: nurseryData?.nurseryName || 'Local Nursery',
                variety,
                price: Number(price),
                stockCount: Number(stock),
                verifiedSeller: true,
                district: nurseryData?.district || 'National',
                images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=1000'],
                timestamp: serverTimestamp(),
            });

            setVariety('');
            setPrice('');
            setStock('');
            setImages([]);
            setIsAdding(false);
            Alert.alert('Success', 'Your pepper plants are now live on the marketplace!');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to add listing.');
            setIsAdding(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Listing', 'Are you sure you want to remove this plant from the marketplace?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteDoc(doc(db, 'PlantListings', id)) }
        ]);
    };

    const ListingItem = ({ item }) => (
        <View style={styles.listingCard}>
            <Image source={{ uri: item.images?.[0] }} style={styles.listingImage} />
            <View style={styles.listingInfo}>
                <Text style={styles.listingVariety}>{item.variety}</Text>
                <Text style={styles.listingPrice}>LKR {item.price}</Text>
                <View style={styles.listingMeta}>
                    <Box size={14} color="#94A3B8" />
                    <Text style={styles.listingStock}>{item.stockCount} in stock</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seller Dashboard</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <View style={styles.nurseryHeader}>
                        <Warehouse size={24} color="#fff" />
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.nurseryName}>{nurseryData?.nurseryName || 'Your Nursery'}</Text>
                            <View style={styles.verifiedRow}>
                                <Verified size={14} color="#4ADE80" />
                                <Text style={styles.verifiedText}>Verified Seller</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statVal}>{listings.length}</Text>
                            <Text style={styles.statLbl}>Active Listings</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statVal}>0</Text>
                            <Text style={styles.statLbl}>Plants Sold</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Add New Pepper Plants</Text>
                <View style={styles.addForm}>
                    <View style={styles.inputWrapper}>
                        <Tag size={18} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Variety (e.g. Panniyur-1)"
                            value={variety}
                            onChangeText={setVariety}
                        />
                    </View>
                    <View style={styles.rowInputs}>
                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <DollarSign size={18} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Price per plant"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 10 }]}>
                            <Layers size={18} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Stock count"
                                keyboardType="numeric"
                                value={stock}
                                onChangeText={setStock}
                            />
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Plant Photos (Up to 3)</Text>
                    <View style={styles.imageGrid}>
                        {images.map((img, index) => (
                            <View key={index} style={styles.imageBox}>
                                <Image source={{ uri: img }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.removeImgBtn}
                                    onPress={() => removeImage(index)}
                                >
                                    <X size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {images.length < 3 && (
                            <TouchableOpacity style={styles.addPhotosBtn} onPress={pickImages}>
                                <Camera size={24} color={COLORS.primary} />
                                <Text style={styles.addPhotosText}>Add</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={handleAddListing}
                        disabled={isAdding}
                    >
                        {isAdding ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Plus size={20} color="#fff" />
                                <Text style={styles.addBtnText}>Publish to Marketplace</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>My active Listings</Text>
                {isLoading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={listings}
                        renderItem={ListingItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View style={styles.emptyList}>
                                <Text style={styles.emptyText}>You haven't listed any plants yet.</Text>
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
    summaryCard: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
    },
    nurseryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nurseryName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
    },
    verifiedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 2,
    },
    verifiedText: {
        fontSize: 12,
        color: '#4ADE80',
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 20,
    },
    statsRow: {
        flexDirection: 'row',
    },
    statItem: {
        flex: 1,
    },
    statVal: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
    },
    statLbl: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '700',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 15,
    },
    addForm: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        height: 52,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    rowInputs: {
        flexDirection: 'row',
    },
    addBtn: {
        backgroundColor: COLORS.primary,
        height: 54,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
    },
    addBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    listingCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    listingImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    listingInfo: {
        flex: 1,
        marginLeft: 15,
    },
    listingVariety: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    listingPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: 2,
    },
    listingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 4,
    },
    listingStock: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '700',
    },
    deleteBtn: {
        padding: 10,
    },
    emptyList: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: '#475569',
        marginBottom: 8,
    },
    imageGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    imageBox: {
        width: (width - 100) / 3,
        height: (width - 100) / 3,
        borderRadius: 12,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removeImgBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    addPhotosBtn: {
        width: (width - 100) / 3,
        height: (width - 100) / 3,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPhotosText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: 4,
    },
});

export default SellerDashboardScreen;
