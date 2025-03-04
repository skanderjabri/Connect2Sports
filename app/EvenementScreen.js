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
    RefreshControl,
    TextInput, // Ajouter TextInput
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/fr';
import Global from "../util/Global";
import GetAllEventsPublicApi from "../api/GetAllEventsPublicApi";
moment.locale('fr');

export default function EvenementScreen() {
    const router = useRouter();
    const [evenements, setEvenements] = useState([]); // Tous les événements
    const [filteredEvents, setFilteredEvents] = useState([]); // Événements filtrés
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchId, setSearchId] = useState(""); // État pour stocker l'_id saisi

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await GetAllEventsPublicApi();
            setEvenements(response.evenements);
            setFilteredEvents(response.evenements); // Initialiser les événements filtrés
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fonction pour rechercher un événement par _id
    const searchEventById = () => {
        if (searchId.trim() === "") {
            // Si le champ est vide, afficher tous les événements
            setFilteredEvents(evenements);
        } else {
            // Filtrer les événements par _id
            const filtered = evenements.filter(event =>
                event._id.toLowerCase().startsWith(searchId.toLowerCase()))

            setFilteredEvents(filtered);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
        setSearchId("")
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucun événement</Text>
            <Text style={styles.emptyText}>
                Aucun événement n'est disponible pour le moment.
            </Text>
        </View>
    );

    const EventCard = ({ event }) => {
        return (
            <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                    <View style={styles.organizerInfo}>
                        <Image
                            source={{ uri: `${Global.BaseFile}/${event.idOrganisateur.photoProfil}` }}
                            style={styles.organizerPhoto}
                        />
                        <View>
                            <Text style={styles.organizerName}>
                                {event.idOrganisateur.prenom} {event.idOrganisateur.nom}
                            </Text>
                            <Text style={styles.eventDate}>
                                {moment(event.dateHeureDebut).format('DD MMMM YYYY à HH:mm')}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.sportIcon}>{event.idSport.icon}</Text>
                </View>

                <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.titre}</Text>
                    <Text style={styles.eventDescription} numberOfLines={2}>
                        {event.description}
                    </Text>

                    <View style={styles.eventDetails}>
                        <View style={styles.detailItem}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.detailText}>{event.lieu}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="people-outline" size={16} color="#666" />
                            <Text style={styles.detailText}>
                                Max {event.maxParticipants} participants
                            </Text>
                        </View>
                    </View>
                    <View style={styles.eventFooter}>
                        <View style={[styles.statusBadge,
                        { backgroundColor: event.statut === 'ouvert' ? '#E8F5E9' : '#FFEBEE' }]}>
                            <Text style={[styles.statusText,
                            { color: event.statut === 'ouvert' ? '#2E7D32' : '#C62828' }]}>
                                {event.statut == "ouvert" && <Text>  EN COURS </Text>}
                                {event.statut != "ouvert" && <Text>  {event.statut.toUpperCase()} </Text>}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.joinButton}
                            onPress={() => router.push(`/DetailsEventScreen/${event._id}`)}
                        >
                            <Text style={styles.joinButtonText}>Voir detail</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <AntDesign name="left" size={14} color="#181C2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Événements sportifs</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/CreateEventScreen')}
                >
                    <MaterialIcons name="add" size={24} color="#FF7622" />
                </TouchableOpacity>
            </View>

            {/* Champ de recherche par _id */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher par ID"
                    placeholderTextColor="#6B7280"
                    value={searchId}
                    onChangeText={setSearchId}
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={searchEventById}
                >
                    <AntDesign name="search1" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <FlatList
                    data={filteredEvents} // Utiliser les événements filtrés
                    renderItem={({ item }) => <EventCard event={item} />}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={EmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FF7622"]}
                        />
                    }
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 40,
        height: 40,
        backgroundColor: '#FFF5EE',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
        flex: 1,
        marginLeft: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#181C2E',
    },
    searchButton: {
        width: 40,
        height: 40,
        backgroundColor: '#FF7622',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    listContainer: {
        padding: 16,
    },
    eventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eventHeader: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    organizerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    organizerPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    organizerName: {
        fontSize: 15,
        fontFamily: 'Sen-Bold',
        color: '#181C2E',
        textTransform: 'capitalize'
    },
    eventDate: {
        fontSize: 13,
        color: '#6C757D',
        marginTop: 2,
        fontFamily: 'Sen-Regular'
    },
    sportIcon: {
        fontSize: 24,
    },
    eventContent: {
        padding: 16,
    },
    eventTitle: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#181C2E',
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 14.5,
        color: '#495057',
        marginBottom: 16,
        fontFamily: 'Sen-Regular'
    },
    eventDetails: {
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#495057',
        marginLeft: 8,
        fontFamily: 'Sen-Regular'
    },
    eventFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 13,
        fontFamily: 'Sen-Bold',
    },
    joinButton: {
        backgroundColor: '#FF7622',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Sen-Bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#181C2E',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6C757D',
        textAlign: 'center',
        fontFamily: "Sen-Regular"
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});