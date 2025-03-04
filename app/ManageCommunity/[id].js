import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    SafeAreaView,
    Platform,
    StatusBar,
    FlatList,
    StyleSheet,
    RefreshControl, // Importez RefreshControl
} from "react-native";
import GetCommunityParticipantsApi from "../../api/GetCommunityParticipantsApi";
import { getUserData } from "../../util/StorageUtils";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Global from "../../util/Global";
import ManageCommunityApi from "../../api/ManageCommunityApi";
import BlockParticipantApi from "../../api/BlockParticipantApi";
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';

export default function ManageCommunity() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // État pour gérer le rafraîchissement
    const [activeTab, setActiveTab] = useState('membres');
    const [participants, setParticipants] = useState([]);
    const [IdUserConnecte, setIdUserConnecte] = useState(null);
    const [loadingActions, setLoadingActions] = useState([]);
    const [loadingBlockActions, setLoadingBlockActions] = useState([]);

    useEffect(() => {
        fetchParticipants();
        getCurrentUser();
    }, [id]);

    const getCurrentUser = async () => {
        try {
            const data = await getUserData();
            setIdUserConnecte(data.user._id);
        } catch (error) {
            console.log("Erreur récupération utilisateur connecté:", error);
        }
    };

    const fetchParticipants = async () => {
        try {
            const response = await GetCommunityParticipantsApi(id);
            setParticipants(response.participants);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false); // Désactiver le rafraîchissement une fois terminé
        }
    };

    // Fonction pour gérer le rafraîchissement
    const onRefresh = () => {
        setRefreshing(true); // Activer le rafraîchissement
        fetchParticipants(); // Rafraîchir les données
    };

    const handleAcceptInvitation = async (userId) => {
        setLoadingActions(prev => [...prev, userId]);
        const action = "accept";
        try {
            const response = await ManageCommunityApi(id, IdUserConnecte, userId, action);
            if (response.message == "Demande acceptee") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Invitation acceptée avec succès.',
                });
                fetchParticipants();
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur s'est produite lors de l'acceptation de l'invitation.",
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur s'est produite lors de l'acceptation de l'invitation.",
            });
        } finally {
            setLoadingActions(prev => prev.filter(id => id !== userId));
        }
    };

    const handleRejectInvitation = async (userId) => {
        setLoadingActions(prev => [...prev, userId]);
        const action = "reject";
        try {
            const response = await ManageCommunityApi(id, IdUserConnecte, userId, action);
            if (response.message == "Demande refusee") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Invitation refusée avec succès.',
                });
                fetchParticipants();
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur s'est produite lors de la refus de l'invitation.",
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur s'est produite lors du refus de l'invitation.",
            });
        } finally {
            setLoadingActions(prev => prev.filter(id => id !== userId));
        }
    };

    const handleBlockUser = async (userId) => {
        setLoadingBlockActions(prev => [...prev, userId]);
        try {
            const response = await BlockParticipantApi(id, userId);
            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Utilisateur bloqué avec succès.',
                });
                fetchParticipants();
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur s'est produite lors du blocage de l'utilisateur.",
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur s'est produite lors du blocage de l'utilisateur.",
            });
        } finally {
            setLoadingBlockActions(prev => prev.filter(id => id !== userId));
        }
    };

    const renderInvitationItem = ({ item }) => {
        const isActionLoading = loadingActions.includes(item.userId);

        return (
            <View style={styles.listItem}>
                <Image
                    source={{ uri: `${Global.BaseFile}/${item.photoProfil}` }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.nom} {item.prenom}</Text>
                    <Text style={styles.invitationDate}>Invité le {new Date(item.joinedAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.acceptButton, isActionLoading && styles.disabledButton]}
                        onPress={() => handleAcceptInvitation(item.userId)}
                        disabled={isActionLoading}
                    >
                        {isActionLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="checkmark" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.rejectButton, isActionLoading && styles.disabledButton]}
                        onPress={() => handleRejectInvitation(item.userId)}
                        disabled={isActionLoading}
                    >
                        {isActionLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="close" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderMemberItem = ({ item }) => {
        const isBlockActionLoading = loadingBlockActions.includes(item.userId);

        return (
            <View style={styles.listItem}>
                <Image
                    source={{ uri: `${Global.BaseFile}/${item.photoProfil}` }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.nom} {item.prenom}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.blockButton, isBlockActionLoading && styles.disabledButton]}
                    onPress={() => handleBlockUser(item.userId)}
                    disabled={isBlockActionLoading}
                >
                    {isBlockActionLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Ionicons name="ban" size={20} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyState = (message) => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{message}</Text>
        </View>
    );

    const invitations = participants.filter(p => p.status === 0);
    const members = participants.filter(p => p.status === 1);

    return (
        <AlertNotificationRoot>
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
                    <Text style={styles.headerTitle}>Gérer la communauté</Text>
                </View>

                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'membres' && styles.tabActive]}
                        onPress={() => setActiveTab('membres')}
                    >
                        <Text style={[styles.tabText, activeTab === 'membres' && styles.tabTextActive]}>
                            Membres
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'invitations' && styles.tabActive]}
                        onPress={() => setActiveTab('invitations')}
                    >
                        <Text style={[styles.tabText, activeTab === 'invitations' && styles.tabTextActive]}>
                            Invitations 
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <View style={styles.content}>
                        {activeTab === 'membres' && (
                            members.length > 0 ? (
                                <FlatList
                                    data={members}
                                    keyExtractor={(item) => item.userId}
                                    renderItem={renderMemberItem}
                                    contentContainerStyle={styles.listContainer}
                                    refreshControl={ // Ajoutez RefreshControl ici
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            colors={["#FF7622"]} // Couleur du spinner
                                            tintColor="#FF7622" // Couleur du spinner (iOS)
                                        />
                                    }
                                />
                            ) : (
                                renderEmptyState("Aucun membre dans la communauté.")
                            )
                        )}

                        {activeTab === 'invitations' && (
                            invitations.length > 0 ? (
                                <FlatList
                                    data={invitations}
                                    keyExtractor={(item) => item.userId}
                                    renderItem={renderInvitationItem}
                                    contentContainerStyle={styles.listContainer}
                                    refreshControl={ // Ajoutez RefreshControl ici
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            colors={["#FF7622"]} // Couleur du spinner
                                            tintColor="#FF7622" // Couleur du spinner (iOS)
                                        />
                                    }
                                />
                            ) : (
                                renderEmptyState("Aucune invitation en attente.")
                            )
                        )}
                    </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        paddingVertical: 12,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#FF7622',
    },
    tabText: {
        fontSize: 16,
        color: "#A5A7B9",
        fontFamily: 'Sen-Bold',
    },
    tabTextActive: {
        color: '#FF7622',
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    listItem: {
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
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
        textTransform: 'capitalize'
    },
    invitationDate: {
        fontSize: 14,
        color: '#666',
        fontFamily: "Sen-Regular",
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    rejectButton: {
        backgroundColor: '#FF5252',
        padding: 8,
        borderRadius: 20,
    },
    blockButton: {
        backgroundColor: '#FF7622',
        padding: 8,
        borderRadius: 20,
    },
    disabledButton: {
        opacity: 0.5,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        fontFamily: "Sen-Regular",
    },
});