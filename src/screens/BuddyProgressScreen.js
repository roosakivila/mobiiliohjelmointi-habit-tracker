import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { collection, getDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import HabitCard from '../components/HabitCard';
import { db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function BuddyProgressScreen({ navigation }) {

    const { user } = useAuth();
    const [buddyInfo, setBuddyInfo] = useState(null);
    const [buddyHabits, setBuddyHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch buddy's basic info
    useEffect(() => {
        const fetchBuddyInfo = async () => {
            if (user?.buddyId) {
                try {
                    const buddyDoc = await getDoc(doc(db, 'users', user.buddyId));
                    if (buddyDoc.exists()) {
                        setBuddyInfo(buddyDoc.data());
                    }
                } catch (error) {
                    console.error('Error fetching buddy info:', error);
                }
            }
            setLoading(false);
        };
        fetchBuddyInfo();
    }, [user?.buddyId]);

    // Fetch buddy's habits in real-time
    useEffect(() => {
        if (!user?.buddyId) {
            setLoading(false);
            return;
        }

        const habitsQuery = query(
            collection(db, 'habits'),
            where('userId', '==', user.buddyId)
        );

        const unsubscribe = onSnapshot(habitsQuery, (snapshot) => {
            const habits = [];
            snapshot.forEach((doc) => {
                habits.push({ id: doc.id, ...doc.data() });
            });
            setBuddyHabits(habits);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.buddyId]);

    // Loading state
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
            </View>
        );
    }

    // No buddy connected
    if (!user?.buddyId || !buddyInfo) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No Buddy Connected</Text>
                <Text style={styles.emptyText}>
                    Connect with a buddy to see their habits!
                </Text>
            </View>
        );
    }

    // Buddy has no habits
    if (buddyHabits.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.buddyName}>{buddyInfo.displayName}</Text>
                <Ionicons name="checkmark-done-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                    {buddyInfo.displayName} hasn't added any habits yet.
                </Text>
            </View>
        );
    }

    // Show buddy's habits
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.buddyName}>{buddyInfo.displayName}'s Habits</Text>
            </View>

            <FlatList
                data={buddyHabits}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <HabitCard
                        habit={item}
                        onToggle={() => { }}
                        readOnly={true}
                    />
                )}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    buddyName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0066cc',
        marginBottom: 4,
    },
    listContent: {
        padding: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});