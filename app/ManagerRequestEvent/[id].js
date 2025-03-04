import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    StatusBar,
    StyleSheet,
    FlatList,
    Image,
    RefreshControl,
    Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { getUserData } from "../../util/StorageUtils";
import GetAllRequestEnAttenteByEventApi from "../../api/GetAllRequestEnAttenteByEventApi";
import Global from "../../util/Global";
import UpdateStatusRequestApi from "../../api/UpdateStatusRequestApi";
import GetFriendsApi from "../../api/GetFriendsApi"; // Importez l'API pour récupérer la liste des amis
import ParticipEventApi from "../../api/ParticipEventApi";
import DeleteRequestByIdApi from "../../api/DeleteRequestByIdApi";
export default function ManagerRequestEvent() {
    const [loading, setLoading] = useState(true);
    const [ListRequest, setListRequest] = useState([]);
    const [idUserConnecte, setIdUserConnecte] = useState(null);
    const [activeTab, setActiveTab] = useState('recu');
    const [refreshing, setRefreshing] = useState(false);
    const [processingRequests, setProcessingRequests] = useState({});
    const [showInviteModal, setShowInviteModal] = useState(false); // État pour gérer la visibilité du modal
    const [listAmis, setListAmis] = useState([]); // État pour stocker la liste des amis
    const [isSendingInvitation, setIsSendingInvitation] = useState(false);

    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Couleurs pour les statuts
    const statusColors = {
        0: ['#FCD34D', '#F59E0B'], // En attente
        1: ['#10B981', '#059669'], // Accepté
        2: ['#EF4444', '#DC2626'], // Refusé
    };

    useEffect(() => {
        Promise.all([fetchRequest(), fetchFriends()]) // Récupérer les invitations et la liste des amis
            .then(() => setLoading(false))
            .catch((error) =>
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Impossible de charger la screen",
                })
            );
    }, []);

    const fetchRequest = async () => {
        try {
            const response = await GetAllRequestEnAttenteByEventApi(id);
            setListRequest(response.invitations);
        } catch (error) {
            console.log("Erreur " + error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Impossible de charger les invitations",
            });
        } finally {
            setRefreshing(false);
        }
    };

    const fetchFriends = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            const response = await GetFriendsApi(userId); // Récupérer la liste des amis
            setListAmis(response.friends);
        } catch (error) {
            console.log("Erreur " + error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Impossible de charger la liste des amis",
            });
        }
        finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequest();
        fetchFriends();
    };

    const invitationRecu = ListRequest.filter(p => p.modeParticipation === "demande");
    const invitationEnvoyes = ListRequest.filter(p => p.modeParticipation === "invitation");

    const renderEmptyState = (message) => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{message}</Text>
        </View>
    );

    const renderInvitationRecu = ({ item }) => {
        const isProcessing = processingRequests[item._id];
        return (
            <View style={styles.invitationCard}>
                <Image
                    source={{ uri: Global.BaseFile + item.idUtilisateur.photoProfil }}
                    style={styles.profileImage}
                />
                <View style={styles.invitationInfo}>
                    <Text style={styles.invitationName}>
                        {item.idUtilisateur.nom} {item.idUtilisateur.prenom}
                    </Text>
                    <Text style={styles.invitationDate}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAcceptInvitation(item._id)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#10B981" />
                        ) : (
                            <Ionicons name="checkmark" size={20} color="#10B981" />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton]}
                        onPress={() => handleDeclineInvitation(item._id)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <Ionicons name="close" size={20} color="#EF4444" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderInvitationEnvoyes = ({ item }) => {
        const [startColor, endColor] = statusColors[item.statut] || ['#64748B', '#64748B'];
        return (
            <View style={styles.invitationCard}>
                <Image
                    source={{ uri: Global.BaseFile + item.idUtilisateur.photoProfil }}
                    style={styles.profileImage}
                />
                <View style={styles.invitationInfo}>
                    <Text style={styles.invitationName}>
                        {item.idUtilisateur.nom} {item.idUtilisateur.prenom}
                    </Text>
                    <Text style={styles.invitationDate}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>
                <View
                    style={[
                        styles.statusContainer,
                        { backgroundColor: startColor },
                    ]}
                >
                    <Text style={styles.statusText}>
                        {item.statut === 0 ? "En attente" : item.statut === 1 ? "Accepté" : "Refusé"}
                    </Text>
                </View>
            </View>
        );
    };

    const handleAcceptInvitation = async (invitationId) => {
        setProcessingRequests((prev) => ({ ...prev, [invitationId]: true }));
        let status = 1;
        try {
            const response = await UpdateStatusRequestApi(invitationId, status);
            if (response.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Invitation acceptée avec succès !',
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Impossible d'accepter l'invitation",
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Impossible d'accepter l'invitation",
            });
        } finally {
            setProcessingRequests((prev) => ({ ...prev, [invitationId]: false }));
            onRefresh();
        }
    };

    const handleDeclineInvitation = async (invitationId) => {
        setProcessingRequests((prev) => ({ ...prev, [invitationId]: true }));
        try {
            const response = await DeleteRequestByIdApi(invitationId);
            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "Vous avez refusé l'invitation !",
                    button: 'OK',
                });
            }
        }
        catch (error) {
            console.log(error)
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur est survenue lors du refus de l'invitation",
                button: 'OK',
            });
        }

        finally {
            setProcessingRequests((prev) => ({ ...prev, [invitationId]: false }));
            onRefresh();
        }
    };

    const handleInviteFriend = async (friendId) => {
        setIsSendingInvitation(true); // Activer l'indicateur de chargement

        try {
            const response = await ParticipEventApi(id, friendId, "invitation");
            console.log(response);

            if (response.message === "Participation existe") {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Participation déjà enregistrée',
                    textBody: 'Vous êtes déjà inscrit à cet événement.',
                    button: 'OK',
                });
            } else if (response.message === "Vous ne pouvez pas vous inscrire") {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Action non autorisée',
                    textBody: 'Vous ne pouvez pas participer à votre propre événement.',
                    button: 'OK',
                });
            } else if (response.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Invitation envoyée avec succès !',
                    button: 'OK',
                });
                setShowInviteModal(false);
                onRefresh()

                // Fermer le modal après une invitation réussie
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: 'Une erreur s\'est produite lors de l\'envoi de l\'invitation.',
                    button: 'OK',
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'invitation :", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur s\'est produite. Veuillez réessayer plus tard.',
                button: 'OK',
            });
        } finally {
            setIsSendingInvitation(false); // Désactiver l'indicateur de chargement
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
        const formattedTime = date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return `${formattedDate}, ${formattedTime}`;
    };

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
                    <Text style={styles.headerTitle}>Gérer Les participants</Text>
                </View>

                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'recu' && styles.tabActive]}
                        onPress={() => setActiveTab('recu')}
                    >
                        <Text style={[styles.tabText, activeTab === 'recu' && styles.tabTextActive]}>
                            Invitation reçues
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'envoye' && styles.tabActive]}
                        onPress={() => setActiveTab('envoye')}
                    >
                        <Text style={[styles.tabText, activeTab === 'envoye' && styles.tabTextActive]}>
                            Invitations envoyées
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <FlatList
                        data={activeTab === 'recu' ? invitationRecu : invitationEnvoyes}
                        keyExtractor={(item) => item._id}
                        renderItem={activeTab === 'recu' ? renderInvitationRecu : renderInvitationEnvoyes}
                        ListEmptyComponent={renderEmptyState("Aucune invitation trouvée")}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["#FF7622"]}
                                tintColor="#FF7622"
                            />
                        }
                    />
                )}

                {/* Bouton pour ouvrir le modal */}
                {activeTab === 'envoye' && (
                    <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={() => setShowInviteModal(true)}
                    >
                        <Ionicons name="person-add" size={24} color="#FF7622" />
                        <Text style={styles.inviteButtonText}>Inviter des amis</Text>
                    </TouchableOpacity>
                )}

                {/* Modal pour inviter des amis */}
                <Modal
                    visible={showInviteModal}
                    transparent={true}
                    onRequestClose={() => setShowInviteModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Inviter des amis</Text>
                                <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                                    <Ionicons name="close" size={24} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                            {isSendingInvitation ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#FF7622" />
                                </View>
                            ) : listAmis.length === 0 ? (
                                <View style={styles.emptyListContainer}>
                                    <Text style={styles.emptyListText}>
                                        Vous n'avez aucun ami dans votre compte.
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={listAmis}
                                    keyExtractor={item => item._id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.friendItem}
                                            onPress={() => handleInviteFriend(item._id)}
                                        >
                                            <View style={styles.friendInfo}>
                                                <Image
                                                    source={{ uri: Global.BaseFile + item.photoProfil }}
                                                    style={styles.profileImage}
                                                />
                                                <View>
                                                    <Text style={styles.friendName}>
                                                        <Text style={{ textTransform: 'capitalize' }}>{item.nom} </Text>{item.prenom}
                                                    </Text>
                                                    <Text style={styles.friendAddress}>
                                                        {item.adresse}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Ionicons name="add-circle-outline" size={24} color="#FF7622" />
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>
                    </View>
                </Modal>
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
    invitationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    invitationInfo: {
        flex: 1,
    },
    invitationName: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        textTransform: 'capitalize',
    },
    invitationDate: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginTop: 4,
    },
    statusContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginLeft: 12,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Sen-Bold',
        color: '#FFFFFF',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    acceptButton: {
        backgroundColor: '#DCFCE7',
    },
    declineButton: {
        backgroundColor: '#FEE2E2',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        textAlign: 'center',
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F1',
        padding: 12,
        borderRadius: 20,
        margin: 16,
    },
    inviteButtonText: {
        marginLeft: 8,
        color: '#FF7622',
        fontFamily: 'Sen-Bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
        maxHeight: '80%', // Hauteur maximale du modal
        minHeight: '30%', // Hauteur minimale pour s'assurer que le contenu est visible
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    friendName: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#1F2937',
        marginLeft: 12,
    },
    friendAddress: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
    },
    emptyListText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        textAlign: 'center',
    },
    friendAddress: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginLeft: 10
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});