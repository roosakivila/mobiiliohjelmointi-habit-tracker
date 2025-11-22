import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HabitCard({ habit, onToggle, readOnly = false }) {
    // Check if habit is completed today
    const isCompletedToday = () => {
        const today = new Date().toISOString().split('T')[0];

        if (!habit.completions || habit.completions.length === 0) {
            return false;
        }

        // Find today's completion record
        const todayCompletion = habit.completions.find(
            comp => comp.date === today
        );

        return todayCompletion ? todayCompletion.completed : false;
    };

    // Calculate current streak
    const calculateStreak = () => {
        if (!habit.completions || habit.completions.length === 0) {
            return 0;
        }

        // Sort completions by date (newest first)
        const sorted = [...habit.completions].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        let streak = 0;
        const today = new Date();

        // Count consecutive days from today backwards
        for (let i = 0; i < sorted.length; i++) {
            const compDate = new Date(sorted[i].date);
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            if (sorted[i].completed &&
                compDate.toISOString().split('T')[0] ===
                expectedDate.toISOString().split('T')[0]) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const completed = isCompletedToday();
    const streak = calculateStreak();

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { borderLeftColor: habit.color || '#4CAF50' }
            ]}
            onPress={() => !readOnly && onToggle(habit.id, completed)}
            disabled={readOnly}
        >
            <View style={styles.cardContent}>
                {/* Checkbox */}
                <View style={styles.checkbox}>
                    {completed ? (
                        <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                    ) : (
                        <Ionicons name="ellipse-outline" size={32} color="#ccc" />
                    )}
                </View>

                {/* Habit Info */}
                <View style={styles.habitInfo}>
                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    {habit.description && (
                        <Text style={styles.habitDescription}>{habit.description}</Text>
                    )}
                    <Text style={styles.habitFrequency}>
                        {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                    </Text>
                </View>

                {/* Streak */}
                <View style={styles.streakContainer}>
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <Text style={styles.streakLabel}>day{streak !== 1 ? 's' : ''}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        marginRight: 12,
    },
    habitInfo: {
        flex: 1,
    },
    habitTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    habitDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    habitFrequency: {
        fontSize: 12,
        color: '#999',
        textTransform: 'capitalize',
    },
    streakContainer: {
        alignItems: 'center',
        paddingLeft: 12,
        borderLeftWidth: 1,
        borderLeftColor: '#eee',
    },
    streakNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    streakLabel: {
        fontSize: 12,
        color: '#999',
    },
});