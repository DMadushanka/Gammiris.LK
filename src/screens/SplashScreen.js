import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    // --- Animation values ---
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const ringScale = useRef(new Animated.Value(0.6)).current;
    const ringOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textY = useRef(new Animated.Value(30)).current;
    const barWidth = useRef(new Animated.Value(0)).current;
    const tagOpacity = useRef(new Animated.Value(0)).current;

    // Pulse loop for the ring
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // 1) Logo pop-in
        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                damping: 12,
                stiffness: 100,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // 2) Ring bloom a tick after the logo
        setTimeout(() => {
            Animated.parallel([
                Animated.spring(ringScale, {
                    toValue: 1,
                    damping: 10,
                    stiffness: 80,
                    useNativeDriver: true,
                }),
                Animated.timing(ringOpacity, {
                    toValue: 0.4,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Looping ring pulse
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 1.12,
                            duration: 1000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 1000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            });
        }, 200);

        // 3) Text + tagline rise up
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(textY, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.back(1.5)),
                    useNativeDriver: true,
                }),
            ]).start();
        }, 500);

        // 4) Tagline after text
        setTimeout(() => {
            Animated.timing(tagOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, 800);

        // 5) Loading bar sweeps across
        setTimeout(() => {
            Animated.timing(barWidth, {
                toValue: width * 0.6,
                duration: 1600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false, // width animation can't use native driver
            }).start();
        }, 900);

        // 6) Navigate to Login
        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <LinearGradient
            colors={[COLORS.primary, '#1B4316', '#0F2A0C']}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Decorative background circles */}
            <View style={styles.circleLarge} />
            <View style={styles.circleSmall} />
            <View style={styles.circleBottom} />

            {/* Pulsing ring behind logo */}
            <Animated.View
                style={[
                    styles.ring,
                    {
                        opacity: ringOpacity,
                        transform: [
                            { scale: Animated.multiply(ringScale, pulseAnim) }
                        ],
                    },
                ]}
            />

            {/* Logo */}
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
            >
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Brand text */}
            <Animated.View
                style={{
                    opacity: textOpacity,
                    transform: [{ translateY: textY }],
                    alignItems: 'center',
                    marginTop: 28,
                }}
            >
                <Text style={styles.brandText}>Gammiris.lk</Text>
            </Animated.View>

            {/* Tagline */}
            <Animated.View style={{ opacity: tagOpacity, alignItems: 'center', marginTop: 8 }}>
                <Text style={styles.tagline}>Sri Lanka's Pepper Market Platform</Text>
            </Animated.View>

            {/* Loading bar */}
            <View style={styles.barTrack}>
                <Animated.View
                    style={[
                        styles.barFill,
                        { width: barWidth },
                    ]}
                />
            </View>

            {/* Footer */}
            <Animated.Text style={[styles.footer, { opacity: tagOpacity }]}>
                Empowering Farmers Across Sri Lanka 🌿
            </Animated.Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Decorative bg blobs
    circleLarge: {
        position: 'absolute',
        width: 360,
        height: 360,
        borderRadius: 180,
        backgroundColor: 'rgba(255,255,255,0.04)',
        top: -120,
        right: -100,
    },
    circleSmall: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.04)',
        top: 80,
        left: -80,
    },
    circleBottom: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(255,255,255,0.03)',
        bottom: -100,
        left: -60,
    },
    // Pulse ring
    ring: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 2.5,
        borderColor: 'rgba(255,255,255,0.6)',
        backgroundColor: 'transparent',
    },
    // Logo container
    logoContainer: {
        width: 130,
        height: 130,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
        overflow: 'hidden',
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 32,
    },
    brandText: {
        fontSize: 34,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.65)',
        fontWeight: '500',
    },
    // Progress bar
    barTrack: {
        width: width * 0.6,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        marginTop: 48,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 48,
        fontSize: 12,
        color: 'rgba(255,255,255,0.45)',
        fontWeight: '500',
    },
});

export default SplashScreen;
