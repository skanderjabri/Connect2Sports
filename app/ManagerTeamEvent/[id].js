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
    TextInput,
    Dimensions,
    RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import GetDetailsEventApi from "../../api/GetDetailsEventApi";
import { getUserData } from "../../util/StorageUtils";
import Global from "../../util/Global";
import GetAllTeamsByIdEventApi from "../../api/GetAllTeamsByIdEventApi";
import GetRequestConfirmeeApi from "../../api/GetRequestConfirmeeApi";
import CreateEquipeApi from "../../api/CreateEquipeApi";
import AddMemberToTeamApi from "../../api/AddMemberToTeamApi";
import RemoveMemberFromTeamApi from "../../api/RemoveMemberFromTeamApi";
const { width, height } = Dimensions.get('window');

const MemberCard = ({ member, onPress }) => (
    <TouchableOpacity style={styles.memberCard} onPress={() => onPress(member)}>
        <Image
            source={{ uri: `${Global.BaseFile}/${member.idUtilisateur.photoProfil}` }}
            style={styles.memberImage}
        />
        <Text style={styles.memberName} numberOfLines={2}>
            {member.idUtilisateur.nom}{" "}{member.idUtilisateur.prenom}

        </Text>
    </TouchableOpacity>
);

export default function ManagerTeamEvent() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [idUserConnecte, setIdUserConnecte] = useState(null);
    const [ListeInvitaionConfirmee, setListeInvitaionConfirmee] = useState([]);
    const [Teams, setTeams] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [role, setRole] = useState("Joueur");
    const [selectedRole, setSelectedRole] = useState('player');
    const [isLeader, setIsLeader] = useState(false);
    const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);

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
        await loadData();
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
            setTeams(response.teams);
        } catch (error) {
            console.log("Erreur " + error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Impossible de charger les équipes",
            });
        }
    };

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Attention',
                textBody: "Le nom de l'équipe est obligatoire",
            });
            return;
        }
        try {
            const response = await CreateEquipeApi(id, teamName);
            if (response.message == 'Une equipe existe deja avec ce nom') {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une équipe existe déjà avec ce nom",
                });
            } else if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "Équipe créée avec succès",
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur est survenue lors de la création de l'équipe",
                });
            }
        } catch {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur est survenue lors de la création de l'équipe",
            });
        } finally {
            onRefresh();
            setIsTeamModalVisible(false);
            setTeamName('');
        }
    };

    const handleMemberPress = (member) => {
        setSelectedMember(member);
        setIsAssignModalVisible(true);
    };


    // Fonction pour ouvrir le modal de suppression
    const handleRemoveMemberPress = (member) => {
        setMemberToRemove(member);
        setIsRemoveModalVisible(true);
    };


    // Fonction pour fermer le modal de suppression
    const handleCancelRemove = () => {
        setIsRemoveModalVisible(false);
        setMemberToRemove(null);
    };



    const handleAssignMember = async () => {
        if (!selectedTeam) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Attention',
                textBody: "Veuillez sélectionner une équipe",
            });
            return;
        }
        if (role.trim() == "") {
            setRole("joueur");
        }
        const idUser = selectedMember?.idUtilisateur?._id;
        try {
            const response = await AddMemberToTeamApi(selectedTeam, idUser, role, isLeader);
            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "Membre assigné avec succès",
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur est survenue lors de l'assignation du membre",
                });
            }
        } catch {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur est survenue lors de l'assignation du membre",
            });
        } finally {
            onRefresh();
            setIsAssignModalVisible(false);
            setSelectedMember(null);
            setSelectedTeam(null);
            setRole("Joueur");
        }
    };


    // Fonction pour confirmer la suppression
    const handleConfirmRemove = async () => {
        if (!memberToRemove) return;

        try {
            // Appeler l'API pour retirer le membre de l'équipe
            const response = await RemoveMemberFromTeamApi(memberToRemove.teamId, memberToRemove.idUser._id);
            if (response.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "Membre retiré avec succès",
                });
                onRefresh(); // Rafraîchir les données
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur est survenue lors du retrait du membre",
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur est survenue lors du retrait du membre",
            });
        } finally {
            setIsRemoveModalVisible(false);
            setMemberToRemove(null);
        }

    };

    const renderAssignmentModal = () => (
        <Modal
            visible={isAssignModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsAssignModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Assigner à une équipe</Text>

                    {selectedMember && (
                        <View style={styles.selectedMemberInfo}>
                            <Image
                                source={{ uri: `${Global.BaseFile}/${selectedMember.idUtilisateur.photoProfil}` }}
                                style={styles.modalMemberImage}
                            />
                            <Text style={styles.modalMemberName}>
                                {selectedMember.idUtilisateur.nom}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.label}>Sélectionner une équipe:</Text>
                    <ScrollView style={styles.teamList}>
                        {Teams.map((team) => (
                            <TouchableOpacity
                                key={team._id}
                                style={[
                                    styles.teamOption,
                                    selectedTeam === team._id && styles.selectedTeamOption
                                ]}
                                onPress={() => setSelectedTeam(team._id)}
                            >
                                <Text style={styles.teamOptionText}>{team.nom}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.label}>Capitaine:</Text>
                    <View style={styles.roleOptions}>
                        <TouchableOpacity
                            style={[
                                styles.roleOption,
                                isLeader == true && styles.selectedRoleOption
                            ]}
                            onPress={() => setIsLeader(true)}
                        >
                            <Text style={styles.roleOptionText}>Oui </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.roleOption,
                                isLeader == false && styles.selectedRoleOption
                            ]}
                            onPress={() => setIsLeader(false)}
                        >
                            <Text style={styles.roleOptionText}>Non</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="Role du joeur dans l'equipe"
                            value={role}
                            onChangeText={setRole}
                        />
                    </View>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setIsAssignModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.createButton]}
                            onPress={handleAssignMember}
                        >
                            <Text style={[styles.buttonText, styles.createButtonText]}>Assigner</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderTeamCreationModal = () => (
        <Modal
            visible={isTeamModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsTeamModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Créer une nouvelle équipe</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom de l'équipe"
                        value={teamName}
                        onChangeText={setTeamName}
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setIsTeamModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.createButton]}
                            onPress={handleCreateTeam}
                        >
                            <Text style={[styles.buttonText, styles.createButtonText]}>Créer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderRemoveMemberModal = () => (
        <Modal
            visible={isRemoveModalVisible}
            transparent
            animationType="fade"
            onRequestClose={handleCancelRemove}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Retirer un membre</Text>

                    {memberToRemove && (
                        <View style={styles.selectedMemberInfo}>
                            <Image
                                source={{ uri: `${Global.BaseFile}/${memberToRemove.idUser.photoProfil}` }}
                                style={styles.modalMemberImage}
                            />
                            <Text style={styles.modalMemberName}>
                                {memberToRemove.idUser.nom} {memberToRemove.idUser.prenom}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.label}>Êtes-vous sûr de vouloir retirer ce membre ?</Text>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={handleCancelRemove}
                        >
                            <Text style={styles.buttonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.createButton]}
                            onPress={handleConfirmRemove}
                        >
                            <Text style={[styles.buttonText, styles.createButtonText]}>Confirmer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF7622" />
            </View>
        );
    }

    const isMemberInAnyTeam = (memberId) => {
        return Teams.some((team) =>
            team.members.some((member) => member.idUser._id === memberId)
        );
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
                        <AntDesign name="left" size={20} color="#FF7622" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Gérer l'équipe</Text>
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
                    <TouchableOpacity
                        style={styles.createTeamButton}
                        onPress={() => setIsTeamModalVisible(true)}
                    >
                        <AntDesign name="plus" size={20} color="#FFFFFF" />
                        <Text style={styles.createTeamButtonText}>Créer une équipe</Text>
                    </TouchableOpacity>

                    <View style={styles.availablePlayersSection}>
                        <Text style={styles.sectionTitle}>Joueurs disponibles</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {ListeInvitaionConfirmee.filter(
                                (member) => !isMemberInAnyTeam(member.idUtilisateur._id)
                            ).map((member) => (
                                <MemberCard
                                    key={member._id}
                                    member={member}
                                    onPress={handleMemberPress}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.teamsSection}>
                        {Teams.length > 0 ? (
                            Teams.map((team) => (
                                <View key={team._id} style={styles.teamContainer}>
                                    <View style={styles.teamHeader}>
                                        <Text style={styles.teamName}>{team.nom}</Text>
                                        <Text style={styles.teamCount}>
                                            {team.members.length} joueurs
                                        </Text>
                                    </View>
                                    <View style={styles.teamMembers}>
                                        {team.members.length > 0 ? (
                                            team.members.map((member) => (
                                                <View key={member._id} style={styles.teamMemberCard}>
                                                    <Image
                                                        source={{ uri: `${Global.BaseFile}/${member.idUser.photoProfil}` }}
                                                        style={styles.teamMemberImage}
                                                    />
                                                    <Text style={styles.teamMemberName}>
                                                        {member.idUser.nom} {member.idUser.prenom}
                                                    </Text>
                                                    <Text style={styles.teamMemberRole}>
                                                        {member.isLeader ? "Capitaine" : "Joueur"}
                                                    </Text>
                                                    {/* Icône "X" pour retirer le membre */}
                                                    <TouchableOpacity
                                                        style={styles.removeIcon}
                                                        onPress={() => handleRemoveMemberPress({ ...member, teamId: team._id })}
                                                    >
                                                        <AntDesign name="close" size={16} color="#FF0000" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.emptyText}>Aucun joueur dans cette équipe</Text>
                                        )}
                                    </View>

                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Aucune équipe créée pour le moment</Text>
                        )}
                    </View>
                </ScrollView>
                {renderTeamCreationModal()}
                {renderAssignmentModal()}
                {renderRemoveMemberModal()}
            </SafeAreaView>
        </AlertNotificationRoot>
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
    content: {
        flex: 1,
        padding: 16,
    },
    createTeamButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF7622',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#FF7622',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    createTeamButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        marginLeft: 8,
    },
    availablePlayersSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    memberCard: {
        alignItems: 'center',
        marginRight: 16,
        width: 80,
    },
    memberImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#FF7622',
    },
    memberName: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#1A1A1A',
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    teamsSection: {
        gap: 20,
    },
    teamContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    teamHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    teamName: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1A1A1A',
    },
    teamCount: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#666666',
    },
    teamMembers: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    teamMemberCard: {
        width: (width - 80) / 3,
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 12,
    },
    teamMemberImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 8,
    },
    teamMemberName: {
        fontSize: 15,
        fontFamily: 'Sen-Regular',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 4,
    },
    teamMemberRole: {
        fontSize: 12,
        fontFamily: 'Sen-Regular',
        color: '#FF7622',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: width - 48,
        maxHeight: height * 0.8,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Sen-Bold',
        color: '#1A1A1A',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        marginBottom: 20,
        backgroundColor: '#F8F8F8',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    createButton: {
        backgroundColor: '#FF7622',
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
    },
    createButtonText: {
        color: '#FFFFFF',
    },
    selectedMemberInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalMemberImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#FF7622',
    },
    modalMemberName: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1A1A1A',
    },
    label: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    teamList: {
        maxHeight: 150,
        marginBottom: 20,
    },
    teamOption: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#F8F8F8',
    },
    selectedTeamOption: {
        backgroundColor: '#FFE4D6',
        borderWidth: 1,
        borderColor: '#FF7622',
    },
    teamOptionText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#1A1A1A',
    },
    roleOptions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    roleOption: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
    },
    selectedRoleOption: {
        backgroundColor: '#FFE4D6',
        borderWidth: 1,
        borderColor: '#FF7622',
    },
    roleOptionText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#1A1A1A',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    removeIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#666666',
        textAlign: 'center',
        marginTop: 20,
    },
});