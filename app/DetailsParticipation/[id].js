import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    StatusBar,
    Platform,
    SafeAreaView,
    ScrollView,
    Modal,
    TextInput
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
    AntDesign, MaterialCommunityIcons, FontAwesome
    , FontAwesome5, Ionicons, MaterialIcons, Feather,
} from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/fr';
import { getUserData } from "../../util/StorageUtils";
import GetParticipationByIdApi from "../../api/GetParticipationByIdApi";
import DeleteRequestByIdApi from "../../api/DeleteRequestByIdApi";
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import AddReviewToEventApi from "../../api/AddReviewToEventApi";

export default function DetailsParticipation() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [participationDetails, setParticipationDetails] = useState(null);
    const [idUserConnecte, setIdUserConnecte] = useState(null);
    const [isEvaluationModalVisible, setIsEvaluationModalVisible] = useState(false);


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([getCurrentUser(), fetchParticipation()]);
        } catch (error) {
            console.log("Erreur lors du chargement des données: " + error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentUser = async () => {
        try {
            const data = await getUserData();
            setIdUserConnecte(data.user._id);
        } catch (error) {
            console.log("Erreur récupération utilisateur connecté:", error);
        }
    };

    const fetchParticipation = async () => {
        try {
            const response = await GetParticipationByIdApi(id);
            setParticipationDetails(response.invitation);
        } catch (error) {
            console.log("Erreur " + error);
        }
    };


    const handleCancelRequest = async (participationId) => {
        setLoading(true);
        try {
            const response = await DeleteRequestByIdApi(participationId);
            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "Votre demande de participation a été annulée.",
                    button: 'OK',
                });
                router.push("/MesParticipationScreen")
            }
            else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur s'est produite lors de l'annulation de la demande.",
                });
            }
        } catch (error) {
            console.log(error)
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur est survenue lors du annuler de la demande du participation",
                button: 'OK',
            });
        }
    };

    const StarRating = ({ rating, setRating }) => {
        return (
            <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                    >
                        <AntDesign
                            name={star <= rating ? "star" : "staro"}
                            size={30}
                            color={star <= rating ? "#FFB800" : "#CBD5E1"}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };


    // Create the Evaluation Modal Component
    const EvaluationModal = ({ visible, onClose, onSubmit, eventTitle }) => {
        const [rating, setRating] = useState(0);
        const [comment, setComment] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        const idEvent = participationDetails?.idEvenement?._id
        const handleSubmit = async () => {

            if (rating === 0) {
                // Show error for no rating
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Attention',
                    textBody: 'Veuillez attribuer une note à l\'événement',
                });
                return;
            }

            if (comment.trim().length < 10) {
                // Show error for short comment
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Attention',
                    textBody: 'Veuillez écrire un commentaire d\'au moins 10 caractères',
                });
                return;
            }
            setIsSubmitting(true);
            try {
                const response = await AddReviewToEventApi(idEvent, idUserConnecte, rating, comment)
                if (response.message == "ok") {
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'Félicitations !',
                        textBody: 'Félicitations, votre avis a bien été envoyé.',
                    });
                }
                else if (response.message == "Vous avez déjà posté un avis pour cet événement.") {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Erreur',
                        textBody: 'Vous avez déjà posté un avis pour cet événement.',
                    });
                }
                else {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Erreur',
                        textBody: 'Une erreur est survenue lors de l\'envoi de l\'évaluation',
                    });
                }
                setRating(0);
                setComment('');
                onClose();
            } catch (error) {
                console.log(error)
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: 'Une erreur est survenue lors de l\'envoi de l\'évaluation',
                });
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <Modal
                visible={visible}
                transparent
                onRequestClose={onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <MaterialIcons name="rate-review" size={24} color="#FF7622" />
                            <Text style={styles.modalTitle}>Évaluer l'événement  </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                            >
                                <AntDesign name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.eventTitleContainer}>
                            <Text style={styles.eventTitleLabel}>Événement :</Text>
                            <Text style={styles.eventTitleText}>{eventTitle}</Text>
                        </View>

                        <View style={styles.ratingSection}>
                            <Text style={styles.ratingLabel}>Note globale</Text>
                            <StarRating rating={rating} setRating={setRating} />
                        </View>

                        <View style={styles.commentSection}>
                            <Text style={styles.commentLabel}>Votre avis</Text>
                            <TextInput
                                style={styles.commentInput}
                                multiline
                                numberOfLines={4}
                                placeholder="Partagez votre expérience..."
                                value={comment}
                                onChangeText={setComment}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isSubmitting && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <MaterialIcons name="send" size={20} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Envoyer mon évaluation</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };
    const renderEventInfo = () => {

        if (!participationDetails) return null;
        const event = participationDetails.idEvenement;
        const dateDebut = moment(event.dateHeureDebut).locale('fr').format('DD MMMM YYYY [à] HH:mm');

        return (
            <ScrollView style={styles.invitationCard}>
                <View style={styles.eventHeader}>
                </View>
                <View style={styles.eventDetailsContainer}>
                    <View style={styles.eventTitleRow}>
                        <Text style={styles.eventTitle}>{event.titre}</Text>
                        <View style={styles.sportTypeTag}>
                            <Text style={styles.sportTypeText}>{event?.idSport.icon}</Text>
                            <Text style={styles.sportTypeText}>{event?.idSport.nom}</Text>
                        </View>
                    </View>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <FontAwesome name="user-o" size={18} color="#64748B" />
                            <Text style={[styles.detailText, { textTransform: 'capitalize' }]}>
                                {event?.idOrganisateur?.nom}{'  '}{event?.idOrganisateur?.prenom}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="calendar-outline" size={18} color="#64748B" />
                            <Text style={styles.detailText}>{dateDebut}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="location-outline" size={18} color="#64748B" />
                            <Text style={styles.detailText}>{event.lieu}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="people-outline" size={18} color="#64748B" />
                            <Text style={styles.detailText}>Max: {event.maxParticipants} participants</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="public" size={18} color="#64748B" />
                            <Text style={styles.detailText}>Visibilité: {event.visibilite}</Text>
                        </View>
                    </View>
                    {event.condtionsReglement && event.condtionsReglement.length > 0 && (
                        <View style={styles.rulesContainer}>
                            <Text style={styles.rulesTitle}>Règlement:</Text>
                            {event.condtionsReglement.map((rule, index) => (
                                <View key={index} style={styles.ruleItem}>
                                    <Feather name="check-circle" size={18} color="#10B981" />
                                    <Text style={styles.ruleText}>{rule}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                {event.statut === "termine" && participationDetails.statut == 1 && (
                    <View style={styles.evaluationSection}>
                        <View style={styles.evaluationHeader}>
                            <View style={styles.evaluationIconContainer}>
                                <MaterialIcons name="rate-review" size={24} color="#FF7622" />
                            </View>
                            <Text style={styles.evaluationTitle}>Donnez votre avis sur l'événement</Text>
                        </View>
                        <View style={styles.evaluationContent}>
                            <View style={styles.evaluationInfo}>
                                <View style={styles.infoItem}>
                                    <View style={styles.infoIconContainer}>
                                        <MaterialCommunityIcons
                                            name="account-group-outline"
                                            size={20}
                                            color="#FF7622"
                                        />
                                    </View>
                                    <Text style={styles.infoText}>
                                        Aidez les autres participants à mieux connaître cet événement
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <View style={styles.infoIconContainer}>
                                        <MaterialCommunityIcons
                                            name="star-outline"
                                            size={20}
                                            color="#FF7622"
                                        />
                                    </View>
                                    <Text style={styles.infoText}>
                                        Notez la qualité de l'organisation et des activités
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <View style={styles.infoIconContainer}>
                                        <MaterialCommunityIcons
                                            name="lightbulb-outline"
                                            size={20}
                                            color="#FF7622"
                                        />
                                    </View>
                                    <Text style={styles.infoText}>
                                        Proposez des suggestions pour améliorer les prochains événements
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.evaluationButton}
                                onPress={() => setIsEvaluationModalVisible(true)}
                            >
                                <MaterialIcons name="rate-review" size={20} color="#FFFFFF" />
                                <Text style={styles.evaluationButtonText}>Donner mon avis</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {event.statut === "termine" && participationDetails.statut == 1 && (
                    <View style={styles.discussionSection}>
                        <View style={styles.discussionHeader}>
                            <MaterialCommunityIcons name="message-text-outline" size={24} color="#FF7622" />
                            <Text style={styles.discussionTitle}>Discussions post-événement</Text>
                        </View>
                        <View style={styles.discussionContent}>
                            <Text style={styles.discussionDescription}>
                                Partagez vos expériences, photos et souvenirs de l'événement avec les autres participants.
                                Cette section permet à tous de rester connectés et de revivre les moments forts de l'événement.
                            </Text>
                            <TouchableOpacity
                                style={styles.discussionButton}
                                onPress={() => router.push(`/PostEventScreen/${event._id}`)}
                            >
                                <MaterialCommunityIcons name="message-text-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.discussionButtonText}>Voir les discussions</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}


                {
                    event?.statut === "ouvert" && participationDetails?.statut === 0 && participationDetails?.modeParticipation === "demande" && (
                        <View style={styles.cancelRequestSection}>
                            <View style={styles.cancelRequestHeader}>
                                <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                                <Text style={styles.cancelRequestTitle}>Annuler la demande de participation</Text>
                            </View>
                            <Text style={styles.cancelRequestText}>
                                Vous pouvez annuler votre demande de participation à tout moment avant que l'organisateur ne l'accepte ou la refuse.
                            </Text>
                            <TouchableOpacity
                                style={styles.cancelRequestButton}
                                onPress={() => handleCancelRequest(participationDetails._id)}
                            >
                                <Text style={styles.cancelRequestButtonText}>Annuler la demande</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            </ScrollView >
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
                        <AntDesign name="left" size={14} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Détails participation  </Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <ScrollView style={styles.content}>
                        {renderEventInfo()}
                    </ScrollView>
                )}


                <EvaluationModal
                    visible={isEvaluationModalVisible}
                    onClose={() => setIsEvaluationModalVisible(false)}
                    eventTitle={participationDetails?.idEvenement?.titre}
                    onSubmit={async (data) => {
                        // Here you would call your API to submit the evaluation
                        //console.log('Evaluation data:', data);
                        // Add your API call here
                    }}
                />
            </SafeAreaView>

        </AlertNotificationRoot>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        marginLeft: 16,
        color: '#1E293B',
        fontFamily: 'Sen-Bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
        flex: 1,
    },
    invitationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
    },
    userTextContainer: {
        marginLeft: 12,
    },
    eventDetailsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
    },
    eventTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 17,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
        flex: 1,
    },
    sportTypeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5ED',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    sportTypeText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#FF7622',
        marginLeft: 4,
    },
    eventDescription: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginBottom: 16,
    },
    detailsRow: {
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14.5,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginLeft: 8,
    },
    rulesContainer: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    rulesTitle: {
        fontSize: 14,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ruleText: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginLeft: 8,
    },
    evaluationSection: {
        marginTop: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    evaluationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    evaluationIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#FFF5ED',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    evaluationTitle: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
        marginLeft: 12,
    },
    evaluationContent: {
        padding: 16,
    },
    evaluationInfo: {
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoIconContainer: {
        width: 32,
        height: 32,
        backgroundColor: '#FFF5ED',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#475569',
        lineHeight: 20,
    },
    evaluationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF7622',
        padding: 14,
        borderRadius: 12,
        shadowColor: '#FF7622',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    evaluationButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Sen-Bold',
        marginLeft: 8,
    },
    cancelRequestSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cancelRequestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cancelRequestTitle: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
        marginLeft: 8,
    },
    cancelRequestText: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginBottom: 16,
    },
    cancelRequestButton: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelRequestButtonText: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#EF4444',
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
        paddingHorizontal: 20,
        paddingBottom: 30,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
        marginLeft: 12,
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    eventTitleContainer: {
        marginTop: 16,
        marginBottom: 20,
    },
    eventTitleLabel: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginBottom: 4,
    },
    eventTitleText: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    ratingLabel: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
        marginBottom: 12,
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    starButton: {
        padding: 4,
    },
    commentSection: {
        marginBottom: 24,
    },
    commentLabel: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
        marginBottom: 12,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#1E293B',
        height: 120,
        backgroundColor: '#F8FAFC',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF7622',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#FF7622',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        marginLeft: 8,
    },
    discussionSection: {
        marginTop: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    discussionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    discussionTitle: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
        marginLeft: 12,
    },
    discussionContent: {
        padding: 16,
    },
    discussionDescription: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#475569',
        lineHeight: 20,
        marginBottom: 20,
    },
    discussionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF7622',
        padding: 14,
        borderRadius: 12,
        shadowColor: '#FF7622',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    discussionButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Sen-Bold',
        marginLeft: 8,
    },
});