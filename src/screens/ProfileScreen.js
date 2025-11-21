import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.info}>Name: {user?.displayName}</Text>
            <Text style={styles.info}>Email: {user?.email}</Text>
            <Button title="Logout" onPress={handleLogout} />
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
    info: {
        fontSize: 16,
        marginBottom: 10,
    },
});