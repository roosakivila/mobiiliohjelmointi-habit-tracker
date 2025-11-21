import { View, Text, StyleSheet } from 'react-native';

export default function HabitListScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Habits</Text>
            <Text>Habit list will appear here</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});