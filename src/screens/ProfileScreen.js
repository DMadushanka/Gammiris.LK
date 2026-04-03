import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import {
    Mail,
    Phone,
    LogOut,
    ChevronRight,
    Bell,
    Shield,
    Languages,
    UserCircle,
    Edit3,
    MapPin,
    TrendingUp,
    CreditCard,
    Home,
    Star,
} from 'lucide-react-native';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                } else {
                    setUserData({
                        fullName: user.displayName || 'Demo User',
                        email: user.email,
                        role: user.email?.includes('agent') ? 'agent' : 'farmer',
                        phoneNumber: 'Not set',
                        address: 'Not set',
                        idNumber: 'Not set',
                        district: 'National',
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            t('logout'),
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await auth.signOut();
                            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout');
                        }
                    }
                }
            ]
        );
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'si' : 'en';
        i18n.changeLanguage(newLang);
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const MenuItem = ({ icon: Icon, label, value, onPress, isSwitch, switchValue, onSwitchChange, iconBg, iconColor, danger }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            disabled={isSwitch || !onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIconBg, { backgroundColor: iconBg || 'rgba(45, 90, 39, 0.1)' }]}>
                <Icon size={18} color={iconColor || COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
                {value && <Text style={styles.menuValue}>{value}</Text>}
            </View>
            {isSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
                    thumbColor="#ffffff"
                    ios_backgroundColor="#E2E8F0"
                />
            ) : (
                <ChevronRight size={18} color={danger ? '#EF4444' : '#94A3B8'} />
            )}
        </TouchableOpacity>
    );

    const roleLabel = userData?.role === 'farmer' ? 'Pepper Farmer' : userData?.role === 'agent' ? 'Collection Agent' : 'Administrator';
    const roleColor = userData?.role === 'farmer' ? '#10B981' : userData?.role === 'agent' ? '#3B82F6' : '#8B5CF6';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }} edges={['top']}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Header gradient */}
                <LinearGradient
                    colors={[COLORS.primary, '#1B4316']}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerTopRow}>
                        <Text style={styles.headerTitle}>{t('profile')}</Text>
                        <TouchableOpacity style={styles.editBtn}>
                            <Edit3 size={18} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                    </View>

                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarRingOuter}>
                            <View style={styles.avatarRingInner}>
                                <Text style={styles.avatarInitial}>{getInitials(userData?.fullName)}</Text>
                            </View>
                        </View>
                        <Text style={styles.userName}>{userData?.fullName || 'Loading...'}</Text>
                        <View style={[styles.roleChip, { backgroundColor: roleColor + '25', borderColor: roleColor + '50' }]}>
                            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
                            <Text style={[styles.roleChipText, { color: roleColor }]}>{roleLabel}</Text>
                        </View>
                    </View>

                    {/* Quick stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <TrendingUp size={18} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.statNum}>14</Text>
                            <Text style={styles.statLbl}>{t('totalSold')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Star size={18} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.statNum}>4.9</Text>
                            <Text style={styles.statLbl}>Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <MapPin size={18} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.statNum}>{userData?.district || 'LK'}</Text>
                            <Text style={styles.statLbl}>{t('district')}</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.body}>
                    {/* Personal Info */}
                    <Text style={styles.sectionLabel}>{t('personalInfo')}</Text>
                    <View style={styles.card}>
                        <MenuItem
                            icon={Mail}
                            label={t('email')}
                            value={userData?.email}
                            iconBg="rgba(59, 130, 246, 0.1)"
                            iconColor="#3B82F6"
                        />
                        <View style={styles.sep} />
                        <MenuItem
                            icon={Phone}
                            label={t('phoneNumber')}
                            value={userData?.phoneNumber || 'Not set'}
                            iconBg="rgba(16, 185, 129, 0.1)"
                            iconColor="#10B981"
                        />
                        <View style={styles.sep} />
                        <MenuItem
                            icon={Home}
                            label={t('address')}
                            value={userData?.address || 'Not set'}
                            iconBg="rgba(139, 92, 246, 0.1)"
                            iconColor="#8B5CF6"
                        />
                        <View style={styles.sep} />
                        <MenuItem
                            icon={CreditCard}
                            label={t('idNumber')}
                            value={userData?.idNumber || 'Not set'}
                            iconBg="rgba(30, 41, 59, 0.1)"
                            iconColor="#1E293B"
                        />
                        <View style={styles.sep} />
                        <MenuItem
                            icon={MapPin}
                            label={t('district')}
                            value={userData?.district || 'Not set'}
                            iconBg="rgba(245, 158, 11, 0.1)"
                            iconColor="#F59E0B"
                        />
                    </View>

                    {/* Preferences */}
                    <Text style={styles.sectionLabel}>{t('preferences')}</Text>
                    <View style={styles.card}>
                        <MenuItem
                            icon={Bell}
                            label={t('pushNotifications')}
                            isSwitch
                            switchValue={notificationsEnabled}
                            onSwitchChange={setNotificationsEnabled}
                            iconBg="rgba(139, 92, 246, 0.1)"
                            iconColor="#8B5CF6"
                        />
                        <View style={styles.sep} />
                        <MenuItem
                            icon={Languages}
                            label={t('language')}
                            value={i18n.language === 'en' ? '🇬🇧 English' : '🇱🇰 සිංහල'}
                            onPress={toggleLanguage}
                            iconBg="rgba(236, 72, 153, 0.1)"
                            iconColor="#EC4899"
                        />
                        <View style={styles.sep} />
                        <MenuItem
                            icon={Shield}
                            label={t('securityPrivacy')}
                            iconBg="rgba(245, 158, 11, 0.1)"
                            iconColor="#F59E0B"
                        />
                    </View>

                    {/* Logout */}
                    <Text style={styles.sectionLabel}>{t('settings')}</Text>
                    <View style={styles.card}>
                        <MenuItem
                            icon={LogOut}
                            label={t('signOut')}
                            onPress={handleLogout}
                            iconBg="rgba(239, 68, 68, 0.1)"
                            iconColor="#EF4444"
                            danger
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Gammiris.lk</Text>
                        <Text style={styles.versionText}>{t('version')} 1.0.0 • {t('madeInSL')} 🇱🇰</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    headerGradient: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
    },
    editBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarRingOuter: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        padding: 3,
        marginBottom: 14,
    },
    avatarRingInner: {
        flex: 1,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 30,
        fontWeight: '900',
        color: '#ffffff',
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 10,
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    roleDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    roleChipText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 10,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statNum: {
        fontSize: 18,
        fontWeight: '900',
        color: '#ffffff',
        marginTop: 4,
    },
    statLbl: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginVertical: 4,
    },
    body: {
        paddingHorizontal: 20,
        marginTop: -10,
        paddingTop: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 18,
    },
    menuIconBg: {
        width: 42,
        height: 42,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    menuValue: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
        fontWeight: '500',
    },
    sep: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 18,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    footerText: {
        fontSize: 15,
        fontWeight: '900',
        color: COLORS.primary,
        marginBottom: 4,
    },
    versionText: {
        fontSize: 11,
        color: '#94A3B8',
    },
});

export default ProfileScreen;
