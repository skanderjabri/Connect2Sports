import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    StatusBar,
    Platform,
    SafeAreaView,
    RefreshControl,
    Dimensions,
    Modal,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/fr';
import { getUserData } from '../util/StorageUtils';
import GetMesEventsApi from "../api/GetMesEventsApi";

const { width } = Dimensions.get('window');

const EventCard = ({ event }) => {
    const router = useRouter();
    const formattedDate = moment(event.dateHeureDebut).format('DD MMMM YYYY');
    const formattedTime = moment(event.dateHeureDebut).format('HH:mm');
    const eventIdShort = (event._id.substr(0, 10)).toUpperCase(); // Extraire les 10 derniers caractères de l'ID

    return (
        <View style={styles.eventCard}>
            {/* En-tête de la carte avec gradient */}
            <View style={styles.cardHeader}>
                <View style={styles.sportIconContainer}>
                    <Text style={styles.sportIcon}>{event.idSport.icon}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge,
                    { backgroundColor: event.statut === 'ouvert' ? '#10B981' : '#EF4444' }]}>
                        <Text style={styles.statusText}>
                            {event.statut === 'ouvert' ? 'En cours' : 'FERMÉ'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Contenu principal */}
            <View style={styles.cardContent}>
                <Text style={styles.eventTitle}>{event.titre}</Text>
                <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                </Text>

                {/* ID Événement */}
                <View style={styles.eventIdContainer}>
                    <Text style={styles.eventIdLabel}>ID Événement :</Text>
                    <Text style={styles.eventIdValue}>{eventIdShort}</Text>
                </View>

                {/* Informations détaillées */}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="calendar-clock" size={20} color="#FF7622" />
                        <View style={styles.detailTexts}>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>{formattedDate} à {formattedTime}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="location" size={20} color="#FF7622" />
                        <View style={styles.detailTexts}>
                            <Text style={styles.detailLabel}>Lieu</Text>
                            <Text style={styles.detailValue}>{event.lieu}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Feather name="users" size={20} color="#FF7622" />
                        <View style={styles.detailTexts}>
                            <Text style={styles.detailLabel}>Participants</Text>
                            <Text style={styles.detailValue}>{event.maxParticipants} max</Text>
                        </View>
                    </View>
                </View>

                {/* Type d'événement et bouton Gérer */}
                <View style={styles.footerContainer}>
                    <View style={styles.typeContainer}>
                        <Text style={styles.typeText}>{event.typeEvenement.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity style={styles.manageButton}
                        onPress={() => router.push(`/EventDetailsScreen/${event._id}`)}
                    >
                        <MaterialCommunityIcons name="account-cog" size={20} color="#FF7622" />
                        <Text style={styles.manageButtonText}>Gérer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default function MesEvenementsScreen() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [idUserConnecte, setIdUserConnecte] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null); // Filtre par statut
    const [filterSport, setFilterSport] = useState(null); // Filtre par type de sport
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false); // Modal pour le filtrage
    const router = useRouter();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            setIdUserConnecte(userId);
            const response = await GetMesEventsApi(userId);
            setEvents(response.events);
        } catch (error) {
            console.log("Erreur lors de la récupération des événements:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEvents();
    };

    // Filtrer les événements en fonction des critères sélectionnés
    const filteredEvents = events.filter(event => {
        if (filterStatus && event.statut !== filterStatus) {
            return false;
        }
        if (filterSport && event.idSport.nom !== filterSport) {
            return false;
        }
        return true;
    });

    const sports = ["Football", "Tennis", "Padel", "Musculation", "Yoga", "EMS (sport avec électrodes)", "Pilate", "Fitness"]; // Liste des sports disponibles

    const handleResetFilters = () => {
        setFilterStatus(null);
        setFilterSport(null);
        setIsFilterModalVisible(false);
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={80} color="#FF7622" />
            </View>
            <Text style={styles.emptyTitle}>Aucun événement</Text>
            <Text style={styles.emptyText}>
                Vous n'avez pas encore organisé d'événement. Commencez par en créer un !
            </Text>
            <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>Créer un événement</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />
            {/* Header amélioré */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <AntDesign name="left" size={14} color="#FF7622" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mes événements</Text>
                <TouchableOpacity
                    style={styles.filterIconButton}
                    onPress={() => setIsFilterModalVisible(true)}
                >
                    <Ionicons name="filter" size={24} color="#FF7622" />
                </TouchableOpacity>
            </View>

            {/* Modal pour le filtrage */}
            <Modal
                visible={isFilterModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsFilterModalVisible(false)}
            >
                <View style={modalStyles.modalOverlay}>
                    <View style={modalStyles.modalContent}>
                        <View style={modalStyles.modalHeader}>
                            <Text style={modalStyles.modalTitle}>Filtrer les événements</Text>
                            <TouchableOpacity
                                style={modalStyles.closeIconButton}
                                onPress={() => setIsFilterModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        {/* Filtre par statut */}
                        <Text style={modalStyles.sectionTitle}>Statut</Text>
                        <View style={modalStyles.filterRow}>
                            <TouchableOpacity
                                style={[
                                    modalStyles.filterButton,
                                    filterStatus === 'ouvert' && modalStyles.activeFilterButton,
                                ]}
                                onPress={() => setFilterStatus('ouvert')}
                            >
                                <Text style={[
                                    modalStyles.filterButtonText,
                                    filterStatus === 'ouvert' && modalStyles.activeFilterButtonText
                                ]}>En cours</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    modalStyles.filterButton,
                                    filterStatus === 'termine' && modalStyles.activeFilterButton,
                                ]}
                                onPress={() => setFilterStatus('termine')}
                            >
                                <Text style={[
                                    modalStyles.filterButtonText,
                                    filterStatus === 'termine' && modalStyles.activeFilterButtonText
                                ]}>Fermé</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Filtre par type de sport */}
                        <Text style={modalStyles.sectionTitle}>Type de sport</Text>
                        <View style={modalStyles.filterRow}>
                            {sports.map((sport, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        modalStyles.filterButton,
                                        filterSport === sport && modalStyles.activeFilterButton,
                                    ]}
                                    onPress={() => setFilterSport(sport)}
                                >
                                    <Text style={[
                                        modalStyles.filterButtonText,
                                        filterSport === sport && modalStyles.activeFilterButtonText
                                    ]}>{sport}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={modalStyles.buttonGroup}>
                            {/* Bouton pour réinitialiser les filtres */}
                            <TouchableOpacity
                                style={modalStyles.resetButton}
                                onPress={handleResetFilters}
                            >
                                <Text style={modalStyles.resetButtonText}>Réinitialiser</Text>
                            </TouchableOpacity>

                            {/* Bouton pour appliquer et fermer */}
                            <TouchableOpacity
                                style={modalStyles.applyButton}
                                onPress={() => setIsFilterModalVisible(false)}
                            >
                                <Text style={modalStyles.applyButtonText}>Appliquer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <FlatList
                    data={filteredEvents}
                    renderItem={({ item }) => <EventCard event={item} />}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FF7622"]}
                        />
                    }
                    ListEmptyComponent={<EmptyState />}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
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
    filterIconButton: {
        marginLeft: 'auto', // Aligner à droite
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    eventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    sportIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sportIcon: {
        fontSize: 28,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: "Sen-Bold",
    },
    cardContent: {
        padding: 16,
    },
    eventTitle: {
        fontSize: 18,
        color: '#1F2937',
        fontFamily: "Sen-Bold",
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: "Sen-Regular",
        marginBottom: 16,
        lineHeight: 20,
    },
    eventIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    eventIdLabel: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: "Sen-Regular",
        marginRight: 8,
    },
    eventIdValue: {
        fontSize: 14,
        color: '#1F2937',
        fontFamily: "Sen-Bold",
    },
    detailsContainer: {
        marginTop: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailTexts: {
        marginLeft: 12,
    },
    detailLabel: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: "Sen-Regular",
    },
    detailValue: {
        fontSize: 14,
        color: '#1F2937',
        fontFamily: "Sen-Bold",
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    typeContainer: {
        backgroundColor: '#FFF5F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    typeText: {
        color: '#FF7622',
        fontSize: 12,
        fontFamily: "Sen-Bold",
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF7622',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    manageButtonText: {
        color: '#FF7622',
        fontSize: 14,
        fontFamily: "Sen-Bold",
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        color: '#1F2937',
        fontFamily: "Sen-Bold",
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        fontFamily: "Sen-Regular",
        marginBottom: 24,
        lineHeight: 24,
    },
    createButton: {
        backgroundColor: '#FF7622',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: "Sen-Bold",
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end', // Modal apparaît depuis le bas
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24, // Plus d'espace pour iOS
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        color: '#1F2937',
        fontFamily: "Sen-Bold",
    },
    closeIconButton: {
        width: 36,
        height: 36,
        backgroundColor: '#F4F5F7',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        color: '#64748B',
        fontFamily: "Sen-Bold",
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    filterButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#F4F5F7',
        borderRadius: 16,
        marginRight: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeFilterButton: {
        backgroundColor: '#FFF5F1',
        borderColor: '#FF7622',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: "Sen-Regular",
    },
    activeFilterButtonText: {
        color: '#FF7622',
        fontFamily: "Sen-Bold",
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#F4F5F7',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginRight: 12,
    },
    resetButtonText: {
        color: '#64748B',
        fontSize: 16,
        fontFamily: "Sen-Bold",
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#FF7622',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: "Sen-Bold",
    },
});