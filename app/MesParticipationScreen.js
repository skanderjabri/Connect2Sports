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
    RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from 'react';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/fr';
import { getUserData } from '../util/StorageUtils';
import GetAllRequestEventByIdUserApi from "../api/GetAllRequestEventByIdUserApi";

const { width } = Dimensions.get('window');

export default function MesParticipationApi() {
    const [participationsEvents, setParticipationsEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const router = useRouter();
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchRequest();
    }, []);

    const fetchRequest = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            const response = await GetAllRequestEventByIdUserApi(userId);

            // Filtrage des participations valides et où l'utilisateur n'est pas l'organisateur
            const participationsFiltrees = response.invitations.filter(participation =>
                participation.idEvenement &&
                participation.idEvenement.idOrganisateur !== userId
            );

            setParticipationsEvents(participationsFiltrees);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRequest();
    };

    const getStatusColor = (statut) => {
        switch (statut) {
            case 1: return '#22C55E'; // Accepté - Vert
            case 2: return '#EF4444'; // Refusé - Rouge
            default: return '#F59E0B'; // En attente - Orange
        }
    };

    const getStatusText = (statut) => {
        switch (statut) {
            case 1: return 'Accepté';
            case 2: return 'Refusé';
            default: return 'En attente';
        }
    };

    const getEventStatusInfo = (statut) => {
        switch (statut) {
            case 'ouvert':
                return {
                    text: 'En cours',
                    color: '#22C55E', // Vert
                    icon: 'door-open', // Icône de porte ouverte
                };
            case 'termine':
                return {
                    text: 'Terminé',
                    color: '#64748B', // Gris
                    icon: 'flag', // Icône de drapeau
                };
            default:
                return {
                    text: 'En cours',
                    color: '#F59E0B', // Orange
                    icon: 'clock', // Icône d'horloge
                };
        }
    };

    const getSportIcon = (sportType) => {
        switch (sportType) {
            case 'Football': return 'soccer';
            case 'Tennis': return 'tennis';
            case 'Yoga': return 'yoga';
            default: return 'run';
        }
    };

    const FilterButton = ({ title, isSelected, onPress }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                isSelected && styles.filterButtonSelected
            ]}
            onPress={onPress}
        >
            <Text style={[
                styles.filterButtonText,
                isSelected && styles.filterButtonTextSelected
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    const filteredParticipations = participationsEvents.filter(participation => {
        if (selectedStatus === 'all') return true;
        if (selectedStatus === 'accepted') return participation.statut === 1;
        if (selectedStatus === 'rejected') return participation.statut === 2;
        if (selectedStatus === 'pending') return participation.statut === 0;
        return true;
    });

    const EventCard = ({ item, index }) => {
        const scale = scrollY.interpolate({
            inputRange: [
                -1,
                0,
                (index * 230) + 230 * 0.5,
                (index * 230) + 230
            ],
            outputRange: [1, 1, 1, 0.95]
        });

        const eventStatus = getEventStatusInfo(item.idEvenement.statut);

        return (
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                {/* Statut badge au coin droit */}
                <View style={[
                    styles.statusRibbon,
                    { backgroundColor: getStatusColor(item.statut) }
                ]}>
                    <Text style={styles.statusText}>{getStatusText(item.statut)}</Text>
                </View>

                <View style={styles.cardContent}>
                    {/* Header avec sport */}
                    <View style={styles.cardHeader}>
                        <View style={styles.sportInfo}>
                            <View style={styles.sportIconContainer}>
                                <MaterialCommunityIcons
                                    name={getSportIcon(item.idEvenement.nomSporttype)}
                                    size={24}
                                    color="#FF7622"
                                />
                            </View>
                            <Text style={styles.sportName}>{item.idEvenement.nomSporttype}</Text>
                        </View>
                    </View>

                    {/* Titre de l'événement */}
                    <Text style={styles.eventTitle} numberOfLines={2}>{item.idEvenement.titre}</Text>

                    {/* Détails de l'événement */}
                    <View style={styles.eventDetailsContainer}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <Ionicons name="location-outline" size={18} color="#FF7622" />
                            </View>
                            <Text style={styles.detailText} numberOfLines={1}>{item.idEvenement.lieu}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <Ionicons name="time-outline" size={18} color="#FF7622" />
                            </View>
                            <Text style={styles.detailText}>
                                {moment(item.idEvenement.dateHeureDebut).format('DD MMM YYYY, HH:mm')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cardFooter}>
                        <View style={[
                            styles.eventStatusBadge,
                            { backgroundColor: eventStatus.color }
                        ]}>
                            <MaterialCommunityIcons
                                name={eventStatus.icon}
                                size={14}
                                color="#FFFFFF"
                            />
                            <Text style={styles.eventStatusText}>
                                {eventStatus.text}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.detailsButton}
                            onPress={() => router.push(`/DetailsParticipation/${item._id}`)}
                        >
                            <Text style={styles.detailsButtonText}>Voir détails</Text>
                            <AntDesign name="right" size={12} color="#FF7622" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucune participation</Text>
            <Text style={styles.emptyText}>
                Vous n'avez pas encore rejoint d'événements. Recherchez-en un et commencez à participer !
            </Text>
        </View>
    );

    return (
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
                <Text style={styles.headerTitle}>Mes Participations</Text>
                {/* Icône pour les invitations */}
                <TouchableOpacity
                    style={styles.invitationsIcon}
                    onPress={() => router.push("/MesInvitationParticipation")}
                >
                    <Ionicons name="mail-outline" size={24} color="#FF7622" />
                </TouchableOpacity>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <View style={styles.content}>
                    {/* Filtres */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterTitle}>Filtrer par statut</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterContainer}
                        >
                            <FilterButton
                                title="Tous"
                                isSelected={selectedStatus === 'all'}
                                onPress={() => setSelectedStatus('all')}
                            />
                            <FilterButton
                                title="Acceptés"
                                isSelected={selectedStatus === 'accepted'}
                                onPress={() => setSelectedStatus('accepted')}
                            />
                            <FilterButton
                                title="En attente"
                                isSelected={selectedStatus === 'pending'}
                                onPress={() => setSelectedStatus('pending')}
                            />
                        </ScrollView>
                    </View>

                    {/* Liste des participations */}
                    {filteredParticipations.length > 0 ? (
                        <Animated.FlatList
                            data={filteredParticipations}
                            renderItem={({ item, index }) => (
                                <EventCard item={item} index={index} />
                            )}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                { useNativeDriver: true }
                            )}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={['#FF7622']}
                                    tintColor="#FF7622"
                                />
                            }
                        />
                    ) : (
                        <EmptyState />
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
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
        flex: 1, // Pour occuper l'espace disponible
    },
    invitationsIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }, invitationsButton: {
        margin: 16,
        backgroundColor: '#FF7622',
        borderRadius: 12,
        shadowColor: '#FF7622',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    invitationsButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    invitationsButtonText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        marginLeft: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    filterSection: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    filterTitle: {
        fontSize: 16,
        color: '#1E293B',
        marginLeft: 16,
        marginBottom: 12,
        fontFamily: 'Sen-SemiBold',
    },
    filterContainer: {
        paddingHorizontal: 16,
        gap: 8,
        flexDirection: 'row',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterButtonSelected: {
        backgroundColor: '#FF7622',
        borderColor: '#FF7622',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'Sen-Regular',
    },
    filterButtonTextSelected: {
        color: '#FFFFFF',
        fontFamily: 'Sen-Bold',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    statusRibbon: {
        position: 'absolute',
        top: 16,
        right: -30,
        width: 120,
        transform: [{ rotate: '45deg' }],
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        zIndex: 5,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statusText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'Sen-Bold',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sportInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sportIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#FFF7F3',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF7622',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    sportName: {
        fontSize: 16,
        color: '#1E293B',
        fontFamily: 'Sen-Bold',
    },
    eventTitle: {
        fontSize: 18,
        color: '#1E293B',
        marginBottom: 16,
        fontFamily: 'Sen-Regular',
        paddingRight: 50, // Pour éviter que le titre ne se superpose au statut
    },
    eventDetailsContainer: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailIconContainer: {
        width: 32,
        height: 32,
        backgroundColor: '#FFF7F3',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 14,
        color: '#475569',
        flex: 1,
        fontFamily: 'Sen-Regular',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    eventStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    eventStatusText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'Sen-Bold',
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFF7F3',
        gap: 8,
        shadowColor: '#FF7622',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    detailsButtonText: {
        fontSize: 14,
        color: '#FF7622',
        fontFamily: 'Sen-Bold',
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
    }
});