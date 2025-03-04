import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    TextInput,
    Dimensions,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
    RefreshControl, // Importez RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Entypo, FontAwesome5, Ionicons, FontAwesome } from '@expo/vector-icons';
import { getUserData } from "../util/StorageUtils";
import { useFocusEffect } from '@react-navigation/native';
import GetMyConversationApi from "../api/GetMyConversationApi";
import Global from "../util/Global";
import moment from 'moment';
import 'moment/locale/fr';

export default function ChatScreen() {
    const [loading, setLoading] = useState(true);
    const [mesDiscussions, setMesDiscussions] = useState([]);
    const [userId, setUserId] = useState(null);
    const [refreshing, setRefreshing] = useState(false); // État pour gérer le rafraîchissement
    const router = useRouter();

    useEffect(() => {
        fetechConverations();
    }, []);

    const fetechConverations = async () => {
        try {
            const data = await getUserData();
            const currentUserId = data.user._id;
            setUserId(currentUserId);
            const response = await GetMyConversationApi(currentUserId);
            setMesDiscussions(response.conversations);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false); // Désactiver l'indicateur de rafraîchissement
        }
    };
 

    // Fonction pour gérer le rafraîchissement
    const onRefresh = () => {
        setRefreshing(true); // Activer l'indicateur de rafraîchissement
        fetechConverations(); // Rafraîchir les données
    };

    const getOtherParticipant = (participants) => {
        return participants.find(participant => participant._id !== userId);
    };

    const renderItem = ({ item }) => {
        const otherParticipant = getOtherParticipant(item.participants);
        if (!otherParticipant) return null;


        const now = moment();
        const notificationDate = moment(item.lastMessageDate);
        const duration = moment.duration(now.diff(notificationDate));

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
            timeAgo = notificationDate.fromNow();
        }
        return (
            <TouchableOpacity
                style={[
                    styles.conversationItem,
                    item.isUnread && styles.unreadConversation
                ]}
                onPress={() => router.push(`/ChatDetailsScreen/${item._id}?otherUserName=${encodeURIComponent(otherParticipant.nom + ' ' + otherParticipant.prenom)}`)}
            >
                <View style={styles.avatar}>
                    {otherParticipant.photoProfil ? (
                        <Image
                            source={{
                                uri: Global.BaseFile + otherParticipant.photoProfil
                            }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <FontAwesome name="user-circle" size={50} color="#DFE4EA" />
                    )}
                </View>
                <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                        <Text style={[
                            styles.userName,
                            item.isUnread && styles.unreadText
                        ]}>
                            {otherParticipant.nom} {otherParticipant.prenom}
                        </Text>
                        <View style={styles.timeContainer}>
                            <Text style={styles.messageTime}>
                                {timeAgo}
                            </Text>
                            {item.isUnread && (
                                <View style={styles.unreadDot} />
                            )}
                        </View>
                    </View>
                    <Text style={[
                        styles.lastMessage,
                        item.isUnread && styles.unreadText
                    ]} numberOfLines={1}>
                        {item.isLastMessageFromMe ? "Vous: " : ""}{item.lastMessage}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
                <FontAwesome name="commenting-o" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucune discussion pour le moment.</Text>
            <Text style={styles.emptyText}>
                Il n'y a pas encore de discussion. Envoyez un message pour démarrer une conversation.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"}
                backgroundColor={Platform.OS === "android" ? "transparent" : "transparent"}
                translucent
            />

            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <AntDesign name="left" size={14} color="#181C2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {mesDiscussions.length > 0 ? (
                        <FlatList
                            data={mesDiscussions}
                            renderItem={renderItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            refreshControl={ // Ajoutez RefreshControl ici
                                <RefreshControl
                                    refreshing={refreshing} // Contrôle l'état de rafraîchissement
                                    onRefresh={onRefresh} // Fonction appelée lors du rafraîchissement
                                    colors={["#FF8C00"]} // Couleur du spinner (optionnel)
                                    tintColor="#FF8C00" // Couleur du spinner (iOS)
                                />
                            }
                        />
                    ) : (
                        <EmptyState />
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
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
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F4F5F7',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageContent: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
    },
    messageTime: {
        fontSize: 12,
        color: '#718096',
        fontFamily: "Sen-Regular",
    },
    lastMessage: {
        fontSize: 14,
        color: '#718096',
        fontFamily: "Sen-Regular",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F7FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 23,
        color: '#2D3748',
        marginBottom: 12,
        fontFamily: "Sen-Bold",
        textAlign: "center"
    },
    emptyText: {
        fontSize: 17,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '90%',
        fontFamily: "Sen-Regular",
        marginTop: 20
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    unreadConversation: {
        backgroundColor: '#F7FAFC',
    },
    unreadText: {
        color: '#373738',
        fontFamily: "Sen-Bold",
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF7622',
        marginRight: 5,
    },
});