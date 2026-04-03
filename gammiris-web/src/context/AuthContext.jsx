import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                
                // Real-time listener for user document in Firestore
                const userDocRef = doc(db, 'users', currentUser.uid);
                const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                });

                return () => unsubDoc();
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email, password, extraData) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = userCredential.user;

        // Update basic firebase profile
        if (extraData.fullName) {
            await updateProfile(userCredential.user, { displayName: extraData.fullName });
        }

        // Create firestore document (matching mobile app schema)
        await setDoc(doc(db, 'users', uid), {
            fullName: extraData.fullName || '',
            email: email.toLowerCase(),
            role: extraData.role || 'farmer',
            phoneNumber: extraData.phoneNumber || '',
            address: extraData.address || '',
            idNumber: extraData.idNumber || '',
            district: extraData.district || 'National',
            createdAt: new Date().toISOString(),
        });

        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        userData,
        loading,
        login,
        register,
        logout,
        isAdmin: userData?.role === 'admin',
        isFarmer: userData?.role === 'farmer',
        isAgent: userData?.role === 'agent'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
