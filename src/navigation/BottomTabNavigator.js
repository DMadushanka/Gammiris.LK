import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';
import { Home, User, BarChart2, Truck, Leaf, Store } from 'lucide-react-native';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import PlantMarketplaceScreen from '../screens/marketplace/PlantMarketplaceScreen';
import AgentHomeScreen from '../screens/agent/AgentHomeScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageSellersScreen from '../screens/admin/ManageSellersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnimatedTabBar from './AnimatedTabBar';

const Tab = createBottomTabNavigator();

export const FarmerTabs = () => {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            tabBar={props => <AnimatedTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="FarmerHome"
                component={FarmerHomeScreen}
                options={{
                    title: t('home'),
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Marketplace"
                component={PlantMarketplaceScreen}
                options={{
                    title: t('market'),
                    tabBarIcon: ({ color, size }) => <Leaf size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: t('profile'),
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};

export const AgentTabs = () => {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            tabBar={props => <AnimatedTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="AgentHome"
                component={AgentHomeScreen}
                options={{
                    title: t('pickups'),
                    tabBarIcon: ({ color, size }) => <Truck size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="AgentProfile"
                component={ProfileScreen}
                options={{
                    title: t('profile'),
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};

export const AdminTabs = () => {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            tabBar={props => <AnimatedTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="AdminDashboard"
                component={AdminDashboard}
                options={{
                    title: t('dashboard'),
                    tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="AdminSellers"
                component={ManageSellersScreen}
                options={{
                    title: t('sellers'),
                    tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="AdminProfile"
                component={ProfileScreen}
                options={{
                    title: t('profile'),
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};
