import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// This creates a "container" for our auth data
const AuthContext = createContext({});

// This wraps our app and makes auth data available everywhere
export const AuthProvider = ({ children }) => {
    // State to store the current user
    const [user, setUser] = useState(null);

    // State to track if we're still checking authentication status
    const [loading, setLoading] = useState(true);

    // State for error messages
    const [error, setError] = useState(null);

    // This runs when the component mounts and listens for auth changes
    useEffect(() => {
        // onAuthStateChanged is a Firebase listener that watches for auth changes
        // It fires whenever the user logs in, logs out, or when the app first loads
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                // Fetch additional user data from Firestore
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        // Combine Firebase Auth data with Firestore data
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...userDoc.data() // displayName, buddyId, etc.
                        });
                    } else {
                        // User exists in Auth but not in Firestore (shouldn't happen)
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email
                        });
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    setError(err.message);
                }
            } else {
                // User is signed out
                setUser(null);
            }

            // Done checking authentication status
            setLoading(false);
        });

        // Cleanup function - unsubscribe when component unmounts
        return unsubscribe;
    }, []);

    // Sign Up Function
    const signUp = async (email, password, displayName) => {
        try {
            setError(null);
            setLoading(true);

            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const firebaseUser = userCredential.user;

            // Create user document in Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                displayName: displayName,
                email: email,
                buddyId: null,
                createdAt: new Date(),
                pushToken: null
            });

            // The onAuthStateChanged listener will automatically update the user state
            return { success: true };

        } catch (err) {
            console.error('Sign up error:', err);
            setError(err.message);

            // Return user-friendly error messages
            let errorMessage = 'Failed to create account';
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            }

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Sign In Function
    const signIn = async (email, password) => {
        try {
            setError(null);
            setLoading(true);

            // Sign in with Firebase Authentication
            await signInWithEmailAndPassword(auth, email, password);

            // The onAuthStateChanged listener will automatically update the user state
            return { success: true };

        } catch (err) {
            console.error('Sign in error:', err);
            setError(err.message);

            // Return user-friendly error messages
            let errorMessage = 'Failed to sign in';
            if (err.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (err.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (err.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password';
            }

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Sign Out Function
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
            // The onAuthStateChanged listener will automatically set user to null
            return { success: true };
        } catch (err) {
            console.error('Sign out error:', err);
            setError(err.message);
            return { success: false, error: 'Failed to sign out' };
        }
    };

    // The value object
    // This is what components will access when they use the context
    const value = {
        user,           // Current user object or null
        loading,        // Boolean: true while checking auth status
        error,          // Error message string or null
        signUp,         // Function to create new account
        signIn,         // Function to sign in
        logout          // Function to sign out
    };

    // This makes all the values available to child components
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;