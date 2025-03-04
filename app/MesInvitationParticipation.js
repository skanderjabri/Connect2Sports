import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    StatusBar,
    Platform,
    SafeAreaView,
    Animated,
    Dimensions,
    ScrollView,
    RefreshControl,
    Alert
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from 'react';
import { AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome, FontAwesome5, Feather, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/fr';
import { getUserData } from '../util/StorageUtils';
import GetInvitationParticipationByIdUserApi from "../api/GetInvitationParticipationByIdUserApi";
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import DeleteRequestByIdApi from "../api/DeleteRequestByIdApi";
import UpdateStatusRequestApi from "../api/UpdateStatusRequestApi";
export default function MesInvitationParticipation() {
    const [invitationParticipationEvents, setInvitationParticipationEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchRequest();
    }, []);

    const fetchRequest = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            const response = await GetInvitationParticipationByIdUserApi(userId);
            setInvitationParticipationEvents(response.invitations);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequest();
    };

    const handleAcceptInvitation = async (invitationId) => {
        setLoading(true);
        let status = 1;
        try {
            const response = await UpdateStatusRequestApi(invitationId, status);
            if (response.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Invitation acceptée avec succès !',
                });
                fetchRequest();

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

        };

    }


    const handleRefuseInvitation = async (invitationId) => {
        setLoading(true);
        try {
            const response = await DeleteRequestByIdApi(invitationId);
            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "Vous avez refusé l'invitation !",
                    button: 'OK',
                });
                fetchRequest();
            }
        } catch (error) {
            console.log(error)
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur est survenue lors du refus de l'invitation",
                button: 'OK',
            });
        }
    };

    const renderItem = ({ item }) => {
        // Formatage de la date de l'événement
        const dateDebut = moment(item.idEvenement.dateHeureDebut).locale('fr').format('DD MMMM YYYY [à] HH:mm');

        return (
            <View style={styles.invitationCard}>
                <View style={styles.eventHeader}>

                </View>

                <View style={styles.eventDetailsContainer}>
                    <View style={styles.eventTitleRow}>
                        <Text style={styles.eventTitle}>{item.idEvenement.titre}</Text>
                        <View style={styles.sportTypeTag}>
                            <Text style={styles.sportTypeText}>{item?.idEvenement?.idSport?.icon}</Text>
                            <Text style={styles.sportTypeText}>{item?.idEvenement?.idSport?.nom}</Text>
                        </View>
                    </View>

                    <Text style={styles.eventDescription}>{item.idEvenement.description}</Text>
                    <View style={styles.detailItem}>
                        <FontAwesome name="user-o" size={18} color="#64748B" />
                        <Text style={[styles.detailText, { textTransform: 'capitalize' }]}>
                            {item?.idEvenement?.idOrganisateur?.nom}{'  '}{item?.idEvenement?.idOrganisateur?.prenom}
                        </Text>
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="calendar-outline" size={18} color="#64748B" />
                            <Text style={styles.detailText}>{dateDebut}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="location-outline" size={18} color="#64748B" />
                            <Text style={styles.detailText}>{item.idEvenement.lieu}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="people-outline" size={18} color="#64748B" />
                            <Text style={styles.detailText}>Max: {item.idEvenement.maxParticipants} participants</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="public" size={18} color="#64748B" />
                            <Text style={styles.detailText}>Visibilité: {item.idEvenement.visibilite}</Text>
                        </View>
                    </View>

                    {item.idEvenement.condtionsReglement && item.idEvenement.condtionsReglement.length > 0 && (
                        <View style={styles.rulesContainer}>
                            <Text style={styles.rulesTitle}>Règlement:</Text>
                            {item.idEvenement.condtionsReglement.map((rule, index) => (
                                <View key={index} style={styles.ruleItem}>
                                    <Feather name="check-circle" size={18} color="#10B981" />
                                    <Text style={styles.ruleText}>{rule}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.refuseButton]}
                        onPress={() => handleRefuseInvitation(item._id)}
                    >
                        <Feather name="x" size={20} color="#F43F5E" />
                        <Text style={styles.refuseButtonText}>Refuser</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAcceptInvitation(item._id)}
                    >
                        <Feather name="check" size={20} color="#FFF" />
                        <Text style={styles.acceptButtonText}>Accepter</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucune invitation de participation</Text>
            <Text style={styles.emptyText}>
                Vous n'avez pas encore reçu d'invitations à des événements. Consultez les événements disponibles et commencez à participer !
            </Text>
        </View>
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
                        <AntDesign name="left" size={14} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mes invitations</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <View style={styles.content}>
                        {invitationParticipationEvents.length > 0 ? (
                            <FlatList
                                data={invitationParticipationEvents}
                                renderItem={renderItem}
                                keyExtractor={(item) => item._id}
                                contentContainerStyle={styles.listContainer}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={["#FF7622"]}
                                    />
                                }
                            />
                        ) : (
                            <EmptyState />
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
        fontSize: 18,
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
        flex: 1,
    },
    listContainer: {
        padding: 16,
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
    userName: {
        fontSize: 14,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
    },
    invitationText: {
        fontSize: 12,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
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
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginBottom: 12,
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
        fontSize: 15,
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
        fontSize: 16,
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
        fontSize: 15,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginLeft: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        flex: 0.48,
    },
    acceptButton: {
        backgroundColor: '#FF7622',
    },
    refuseButton: {
        backgroundColor: '#FFF0F3',
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        marginLeft: 6,
    },
    refuseButtonText: {
        color: '#F43F5E',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        marginLeft: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#F1F5F9',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        color: '#1E293B',
        fontFamily: 'Sen-Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'Sen-Regular',
        textAlign: 'center',
    },
    
});