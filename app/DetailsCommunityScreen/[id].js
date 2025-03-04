import React, { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
    RefreshControl,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    StyleSheet,
} from "react-native";
import GetDetailsCommunityApi from "../../api/GetDetailsCommunityApi";
import GetMessagesCommunityApi from "../../api/GetMessagesCommunityApi";
import RejoindreCommunityApi from "../../api/RejoindreCommunityApi";
import SendMessageInCommunityApi from "../../api/SendMessageInCommunityApi";
import { getUserData } from "../../util/StorageUtils";
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Global from "../../util/Global";
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';

export default function DetailsCommunityScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // États du composant
    const [loading, setLoading] = useState(true);
    const [community, setCommunity] = useState(null);
    const [IdUserConnecte, setIdUserConnecte] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [userStatus, setUserStatus] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [isJoinRequestLoading, setIsJoinRequestLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const flatListRef = useRef(null); // Référence pour la FlatList
    // Vérifier si l'utilisateur est l'admin

    // Effet au montage du composant
    useEffect(() => {
        fetchCommunity();
        getCurrentUser();
    }, []);

    // Effet pour vérifier le statut de l'utilisateur
    useEffect(() => {
        if (community && IdUserConnecte) {
            const userParticipant = community.participants.find(
                p => p.userId._id === IdUserConnecte
            );
            setUserStatus(userParticipant ? userParticipant.status : null);
        }
    }, [community, IdUserConnecte]);

    // Effet pour charger les messages si l'utilisateur est membre
    useEffect(() => {
        if (userStatus === 1) {
            fetchMessages();
        }
    }, [userStatus]);

    // Récupération des données de l'utilisateur connecté
    const getCurrentUser = async () => {
        try {
            const data = await getUserData();
            setIdUserConnecte(data.user._id);
        } catch (error) {
            console.log("Erreur récupération utilisateur connecté:", error);
        }
    };

    // Récupération des détails de la communauté
    const fetchCommunity = async () => {
        try {
            const data = await getUserData();
            const response = await GetDetailsCommunityApi(id);
            setCommunity(response.community);
            setIsAdmin(data.user._id == response.community.adminId._id)

        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Récupération des messages
    const fetchMessages = async () => {
        try {
            setLoadingMessages(true);
            const response = await GetMessagesCommunityApi(id);
            setMessages(response.messages);
        } catch (error) {
            console.log("Erreur récupération messages:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Rafraîchissement des données
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCommunity();
        if (userStatus === 1) {
            await fetchMessages();
        }
    };

    // Gestion de la demande de rejoindre la communauté
    const requestRejoindreCommunity = async () => {
        setIsJoinRequestLoading(true);
        try {
            const response = await RejoindreCommunityApi(id, IdUserConnecte);
            if (response.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Félicitations ! 🎉',
                    textBody: 'Votre demande pour rejoindre le groupe a été envoyée avec succès',
                });
            } else if (response.message === "Déjà membre ou en attente d'approbation") {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    textBody: 'Vous êtes déjà membre ou en attente de validation.',
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur s'est produite lors de l'envoi de la demande",
            });
        } finally {
            setIsJoinRequestLoading(false);
        }
    };

    // Envoi d'un nouveau message
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const response = await SendMessageInCommunityApi(id, IdUserConnecte, newMessage);
            if (response.message === "ok") {
                // Ajouter le nouveau message à la liste des messages
                const newMessageData = {
                    _id: Date.now().toString(), // ID temporaire (à remplacer par l'ID réel du serveur si disponible)
                    content: newMessage,
                    senderId: { _id: IdUserConnecte },
                    createdAt: new Date().toISOString(),
                };
                setMessages(prevMessages => [...prevMessages, newMessageData]); // Mettre à jour la liste des messages
                setNewMessage(""); // Réinitialiser le champ de saisie

                // Faire défiler la liste vers le bas
                flatListRef.current?.scrollToEnd({ animated: true });
            } else {
                console.error("Erreur :", response.error || "Réponse inattendue de l'API");
            }
        } catch (error) {
            console.log("Erreur envoi message:", error);
        }
    };

    // Rendu d'un message individuel
    const renderMessage = ({ item }) => {
        const isOwnMessage = item.senderId._id === IdUserConnecte;

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessageContainer : null
            ]}>
                {!isOwnMessage && (
                    <Image
                        source={{ uri: `${Global.BaseFile}/${item.senderId.photoProfil}` }}
                        style={styles.messageAvatar}
                    />
                )}
                <View style={[
                    styles.messageContent,
                    isOwnMessage ? styles.ownMessageContent : null
                ]}>
                    {!isOwnMessage && (
                        <Text style={styles.messageSender}>
                            {item.senderId.prenom} {item.senderId.nom}
                        </Text>
                    )}
                    <Text style={[
                        styles.messageText,
                        isOwnMessage ? styles.ownMessageText : null
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime // Style conditionnel pour l'heure
                    ]}>
                        {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    const renderMessageInput = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.inputContainer}
        >
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Écrivez votre message..."
                    placeholderTextColor="#A0A0A0"
                    multiline
                    maxHeight={100}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        !newMessage.trim() && styles.sendButtonDisabled
                    ]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim()}
                >
                    <Ionicons
                        name="send"
                        size={24}
                        color={!newMessage.trim() ? "#A0A0A0" : "white"}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );    // Rendu de la vue membre (uniquement la conversation)
    const renderMemberView = () => (
        <View style={styles.memberViewContainer}>
            <FlatList
                ref={flatListRef} // Ajoutez la référence
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.messagesList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {renderMessageInput()}
        </View>
    );

    const renderMembers = () => {
        // Filtrer les membres dont le statut est 1
        const activeMembers = community.participants.filter(
            participant => participant.status === 1
        );

        // Limiter l'affichage à 5 membres maximum
        const displayMembers = activeMembers.slice(0, 5);

        return (
            <View style={styles.membersContainer}>
                {/* Afficher le nombre de membres actifs */}
                <Text style={styles.sectionTitle}>
                    Membres actifs ({activeMembers.length})
                </Text>
                {displayMembers.map((participant, index) => (
                    <View key={index} style={styles.memberItem}>
                        <Image
                            source={{ uri: `${Global.BaseFile}/${participant.userId.photoProfil}` }}
                            style={styles.memberAvatar}
                        />
                        <Text style={styles.memberName}>
                            {participant.userId.nom} {participant.userId.prenom}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    // Rendu de la vue non-membre (détails de la communauté)
    const renderNonMemberView = () => (
        <ScrollView

            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                />
            }
            style={styles.scrollView}
        >
            <Image
                source={{ uri: `${Global.BaseFile}/${community.image}` }}
                style={styles.communityImage}
            />
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{community.title}</Text>
                <View style={styles.sportTypeContainer}>
                    <Text style={styles.sportIcon}>{community.sportType.icon}</Text>
                    <Text style={styles.sportName}>{community.sportType.nom}</Text>
                </View>
                <Text style={styles.description}>{community.description}</Text>

                <View style={styles.tagsContainer}>
                    {community.tags.map((tag, index) => (
                        <View key={index} style={styles.tagItem}>
                            <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                    ))}
                </View>

                {renderMembers()}

                {community.regles.length > 0 && (
                    <View style={styles.rulesContainer}>
                        <Text style={styles.sectionTitle}>Règles de la communauté</Text>
                        {community.regles.map((rule, index) => (
                            <View key={index} style={styles.ruleItem}>
                                <MaterialIcons name="rule" size={20} color="#FF7622" />
                                <Text style={styles.ruleText}>{rule}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.joinButton, isJoinRequestLoading && styles.joinButtonDisabled]}
                    onPress={requestRejoindreCommunity}
                    disabled={isJoinRequestLoading}
                >
                    {isJoinRequestLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Ionicons name="enter-outline" size={24} color="white" />
                            <Text style={styles.joinButtonText}>Rejoindre</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // Rendu principal
    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="transparent"
                    translucent
                />
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <AntDesign name="left" size={14} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Communauté</Text>
                    {isAdmin && (
                        <TouchableOpacity
                            style={styles.manageGroupButton}
                            onPress={() => router.push(`/ManageCommunity/${id}`)}
                        >
                            <Text style={styles.manageGroupText}>Gérer le groupe</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    userStatus === 1 ? renderMemberView() : renderNonMemberView()
                )}
            </SafeAreaView>
        </AlertNotificationRoot>
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
    manageGroupButton: {
        marginLeft: 'auto',
        paddingHorizontal: 12,
        paddingVertical: 8,
        // backgroundColor: '#FF7622',
        borderRadius: 20,
    },
    manageGroupText: {
        color: '#FF7622',
        fontSize: 14,
        fontFamily: "Sen-Bold",
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    communityImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    contentContainer: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 8,
    },
    sportTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sportIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    sportName: {
        fontSize: 16,
        color: '#666',
        fontFamily: "Sen-Regular",
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
        fontFamily: "Sen-Regular",
        lineHeight: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    tagItem: {
        backgroundColor: '#F4F5F7',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        color: '#666',
        fontFamily: "Sen-Regular",
    },
    membersContainer: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 12,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    memberName: {
        fontSize: 16,
        color: '#181C2E',
        fontFamily: "Sen-Regular",
    },
    rulesContainer: {
        marginVertical: 16,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#F4F5F7',
        padding: 12,
        borderRadius: 12,
    },
    ruleText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#666',
        flex: 1,
        fontFamily: "Sen-Regular",
    },
    joinButton: {
        backgroundColor: '#FF7622',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    joinButtonText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 8,
        fontFamily: "Sen-Bold",
    },
    joinButtonDisabled: {
        backgroundColor: '#CCCCCC',
        shadowOpacity: 0.1,
    },
    membershipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 12,
        marginVertical: 16,
    },
    membershipText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#4CAF50',
        fontFamily: "Sen-Bold",
    },
    memberViewContainer: {
        flex: 1,
    },
    messagesList: {
        paddingBottom: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 8,
        alignItems: 'flex-end',
    },
    ownMessageContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    messageContent: {
        maxWidth: '75%',
        backgroundColor: '#F4F5F7',
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        padding: 12,
    },
    ownMessageContent: {
        backgroundColor: '#FF7622',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 4,
    },
    messageSender: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontFamily: "Sen-Bold",
    },
    messageText: {
        fontSize: 16,
        marginBottom: 4,
        fontFamily: "Sen-Regular",
    },
    ownMessageText: {
        color: 'white',

    },
    messageTime: {
        fontSize: 12,
        alignSelf: 'flex-end',
        marginTop: 4,
        fontFamily: "Sen-Regular",
    },
    ownMessageTime: {
        color: 'white', // Heure en blanc pour les messages de l'utilisateur
    },
    otherMessageTime: {
        color: '#666', // Heure en gris pour les messages des autres
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F4F5F7',
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F5F7',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },

    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#181C2E',
        minHeight: 40,
        maxHeight: 100,
        marginRight: 8,
        paddingTop: 8,
        paddingBottom: 8,
    },

    sendButton: {
        backgroundColor: '#FF7622',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    sendButtonDisabled: {
        backgroundColor: '#E0E0E0',
        elevation: 0,
        shadowOpacity: 0,
    },
});