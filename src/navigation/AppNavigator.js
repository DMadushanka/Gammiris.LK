import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { FarmerTabs, AgentTabs, AdminTabs } from './BottomTabNavigator';
import SellerRegistrationScreen from '../screens/marketplace/SellerRegistrationScreen';
import PlantDetailsScreen from '../screens/marketplace/PlantDetailsScreen';
import SellerDashboardScreen from '../screens/marketplace/SellerDashboardScreen';
import GrowthTrackerScreen from '../screens/marketplace/GrowthTrackerScreen';
import ManageSellersScreen from '../screens/admin/ManageSellersScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    // Logic to determine initial route based on auth and role
    // For demonstration, we'll start with Login
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="FarmerTabs" component={FarmerTabs} />
                <Stack.Screen name="AgentTabs" component={AgentTabs} />
                <Stack.Screen name="AdminTabs" component={AdminTabs} />
                <Stack.Screen name="Notifications" component={NotificationScreen} />

                {/* Marketplace Screens */}
                <Stack.Screen name="SellerRegistration" component={SellerRegistrationScreen} />
                <Stack.Screen name="PlantDetails" component={PlantDetailsScreen} />
                <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
                <Stack.Screen name="GrowthTracker" component={GrowthTrackerScreen} />
                <Stack.Screen name="ManageSellers" component={ManageSellersScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
