import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const PENDING_SYNC_KEY = '@pending_sync_requests';

export const useOfflineSync = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    const saveOffline = async (data) => {
        try {
            const existing = await AsyncStorage.getItem(PENDING_SYNC_KEY);
            const pending = existing ? JSON.parse(existing) : [];
            pending.push(data);
            await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
        } catch (error) {
            console.error('Failed to save offline:', error);
        }
    };

    const syncData = async () => {
        setIsSyncing(true);
        try {
            const existing = await AsyncStorage.getItem(PENDING_SYNC_KEY);
            if (existing) {
                const pending = JSON.parse(existing);
                for (const item of pending) {
                    // Logic to upload to Firestore
                    // await addDoc(collection(db, 'saleRequests'), item);
                    console.log('Syncing item:', item);
                }
                await AsyncStorage.removeItem(PENDING_SYNC_KEY);
            }
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    return { saveOffline, syncData, isSyncing };
};
