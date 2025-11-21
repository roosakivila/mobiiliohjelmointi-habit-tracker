import { View, Text, StyleSheet } from 'react-native';

export default function BuddyProgressScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Buddy Progress</Text>
            <Text>Your buddy's progress will appear here</Text>
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