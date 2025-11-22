import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useState, useEffect } from 'react';
import { Camera, CameraView } from 'expo-camera';

// https://www.youtube.com/watch?v=iShltk7YCfM

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [buddyInfo, setBuddyInfo] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scanned, setScanned] = useState(false);


    useEffect(() => {
        const requestCameraPermission = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        requestCameraPermission();
    }, []);

    // Fetch buddy info when buddyId changes
    useEffect(() => {
        const fetchBuddyInfo = async () => {
            if (user?.buddyId) {
                try {
                    const buddyDocRef = doc(db, 'users', user.buddyId);
                    const buddyDoc = await getDoc(buddyDocRef);
                    if (buddyDoc.exists()) {
                        setBuddyInfo(buddyDoc.data());
                    }
                } catch (error) {
                    console.error('Error fetching buddy:', error);
                }
            } else {
                setBuddyInfo(null);
            }
        };
        fetchBuddyInfo();
    }, [user?.buddyId]);


    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        setShowScanner(false);

        try {
            const scannedUid = data;

            if (scannedUid === user.uid) {
                Alert.alert('Error', 'You cannot connect with yourself!');
                return;
            }

            if (user.buddyId) {
                Alert.alert(
                    'Already Connected',
                    'You already have a buddy. Disconnect first to add a new one.'
                );
                return;
            }

            //Check if the scanned UID exists in Firestore
            const scannedUserRef = doc(db, 'users', scannedUid);
            const scannedUserDoc = await getDoc(scannedUserRef);

            if (!scannedUserDoc.exists()) {
                Alert.alert('Invalid QR Code', 'This user does not exist.');
                return;
            }

            // Check if the scanned user already has a buddy
            const scannedUserData = scannedUserDoc.data();
            if (scannedUserData.buddyId) {
                Alert.alert(
                    'Already Connected',
                    `${scannedUserData.displayName} already has a buddy.`
                );
                return;
            }

            // Update current user's buddyId
            await updateDoc(doc(db, 'users', user.uid), {
                buddyId: scannedUid
            });

            // Update scanned user's buddyId
            await updateDoc(doc(db, 'users', scannedUid), {
                buddyId: user.uid
            });

            // Set the buddy info to update UI immediately
            setBuddyInfo(scannedUserData);

            //Update local user object
            user.buddyId = scannedUid;

            Alert.alert(
                'Success! 🎉',
                `You are now connected with ${scannedUserData.displayName}!`,
                [{ text: 'OK' }]
            );

            console.log('Successfully connected with buddy:', scannedUserData.displayName);

        } catch (error) {
            console.error('Error connecting with buddy:', error);
            Alert.alert(
                'Connection Failed',
                'Failed to connect with buddy. Please try again.'
            );
        }
    };

    const openScanner = () => {
        if (hasPermission === null) {
            Alert.alert('Permission', 'Requesting camera permission...');
            return;
        }
        if (hasPermission === false) {
            Alert.alert('No Access', 'Camera permission denied');
            return;
        }
        setShowScanner(true);
        setScanned(false);
    };

    const handleLogout = async () => {
        await logout();
    };

    const handleDisconnectBuddy = async () => {
        Alert.alert(
            'Disconnect Buddy?',
            'Are you sure you want to disconnect from your buddy?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const buddyUid = user.buddyId;

                            if (!buddyUid) {
                                Alert.alert('Error', 'No buddy connected');
                                return;
                            }

                            await updateDoc(doc(db, 'users', user.uid), {
                                buddyId: null
                            });

                            // Update buddy's buddyId to null
                            await updateDoc(doc(db, 'users', buddyUid), {
                                buddyId: null
                            });

                            // Update local state immediately
                            setBuddyInfo(null);
                            user.buddyId = null;

                            Alert.alert('Success! 🎉', 'You have disconnected your buddy.');
                            console.log('Successfully disconnected buddy');

                        } catch (error) {
                            console.error('Error disconnecting buddy:', error);
                            Alert.alert(
                                'Disconnect Failed',
                                'Failed to disconnect buddy. Please try again.'
                            );
                        }
                    }
                }
            ]
        );
    };

    if (showScanner) {
        return (
            <View style={styles.container}>
                <CameraView
                    style={styles.camera}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                >
                    <View style={styles.overlay}>
                        <Text style={styles.overlayText}>
                            Point camera at buddy's QR code
                        </Text>
                        <Button
                            title="Cancel"
                            onPress={() => setShowScanner(false)}
                        />
                    </View>
                </CameraView>
            </View>
        );
    }

    // Normal profile view
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.info}>Name: {user?.displayName}</Text>
            <Text style={styles.info}>Email: {user?.email}</Text>

            {/* My QR Code */}
            <View style={styles.qrSection}>
                <Text style={styles.sectionTitle}>My Buddy Code</Text>
                <QRCode
                    value={user.uid}
                    size={200}
                />
            </View>

            {/* Buddy Connection Status */}
            {buddyInfo ? (
                <View style={styles.buddySection}>
                    <Text style={styles.sectionTitle}>My Buddy:</Text>
                    <Text style={styles.buddyName}>{buddyInfo.displayName}</Text>
                    <Button title="Disconnect Buddy" onPress={() => handleDisconnectBuddy()} />
                </View>
            ) : (
                <View style={styles.buddySection}>
                    <Text>No buddy connected</Text>
                    <Button title="Scan Buddy's QR Code" onPress={openScanner} />
                </View>
            )}

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
        backgroundColor: '#f5f5f5',
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
    qrSection: {
        alignItems: 'center',
        marginVertical: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    buddySection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    buddyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0066cc',
        marginBottom: 10,
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
        padding: 20,
    },
    overlayText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
        fontWeight: 'bold',
    },
});