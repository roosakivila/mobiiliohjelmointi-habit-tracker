import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import HabitCard from '../components/HabitCard';
import { Ionicons } from '@expo/vector-icons';

export default function HabitListScreen({ navigation }) {
    const { user } = useAuth();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Real-time listener for user's habits
    useEffect(() => {
        if (!user) return;

        // Query to get only current user's habits
        const habitsQuery = query(
            collection(db, 'habits'),
            where('userId', '==', user.uid)
        );

        // Real-time listener using onSnapshot
        const unsubscribe = onSnapshot(habitsQuery, (snapshot) => {
            const habitsData = [];

            snapshot.forEach((doc) => {
                habitsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            setHabits(habitsData);
            setLoading(false);
            setRefreshing(false);
        }, (error) => {
            console.error('Error fetching habits:', error);
            setLoading(false);
            setRefreshing(false);
        });

        // Cleanup listener when component unmounts
        return () => unsubscribe();
    }, [user]);

    // Toggling habit completion
    const handleToggleHabit = async (habitId, currentlyCompleted) => {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Find the habit
            const habit = habits.find(h => h.id === habitId);
            if (!habit) return;

            // Create new completions array
            let updatedCompletions = habit.completions || [];

            // Check if there's already a record for today
            const todayIndex = updatedCompletions.findIndex(
                comp => comp.date === today
            );

            if (todayIndex >= 0) {
                // Update existing record
                updatedCompletions[todayIndex] = {
                    date: today,
                    completed: !currentlyCompleted
                };
            } else {
                // Add new record
                updatedCompletions.push({
                    date: today,
                    completed: true
                });
            }

            // Update Firestore
            const habitRef = doc(db, 'habits', habitId);
            await updateDoc(habitRef, {
                completions: updatedCompletions
            });


        } catch (error) {
            console.error('Error toggling habit:', error);
            alert('Failed to update habit');
        }
    };

    // Pull-to-refresh
    const onRefresh = () => {
        setRefreshing(true);
        // The onSnapshot listener will automatically refresh the data
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Loading habits...</Text>
            </View>
        );
    }

    // Empty state
    if (habits.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="checkmark-done-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No Habits Yet</Text>
                <Text style={styles.emptyText}>
                    Start building better habits by adding your first one!
                </Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddHabit')}
                >
                    <Text style={styles.addButtonText}>Add Your First Habit</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Main list view
    return (
        <View style={styles.container}>
            {/* Header with date */}
            <View style={styles.header}>
                <Text style={styles.dateText}>
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Text>
            </View>

            {/* Habits List */}
            <FlatList
                data={habits}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <HabitCard
                        habit={item}
                        onToggle={handleToggleHabit}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0066cc']}
                    />
                }
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
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    listContent: {
        padding: 16,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
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
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    addButton: {
        backgroundColor: '#0066cc',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});