import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const tabWidth = (width - 40) / state.routes.length;
    const translateX = useSharedValue(0);

    useEffect(() => {
        translateX.value = withSpring(state.index * tabWidth, {
            damping: 15,
            stiffness: 100,
        });
    }, [state.index, tabWidth]);

    const indicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.content}>
                <Animated.View style={[styles.indicator, { width: tabWidth }, indicatorStyle]} />
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabItem}
                        >
                            <TabIcon
                                options={options}
                                isFocused={isFocused}
                                color={isFocused ? COLORS.white : COLORS.textSecondary}
                            />
                            <Animated.Text style={[
                                styles.label,
                                { color: isFocused ? COLORS.white : COLORS.textSecondary }
                            ]}>
                                {label}
                            </Animated.Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const TabIcon = ({ options, isFocused, color }) => {
    const scale = useSharedValue(isFocused ? 1.2 : 1);

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1.2 : 1);
    }, [isFocused]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            {options.tabBarIcon({ color, size: 24 })}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: -10,
        width: '100%',
        backgroundColor: 'transparent',
        paddingHorizontal:20,
    },
    content: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 30,
        height: 55,
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    indicator: {
        position: 'absolute',
        height: 48,
        backgroundColor: '#E6A23C', // Gammiris Gold Accent
        borderRadius: 25,
        marginHorizontal: 0,
        left: 0,
        zIndex: -1,
        shadowColor: '#E6A23C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '900', // Making it pro-black
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default AnimatedTabBar;
