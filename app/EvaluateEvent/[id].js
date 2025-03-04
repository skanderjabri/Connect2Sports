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
    RefreshControl,
    Dimensions,
    TextInput
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import GetDetailsEventApi from "../../api/GetDetailsEventApi";
import { getUserData } from "../../util/StorageUtils";
import GetRequestConfirmeeApi from "../../api/GetRequestConfirmeeApi";
import GetAllTeamsByIdEventApi from "../../api/GetAllTeamsByIdEventApi";
import Global from "../../util/Global";
import CreateReviewParticipationApi from "../../api/CreateReviewParticipationApi";
import AssignScoresToTeamsApi from "../../api/AssignScoresToTeamsApi";
import DetermineWinnerTennisApi from "../../api/DetermineWinnerTennisApi";
const { width } = Dimensions.get('window');

export default function EvaluateEvent() {
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [idUserConnecte, setIdUserConnecte] = useState(null);
    const [ListeInvitaionConfirmee, setListeInvitaionConfirmee] = useState([]);
    const [Teams, setTeams] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [teamScores, setTeamScores] = useState({}); // Pour stocker les scores des équipes
    const router = useRouter();
    const [selectedBadge, setSelectedBadge] = useState(null);
    const { id } = useLocalSearchParams();
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(1); // Nouvel état pour la note
    const [selectedBadges, setSelectedBadges] = useState([]); // Tableau pour stocker plusieurs badges
    const [selectedWinner, setSelectedWinner] = useState(null);

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

    const handleEvaluateParticipant = (participant) => {
        setSelectedParticipant(participant);
        setModalVisible(true);
    };


    const handleBadgeSelection = (badge) => {
        setSelectedBadges((prevBadges) => {
            if (prevBadges.includes(badge)) {
                // Si le badge est déjà sélectionné, le retirer
                return prevBadges.filter((b) => b !== badge);
            } else {
                // Sinon, l'ajouter au tableau
                return [...prevBadges, badge];
            }
        });
    };
    const handleSaveEvaluation = async () => {
        if (rating === 0) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Erreur',
                textBody: "La sélection des étoiles est obligatoire",
            });
            return;
        }
        if (comment.trim() === "") {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Erreur',
                textBody: "Le commentaire est obligatoire",
            });
            return;
        }
        if (selectedParticipant._id === idUserConnecte) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Erreur',
                textBody: "Vous ne pouvez pas évaluer votre propre participation.",
            });
            return;
        }

        try {
            const response = await CreateReviewParticipationApi(
                selectedParticipant._id, // ID de l'utilisateur évalué
                id, // ID de l'événement
                rating, // Note
                comment, // Commentaire
                selectedBadges // Tableau des badges sélectionnés
            );

            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "L'évaluation a été enregistrée avec succès",
                });
                setModalVisible(false); // Fermer le modal
                setSelectedBadges([]); // Réinitialiser les badges sélectionnés
                setComment(''); // Réinitialiser le commentaire
                setRating(1); // Réinitialiser la note
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: response.message || "Erreur lors de l'enregistrement de l'évaluation",
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur s'est produite lors de l'enregistrement de l'évaluation",
            });
        }
    };

    const handleSetTeamScore = (teamId, score) => {
        setTeamScores({ ...teamScores, [teamId]: score });
    };

    const determineWinner = async () => {
        const winner = Object.keys(teamScores).reduce((a, b) => teamScores[a] > teamScores[b] ? a : b);
        try {
            const response = await AssignScoresToTeamsApi(id, teamScores)
            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "Les scores des équipes ont été enregistrés avec succès",
                });
                onRefresh()
            }
            else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur s'est produite lors de l'enregistrement de l'évaluation",
                });
            }
        }
        catch (error) {
            console.log(error.message)
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur s'est produite lors de l'enregistrement de l'évaluation",
            });
        };
    }
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <AntDesign name="left" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Évaluer les Participants</Text>
        </View>
    );

    const renderTeamSection = (team) => (
        <View key={team._id} style={styles.teamSection}>
            <View style={styles.teamHeader}>
                <View style={styles.teamIcon}>
                    <MaterialIcons name="group" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.teamName}>{team.nom}</Text>
            </View>

            <View style={styles.membersContainer}>
                {team.members.map((member) => (
                    <TouchableOpacity
                        key={member._id}
                        style={styles.memberCard}
                        onPress={() => handleEvaluateParticipant(member.idUser)}
                    >
                        {teamScores[member._id] && (
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>{teamScores[member._id]}</Text>
                            </View>
                        )}
                        <Image
                            source={{ uri: Global.BaseFile + member.idUser.photoProfil }}
                            style={styles.memberImage}
                        />
                        <Text style={styles.memberName} numberOfLines={1}>
                            {member.idUser.nom} {member.idUser.prenom}
                        </Text>
                        <Text style={styles.evaluatePrompt} numberOfLines={1}>Appuyez pour évaluer</Text>

                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderEvaluationModal = () => (
        <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderContent}>
                            <Image
                                source={{ uri: Global.BaseFile + selectedParticipant?.photoProfil }}
                                style={styles.modalUserImage}
                            />
                            <View>
                                <Text style={styles.modalUserName}>
                                    {selectedParticipant?.nom} {selectedParticipant?.prenom}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <AntDesign name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.badgeTitle}>Badge Optionnels :</Text>
                    <View style={styles.badgeContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScrollContainer}>
                            {[
                                "Débutant 🔰",
                                "Assidu 🕒",
                                "Esprit d'Équipe 🤝",
                                "Fair-Play ✨",
                                "Endurance 💪",
                                "Persévérant 🔥",
                                "Passionné ❤️",
                                "Champion 🏆",
                                "Maître de la Discipline 🎓",
                                "Ambassadeur 🌍",
                            ].map((badge) => (
                                <TouchableOpacity
                                    key={badge}
                                    style={[
                                        styles.badgeButton,
                                        selectedBadges.includes(badge) && styles.badgeButtonSelected, // Appliquer le style si le badge est sélectionné
                                    ]}
                                    onPress={() => handleBadgeSelection(badge)} // Gérer la sélection
                                >
                                    <Text style={styles.badgeText}>{badge}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <Text style={styles.explanationText}>
                        <Ionicons name="star" size={16} color="#FF9500" /> Cliquez sur une étoile pour noter ce joueur.
                    </Text>
                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)} // Mettre à jour la note
                            >
                                <Ionicons
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={36}
                                    color="#FF9500"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.explanationText}>
                        <AntDesign name="message1" size={16} color="#666" /> Laissez un commentaire pour détailler votre évaluation.
                    </Text>

                    <TextInput
                        style={styles.commentInput}
                        placeholder="Votre commentaire"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        placeholderTextColor="#666"
                    />

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSaveEvaluation} // Enregistrer l'évaluation
                    >
                        <Text style={styles.submitButtonText}>Envoyer les avis</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const handleSelectWinner = async (winnerId) => {
        setSelectedWinner(winnerId);
    };

    const ValideSelectWinnerTennis = async () => {
        if (!selectedWinner) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Erreur',
                textBody: "Choisissez le gagnant, s'il vous plaît",
            });
            return;
        }
        const response = await DetermineWinnerTennisApi(id, selectedWinner)
        if (response.message == "ok") {
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Succès',
                textBody: "Le gagnant a été validé avec succès.",
            });
            onRefresh()
        }
        else {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur est survenue lors de l'enregistrement du gagnant.",
            });
        }

    }

    const renderTennisMatch = () => {
        const player1 = ListeInvitaionConfirmee[0]?.idUtilisateur;
        const player2 = ListeInvitaionConfirmee[1]?.idUtilisateur;

        if (!player1 || !player2) return null;
        // Déterminer si un joueur est le gagnant


        const isPlayer1Winner = event?.gagnantUser === player1._id;
        const isPlayer2Winner = event?.gagnantUser === player2._id;

        return (

            <View style={styles.tennisContainer}>
                <Text style={styles.sectionTitle}>Match de Tennis</Text>

                {!event?.isEvalue && event?.gagnantUser === null && (
                    <View style={styles.tooltip}>
                        <Ionicons name="information-circle" size={24} color="#FF9500" />
                        <Text style={styles.tooltipText}>
                            Sélectionnez le joueur gagnant du match en cliquant sur son profil.
                        </Text>
                    </View>
                )}

                <View style={styles.tennisMatchup}>
                    {/* Player 1 */}
                    <TouchableOpacity
                        style={[
                            styles.tennisPlayer,
                            selectedWinner === player1._id && styles.selectedPlayer,
                            isPlayer1Winner && styles.winnerPlayer
                        ]}
                        onPress={() => !event?.isEvalue && event?.gagnantUser === null && handleSelectWinner(player1._id)}
                        disabled={event?.isEvalue || event?.gagnantUser !== null}
                    >
                        <Image
                            source={{ uri: Global.BaseFile + player1.photoProfil }}
                            style={[
                                styles.tennisPlayerImage,
                                selectedWinner === player1._id && styles.selectedPlayerImage,
                                isPlayer1Winner && styles.winnerPlayerImage
                            ]}
                        />
                        <Text style={styles.tennisPlayerName}>
                            {player1.nom} {player1.prenom}
                        </Text>
                        {(selectedWinner === player1._id || isPlayer1Winner) && (
                            <View style={styles.winnerBadge}>
                                <Text style={styles.winnerBadgeText}>Gagnant 🏆</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* VS Text */}
                    <View style={styles.vsContainer}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>

                    {/* Player 2 */}
                    <TouchableOpacity
                        style={[
                            styles.tennisPlayer,
                            selectedWinner === player2._id && styles.selectedPlayer,
                            isPlayer2Winner && styles.winnerPlayer
                        ]}
                        onPress={() => !event?.isEvalue && event?.gagnantUser === null && handleSelectWinner(player2._id)}
                        disabled={event?.isEvalue || event?.gagnantUser !== null}
                    >
                        <Image
                            source={{ uri: Global.BaseFile + player2.photoProfil }}
                            style={[
                                styles.tennisPlayerImage,
                                selectedWinner === player2._id && styles.selectedPlayerImage,
                                isPlayer2Winner && styles.winnerPlayerImage
                            ]}
                        />
                        <Text style={styles.tennisPlayerName}>
                            {player2.nom} {player2.prenom}
                        </Text>
                        {(selectedWinner === player2._id || isPlayer2Winner) && (
                            <View style={styles.winnerBadge}>
                                <Text style={styles.winnerBadgeText}>Gagnant 🏆</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {!event?.isEvalue && event?.gagnantUser === null && (
                    <TouchableOpacity
                        style={styles.validateButton}
                        onPress={ValideSelectWinnerTennis}
                    >
                        <Text style={styles.validateButtonText}>Valider</Text>
                    </TouchableOpacity>
                )}

                <View style={{ marginTop: 20 }}>
                    <View style={styles.instructionContainer}>
                        <Ionicons name="information-circle" size={24} color="#FF9500" />
                        <Text style={styles.instructionText}>
                            Cliquez sur un participant pour lui attribuer une note, un commentaire et des badges.
                        </Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.membersRow}
                    >
                        {ListeInvitaionConfirmee.map((invitation) => (
                            <TouchableOpacity
                                key={invitation._id}
                                style={styles.memberCircle}
                                onPress={() => handleEvaluateParticipant(invitation.idUtilisateur)}
                            >
                                <Image
                                    source={{ uri: Global.BaseFile + invitation.idUtilisateur.photoProfil }}
                                    style={styles.memberImage}
                                />
                                <Text style={styles.memberName} numberOfLines={1}>
                                    {invitation.idUtilisateur.nom} {invitation.idUtilisateur.prenom}
                                </Text>
                                <Text style={styles.evaluatePrompt} numberOfLines={1}>
                                    Appuyez pour évaluer
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    };


    const renderScoreSection = () => {
        const team1 = Teams[0];
        const team2 = Teams[1];

        if (!team1 || !team2) return null;

        return (
            <View style={styles.scoreContainer}>
                <View style={styles.scoreSectionHeader}>
                    <Text style={styles.sectionTitle}>Score du match :</Text>
                </View>
                <View style={styles.scoreSection}>
                    <View style={styles.teamSide}>
                        <Text style={styles.teamName}>{team1.nom}</Text>
                    </View>

                    {event?.isEvalue == false ? (
                        <View style={styles.scoreInputContainer}>

                            <TextInput
                                style={styles.scoreInput}
                                keyboardType="numeric"
                                value={teamScores[team1._id]?.toString() || '0'}
                                onChangeText={(score) => handleSetTeamScore(team1._id, parseInt(score) || 0)}
                                maxLength={2}
                            />
                            <Text style={styles.scoreSeparator}>-</Text>
                            <TextInput
                                style={styles.scoreInput}
                                keyboardType="numeric"
                                value={teamScores[team2._id]?.toString() || '0'}
                                onChangeText={(score) => handleSetTeamScore(team2._id, parseInt(score) || 0)}
                                maxLength={2}
                            />
                        </View>
                    ) : (
                        <View style={styles.scoreInputContainer}>
                            <View
                                style={styles.scoreInput}
                            >
                                <View style={styles.scoreInput11}>
                                    <Text style={styles.scoreFinal} >{team1.score}</Text>
                                </View>
                            </View>
                            <Text style={styles.scoreSeparator}>-</Text>
                            <View
                                style={styles.scoreInput}
                            >
                                <View style={styles.scoreInput11}>

                                    <Text style={styles.scoreFinal} >{team2.score}</Text>
                                </View>
                            </View>


                        </View>


                    )}

                    <View style={styles.teamSide}>

                        <Text style={styles.teamName}>{team2.nom}</Text>
                    </View>
                </View>
                {event?.isEvalue == false && (
                    <>
                        <TouchableOpacity
                            style={styles.validateButton}
                            onPress={determineWinner}
                        >
                            <Text style={styles.validateButtonText}>Valider le Score</Text>
                        </TouchableOpacity>
                        <View style={styles.tooltip}>
                            <Text style={styles.tooltipText}>
                                Entrez le score final du match. Le score sera utilisé pour déterminer l'équipe gagnante.
                            </Text>
                        </View>
                    </>
                )}

            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF9500" />
            </View>
        );
    }

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
                {renderHeader()}
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {(event.nomSporttype === "Football" || event.nomSporttype === "Padel") && (
                        <>
                            {renderScoreSection()}
                            {Teams.map((team) => renderTeamSection(team))}
                        </>
                    )}

                    {(event.nomSporttype === "Tennis") && (
                        <View>
                            {renderTennisMatch()}

                        </View>
                    )}
                    {(event.nomSporttype === "Musculation" || event.nomSporttype === "Yoga" ||
                        event.nomSporttype === "EMS (sport avec électrodes)" || event.nomSporttype === "Pilate"
                        || event.nomSporttype === "Fitness") && (
                            <>
                                <View style={styles.instructionContainer}>
                                    <Ionicons name="information-circle" size={24} color="#FF9500" />
                                    <Text style={styles.instructionText}>
                                        Cliquez sur un participant pour lui attribuer une note, un commentaire et des badges.
                                    </Text>
                                </View>

                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.membersRow}
                                >
                                    {
                                        ListeInvitaionConfirmee.map((invitation) => (
                                            <TouchableOpacity
                                                key={invitation._id}
                                                style={styles.memberCircle}
                                                onPress={() => handleEvaluateParticipant(invitation.idUtilisateur)}
                                            >
                                                <Image
                                                    source={{ uri: Global.BaseFile + invitation.idUtilisateur.photoProfil }}
                                                    style={styles.memberImage}
                                                />
                                                <Text style={styles.memberName} numberOfLines={1}>
                                                    {invitation.idUtilisateur.nom} {invitation.idUtilisateur.prenom}
                                                </Text>
                                                <Text style={styles.evaluatePrompt} numberOfLines={1}>Appuyez pour évaluer</Text>

                                            </TouchableOpacity>
                                        ))}
                                </ScrollView>
                            </>)}
                </ScrollView>
                {renderEvaluationModal()}
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#000000',
        flex: 1,
    },
    teamSection: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    teamName: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#000000',
        marginBottom: 8,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: "Sen-Regular",
        color: "#FF9500",
        fontSize: 17,
    },
    scoreLabel: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#666666',
        marginRight: 8,
    },
    scoreButton: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    scoreText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
    },

    memberImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    memberName: {
        fontSize: 14,
        fontFamily: 'Sen-Bold',
        color: '#000000',
        textAlign: 'center',
    },
    memberRole: {
        fontSize: 12,
        fontFamily: 'Sen-Regular',
        color: '#666666',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalUserImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    modalUserName: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#000000',
    },
    modalUserStatus: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#666666',
    },
    closeButton: {
        padding: 8,
    },
    badgeTitle: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#000000',
        marginBottom: 16,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    badgeButton: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 15
    },
    badgeButtonSelected: {
        backgroundColor: '#FF950015',
    },
    badgeText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#000000',
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginVertical: 24,
    },
    commentInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        height: 120,
        textAlignVertical: 'top',
        marginBottom: 24,
        fontSize: 16,
        fontFamily: 'Sen-Regular',
    },
    submitButton: {
        backgroundColor: '#FF9500',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },

    scoreContainer: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    scoreSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },


    scoreInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    scoreInput: {
        width: 50,
        height: 50,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'Sen-Bold',
        color: '#000000',
    },
    scoreSeparator: {
        fontSize: 24,
        fontFamily: 'Sen-Bold',
        color: '#000000',
        marginHorizontal: 12,
    },
    validateButton: {
        backgroundColor: '#FF9500',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    validateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
    },
    teamSection: {
        marginBottom: 32,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    teamHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    teamIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF9500',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    teamName: {
        fontSize: 20,
        fontFamily: 'Sen-Bold',
        color: '#000000',
    },
    membersContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 16,
    },
    memberCard: {
        width: (width - 80) / 3,
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    memberImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 8,
        borderWidth: 3,
        borderColor: '#FF9500',
    },
    memberName: {
        fontSize: 14,
        fontFamily: 'Sen-Bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 4,
    },
    memberRole: {
        fontSize: 12,
        fontFamily: 'Sen-Regular',
        color: '#666666',
        textAlign: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF9500',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    ratingText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Sen-Bold',
    },
    membersRow: {
        paddingHorizontal: 16,
    },
    memberCircle: {
        alignItems: 'center',
        marginRight: 20,
        width: 80,
    },
    memberImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    memberName: {
        fontSize: 14,
        fontFamily: 'Sen-Bold',
        color: '#000000',
        textAlign: 'center',
    },
    memberRole: {
        fontSize: 12,
        fontFamily: 'Sen-Regular',
        color: '#666666',
        textAlign: 'center',
    },
    explanationText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#666666',
        marginBottom: 12,
        textAlign: 'center',
        marginTop: 10
    },
    tooltip: {
        backgroundColor: '#eee',
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        marginTop: 20
    },
    tooltipText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'Sen-Regular',
    },
    evaluatePrompt: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: "center"
    },
    scoreFinal: {
        textAlign: "center",
        fontFamily: "Sen-Bold",
        fontSize: 22
    },
    scoreInput11: {
        flex: 1,
        justifyContent: "center", // Centre verticalement
        alignItems: "center",
    },
    instructionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF950015',
        padding: 18,
        borderRadius: 8,
        marginBottom: 24,
        paddingHorizontal: 30
    },
    instructionText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#000000',
        marginLeft: 8,

    },
    tennisContainer: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tennisMatchup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20,
    },
    tennisPlayer: {
        alignItems: 'center',
        flex: 1,
    },
    tennisPlayerImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#FF9500',
    },
    tennisPlayerName: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#000000',
        marginTop: 8,
        textAlign: 'center',
    },
    vsContainer: {
        paddingHorizontal: 20,
    },
    vsText: {
        fontSize: 24,
        fontFamily: 'Sen-Bold',
        color: '#FF9500',
    },
    selectorIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF950015',
        padding: 8,
        borderRadius: 20,
        marginTop: 8,
    },
    selectorText: {
        fontSize: 12,
        fontFamily: 'Sen-Regular',
        color: '#FF9500',
        marginLeft: 4,
    },
    selectWinnerButton: {
        backgroundColor: '#FF9500',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    selectWinnerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
    },
    tooltip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF950015',
        padding: 12,
        borderRadius: 8,
        marginVertical: 16,
    },
    tooltipText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#666',
    },
    selectedPlayer: {
        transform: [{ scale: 1.05 }],
    },
    selectedPlayerImage: {
        borderColor: '#28a745',
        borderWidth: 4,
    },
    winnerBadge: {
        backgroundColor: '#28a745',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 8,
    },
    winnerBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Sen-Bold',
    },
    winnerPlayer: {
        transform: [{ scale: 1.05 }],
        opacity: 1,
    },
    winnerPlayerImage: {
        borderColor: '#28a745',
        borderWidth: 4,
    }
});