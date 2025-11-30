import { View, Text, Button, StyleSheet, Alert, ScrollView, Image, FlatList, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useState, useEffect } from 'react';
import { Camera, CameraView } from 'expo-camera';

//https://firebase.google.com/docs/firestore/query-data/listen
// https://www.youtube.com/watch?v=iShltk7YCfM

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [buddyInfo, setBuddyInfo] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [receivedCheers, setReceivedCheers] = useState([]);
    const [loadingCheers, setLoadingCheers] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);


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

    // Fetch received cheer messages
    useEffect(() => {
        if (!user?.uid) return;

        setLoadingCheers(true);

        const cheersQuery = query(
            collection(db, 'cheerMessages'),
            where('toUserId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(cheersQuery, async (snapshot) => {
            const cheers = [];
            let unread = 0;

            for (const docSnap of snapshot.docs) {
                const cheerData = docSnap.data();

                // Fetch sender info
                const senderDoc = await getDoc(doc(db, 'users', cheerData.fromUserId));
                const senderName = senderDoc.exists() ? senderDoc.data().displayName : 'Unknown';

                cheers.push({
                    id: docSnap.id,
                    ...cheerData,
                    senderName,
                });

                if (!cheerData.read) {
                    unread++;
                }
            }

            setReceivedCheers(cheers);
            setUnreadCount(unread);
            setLoadingCheers(false);
        }, (error) => {
            console.error('Error fetching cheers:', error);
            setLoadingCheers(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);


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

    const markCheerAsRead = async (cheerId) => {
        try {
            await updateDoc(doc(db, 'cheerMessages', cheerId), {
                read: true
            });
        } catch (error) {
            console.error('Error marking cheer as read:', error);
        }
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
        <ScrollView style={styles.scrollContainer}>
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

                {/* Received Cheers Section */}
                <View style={styles.cheersSection}>
                    <Text style={styles.sectionTitle}>
                        Received Cheers {unreadCount > 0 && `(${unreadCount} new)`}
                    </Text>

                    {loadingCheers ? (
                        <ActivityIndicator size="large" color="#0066cc" />
                    ) : receivedCheers.length === 0 ? (
                        <Text style={styles.emptyText}>No cheers yet! 😊</Text>
                    ) : (
                        <FlatList
                            data={receivedCheers}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <View style={[
                                    styles.cheerCard,
                                    !item.read && styles.cheerCardUnread
                                ]}>
                                    <View style={styles.cheerHeader}>
                                        <Text style={styles.cheerSender}>
                                            From: {item.senderName}
                                        </Text>
                                        {!item.read && (
                                            <View style={styles.unreadBadge}>
                                                <Text style={styles.unreadText}>NEW</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Image
                                        source={{ uri: item.gifUrl }}
                                        style={styles.cheerGif}
                                        resizeMode="cover"
                                    />

                                    <Text style={styles.cheerMessage}>{item.message}</Text>

                                    <Text style={styles.cheerDate}>
                                        {item.createdAt?.toDate().toLocaleDateString()}
                                    </Text>

                                    {!item.read && (
                                        <Button
                                            title="Mark as Read"
                                            onPress={() => markCheerAsRead(item.id)}
                                        />
                                    )}
                                </View>
                            )}
                        />
                    )}
                </View>

                <Button title="Logout" onPress={handleLogout} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
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
    // New styles for cheers section
    cheersSection: {
        width: '100%',
        marginVertical: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
        marginVertical: 20,
    },
    cheerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cheerCardUnread: {
        borderColor: '#0066cc',
        borderWidth: 2,
        backgroundColor: '#f0f8ff',
    },
    cheerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cheerSender: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    unreadBadge: {
        backgroundColor: '#ff3b30',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    unreadText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cheerGif: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginVertical: 10,
    },
    cheerMessage: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 10,
        fontWeight: '500',
    },
    cheerDate: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 8,
    },
});