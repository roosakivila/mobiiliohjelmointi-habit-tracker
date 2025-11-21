import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function RegisterScreen({ navigation }) {

    const { signUp } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Validator function
    const validateForm = () => {
        const newErrors = {};

        // Display name validation
        if (!displayName.trim()) {
            newErrors.displayName = 'Display name is required';
        } else if (displayName.trim().length < 2) {
            newErrors.displayName = 'Display name must be at least 2 characters';
        } else if (displayName.trim().length > 30) {
            newErrors.displayName = 'Display name must be less than 30 characters';
        }

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
        } else if (password.length > 50) {
            newErrors.password = 'Password must be less than 50 characters';
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        setErrors({});

        //Validate form
        if (!validateForm()) {
            return; // Stops if validation fails
        }

        setLoading(true);

        try {
            const result = await signUp(email, password, displayName.trim());
            if (result.success) {
                console.log('Register successful');
            } else {
                Alert.alert('Register failed', result.error);
            }

        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
            console.error('Register error:', error);

        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            {/* Display Name Input */}
            <TextInput
                placeholder="Display Name"
                value={displayName}
                onChangeText={(text) => {
                    setDisplayName(text);
                    if (errors.displayName) {
                        setErrors({ ...errors, displayName: null });
                    }
                }}
                autoCapitalize="words"
                autoCorrect={false}
                style={[
                    styles.input,
                    errors.displayName && styles.inputError
                ]}
            />
            {errors.displayName && (
                <Text style={styles.errorText}>{errors.displayName}</Text>
            )}

            {/* Email Input */}
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
                autoCorrect={false}
                style={[styles.input,
                errors.email && styles.inputError]} />

            {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Password Input */}
            <TextInput
                placeholder="Password (min 6 characters)"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                        setErrors({ ...errors, password: null });
                    }
                }}
                secureTextEntry={true}
                autoCapitalize="none"
                style={[styles.input, errors.password && styles.inputError]} />

            {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password Input */}
            <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: null });
                    }
                }}
                secureTextEntry={true}
                autoCapitalize="none"
                style={[
                    styles.input,
                    errors.confirmPassword && styles.inputError
                ]}
            />
            {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
                <Button title="Register" onPress={handleRegister} />
            )}

            <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('Login')}
            >
                Already have an account? Sign in
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
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