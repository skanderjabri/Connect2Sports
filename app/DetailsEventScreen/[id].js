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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { LinearGradient } from 'expo-linear-gradient';
import GetDetailsEventApi from "../../api/GetDetailsEventApi";
import ParticipEventApi from "../../api/ParticipEventApi";
import { getUserData } from "../../util/StorageUtils";

export default function DetailsEventScreen() {
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [IdUserConnecte, setIdUserConnecte] = useState(null);
    const [isParticipating, setIsParticipating] = useState(false); // État pour gérer la participation

    const router = useRouter();
    const { id } = useLocalSearchParams();

    useEffect(() => {
        fetchEvent();
        getCurrentUser();
    }, []);

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
        } finally {
            setLoading(false);
        }
    };

    const handleParticipate = async () => {
        setIsParticipating(true); // Démarrer la requête
        let modeParticipation = "demande";

        try {
            const response = await ParticipEventApi(id, IdUserConnecte, modeParticipation);

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
                    title: 'Participation enregistrée',
                    textBody: 'Votre demande de participation a été envoyée avec succès !',
                    button: 'OK',
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: 'Une erreur s\'est produite lors de votre inscription.',
                    button: 'OK',
                });
            }
        } catch (error) {
            console.error("Erreur lors de la participation :", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur s\'est produite. Veuillez réessayer plus tard.',
                button: 'OK',
            });
        } finally {
            setIsParticipating(false); // Terminer la requête
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent
                />

                {loading ? (
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <>
                        <LinearGradient
                            colors={['#FF7622', '#F45B3C']}
                            style={styles.headerGradient}
                        >
                            <View style={styles.headerContainer}>
                                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                                    <AntDesign name="left" size={14} color="#FFF" />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Détails Événement</Text>
                            </View>
                            <View style={styles.eventHeaderInfo}>
                                <Text style={styles.eventTitle}>{event.titre}</Text>
                                <View style={styles.sportBadge}>
                                    <Text style={styles.sportIcon}>{event.idSport.icon}</Text>
                                    <Text style={styles.sportName}>{event.idSport.nom}</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        <ScrollView style={styles.contentContainer}>
                            <View style={styles.mainCard}>
                                {/* Section Informations */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Informations</Text>
                                    <View style={styles.infoRow}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#FFE4D9' }]}>
                                            <Ionicons name="calendar-outline" size={20} color="#FF7622" />
                                        </View>
                                        <Text style={styles.infoText}>{formatDate(event.dateHeureDebut)}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#E3F5FF' }]}>
                                            <Ionicons name="location-outline" size={20} color="#0095FF" />
                                        </View>
                                        <Text style={styles.infoText}>{event.lieu}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#E5ECF6' }]}>
                                            <Ionicons name="people-outline" size={20} color="#3366FF" />
                                        </View>
                                        <Text style={styles.infoText}>{event.maxParticipants} participants maximum</Text>
                                    </View>
                                </View>

                                {/* Section Organisateur */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Organisateur</Text>
                                    <View style={styles.organizerCard}>
                                        <View style={styles.organizerAvatar}>
                                            <FontAwesome5 name="user-alt" size={20} color="#FFF" />
                                        </View>
                                        <View style={styles.organizerDetails}>
                                            <Text style={styles.organizerName}>
                                                {event.idOrganisateur.prenom} {event.idOrganisateur.nom}
                                            </Text>
                                            <Text style={styles.organizerEmail}>{event.idOrganisateur.email}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Section Description */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Description</Text>
                                    <View style={styles.descriptionCard}>
                                        <Text style={styles.descriptionText}>{event.description}</Text>
                                    </View>
                                </View>

                                {/* Section Règlement */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Règlement</Text>
                                    <View style={styles.rulesCard}>
                                        {event.condtionsReglement.map((rule, index) => (
                                            <View key={index} style={styles.ruleItem}>
                                                <View style={styles.ruleIconContainer}>
                                                    <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                                                </View>
                                                <Text style={styles.ruleText}>{rule}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Bouton Participer */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.participateButton,
                                    isParticipating && styles.participateButtonDisabled
                                ]}
                                onPress={handleParticipate}
                                disabled={isParticipating}
                            >
                                <LinearGradient
                                    colors={isParticipating ? ['#CCCCCC', '#999999'] : ['#FF7622', '#F45B3C']}
                                    style={styles.participateGradient}
                                >
                                    {isParticipating ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.participateButtonText}>Participer à l'événement</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </SafeAreaView>
        </AlertNotificationRoot>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    headerGradient: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: '#FFF',
        marginLeft: 12,
        fontFamily: "Sen-Bold",
    },
    eventHeaderInfo: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    eventTitle: {
        fontSize: 26,
        fontFamily: "Sen-Bold",
        color: '#FFF',
        marginBottom: 8,
    },
    sportBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    sportIcon: {
        fontSize: 16,
        marginRight: 6,
        color: '#FFF',
    },
    sportName: {
        fontSize: 14,
        color: '#FFF',
        fontFamily: "Sen-Regular",
    },
    contentContainer: {
        flex: 1,
        marginTop: -20,
    },
    mainCard: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        marginBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        color: '#181C2E',
        fontFamily: "Sen-SemiBold",
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoText: {
        flex: 1,
        fontSize: 15,
        color: '#444',
        fontFamily: "Sen-Regular",
    },
    organizerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    organizerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FF7622',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    organizerDetails: {
        flex: 1,
    },
    organizerName: {
        fontSize: 16,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
        marginBottom: 4,
        textTransform: "capitalize"
    },
    organizerEmail: {
        fontSize: 14,
        color: '#666',
        fontFamily: "Sen-Regular",
    },
    descriptionCard: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    descriptionText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
        fontFamily: "Sen-Regular",
    },
    rulesCard: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
    },
    ruleIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ruleText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        fontFamily: "Sen-Regular",
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F4F5F7',
    },
    participateButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    participateButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    participateGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    participateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: "Sen-Bold",
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});