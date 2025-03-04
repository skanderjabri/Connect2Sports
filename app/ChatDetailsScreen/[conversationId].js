import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from 'react';
import { AntDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import { getUserData } from "../../util/StorageUtils";
import GetMessagesByConvertationApi from "../../api/GetMessagesByConvertationApi";
import AddMessageToConversationApi from "../../api/addMessageToConversationApi";
import MarkLastMessageAsReadApi from "../../api/MarkLastMessageAsReadApi";
import Global from "../../util/Global";
import moment from 'moment';
import 'moment/locale/fr';
import { useFocusEffect } from '@react-navigation/native';

const ChatDetailsScreen = () => {
    const { conversationId, otherUserName } = useLocalSearchParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [userId, setUserId] = useState(null);
    const socketRef = useRef(null);
    const flatListRef = useRef(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeChat();

        // Initialize Socket.IO




    }, [conversationId]);

    const initializeChat = async () => {
        try {
            const data = await getUserData();
            setUserId(data.user._id);
            const response = await GetMessagesByConvertationApi(conversationId);
            setMessages(response.messages);
            if (response.messages.length > 0) {
                const lastMessage = response.messages[response.messages.length - 1];
                if (lastMessage.sender._id !== data.user._id) {
                    await MarkLastMessageAsReadApi(conversationId, data.user._id);
                }
            }
        } catch (error) {
            console.log("Error initializing chat:", error);
        } finally {
            setLoading(false);
        }
    };


    useFocusEffect(
        React.useCallback(() => {
            // Appel initial
            initializeChat();

            const interval = setInterval(() => {
                initializeChat();
            }, 5000);

            // Nettoyage lors du départ de l'écran
            return () => clearInterval(interval);
        }, [])
    );

    const sendMessage = async () => {
        if (newMessage.trim().length === 0) return;

        const newMsg = {
            conversationId: conversationId,
            sender: {
                _id: userId
            },
            content: newMessage,
        };
        try {
            const response = await AddMessageToConversationApi(newMsg.conversationId, userId, newMsg.content);

            if (response.message === "ok") {
                setMessages(prevMessages => [...prevMessages, newMsg]);
                setNewMessage('');
            } else {
                //  console.error("Erreur :", response.error || "Réponse inattendue de l'API");
            }
        } catch (error) {
            console.log(error)
            //    console.error("Erreur lors de l'envoi du message :", error);
        }
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.sender._id === userId;

        const now = moment();
        const messageTime = moment(item.createdAt);
        const duration = moment.duration(now.diff(messageTime));

        let timeAgo = '';

        if (duration.asMinutes() < 1) {
            timeAgo = "À l'instant"; // Afficher "À l'instant" si moins d'une minute
        } else if (duration.asMinutes() < 60) {
            timeAgo = `${Math.floor(duration.asMinutes())} minute${Math.floor(duration.asMinutes()) > 1 ? 's' : ''}`;
        } else if (duration.asHours() < 24) {
            const hours = Math.floor(duration.asHours());
            const minutes = Math.floor(duration.asMinutes()) % 60;
            timeAgo = `${hours} heure${hours > 1 ? 's' : ''} et ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            timeAgo = messageTime.fromNow();
        }

        return (
            <View
                key={item._id}
                style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessage : styles.theirMessage,
                ]}
            >
                {!isMyMessage && (
                    <View style={styles.senderAvatar}>
                        {item.sender.photoProfil ? (
                            <Image
                                source={{ uri: Global.BaseFile + item.sender.photoProfil }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <FontAwesome name="user-circle" size={30} color="#DFE4EA" />
                        )}
                    </View>
                )}
                <View
                    style={[
                        styles.messageBubble,
                        isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isMyMessage ? styles.myMessageText : styles.theirMessageText,
                        ]}
                    >
                        {item.content}
                    </Text>
                    <Text
                        style={[
                            styles.messageTime,
                            isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
                        ]}
                    >
                        {messageTime.fromNow()}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF7622" />
            </View>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <AntDesign name="left" size={14} color="#181C2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{otherUserName}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.messagesList}
                inverted={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                showsVerticalScrollIndicator={false}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                style={styles.inputContainer}
            >
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Écrivez votre message..."
                        multiline
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: newMessage.trim() ? '#FF7622' : '#E2E8F0' }
                        ]}
                        onPress={sendMessage}
                        disabled={newMessage.trim().length === 0}
                    >
                        <Ionicons
                            name="send"
                            size={24}
                            color={newMessage.trim() ? "#FFFFFF" : "#A0AEC0"}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F4F5F7',
    },
    backButton: {
        width: 45,
        height: 45,
        backgroundColor: '#F4F5F7',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: '#181C2E',
        marginLeft: 12,
        fontFamily: "Sen-Bold",
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '80%',
        alignItems: 'flex-end',
    },
    senderAvatar: {
        width: 30,
        height: 30,
        marginRight: 8,
        borderRadius: 15,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    theirMessage: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        borderRadius: 20,
        padding: 12,
        maxWidth: '100%',
    },
    myMessageBubble: {
        backgroundColor: '#FF7622',
    },
    theirMessageBubble: {
        backgroundColor: '#F4F5F7',
    },
    messageText: {
        fontSize: 16,
        marginBottom: 4,
        fontFamily: "Sen-Regular",
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    theirMessageText: {
        color: '#181C2E',
    },
    messageTime: {
        fontSize: 12,
        alignSelf: 'flex-end',
        marginTop: 4,
        fontFamily: "Sen-Regular",
    },
    myMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    theirMessageTime: {
        color: '#A0AEC0',
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F4F5F7',
        padding: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F5F7',
        borderRadius: 25,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        fontFamily: "Sen-Regular",
        maxHeight: 120,
    },
    sendButton: {
        width: 45,
        height: 45,
        borderRadius: 22,
        backgroundColor: '#FF7622',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});

export default ChatDetailsScreen;