import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
    StyleSheet,
    Modal,
    Image,
    RefreshControl
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Ionicons, MaterialIcons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import GetDetailsEventApi from "../../api/GetDetailsEventApi";
import { getUserData } from "../../util/StorageUtils";
import GetRequestConfirmeeApi from "../../api/GetRequestConfirmeeApi";
import UpdateStatusRequestApi from "../../api/UpdateStatusRequestApi";
import Global from "../../util/Global";
import GetAllTeamsByIdEventApi from "../../api/GetAllTeamsByIdEventApi";
import CloseEvenementApi from "../../api/CloseEvenementApi";
import moment from 'moment';
import 'moment/locale/fr';
import DeleteRequestByIdApi from "../../api/DeleteRequestByIdApi";
const ConfirmedParticipantsList = ({ participants, onRemoveParticipant, refreshing, onRefresh }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRemoveParticipant = (participant) => {
        setSelectedParticipant(participant);
        setModalVisible(true);
    };

    const confirmRemoval = async () => {
        if (selectedParticipant) {
            setIsLoading(true); // Début de la requête
            try {
                const response = await DeleteRequestByIdApi(selectedParticipant._id);
                if (response.message === "ok") {
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'Succès',
                        textBody: 'Le participant a été retiré avec succès',
                    });
                    onRemoveParticipant(); // Rafraîchir la liste des participants
                } else {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Erreur',
                        textBody: "Impossible de retirer le participant",
                    });
                }
            } catch (error) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur s'est produite lors de la suppression",
                });
            } finally {
                setIsLoading(false); // Fin de la requête
                setModalVisible(false); // Fermer le modal
                setSelectedParticipant(null); // Réinitialiser le participant sélectionné
            }
        }
    };

    if (!participants || participants.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="group-off" size={50} color="#64748B" />
                <Text style={styles.emptyText}>
                    Aucun participant confirmé pour le moment
                </Text>
                <Text style={styles.emptySubText}>
                    Les participants confirmés apparaîtront ici
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.participantsContainer}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#FF7622"]}
                        tintColor="#FF7622"
                    />
                }
            >
                {participants.map((participant) => (
                    <View key={participant._id} style={styles.participantCard}>
                        <View style={styles.participantInfo}>
                            {participant.idUtilisateur.photoProfil ? (
                                <Image
                                    source={{ uri: Global.BaseFile + participant.idUtilisateur.photoProfil }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={styles.avatarContainer}>
                                    <Text style={styles.avatarText}>
                                        {participant.idUtilisateur.nom.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.textContainer}>
                                <Text style={styles.participantName}>
                                    {participant.idUtilisateur.nom} {participant.idUtilisateur.prenom}
                                </Text>
                                <Text style={styles.participantEmail}>
                                    {participant.idUtilisateur.email}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveParticipant(participant)}
                        >
                            <MaterialIcons name="person-remove" size={24} color="#FF7622" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Modal de confirmation */}
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <MaterialIcons name="warning" size={40} color="#FF7622" />
                            <Text style={styles.modalTitle}>Confirmer le retrait</Text>
                        </View>
                        <Text style={styles.modalText}>
                            Êtes-vous sûr de vouloir retirer ce participant de l'événement ?
                        </Text>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#FF7622" />
                        ) : (
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={confirmRemoval}
                                >
                                    <Text style={styles.confirmButtonText}>Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default function EventDetailsScreen() {
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [idUserConnecte, setIdUserConnecte] = useState(null);
    const [ListeInvitaionConfirmee, setListeInvitaionConfirmee] = useState([]);
    const [Teams, setTeams] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
    const router = useRouter();
    const { id } = useLocalSearchParams();


    const handleOptionsPress = () => {
        setIsOptionsModalVisible(true);
    };

    // Fonction pour fermer le modal des options
    const handleCloseOptionsModal = () => {
        setIsOptionsModalVisible(false);
    };




    const handleOptionPress = (option) => {
        handleCloseOptionsModal(); // Fermer le modal après avoir sélectionné une option
        switch (option) {
            case "modifier":
                router.push(`/EditEvent/${id}`); // Naviguer vers l'écran de modification de l'événement
                break;
            case "terminer":
                handleMarkAsCompleted(); // Marquer l'événement comme terminé
                break;
            case "evaluer":
                router.push(`/EvaluateEvent/${id}`); // Naviguer vers l'écran d'évaluation de l'événement
                break;
            case "voir":
                router.push(`/ListeAvisEvent/${id}`); // Naviguer vers l'écran d'évaluation de l'événement
                break;
            case "message":
                router.push(`/PostEventScreen/${id}`); // Naviguer vers l'écran d'évaluation de l'événement
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([getCurrentUser(), fetchEvent(), fetchMembresConfirmee(), fetchTeams()]);
        } catch (error) {
            console.log("Erreur lors du chargement des données: " + error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData(); // Recharge toutes les données (user, event, participants, etc.)
        setRefreshing(false);
    };

    const getCurrentUser = async () => {
        try {
            const data = await getUserData();
            setIdUserConnecte(data.user._id);
        } catch (error) {
            console.log("Erreur récupération utilisateur connecté:", error);
        }
    };

    const fetchEvent = async () => {
        try {
            const response = await GetDetailsEventApi(id);
            setEvent(response.event);
        } catch (error) {
            console.log("Erreur " + error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Impossible de charger les détails de l'événement",
            });
        }
    };

    const fetchMembresConfirmee = async () => {
        try {
            const response = await GetRequestConfirmeeApi(id);
            setListeInvitaionConfirmee(response.invitations);
        } catch (error) {
            console.log("Erreur " + error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Impossible de charger les participants confirmés",
            });
        }
    };
    const fetchTeams = async () => {
        try {
            const response = await GetAllTeamsByIdEventApi(id);
            setTeams(response.teams)
        } catch (error) {
            console.log("Erreur " + error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Impossible de charger les participants confirmés",
            });
        }
    };
    const handleRemoveParticipant = async () => {
        await fetchMembresConfirmee(); // Rafraîchir la liste après suppression
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF7622" />
            </View>
        );
    }
    // Calcul des places restantes
    const maxParticipants = event?.maxParticipants || 0;
    const confirmedParticipants = ListeInvitaionConfirmee.length;
    const remainingParticipants = Math.abs(maxParticipants - confirmedParticipants);
    const handleMarkAsCompleted = async () => {
        try {
            // Vérifier si le nombre de participants confirmés dépasse le nombre maximum autorisé
            if (ListeInvitaionConfirmee.length > event?.maxParticipants) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Le nombre de participants confirmés dépasse le nombre maximum autorisé.",
                });
                return; // Arrêter l'exécution de la fonction
            }
            if (ListeInvitaionConfirmee.length < event?.maxParticipants) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Le nombre maximum de participants n'est pas atteint.",
                });
                return; // Arrêter l'exécution de la fonction
            }
            if (event?.typeEvenement == "match" && Teams.length != 2 && event?.nomSporttype != "Tennis") {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "L'événement ne peut être marqué comme terminé que s'il y a exactement 2 équipes",
                });
                return; // Arrêter l'exécution de la fonction
            }

            // Vérifier si le nombre maximum de participants est atteint
            if (event?.maxParticipants === ListeInvitaionConfirmee.length) {
                const response = await CloseEvenementApi(id);
                if (response.message === "ok") {
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'Succès',
                        textBody: "L'événement a été marqué comme terminé.",
                    });
                    onRefresh();
                } else {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Erreur',
                        textBody: "Impossible de marquer l'événement comme terminé.",
                    });
                }
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur s'est produite lors de la mise à jour de l'événement.",
            });
        }
    };

    const renderOptionsModal = () => (
        <Modal
            transparent={true}
            visible={isOptionsModalVisible}
            onRequestClose={handleCloseOptionsModal}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.optionsModalContent}>
                    {/* Option 1 : Modifier l'événement */}
                    {event?.statut !== "termine" && (
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleOptionPress("modifier")}
                        >
                            <Ionicons name="create-outline" size={24} color="#FF7622" />
                            <Text style={styles.optionText}>Modifier l'événement</Text>
                        </TouchableOpacity>
                    )}

                    {/* Option 2 : Marquer comme terminé */}
                    {event?.statut !== "termine" && (

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleOptionPress("terminer")}
                        >
                            <Ionicons name="checkmark-done-outline" size={24} color="#FF7622" />
                            <Text style={styles.optionText}>Marquer comme terminé</Text>
                        </TouchableOpacity>
                    )}
                    {/* Option 3 : Évaluer l'événement */}
                    {event?.statut == "termine" && (
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleOptionPress("evaluer")}
                        >
                            <Ionicons name="star-outline" size={24} color="#FF7622" />
                            <Text style={styles.optionText}>Évaluation des participants</Text>
                        </TouchableOpacity>
                    )}
                    {event?.statut == "termine" && (
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleOptionPress("voir")}
                        >
                            <FontAwesome6 name="smile" size={24} color="#FF7622" />
                            <Text style={styles.optionText}>Consultez les avis sur l'événement</Text>
                        </TouchableOpacity>
                    )}
                    {event?.statut == "termine" && (
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleOptionPress("message")}
                        >
                            <MaterialCommunityIcons name="message-text-outline" size={24} color="#FF7622" />
                            <Text style={styles.optionText}>Discussions post-événement</Text>
                        </TouchableOpacity>
                    )}
                    {/* Bouton Annuler */}
                    <TouchableOpacity
                        style={styles.cancelOptionButton}
                        onPress={handleCloseOptionsModal}
                    >
                        <Text style={styles.cancelOptionText}>Annuler</Text>
                    </TouchableOpacity>
                </View >
            </View >
        </Modal >
    );

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="transparent"
                    translucent
                />
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <AntDesign name="left" size={20} color="#FF7622" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Détails de l'événement</Text>
                    <TouchableOpacity
                        style={styles.optionsIcon}
                        onPress={handleOptionsPress}
                    >
                        <Ionicons name="ellipsis-vertical" size={24} color="#FF7622" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FF7622"]}
                            tintColor="#FF7622"
                        />
                    }
                >
                    {/* Informations de l'événement */}
                    <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{event?.titre}</Text>
                        {event?.statut == "termine" && (
                            <View style={styles.completedEventContainer}>
                                {/* Event Information */}
                                <View style={styles.completedEventCard}>
                                    <MaterialIcons name="event-available" size={40} color="#FF7622" />
                                    <Text style={styles.completedEventTitle}>Événement Terminé</Text>

                                    <View style={styles.eventDetailsSection}>
                                        <Text style={styles.detailLabel}>Description : </Text>
                                        <Text style={styles.detailValue}>{event.description}</Text>


                                        <Text style={styles.detailLabel}>Lieu :</Text>
                                        <Text style={styles.detailValue}>{event.lieu}</Text>

                                        <Text style={styles.detailLabel}>Date et Heure:</Text>
                                        <Text style={styles.detailValue}>
                                            {moment(event.dateHeureDebut).format('DD MMMM YYYY')}{' '}{moment(event.formattedTime).format('HH:mm')}
                                        </Text>

                                        <Text style={styles.detailLabel}>Participants</Text>
                                        <Text style={styles.detailValue}>
                                            {event.maxParticipants}
                                        </Text>
                                    </View>
                                </View>
                                {/* Evaluation Section */}
                                <View style={styles.evaluationSection}>
                                    <Text style={styles.evaluationTitle}>Évaluation des Participants</Text>
                                    <Text style={styles.evaluationDescription}>
                                        Évaluez les participants de cet événement pour partager votre expérience
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.evaluateButton}
                                        onPress={() => router.push(`/EvaluateEvent/${id}`)}
                                    >
                                        <MaterialIcons name="rate-review" size={24} color="#FFFFFF" />
                                        <Text style={styles.evaluateButtonText}>Évaluer les Participants</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                    </View>
                    {event?.statut != "termine" && (

                        <View style={styles.detailsCard}>
                            <View style={styles.detailsRow}>
                                <Text style={styles.detailsLabel}>Participants max :</Text>
                                <Text style={styles.detailsValue}>{maxParticipants}</Text>
                            </View>
                            <View style={styles.detailsRow}>
                                <Text style={styles.detailsLabel}>Participants confirmés :</Text>
                                <Text style={styles.detailsValue}>{confirmedParticipants}</Text>
                            </View>
                            <View style={styles.detailsRow}>
                                <Text style={styles.detailsLabel}>Places restantes :</Text>
                                <Text style={styles.detailsValue}>{remainingParticipants}</Text>
                            </View>
                        </View>
                    )}
                    {event?.statut != "termine" && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Participants confirmées :</Text>
                                <TouchableOpacity
                                    style={styles.inviteButton}
                                    onPress={() => router.push(`/ManagerRequestEvent/${id}`)}
                                >
                                    <Ionicons name="person-add" size={20} color="#FF7622" />
                                    <Text style={styles.inviteButtonText}>Inviter</Text>
                                </TouchableOpacity>
                            </View>
                            <ConfirmedParticipantsList
                                participants={ListeInvitaionConfirmee}
                                onRemoveParticipant={handleRemoveParticipant}
                            />
                        </View>
                    )}
                    {event?.statut != "termine" && event?.typeEvenement === 'match' && event?.nomSporttype != "Tennis" && (
                        <View style={styles.teamSection}>
                            {/* En-tête de la section "Gestion des équipes" */}
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <Text style={styles.sectionTitle}>Gestion des équipes</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.inviteButton}
                                    onPress={() => router.push(`/ManagerTeamEvent/${id}`)}
                                >
                                    <Ionicons name="settings" size={20} color="#FF7622" />
                                    <Text style={styles.inviteButtonText}>Gérer </Text>
                                </TouchableOpacity>
                            </View>
                            {/* Contenu de la section */}
                            {Teams.length > 0 ? (
                                <View style={styles.teamList}>
                                    {Teams.map((team) => (
                                        <View key={team._id} style={styles.teamCard}>
                                            {/* Avatar de l'équipe */}
                                            <View style={styles.teamAvatarContainer}>
                                                <Text style={styles.teamAvatarText}>
                                                    {team.nom.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>

                                            {/* Informations de l'équipe */}
                                            <View style={styles.teamInfo}>
                                                <Text style={styles.teamName}>{team.nom}</Text>
                                                <Text style={styles.teamMembers}>
                                                    {team.members.length} membre{team.members.length > 1 ? 's' : ''}
                                                </Text>
                                            </View>

                                            {/* Bouton pour voir les détails de l'équipe */}
                                            <TouchableOpacity
                                                style={styles.teamDetailsButton}
                                            //onPress={() => handleViewTeamDetails(team._id)}
                                            >
                                                <Ionicons name="chevron-forward" size={20} color="#FF7622" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyTeamContainer}>
                                    <MaterialIcons name="group-off" size={50} color="#64748B" />
                                    <Text style={styles.emptyTeamText}>Aucune équipe créée pour le moment</Text>
                                    <Text style={styles.emptyTeamSubText}>
                                        Créez une équipe pour commencer à organiser votre match.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                    {renderOptionsModal()}
                </ScrollView>
            </SafeAreaView>
        </AlertNotificationRoot >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginLeft: 16,
        flex: 1,
    },
    inviteIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    eventInfo: {
        padding: 16,
    },
    eventTitle: {
        fontSize: 24,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        lineHeight: 24,
    },
    detailsCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        margin: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailsLabel: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
    },
    detailsValue: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
    },
    section: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F1',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    inviteButtonText: {
        marginLeft: 8,
        color: '#FF7622',
        fontFamily: 'Sen-Bold',
    },
    // Styles pour la liste des participants
    participantsContainer: {
        padding: 16,
    },
    participantCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    participantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF7622',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Sen-Bold',
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    participantName: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
    },
    participantEmail: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
    },
    removeButton: {
        padding: 8,
    },
    // Styles pour le modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        alignItems: 'center',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginTop: 12,
    },
    modalText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#F1F5F9',
    },
    confirmButton: {
        backgroundColor: '#FF7622',
    },
    cancelButtonText: {
        color: '#64748B',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        margin: 16,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginTop: 8,
        textAlign: 'center',
    },
    manageTeamsButton: {
        backgroundColor: '#FF7622',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    manageTeamsButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Sen-Bold',
    },
    teamSection: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginLeft: 8,
    },
    manageTeamsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7622',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    manageTeamsButtonText: {
        marginLeft: 8,
        color: '#FFFFFF',
        fontFamily: 'Sen-Bold',
    },
    teamList: {
        marginTop: 16,
    },
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    teamAvatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FF7622',
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamAvatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontFamily: 'Sen-Bold',
    },
    teamInfo: {
        flex: 1,
        marginLeft: 12,
    },
    teamName: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
    },
    teamMembers: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
    },
    teamDetailsButton: {
        padding: 8,
    },
    teamListText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
    },
    emptyTeamContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyTeamText: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyTeamSubText: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginTop: 8,
        textAlign: 'center',
    },
    optionsIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionsModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '80%',
        alignItems: 'center',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#1F2937',
        marginLeft: 16,
    },
    cancelOptionButton: {
        width: '100%',
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    cancelOptionText: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#FF7622',
    },
    // New styles for completed event view
    completedEventContainer: {
    },
    completedEventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    completedEventTitle: {
        fontSize: 24,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 24,
    },
    eventDetailsSection: {
        width: '100%',
    },
    detailLabel: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#64748B',
        marginTop: 16,
    },
    detailValue: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#1F2937',
        marginTop: 4,
    },
    evaluationSection: {
        marginTop: 24,
        padding: 24,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
    },
    evaluationTitle: {
        fontSize: 20,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    evaluationDescription: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginBottom: 24,
    },
    evaluateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF7622',
        padding: 16,
        borderRadius: 12,
    },
    evaluateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        marginLeft: 8,
    }
});