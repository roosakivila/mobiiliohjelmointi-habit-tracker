import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {

    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Validator function
    const validateForm = () => {
        const newErrors = {};

        // Email validation 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation 
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        setErrors({});

        //Validate form
        if (!validateForm()) {
            return; // Stops if validation fails
        }

        setLoading(true);

        try {
            const result = await signIn(email, password);
            if (result.success) {
                console.log('Login successful');
            } else {
                Alert.alert('Login failed', result.error);
            }

        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
            console.error('Login error:', error);

        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <Ionicons name="checkmark-done-outline" size={64} color="#0066cc" style={styles.logo} />
            <Text style={styles.logoText}>Buddy Habit Tracker</Text>
            <Text style={styles.title}>Login</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={(text => {
                    setEmail(text);
                    if (errors.email) {
                        setErrors({ ...errors, email: null });
                    }
                })}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input,
                errors.email && styles.inputError]} />

            {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                        setErrors({ ...errors, password: null });
                    }
                }}
                secureTextEntry={true}
                style={[styles.input, errors.password && styles.inputError]} />

            {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
                <Button title="Login" onPress={handleLogin} />
            )}

            <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('Register')}
            >
                Don't have an account? Sign up
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    logo: {
        alignSelf: 'center',
        marginBottom: 5,
    },
    logoText: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#0066cc',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 5,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#ff0000',
        borderWidth: 2,
    },
    errorText: {
        color: '#ff0000',
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 5,
    },
    loader: {
        marginVertical: 10,
    },
    linkText: {
        marginTop: 20,
        color: '#0066cc',
        textAlign: 'center',
        fontSize: 14,
    },
});