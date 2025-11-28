import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CheerButton({ buddyId }) {

    const navigation = useNavigation();

    const handleCheer = () => {
        navigation.navigate('CheerMessageScreen', {
            buddyId
        });
    };

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handleCheer}
        >
            <Text style={styles.buttonText}>Send Cheer</Text>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    button: {
        backgroundColor: '#0066cc',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
