import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const COLORS = [
    '#4CAF50', '#2196F3', '#FF9800', '#E91E63',
    '#9C27B0', '#00BCD4', '#FF5722', '#607D80'
];

const WEEKDAYS = [
    { name: 'Sun', value: 0 },
    { name: 'Mon', value: 1 },
    { name: 'Tue', value: 2 },
    { name: 'Wed', value: 3 },
    { name: 'Thu', value: 4 },
    { name: 'Fri', value: 5 },
    { name: 'Sat', value: 6 },
];

export default function AddHabitScreen({ navigation }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [customDays, setCustomDays] = useState([]);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [loading, setLoading] = useState(false);

    // Toggle weekday selection
    const toggleDay = (dayValue) => {
        if (customDays.includes(dayValue)) {
            setCustomDays(customDays.filter(d => d !== dayValue));
        } else {
            setCustomDays([...customDays, dayValue].sort());
        }
    };

    // Validate and save habit
    const handleSaveHabit = async () => {

        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a habit title');
            return;
        }

        if (frequency === 'custom' && customDays.length === 0) {
            Alert.alert('Error', 'Please select at least one day');
            return;
        }

        setLoading(true);

        try {
            const newHabit = {
                userId: user.uid,
                title: title.trim(),
                description: description.trim(),
                frequency: frequency,
                customDays: frequency === 'custom' ? customDays : [],
                completions: [],
                createdAt: new Date(),
                color: selectedColor
            };

            // Add to Firestore
            await addDoc(collection(db, 'habits'), newHabit);

            Alert.alert('Success', 'Habit created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error('Error creating habit:', error);
            Alert.alert('Error', 'Failed to create habit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Title Input */}
                <Text style={styles.label}>Habit Title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Exercise, Read, Meditate"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={50}
                />

                {/* Description Input */}
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add some details..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                />

                {/* Frequency Selector */}
                <Text style={styles.label}>Frequency *</Text>
                <View style={styles.frequencyContainer}>
                    <TouchableOpacity
                        style={[
                            styles.frequencyButton,
                            frequency === 'daily' && styles.frequencyButtonActive
                        ]}
                        onPress={() => setFrequency('daily')}
                    >
                        <Text style={[
                            styles.frequencyText,
                            frequency === 'daily' && styles.frequencyTextActive
                        ]}>
                            Daily
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.frequencyButton,
                            frequency === 'weekly' && styles.frequencyButtonActive
                        ]}
                        onPress={() => setFrequency('weekly')}
                    >
                        <Text style={[
                            styles.frequencyText,
                            frequency === 'weekly' && styles.frequencyTextActive
                        ]}>
                            Weekly
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.frequencyButton,
                            frequency === 'custom' && styles.frequencyButtonActive
                        ]}
                        onPress={() => setFrequency('custom')}
                    >
                        <Text style={[
                            styles.frequencyText,
                            frequency === 'custom' && styles.frequencyTextActive
                        ]}>
                            Custom
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Custom Days Selector (only shown if custom is selected) */}
                {frequency === 'custom' && (
                    <>
                        <Text style={styles.label}>Select Days</Text>
                        <View style={styles.daysContainer}>
                            {WEEKDAYS.map((day) => (
                                <TouchableOpacity
                                    key={day.value}
                                    style={[
                                        styles.dayButton,
                                        customDays.includes(day.value) && styles.dayButtonActive
                                    ]}
                                    onPress={() => toggleDay(day.value)}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        customDays.includes(day.value) && styles.dayTextActive
                                    ]}>
                                        {day.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* Color Picker */}
                <Text style={styles.label}>Color</Text>
                <View style={styles.colorContainer}>
                    {COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorButton,
                                { backgroundColor: color },
                                selectedColor === color && styles.colorButtonActive
                            ]}
                            onPress={() => setSelectedColor(color)}
                        />
                    ))}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSaveHabit}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? 'Creating...' : 'Create Habit'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    frequencyContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    frequencyButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    frequencyButtonActive: {
        borderColor: '#0066cc',
        backgroundColor: '#E3F2FD',
    },
    frequencyText: {
        fontSize: 16,
        color: '#666',
    },
    frequencyTextActive: {
        color: '#0066cc',
        fontWeight: 'bold',
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    dayButtonActive: {
        borderColor: '#0066cc',
        backgroundColor: '#E3F2FD',
    },
    dayText: {
        fontSize: 14,
        color: '#666',
    },
    dayTextActive: {
        color: '#0066cc',
        fontWeight: 'bold',
    },
    colorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorButtonActive: {
        borderColor: '#333',
        borderWidth: 3,
    },
    saveButton: {
        backgroundColor: '#0066cc',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 20,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});