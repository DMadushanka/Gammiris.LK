import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import {
    Bell,
    ChevronLeft,
    Trash2,
    CheckCircle2,
    MessageSquare,
    TrendingUp,
    Info,
    Inbox
} from 'lucide-react-native';
import { auth, db } from '../services/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc
} from 'firebase/firestore';

const { width } = Dimensions.get('window');

const NotificationScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        // Listen for user's notifications
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const markAsRead = async (id) => {
        try {
            await updateDoc(doc(db, 'notifications', id), {
                read: true
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await deleteDoc(doc(db, 'notifications', id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'price_update': return <TrendingUp size={20} color="#10B981" />;
            case 'sale_verification': return <CheckCircle2 size={20} color="#3B82F6" />;
            case 'message': return <MessageSquare size={20} color="#8B5CF6" />;
            default: return <Info size={20} color="#64748B" />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'price_update': return '#F0FDF4';
            case 'sale_verification': return '#EFF6FF';
            case 'message': return '#F5F3FF';
            default: return '#F8FAFC';
        }
    };

    const formatTime = (ts) => {
        if (!ts) return 'Just now';
        const date = ts?.toDate ? ts.toDate() : new Date(ts);
        const diff = (new Date() - date) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notifCard, !item.read && styles.unreadCard]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconBg, { backgroundColor: getIconBg(item.type) }]}>
                {getIcon(item.type)}
            </View>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.bodyText} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteNotification(item.id)}
            >
                <Trash2 size={18} color="#CBD5E1" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <LinearGradient
                colors={[COLORS.primary, '#1B4316', '#0F2A0C']}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerInner}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.body}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : notifications.length > 0 ? (
                    <FlatList
                        data={notifications}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.center}>
                        <View style={styles.emptyIconBg}>
                            <Inbox size={48} color="#94A3B8" />
                        </View>
                        <Text style={styles.emptyTitle}>Your inbox is empty</Text>
                        <Text style={styles.emptySub}>We will notify you when something important happens.</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    body: { flex: 1 },
    listContent: { padding: 20, paddingBottom: 40 },
    notifCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    unreadCard: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: { flex: 1 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    unreadTitle: {
        color: COLORS.primary,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    bodyText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    timeText: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 6,
        fontWeight: '600',
    },
    deleteBtn: {
        padding: 8,
        marginLeft: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#334155',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default NotificationScreen;
