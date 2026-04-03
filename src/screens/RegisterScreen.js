import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';
import {
    Mail, Lock, Eye, EyeOff, Leaf, ArrowRight, User, ChevronLeft,
    Sprout, Truck, Shield, Phone, MapPin, CreditCard, Home, Search, X, CheckCircle
} from 'lucide-react-native';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const InputField = ({ icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, fieldName, onSubmitEditing, inputRef, focusedField, setFocusedField, showPassword, setShowPassword }) => (
    <View style={[styles.inputWrapper, focusedField === fieldName && styles.inputFocused]}>
        <View style={styles.inputIcon}>
            <Icon size={20} color={focusedField === fieldName ? COLORS.primary : '#94A3B8'} />
        </View>
        <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
            onFocus={() => setFocusedField(fieldName)}
            onBlur={() => setFocusedField(null)}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={onSubmitEditing ? 'next' : 'done'}
        />
        {fieldName === 'password' && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={19} color="#94A3B8" /> : <Eye size={19} color="#94A3B8" />}
            </TouchableOpacity>
        )}
    </View>
);

const RegisterScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [district, setDistrict] = useState('National');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('farmer');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [isDistrictModalVisible, setIsDistrictModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const districts = [
        'National', 'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
        'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
        'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Moneragala',
        'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
        'Trincomalee', 'Vavuniya'
    ];

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const roles = [
        { id: 'farmer', label: 'Farmer', icon: Sprout, color: '#10B981' },
        { id: 'agent', label: 'Agent', icon: Truck, color: '#3B82F6' },
        { id: 'admin', label: 'Admin', icon: Shield, color: '#8B5CF6' },
    ];

    const handleRegister = async () => {
        if (!fullName || !email || !password || !phoneNumber || !address || !idNumber) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            try {
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    fullName,
                    email: email.trim().toLowerCase(),
                    role,
                    phoneNumber,
                    address,
                    idNumber,
                    district,
                    createdAt: new Date().toISOString(),
                });
            } catch (dbError) {
                console.error('Firestore save error:', dbError);
            }

            if (role === 'farmer') navigation.replace('FarmerTabs');
            else if (role === 'agent') navigation.replace('AgentTabs');
            else navigation.replace('AdminTabs');
        } catch (error) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <LinearGradient
                colors={[COLORS.primary, '#1B4316', '#0F2A0C']}
                style={styles.background}
            >
                <View style={styles.circleTopRight} />
                <View style={styles.circleMid} />

                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={26} color="#ffffff" />
                    </TouchableOpacity>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Branding */}
                            <View style={styles.brandSection}>
                                <View style={styles.logoRing}>
                                    <Leaf size={28} color="#ffffff" />
                                </View>
                                <Text style={styles.brandName}>Join Gammiris.lk</Text>
                                <Text style={styles.brandTagline}>Create your free account in seconds</Text>
                            </View>

                            {/* Card */}
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Create Account ✨</Text>
                                <Text style={styles.cardSub}>Fill in your details to get started</Text>

                                <InputField
                                    icon={User}
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    fieldName="name"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                    focusedField={focusedField}
                                    setFocusedField={setFocusedField}
                                />
                                <InputField
                                    icon={Mail}
                                    placeholder="Email address"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    fieldName="email"
                                    inputRef={emailRef}
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                    focusedField={focusedField}
                                    setFocusedField={setFocusedField}
                                />
                                <InputField
                                    icon={Lock}
                                    placeholder="Password (min 6 characters)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    fieldName="password"
                                    inputRef={passwordRef}
                                    focusedField={focusedField}
                                    setFocusedField={setFocusedField}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                />

                                <InputField
                                    icon={Phone}
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    fieldName="phone"
                                    focusedField={focusedField}
                                    setFocusedField={setFocusedField}
                                />

                                <InputField
                                    icon={Home}
                                    placeholder="Address"
                                    value={address}
                                    onChangeText={setAddress}
                                    fieldName="address"
                                    focusedField={focusedField}
                                    setFocusedField={setFocusedField}
                                />

                                <InputField
                                    icon={CreditCard}
                                    placeholder="ID Number (NIC)"
                                    value={idNumber}
                                    onChangeText={setIdNumber}
                                    fieldName="nic"
                                    focusedField={focusedField}
                                    setFocusedField={setFocusedField}
                                />

                                <Text style={styles.roleTitle}>Select Your District</Text>
                                <TouchableOpacity
                                    style={styles.districtSelector}
                                    onPress={() => setIsDistrictModalVisible(true)}
                                >
                                    <View style={styles.inputWrapper}>
                                        <View style={styles.inputIcon}>
                                            <MapPin size={20} color={COLORS.primary} />
                                        </View>
                                        <Text style={[styles.textInput, { paddingTop: 15 }]}>{district}</Text>
                                        <ArrowRight size={18} color={COLORS.primary} />
                                    </View>
                                </TouchableOpacity>

                                {/* Role Selector */}
                                <Text style={styles.roleTitle}>Select Your Role</Text>
                                <View style={styles.roleRow}>
                                    {roles.map(({ id, label, icon: RoleIcon, color }) => {
                                        const isActive = role === id;
                                        return (
                                            <TouchableOpacity
                                                key={id}
                                                style={[
                                                    styles.roleCard,
                                                    isActive && { borderColor: color, backgroundColor: color + '12' }
                                                ]}
                                                onPress={() => setRole(id)}
                                                activeOpacity={0.75}
                                            >
                                                <View style={[
                                                    styles.roleIconBg,
                                                    { backgroundColor: isActive ? color + '20' : '#F1F5F9' }
                                                ]}>
                                                    <RoleIcon size={20} color={isActive ? color : '#94A3B8'} />
                                                </View>
                                                <Text style={[
                                                    styles.roleCardText,
                                                    isActive && { color: color, fontWeight: '800' }
                                                ]}>
                                                    {label}
                                                </Text>
                                                {isActive && (
                                                    <View style={[styles.roleCheck, { backgroundColor: color }]}>
                                                        <Text style={{ fontSize: 9, color: '#fff', fontWeight: '900' }}>✓</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Register Button */}
                                <TouchableOpacity
                                    style={[styles.registerBtn, isLoading && { opacity: 0.7 }]}
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                    activeOpacity={0.85}
                                >
                                    <LinearGradient
                                        colors={[COLORS.primary, '#1B4316']}
                                        style={styles.btnGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {isLoading
                                            ? <ActivityIndicator color="#ffffff" size="small" />
                                            : <>
                                                <Text style={styles.btnText}>Create Account</Text>
                                                <ArrowRight size={20} color="#ffffff" />
                                            </>
                                        }
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.dividerRow}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <TouchableOpacity
                                    style={styles.loginLink}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={styles.loginLinkText}>
                                        Already have an account?{'  '}
                                        <Text style={styles.loginLinkHighlight}>Sign In</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.bottomNote}>
                                By creating an account, you agree to our Terms & Privacy Policy
                            </Text>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
            {/* District Selection Modal */}
            <Modal
                visible={isDistrictModalVisible}
                animationType="slide"
                transparent={true}
                statusBarTranslucent={true}
                onRequestClose={() => setIsDistrictModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBlur}
                        activeOpacity={1}
                        onPress={() => setIsDistrictModalVisible(false)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.dragHandle} />
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setIsDistrictModalVisible(false)}
                            >
                                <X size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalTitle}>Select Your District</Text>

                        <View style={styles.searchContainer}>
                            <Search size={18} color="#94A3B8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search district..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#94A3B8"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={{ height: 400 }}>
                            <FlatList
                                data={districts.filter(d =>
                                    d && d.toLowerCase().includes((searchQuery || '').toLowerCase())
                                )}
                                keyExtractor={item => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.districtItem, district === item && styles.activeDistrictItem]}
                                        onPress={() => {
                                            setDistrict(item);
                                            setIsDistrictModalVisible(false);
                                            setSearchQuery('');
                                        }}
                                    >
                                        <View style={[styles.districtIconBg, district === item && { backgroundColor: COLORS.primary + '15' }]}>
                                            <MapPin size={18} color={district === item ? COLORS.primary : "#94A3B8"} />
                                        </View>
                                        <Text style={[styles.districtItemText, district === item && styles.activeDistrictItemText]}>
                                            {item}
                                        </Text>
                                        {district === item && (
                                            <CheckCircle size={18} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 40 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1 },
    circleTopRight: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        top: -80,
        right: -80,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    circleMid: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        bottom: 100,
        left: -80,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    backBtn: {
        marginLeft: 20,
        marginTop: 8,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
    },
    brandSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    brandName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#ffffff',
    },
    brandTagline: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.65)',
        marginTop: 4,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 28,
        padding: 26,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 15,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 21,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 5,
    },
    cardSub: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 22,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        marginBottom: 14,
        height: 54,
        paddingHorizontal: 14,
    },
    inputFocused: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0FDF4',
    },
    inputIcon: { marginRight: 10 },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '500',
    },
    eyeBtn: { padding: 4 },
    roleTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 12,
        marginTop: 6,
    },
    roleRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 22,
    },
    roleCard: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        position: 'relative',
    },
    roleIconBg: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    roleCardText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
    },
    roleCheck: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    btnGradient: {
        height: 54,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    btnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '700',
    },
    loginLink: { alignItems: 'center' },
    loginLinkText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    loginLinkHighlight: {
        color: COLORS.primary,
        fontWeight: '800',
    },
    bottomNote: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.45)',
        fontSize: 11,
        fontWeight: '500',
        paddingHorizontal: 10,
    },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalBlur: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 24,
        minHeight: 500,
        width: '100%',
    },
    dragHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, position: 'absolute', top: -30, alignSelf: 'center' },
    modalHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 5, position: 'relative' },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    modalTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 20 },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
        borderRadius: 16, paddingHorizontal: 16, marginBottom: 20,
        borderWidth: 1.5, borderColor: '#E2E8F0', height: 54,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#1E293B' },

    districtItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
        paddingHorizontal: 12, borderRadius: 16, marginBottom: 8, gap: 12,
    },
    activeDistrictItem: { backgroundColor: '#F0FDF4' },
    districtIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
    districtItemText: { fontSize: 15, fontWeight: '700', color: '#475569', flex: 1 },
    activeDistrictItemText: { color: COLORS.primary, fontWeight: '800' },
    districtSelector: { marginBottom: 10 },
});

export default RegisterScreen;
