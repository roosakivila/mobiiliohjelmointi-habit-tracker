import { View, TextInput, Button, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { searchGifs } from "../services/giphyService";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function CheerMessageScreen({ route, navigation }) {

    const { buddyId } = route.params;
    const { user } = useAuth();

    const predefinedMessages = [
        "Great job! 🎉",
        "Keep it up! 💪",
        "You're doing amazing! ⭐",
        "So proud of you! 🌟",
        "You're crushing it! 🔥",
        "Stay strong! 💯",
    ];

    const [query, setQuery] = useState('');
    const [gifs, setGifs] = useState([]);
    const [selectedGif, setSelectedGif] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [customMessage, setCustomMessage] = useState('');

    const fetchCheerGif = async () => {
        try {
            setLoading(true);
            const giphyResponse = await searchGifs(query);
            setGifs(giphyResponse);
        } catch (error) {
            console.error('Error fetching cheer gif:', error);
            Alert.alert('Error', 'Failed to fetch GIFs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendCheer = async () => {

        if (!selectedGif) {
            Alert.alert('Missing GIF', 'Please select a GIF first!');
            return;
        }

        const finalMessage = customMessage.trim() || message;
        if (!finalMessage) {
            Alert.alert('Missing Message', 'Please select or write a message!');
            return;
        }

        try {
            setSending(true);

            // Create cheer message in Firestore
            await addDoc(collection(db, 'cheerMessages'), {
                fromUserId: user.uid,
                toUserId: buddyId,
                message: finalMessage,
                gifUrl: selectedGif.images.fixed_width.url,
                createdAt: serverTimestamp(),
                read: false,
            });

            Alert.alert(
                'Success!',
                'Your cheer has been sent! 🎉',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    }
                ]
            );
        } catch (error) {
            console.error('Error sending cheer:', error);
            Alert.alert('Error', 'Failed to send cheer. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Send a cheer to your buddy!</Text>

            {/* GIF Search Section */}
            <Text style={styles.sectionTitle}>1. Search & Select a GIF</Text>
            <TextInput
                style={styles.input}
                placeholder="Search GIF"
                value={query}
                onChangeText={text => setQuery(text)}
                onSubmitEditing={fetchCheerGif}
            />
            <Button title="Search" onPress={fetchCheerGif} disabled={loading || !query} />

            {loading && <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 20 }} />}

            <FlatList
                data={gifs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.gifContainer}
                        onPress={() => setSelectedGif(item)}
                    >
                        <Image
                            source={{ uri: item.images.fixed_width.url }}
                            style={styles.gif}
                            resizeMode="cover"
                        />
                        {selectedGif?.id === item.id && (
                            <View style={styles.selectedOverlay}>
                                <Text style={styles.checkmark}>✓</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                numColumns={2}
                contentContainerStyle={styles.gifList}
                scrollEnabled={false}
            />

            {/* Message Selection Section */}
            <Text style={styles.sectionTitle}>2. Choose Your Message</Text>
            <View style={styles.messageContainer}>
                {predefinedMessages.map((msg, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.messageButton,
                            message === msg && !customMessage && styles.messageButtonSelected
                        ]}
                        onPress={() => {
                            setMessage(msg);
                            setCustomMessage('');
                        }}
                    >
                        <Text style={[
                            styles.messageButtonText,
                            message === msg && !customMessage && styles.messageButtonTextSelected
                        ]}>
                            {msg}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.orText}>OR</Text>

            <TextInput
                style={styles.customMessageInput}
                placeholder="Write your own message..."
                value={customMessage}
                onChangeText={text => {
                    setCustomMessage(text);
                    if (text) setMessage('');
                }}
                multiline
                maxLength={200}
            />

            {/* Send Button */}
            <TouchableOpacity
                style={[
                    styles.sendButton,
                    (!selectedGif || (!message && !customMessage) || sending) && styles.sendButtonDisabled
                ]}
                onPress={handleSendCheer}
                disabled={!selectedGif || (!message && !customMessage) || sending}
            >
                {sending ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.sendButtonText}>
                        Send Cheer 🎉
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#0066cc',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    gifList: {
        marginTop: 10,
        paddingBottom: 10,
    },
    gifContainer: {
        flex: 1,
        margin: 5,
        position: 'relative',
    },
    gif: {
        width: '100%',
        height: 150,
        borderRadius: 8,
    },
    selectedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 102, 204, 0.5)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    messageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
    messageButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    messageButtonSelected: {
        backgroundColor: '#e6f2ff',
        borderColor: '#0066cc',
    },
    messageButtonText: {
        fontSize: 16,
        color: '#333',
    },
    messageButtonTextSelected: {
        color: '#0066cc',
        fontWeight: '600',
    },
    orText: {
        textAlign: 'center',
        marginVertical: 15,
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
    customMessageInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    sendButton: {
        backgroundColor: '#0066cc',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30,
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});