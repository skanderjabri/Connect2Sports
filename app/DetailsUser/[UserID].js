import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Modal, TextInput, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert, StatusBar, Platform } from "react-native";
import { FontAwesome5, AntDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import GetUserByIdApi from "../../api/GetUserByIdApi";
import CheckRequestBetweenUsersApi from "../../api/CheckRequestBetweenUsersApi";
import SendInvitationApi from "../../api/SendInvitationApi";
import CancelInvitationApi from "../../api/CancelInvitationApi";
import ConfirmInvitationApi from "../../api/ConfirmInvitationApi";
import isUserInFavorisApi from "../../api/isUserInFavorisApi";
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import AddUserInFavorisApi from "../../api/AddUserInFavorisApi";
import Global from "../../util/Global";
import { getUserData } from "../../util/StorageUtils";
import AddMessageApi from "../../api/addMessageApi";
import GetUserParticipationHistoryApi from "../../api/GetUserParticipationHistoryApi";
import GetBadgesByUserApi from "../../api/Stat/GetBadgesByUserApi";
import GetUserPointsApi from "../../api/Stat/GetUserPointsApi";
import GetReviewStatsByUserApi from "../../api/GetReviewStatsByUserApi";
export default function DetailsUser() {
    const router = useRouter();
    const { UserID } = useLocalSearchParams();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingInvitation, setIsSendingInvitation] = useState(false); // État pour gérer le chargement pendant l'envoi
    const [requestStatus, setRequestStatus] = useState(null); // État pour stocker les informations de la demande
    const [isFriend, setIsFriend] = useState(false);
    const [isCancelingInvitation, setIsCancelingInvitation] = useState(false);
    const [isConfirmingInvitation, setIsConfirmingInvitation] = useState(false);
    const [inFavoris, setInFavoris] = useState(null);
    const [IdUserConnecte, setIdUserConnecte] = useState(null);
    const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [HistoriqueParticipation, setHistoriqueParticipation] = useState([]);
    const [TotalePoints, setTotalePoints] = useState(0);
    const [TotaleBadges, setTotaleBadges] = useState(0);
    const [averageRating, setaverageRating] = useState(null);
    const [totalReviews, settotalReviews] = useState(null);

    const [message, setMessage] = useState('');


    useEffect(() => {
        Promise.all([fetechUser(), checkRequestBetweenUsers(),
        verifUserInFavorisList(), fetechUserParticipationHistory(), fetchBadges(),
        fetchPointsUser(), fetchStatReviews()])
            .then(() => setIsLoading(false))
            .catch((error) =>
                console.log("Erreur lors du chargement des données: " + error)
            );
    }, [UserID]);

    const fetechUser = async () => {

        const data = await getUserData();

        setIdUserConnecte(data.user._id)


        return GetUserByIdApi(UserID)

            .then((response) => {
                setUser(response.user);
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };

    const checkRequestBetweenUsers = async () => {

        const data = await getUserData();

        const IdUserConnecte = data.user._id;

        return CheckRequestBetweenUsersApi(IdUserConnecte, UserID)
            .then((response) => {
                if (response.message === "Aucune demande trouvee entre ces utilisateurs") {
                    setRequestStatus(null);
                    setIsFriend(false);
                } else {
                    setRequestStatus(response.request);
                    setIsFriend(response.request.StatusRequest === 1);
                }
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };
    const fetechUserParticipationHistory = async () => {

        const data = await getUserData();

        const IdUserConnecte = data.user._id;

        return GetUserParticipationHistoryApi(IdUserConnecte)
            .then((response) => {
                setHistoriqueParticipation(response.data)
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };


    const fetchBadges = async () => {
        try {
            if (UserID) {
                const response = await GetBadgesByUserApi(UserID);
                setTotaleBadges(response.data.totalBadges);
            }
        } catch (error) {
            console.log("Erreur " + error);
        }
    };

    const fetchPointsUser = async () => {
        try {
            if (UserID) {
                const response = await GetUserPointsApi(UserID);
                setTotalePoints(response.data.totalPoints);
            }
        } catch (error) {
            console.log("Erreur " + error);
        }
    };

    const fetchStatReviews = async () => {
        try {
            if (UserID) {
                const response = await GetReviewStatsByUserApi(UserID);
                setaverageRating(response.averageRating);
                settotalReviews(response.totalReviews);
            }
        } catch (error) {
            console.log("Erreur " + error);
        }
    };

    const renderPrivateProfileOverlay = () => (
        <View style={styles.privateProfileContainer}>
            <Ionicons name="lock-closed" size={50} color="#32343E" />
            <Text style={styles.privateProfileTitle}>Compte Privé</Text>
            <Text style={styles.privateProfileDescription}>
                Seules quelques informations sont visibles. Devenez ami(e) pour voir plus de détails.
            </Text>
        </View>
    );

    const handleAddFriend = async () => {
        try {
            setIsSendingInvitation(true); // Activer l'état de chargement pendant l'envoi

            const data = await getUserData();

            const IdUserConnecte = data.user._id;



            const response = await SendInvitationApi(IdUserConnecte, UserID);
            if (response.message === "ok") {
                // Mettre à jour l'état local en récupérant le nouvel état de la demande
                await checkRequestBetweenUsers(); // Appeler cette fonction pour récupérer le nouvel état
            } else {
                // Gérer les erreurs spécifiques de l'API
                Alert.alert("Erreur", "Une erreur s'est produite lors de l'envoi de l'invitation.");
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'invitation :", error);
            Alert.alert("Erreur", "Une erreur s'est produite lors de l'envoi de l'invitation.");
        } finally {
            setIsSendingInvitation(false); // Désactiver l'état de chargement
        }
    };



    const handleCancelInvitation = async () => {
        try {
            setIsCancelingInvitation(true);

            const response = await CancelInvitationApi(requestStatus._id);

            if (response.message === "ok") {
                await checkRequestBetweenUsers();
            } else {
                Alert.alert("Erreur", "Une erreur s'est produite lors de l'annulation de l'invitation.");
            }
        } catch (error) {
            console.error("Erreur lors de l'annulation de l'invitation :", error);
            Alert.alert("Erreur", "Une erreur s'est produite lors de l'annulation de l'invitation.");
        } finally {
            setIsCancelingInvitation(false);
        }
    };
    const handleConfirmInvitation = async () => {
        try {
            setIsConfirmingInvitation(true);

            const response = await ConfirmInvitationApi(requestStatus._id);

            if (response.message === "ok") {
                await checkRequestBetweenUsers();
            } else {
                Alert.alert("Erreur", "Une erreur s'est produite lors de la confirmation de l'invitation.");
            }
        } catch (error) {
            console.error("Erreur lors de la confirmation de l'invitation :", error);
            Alert.alert("Erreur", "Une erreur s'est produite lors de la confirmation de l'invitation.");
        } finally {
            setIsConfirmingInvitation(false);
        }
    };

    const verifUserInFavorisList = async () => {
        const data = await getUserData();
        const userId = data.user._id;
        let favoriUserID = UserID; // Utilisez directement SalleID depuis les paramètres

        try {
            const response = await isUserInFavorisApi(userId, favoriUserID);
            if (response.isFavorite) {
                setInFavoris(true);
            } else {
                setInFavoris(false); // Mettre à jour l'état pour indiquer que la salle n'est pas dans les favoris
            }
        } catch (error) {
            console.error("Error checking if salle is in favoris:", error);
            setInFavoris(false); // En cas d'erreur, supposer que la salle n'est pas dans les favoris
        }
    };


    const addToFavoriteOrRemoveInFavoris = async () => {
        const data = await getUserData();
        const userId = data.user._id;
        let favoriteUser = UserID;// ID de la salle de sport

        try {
            const response = await AddUserInFavorisApi(userId, favoriteUser);
            if (response.message === "ok") {
                // La salle a été ajoutée aux favoris
                setInFavoris(true); // Mettre à jour l'état local
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "L'utilisateur a été ajouté à vos favoris.",
                });
            } else if (response.message === "deleted") {
                // La salle a été supprimée des favoris
                setInFavoris(false); // Mettre à jour l'état local
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "L'utilisateur a été supprimée de vos favoris.",
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout ou de la suppression des favoris:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur s\'est produite. Veuillez réessayer.',
            });
        }
    };


    const handleSendMessage = async () => {
        if (!message.trim()) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez écrire un message',
            });
            return;
        }

        setIsSendingMessage(true); // Active le chargement

        try {
            const response = await AddMessageApi(IdUserConnecte, UserID, message);
            if (response.message === "ok") {
                setMessage('');
                setIsMessageModalVisible(false);
                router.push(`/ChatDetailsScreen/${response.conversation._id}?otherUserName=${encodeURIComponent(user.nom + ' ' + user.prenom)}`);

            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Erreur lors de l\'envoi du message.',
            });
        } finally {
            setIsSendingMessage(false); // Désactive le chargement après l'envoi
        }
    };




    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"} // Texte foncé sur iOS, clair sur Android
                    backgroundColor={Platform.OS === "android" ? "transparent" : "transparent"} // Bleu sur Android, transparent sur iOS
                    translucent
                />



                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text><AntDesign name="left" size={14} color="#181C2E" style={{ fontFamily: "Sen-Medium" }} /></Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Détails sportif</Text>
                </View>

                {isLoading ? (
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <ScrollView style={{ paddingHorizontal: 20, paddingBottom: 190 }} showsVerticalScrollIndicator={false} >
                        <View style={styles.bannerContainer}>
                            <Image
                                source={{ uri: Global.BaseFile + user.photoProfil }}
                                style={styles.bannerImage}
                                resizeMode="stretch"
                                accessible={true}
                                accessibilityLabel="Photo de profil de l'athlète"
                            />
                            <View style={styles.professionalBadge}>
                                <Text style={styles.professionalText}>{user.niveauSportif}</Text>
                            </View>
                            <TouchableOpacity style={styles.favoriteButton}
                                onPress={addToFavoriteOrRemoveInFavoris}
                            >
                                <FontAwesome
                                    name={inFavoris ? "heart" : "heart-o"} // Utiliser "heart" si la salle est dans les favoris
                                    size={24}
                                    color={inFavoris ? "#FF6B6B" : "white"} // Couleur rose si la salle est dans les favoris
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.athleteName}>{user.nom}{" "}{user.prenom}</Text>

                        {/* Informations supplémentaires */}
                        <View style={styles.infoRow}>
                            <View style={styles.locationContainer}>
                                <FontAwesome5 name="map-marker-alt" size={14} color="#AFAFAF" />
                                <Text style={styles.locationText}>{user.adresse}</Text>
                            </View>
                            <View style={styles.ratingContainer}>
                                <FontAwesome5 name="star" size={14} color="#FB6D3A" />
                                <Text style={styles.ratingText}>{averageRating}</Text>
                                <Text style={styles.reviewCount}>({totalReviews} Avis)</Text>
                            </View>
                        </View>

                        <View style={styles.invitationButtonContainer}>
                            {requestStatus === null ? (
                                <TouchableOpacity
                                    style={[styles.invitationButton, styles.addFriendButton, styles.rightAlignedButton]}
                                    onPress={handleAddFriend}
                                    disabled={isSendingInvitation} // Désactiver le bouton pendant l'envoi
                                >
                                    {isSendingInvitation ? (
                                        <ActivityIndicator size="small" color="#fff" /> // Afficher un spinner pendant le traitement
                                    ) : (
                                        <>
                                            <FontAwesome5 name="user-plus" size={18} color="#fff" style={styles.buttonIcon} />
                                            <Text style={styles.invitationButtonText}>Ajouter ami(e)</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ) : requestStatus.StatusRequest === 1 ? (

                                <View style={styles.friendActionContainer}>
                                    <TouchableOpacity
                                        style={styles.messageButton} // Utiliser le même style de base que messageButton
                                    >
                                        <FontAwesome5 name="user-friends" size={20} color="#4CAF50" />
                                        <Text style={[styles.messageButtonText, { color: '#4CAF50' }]}>Ami(e)</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.messageButton}
                                        onPress={() => setIsMessageModalVisible(true)}
                                    >
                                        <FontAwesome5 name="facebook-messenger" size={20} color="#FF7622" />
                                        <Text style={styles.messageButtonText}>Message</Text>
                                    </TouchableOpacity>
                                </View>

                            ) : requestStatus.Id_Emetteur._id === IdUserConnecte ? (
                                <TouchableOpacity
                                    style={[styles.invitationButton, styles.pendingInvitationButton, styles.rightAlignedButton]}
                                    onPress={handleCancelInvitation}
                                    disabled={isCancelingInvitation}
                                >
                                    {isCancelingInvitation ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <FontAwesome5 name="user-times" size={18} color="#fff" style={styles.buttonIcon} />
                                            <Text style={styles.invitationButtonText}>Annuler l'invitation</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                            ) : (
                                <View style={styles.rightAlignedDualButtonContainer}>
                                    <TouchableOpacity
                                        style={[styles.invitationButton, styles.declineInvitationButton, { marginRight: 10 }]}
                                        onPress={handleCancelInvitation}
                                        disabled={isCancelingInvitation}
                                    >
                                        {isCancelingInvitation ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>

                                                <FontAwesome5 name="times" size={18} color="#FF7622" style={styles.buttonIcon} />
                                                <Text style={styles.declineButtonText}>Refuser</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.invitationButton, styles.acceptInvitationButton]}
                                        onPress={handleConfirmInvitation}
                                        disabled={isConfirmingInvitation} // Désactiver le bouton pendant la confirmation
                                    >
                                        {isConfirmingInvitation ? (
                                            <ActivityIndicator size="small" color="#fff" /> // Afficher un spinner pendant le traitement
                                        ) : (
                                            <>
                                                <FontAwesome5 name="check" size={18} color="#fff" style={styles.buttonIcon} />
                                                <Text style={styles.invitationButtonText}>Accepter</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>


                        {user.sportsPratiques && user.sportsPratiques.length > 0 && (
                            <View>
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>SPORTS PRATIQUÉS</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsScroll}>
                                    <View style={styles.sportsScrollContent}>
                                        {user.sportsPratiques.map((sport, index) => (
                                            <View key={index} style={styles.sportItem}>
                                                <View style={styles.iconContainer}>
                                                    <Text style={{ fontFamily: "Sen-Regular", fontSize: 22 }}>{sport.icon}</Text>
                                                </View>
                                                <Text style={styles.sportLabel}>{sport.nom}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}
                        {isFriend ? (
                            <View>

                                {user.disponibilitesPlaces && user.disponibilitesPlaces.length > 0 && (
                                    <View>
                                        <View style={styles.divider} />
                                        <Text style={styles.sectionTitle}>LIEUX PRÉFÉRÉS</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View style={styles.locationsList}>
                                                {user.disponibilitesPlaces.map((place, index) => (
                                                    <View key={index} style={styles.preferredLocation}>
                                                        <FontAwesome5 name="map-marker-alt" size={16} color="#FB6D3A" />
                                                        <Text style={styles.locationName}>{place}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                )}

                                {user.disponibilitesTimes && user.disponibilitesTimes.length > 0 && (
                                    <View>
                                        <View style={styles.divider} />
                                        <Text style={styles.sectionTitle}>DISPONIBILITÉS</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View style={styles.availabilityContainer}>
                                                {user.disponibilitesTimes.map((time, index) => (
                                                    <View key={index} style={styles.timeSlot}>
                                                        <Text style={styles.timeSlotText}>{time}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                )}

                                {user.description && (
                                    <View>
                                        <View style={styles.divider} />
                                        <Text style={styles.sectionTitle}>DESCRIPTION</Text>
                                        <Text style={styles.description}>
                                            {user.description}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>HISTORIQUE DES PARTICIPATIONS</Text>
                                {HistoriqueParticipation.length > 0 ? (
                                    <View style={styles.historyContainer}>
                                        {HistoriqueParticipation.map((participation, index) => {
                                            // Formatage des dates
                                            const eventDate = new Date(participation.eventDate);
                                            const participationDate = new Date(participation.participationDate);

                                            return (
                                                <View key={index} style={styles.historyItem}>
                                                    <View style={styles.historyIconContainer}>
                                                        <FontAwesome5 name="calendar-check" size={16} color="#FF7622" />
                                                    </View>
                                                    <View style={styles.historyContent}>
                                                        <Text style={styles.historyEventName}>
                                                            {participation.eventName}
                                                        </Text>
                                                        <View style={styles.historyDetails}>
                                                            <View style={styles.historyDetailItem}>
                                                                <FontAwesome5 name="map-marker-alt" size={12} color="#AFAFAF" />
                                                                <Text style={styles.historyDetailText}>
                                                                    {participation.eventLocation}
                                                                </Text>
                                                            </View>
                                                            <View style={styles.historyDetailItem}>
                                                                <FontAwesome5 name="clock" size={12} color="#AFAFAF" />
                                                                <Text style={styles.historyDetailText}>
                                                                    {eventDate.toLocaleDateString('fr-FR', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric'
                                                                    })}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <Text style={styles.participationDate}>
                                                            Inscrit le {participationDate.toLocaleDateString('fr-FR', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ) : (
                                    <View style={styles.emptyHistoryContainer}>
                                        <FontAwesome5 name="calendar-times" size={40} color="#AFAFAF" />
                                        <Text style={styles.emptyHistorySubtext}>
                                            Aucun historique de participation disponible
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.statsSection}>
                                    {/* Carte pour les points totaux */}
                                    <View style={styles.statCard}>
                                        <View style={styles.statIconContainer}>
                                            <FontAwesome5 name="trophy" size={24} color="#FF7622" />
                                        </View>
                                        <Text style={styles.statValue}>{TotalePoints}</Text>
                                        <Text style={styles.statLabel}>Points Totaux</Text>
                                    </View>

                                    {/* Carte pour les badges totaux */}
                                    <View style={styles.statCard}>
                                        <View style={styles.statIconContainer}>
                                            <FontAwesome5 name="medal" size={24} color="#FF7622" />
                                        </View>
                                        <Text style={styles.statValue}>{TotaleBadges}</Text>
                                        <Text style={styles.statLabel}>Badges Totaux</Text>
                                    </View>
                                </View>


                            </View>
                        ) : (
                            renderPrivateProfileOverlay()
                        )}
                    </ScrollView>
                )}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isMessageModalVisible}
                    onRequestClose={() => setIsMessageModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Envoyer un message</Text>
                                <TouchableOpacity
                                    onPress={() => setIsMessageModalVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <AntDesign name="close" size={24} color="#32343E" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.messageInput}
                                placeholder="Écrivez votre message..."
                                multiline={true}
                                value={message}
                                onChangeText={setMessage}
                            />
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={handleSendMessage}
                                disabled={isSendingMessage}
                            >
                                {isSendingMessage ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.sendButtonText}>Envoyer</Text>
                                )}
                            </TouchableOpacity>

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
    headerContainer: {
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
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bannerContainer: {
        marginTop: 10,
        height: 240,
        borderRadius: 20,
        overflow: "hidden",
    },
    bannerImage: {
        width: "100%",
        height: "100%"
    },
    professionalBadge: {
        position: "absolute",
        top: 11,
        left: 16,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 61,
        padding: 8
    },
    professionalText: {
        color: "#32343E",
        fontSize: 15,
        fontFamily: "Sen-Medium",
    },
    athleteName: {
        marginTop: 12,
        fontSize: 18,
        color: "#32343E",
        fontFamily: 'Sen-Bold',
        textTransform: "capitalize"
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 14
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    locationText: {
        color: "#AFAFAF",
        fontSize: 14,
        fontFamily: "Sen-Regular"
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5
    },
    ratingText: {
        color: "#FB6D3A",
        fontSize: 15,
        fontFamily: "Sen-Bold"
    },
    reviewCount: {
        color: "#AFAFAF",
        fontSize: 15,
        fontFamily: "Sen-Regular"
    },
    divider: {
        height: 1.4,
        backgroundColor: "#F0F4F9",
        marginVertical: 17
    },
    sectionTitle: {
        fontSize: 16,
        color: "#32343E",
        textTransform: "uppercase",
        marginBottom: 13,
        fontFamily: 'Sen-Regular'
    },
    sportsScroll: {
        marginBottom: 10
    },
    sportsScrollContent: {
        flexDirection: "row",
        gap: 15,
        alignItems: "center"
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#f8eae4",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    sportItem: {
        alignItems: "center",
        marginRight: 15,
    },
    sportLabel: {
        fontSize: 14,
        fontFamily: "Sen-Regular",
        color: "#32343E",
        textAlign: "center",
    },
    locationsList: {
        flexDirection: "row",
        gap: 20
    },
    preferredLocation: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    locationName: {
        fontSize: 15.5,
        color: "#AFAFAF",
        fontFamily: "Sen-Regular"
    },
    availabilityContainer: {
        flexDirection: "row",
        gap: 10
    },
    timeSlot: {
        backgroundColor: "#F0F4F9",
        padding: 10,
        borderRadius: 10
    },
    timeSlotText: {
        fontSize: 15.5,
        color: "#32343E",
        fontFamily: 'Sen-Regular',
    },
    description: {
        fontSize: 15.5,
        color: "#747783",
        marginTop: 10,
        fontFamily: 'Sen-Regular',
        textAlign: 'justify',
        lineHeight: 27
    },
    invitationButtonContainer: {
        marginTop: 20,
        alignItems: 'center', // Align to the right
    },
    dualButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightAlignedDualButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align to the right
        alignItems: 'center',
    },
    rightAlignedButton: {
        alignSelf: 'flex-end', // Ensure individual button is right-aligned
        minWidth: 180, // Slightly reduced width
    },
    invitationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        minWidth: 200,
    },
    buttonIcon: {
        marginRight: 10,
    },
    invitationButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: "Sen-Bold",
        textAlign: 'center',
    },
    addFriendButton: {
        backgroundColor: "#FF7622",
    },
    pendingInvitationButton: {
        backgroundColor: "#FFA500", // Orange for pending
    },
    acceptInvitationButton: {
        backgroundColor: "#4CAF50",
    },
    declineInvitationButton: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#FF7622",
    },
    declineButtonText: {
        color: "#FF7622",
        fontSize: 16,
        fontFamily: "Sen-Bold",
        textAlign: 'center',
    },
    friendsButton: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#4CAF50",
    },
    friendsButtonText: {
        color: "#4CAF50",
        fontSize: 16,
        fontFamily: "Sen-Bold",
        textAlign: 'center',
    },
    privateProfileContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: '#F0F4F9',
        borderRadius: 15,
    },
    privateProfileTitle: {
        fontSize: 22,
        fontFamily: 'Sen-Bold',
        color: '#32343E',
        marginTop: 15,
    },
    privateProfileDescription: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#747783',
        textAlign: 'center',
        marginTop: 10,
    },
    favoriteButton: {
        position: 'absolute',
        top: 11,
        right: 10,
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#32343E',
    },
    closeButton: {
        padding: 5,
    },
    messageInput: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 10,
        padding: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        fontFamily: 'Sen-Regular',
        fontSize: 16,
        marginBottom: 20,
    },
    sendButton: {
        backgroundColor: "#FF7622",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: "#A0A0A0", // Couleur grise pour indiquer que le bouton est désactivé
    },
    sendButtonText: {
        color: "#fff",
        fontFamily: "Sen-Bold",
        fontSize: 16,
    }, friendActionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end', // Aligner à droite
        gap: 10,
        marginTop: 20,
    },
    messageButton: {
        flexDirection: 'row', // Pour aligner l'icône et le texte
        alignItems: 'center',
        backgroundColor: '#F4F5F7',
        borderRadius: 18,
        paddingHorizontal: 50, // Augmenter l'espace horizontal
        height: 45,
    },

    messageButtonText: {
        marginLeft: 8,
        color: '#FF7622',
        fontSize: 16,
        fontFamily: "Sen-Bold",
    },

    historyContainer: {
        marginTop: 10,
    },
    historyItem: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FB',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
    },
    historyIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFE5D8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    historyContent: {
        flex: 1,
    },
    historyEventName: {
        fontSize: 16,
        color: '#32343E',
        fontFamily: 'Sen-Bold',
        marginBottom: 8,
    },
    historyDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    historyDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    historyDetailText: {
        fontSize: 14,
        color: '#747783',
        fontFamily: 'Sen-Regular',
    },
    participationDate: {
        fontSize: 13,
        color: '#AFAFAF',
        fontFamily: 'Sen-Regular',
        fontStyle: 'italic',
    },
    emptyHistoryContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        backgroundColor: '#F8F9FB',
        borderRadius: 15,
        marginTop: 10,
    },
    emptyHistoryText: {
        fontSize: 16,
        color: '#32343E',
        fontFamily: 'Sen-Bold',
        marginTop: 15,
        marginBottom: 8,
    },
    emptyHistorySubtext: {
        marginTop: 10,
        fontSize: 14,
        color: '#747783',
        fontFamily: 'Sen-Regular',
        textAlign: 'center',
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF5ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 24,
        fontFamily: 'Sen-Bold',
        color: '#32343E',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#747783',
        textAlign: 'center',
    },
 
});
