import React, { useEffect, useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import './src/localization/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the native splash visible until we've finished initializing
ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Any app initialization (fonts, assets, warm-up, etc.) goes here
        // For now just a tiny delay so the green background shows instead of a flash
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      // Hide the native splash — our custom SplashScreen takes over from here
      await ExpoSplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    // Keep the native splash visible while we are not ready
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container} onLayout={onLayoutRootView}>
          <AppNavigator />
          <StatusBar style="light" translucent backgroundColor="transparent" />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D5A27', // Matches splash so there is zero visual flash
  },
});
