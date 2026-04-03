import React, { useState } from 'react';
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
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Camera,
    CheckCircle,
    Info,
    Warehouse,
    Leaf,
    ShieldCheck
} from 'lucide-react-native';
import { db, auth } from '../../services/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/theme';

const SellerRegistrationScreen = ({ navigation }) => {
    const [nurseryName, setNurseryName] = useState('');
    const [description, setDescription] = useState('');
    const [experience, setExperience] = useState('');
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload nursery photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!nurseryName || !description || !experience || !image) {
            Alert.alert('Required Fields', 'Please fill in all details and upload a nursery photo.');
            return;
        }

        setIsLoading(true);
        try {
            const user = auth.currentUser;
            // Update user status
            await updateDoc(doc(db, 'users', user.uid), {
                sellerStatus: 'pending',
                nurseryName,
            });

            // Create a formal request document
            await setDoc(doc(db, 'SellerRequests', user.uid), {
                userId: user.uid,
                nurseryName,
                description,
                experience,
                nurseryImage: image,
                status: 'pending',
                timestamp: serverTimestamp(),
            });

            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit application. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <SafeAreaView style={styles.successContainer}>
                <View style={styles.successContent}>
                    <View style={styles.successIconBg}>
                        <ShieldCheck size={60} color="#fff" />
                    </View>
                    <Text style={styles.successTitle}>Application Submitted!</Text>
                    <Text style={styles.successSub}>
                        Our team will review your nursery details. Verification usually takes 24-48 hours.
                        We will notify you once you're ready to start selling.
                    </Text>
                    <TouchableOpacity
                        style={styles.backHomeBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backHomeText}>Back to Marketplace</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nursery Verification</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.infoCard}>
                        <Info size={20} color={COLORS.primary} />
                        <Text style={styles.infoText}>
                            Only verified nurseries can list pepper plants to ensure quality and prevent fraud.
                            Approved sellers get a "Verified" badge on all listings.
                        </Text>
                    </View>

                    <Text style={styles.inputLabel}>Nursery Name</Text>
                    <View style={styles.inputWrapper}>
                        <Warehouse size={20} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Sunil's Pepper Nursery"
                            value={nurseryName}
                            onChangeText={setNurseryName}
                        />
                    </View>

                    <Text style={styles.inputLabel}>About Your Nursery</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Describe your nursery, varieties you grow, and location details..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />

                    <Text style={styles.inputLabel}>Experience (Years)</Text>
                    <View style={styles.inputWrapper}>
                        <Leaf size={20} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="How many years have you been growing pepper?"
                            keyboardType="numeric"
                            value={experience}
                            onChangeText={setExperience}
                        />
                    </View>

                    <Text style={styles.inputLabel}>Nursery Photos (Required)</Text>
                    <TouchableOpacity
                        style={[styles.photoUpload, image && { borderStyle: 'solid', padding: 0 }]}
                        onPress={pickImage}
                        activeOpacity={0.8}
                    >
                        {image ? (
                            <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                                <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 18 }} />
                                <View style={styles.imageOverlay}>
                                    <Camera size={24} color="#fff" />
                                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 4 }}>Change Photo</Text>
                                </View>
                            </View>
                        ) : (
                            <>
                                <Camera size={32} color={COLORS.primary} />
                                <Text style={styles.photoText}>Upload Nursery Images</Text>
                                <Text style={styles.photoSub}>Clear photos of your plants help with faster approval.</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.agreements}>
                        <CheckCircle size={18} color={COLORS.primary} />
                        <Text style={styles.agreementsText}>
                            I agree to sell only high-quality pepper varieties and follow the platform's escrow payment terms.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Submit Application</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
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
    infoCard: {
        backgroundColor: '#F0FDF4',
        padding: 15,
        borderRadius: 16,
        flexDirection: 'row',
        gap: 12,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#166534',
        lineHeight: 18,
        fontWeight: '500',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: '#475569',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        height: 54,
        paddingHorizontal: 15,
        marginBottom: 20,
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
    textArea: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        padding: 15,
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        minHeight: 100,
        marginBottom: 20,
    },
    photoUpload: {
        height: 160,
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginBottom: 25,
    },
    photoText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: 10,
    },
    photoSub: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 4,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    agreements: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    agreementsText: {
        flex: 1,
        fontSize: 12,
        color: '#64748B',
        lineHeight: 18,
        fontWeight: '500',
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    successContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successContent: {
        padding: 30,
        alignItems: 'center',
    },
    successIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    successSub: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 35,
    },
    backHomeBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 16,
    },
    backHomeText: {
        color: COLORS.primary,
        fontWeight: '800',
        fontSize: 16,
    },
});

export default SellerRegistrationScreen;
