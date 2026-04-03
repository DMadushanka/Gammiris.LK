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
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react-native';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const passwordRef = useRef(null);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter your email and password.');
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

            if (userDoc.exists()) {
                const role = userDoc.data().role;
                if (role === 'farmer') navigation.replace('FarmerTabs');
                else if (role === 'agent') navigation.replace('AgentTabs');
                else navigation.replace('AdminTabs');
            } else {
                if (email.toLowerCase().includes('farmer')) navigation.replace('FarmerTabs');
                else if (email.toLowerCase().includes('agent')) navigation.replace('AgentTabs');
                else Alert.alert('Error', 'User profile not found.');
            }
        } catch (error) {
            Alert.alert('Login Failed', error.message);
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
                {/* Decorative circles */}
                <View style={styles.circleTopRight} />
                <View style={styles.circleTopLeft} />

                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.kav}
                    >
                        {/* Branding */}
                        <View style={styles.brandSection}>
                            <View style={styles.logoRing}>
                                <Leaf size={32} color="#ffffff" />
                            </View>
                            <Text style={styles.brandName}>Gammiris.lk</Text>
                            <Text style={styles.brandTagline}>Sri Lanka's Pepper Market Platform</Text>
                        </View>

                        {/* Card */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Welcome Back 👋</Text>
                            <Text style={styles.cardSub}>Sign in to continue to your dashboard</Text>

                            {/* Email Field */}
                            <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                                <View style={styles.inputIcon}>
                                    <Mail size={20} color={emailFocused ? COLORS.primary : '#94A3B8'} />
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Email address"
                                    placeholderTextColor="#94A3B8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Password Field */}
                            <View style={[styles.inputWrapper, passwordFocused && styles.inputFocused]}>
                                <View style={styles.inputIcon}>
                                    <Lock size={20} color={passwordFocused ? COLORS.primary : '#94A3B8'} />
                                </View>
                                <TextInput
                                    ref={passwordRef}
                                    style={styles.textInput}
                                    placeholder="Password"
                                    placeholderTextColor="#94A3B8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    onSubmitEditing={handleLogin}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(p => !p)}
                                    style={styles.eyeBtn}
                                >
                                    {showPassword
                                        ? <EyeOff size={19} color="#94A3B8" />
                                        : <Eye size={19} color="#94A3B8" />
                                    }
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.forgotBtn}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            {/* Sign In Button */}
                            <TouchableOpacity
                                style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={isLoading ? ['#94A3B8', '#94A3B8'] : [COLORS.primary, '#1B4316']}
                                    style={styles.loginGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isLoading
                                        ? <ActivityIndicator color="#ffffff" size="small" />
                                        : <>
                                            <Text style={styles.loginBtnText}>Sign In</Text>
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
                                style={styles.registerBtn}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <Text style={styles.registerBtnText}>
                                    Don't have an account?{'  '}
                                    <Text style={styles.registerBtnHighlight}>Create Account</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.bottomNote}>
                            Empowering Sri Lankan Pepper Farmers 🌿
                        </Text>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
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
    circleTopLeft: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        top: 60,
        left: -60,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    kav: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    brandSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    brandName: {
        fontSize: 30,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 0.5,
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
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 15,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 6,
    },
    cardSub: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 24,
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
        height: '100%',
    },
    eyeBtn: { padding: 4 },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        marginTop: 4,
    },
    forgotText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '700',
    },
    loginBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    loginBtnDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    loginGradient: {
        height: 54,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    loginBtnText: {
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
    registerBtn: { alignItems: 'center' },
    registerBtnText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    registerBtnHighlight: {
        color: COLORS.primary,
        fontWeight: '800',
    },
    bottomNote: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.55)',
        fontSize: 12,
        marginTop: 24,
        fontWeight: '500',
    },
});

export default LoginScreen;
