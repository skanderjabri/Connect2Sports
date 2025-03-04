import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    TextInput,
    Dimensions,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Platform,
    Modal,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, Entypo, FontAwesome5 } from '@expo/vector-icons';
import GetUsersAproximitesApi from "../api/GetUsersAproximitesApi";
import Global from "../util/Global";
import { getUserData } from "../util/StorageUtils";
import debounce from 'lodash/debounce';

const { width } = Dimensions.get('window');

const MAX_DISTANCE = 200;
const MIN_DISTANCE = 0;
const DEFAULT_DISTANCE = 15;
const USERS_PER_PAGE = 9;

export default function UsersScreen() {
    const router = useRouter();

    // États principaux
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [userLocation, setUserLocation] = useState({
        latitude: null,
        longitude: null
    });

    // États de filtrage
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tous");
    const [distance, setDistance] = useState(DEFAULT_DISTANCE);
    const [tempDistance, setTempDistance] = useState(DEFAULT_DISTANCE); // État temporaire pour la distance

    // États UI
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [error, setError] = useState(null);


    const categories = ["Tous", "Football", "Tennis", "Padel", "Musculation", "Yoga", "EMS (sport avec électrodes)", "Pilate", "Fitness"];

    // Récupération de la localisation de l'utilisateur
    const fetchUserLocation = async () => {
        try {
            const data = await getUserData();
            const connectedUserId = data.user._id;
            if (data?.location?.coords) {
                setUserLocation({
                    latitude: data.location.coords.latitude,
                    longitude: data.location.coords.longitude
                });
                return data.location.coords;
            }
            throw new Error("Location not found in user data");
        } catch (error) {
            console.error("Error fetching user location:", error);
            setError("Impossible de récupérer votre localisation");
            return null;
        }
    };

    // Fonction principale de récupération des utilisateurs
    const fetchUsers = async (currentPage = 1) => {
        try {
            if (!userLocation.latitude || !userLocation.longitude) {
                const coords = await fetchUserLocation();
                if (!coords) return;
            }

            // Récupérer les données de l'utilisateur connecté
            const data = await getUserData();
            const connectedUserId = data.user._id; // ID de l'utilisateur connecté

            setIsFetching(true);
            setError(null);

            // Récupérer les utilisateurs à proximité
            const response = await GetUsersAproximitesApi(
                currentPage,
                USERS_PER_PAGE,
                userLocation.latitude,
                userLocation.longitude,
                distance
            );

            if (response && response.users) {
                // Filtrer les utilisateurs pour exclure l'utilisateur connecté
                const filteredUsers = response.users.filter(user => user._id !== connectedUserId);

                if (currentPage === 1) {
                    setUsers(filteredUsers); // Mettre à jour l'état avec les utilisateurs filtrés
                } else {
                    setUsers(prev => [...prev, ...filteredUsers]); // Ajouter les nouveaux utilisateurs filtrés
                }

                setHasMore(response.users.length === USERS_PER_PAGE);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Erreur lors du chargement des utilisateurs");
        } finally {
            setIsFetching(false);
            setIsLoading(false);
        }
    };
    // Reset et rechargement
    const resetAndFetchUsers = useCallback(async () => {
        setPage(1);
        setUsers([]);
        setIsLoading(true);
        await fetchUsers(1);
    }, [distance, userLocation]);

    // Effet initial et sur changement de distance
    useEffect(() => {
        resetAndFetchUsers();
    }, [distance, resetAndFetchUsers]);

    // Gestion de la pagination
    const handleLoadMore = useCallback(() => {
        if (!hasMore || isFetching) return;

        const nextPage = page + 1;
        setPage(nextPage);
        fetchUsers(nextPage);
    }, [hasMore, isFetching, page]);

    // Filtrage des utilisateurs
    const filteredUsers = users.filter(user => {
        const matchesCategory = selectedCategory === "Tous" ||
            user.sportsPratiques?.some(sport => sport.nom === selectedCategory);

        const matchesSearch = !search ||
            user.nom?.toLowerCase().includes(search.toLowerCase()) ||
            user.prenom?.toLowerCase().includes(search.toLowerCase()) ||
            user.pseudo?.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    // Composant de carte utilisateur
    const renderUserCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Image
                    source={{ uri: Global.BaseFile + item.photoProfil }}
                    style={styles.avatar}
                />
                <View style={styles.userHeaderInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {item.nom} {item.prenom}
                    </Text>
                    <Text style={styles.userPseudo} numberOfLines={1}>
                        @{item.pseudo}
                    </Text>
                </View>
            </View>

            <View style={styles.cardDetails}>
                {item.adresse && (
                    <View style={styles.infoRow}>
                        <Entypo name="location-pin" size={20} color="#FF9F43" />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {item.adresse}
                        </Text>
                    </View>
                )}
                <View style={styles.sportsContainer}>
                    {item.sportsPratiques?.length > 0 ? (
                        item.sportsPratiques.map((sport, index) => (
                            <View key={index} style={styles.sportItem}>
                                <Text style={styles.sportIcon}>{sport.icon}</Text>
                                <Text style={styles.sportName}>{sport.nom}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.infoText}>Aucun sport pratiqué</Text>
                    )}
                </View>
            </View>

            <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push(`/DetailsUser/${item._id}`)}
            >
                <Text style={styles.profileButtonText}>Voir le profil</Text>
            </TouchableOpacity>
        </View>
    );

    // Composant message vide
    const EmptyListMessage = () => (
        <View style={styles.emptyListContainer}>
            <AntDesign name="frowno" size={50} color="#FF9F43" />
            <Text style={styles.emptyListText}>
                {error || "Aucun utilisateur trouvé"}
            </Text>
        </View>
    );

    // Recherche avec debounce
    const debouncedSearch = useCallback(
        debounce((text) => setSearch(text), 300),
        []
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <AntDesign name="left" size={14} color="#181C2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sportifs à proximité</Text>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setIsFilterModalVisible(true)}
                >
                    <FontAwesome5 name="filter" size={20} color="#FF9F43" />
                </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
                <AntDesign name="search1" size={18} color="#6B7280" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher des sportifs"
                    placeholderTextColor="#6B7280"
                    onChangeText={debouncedSearch}
                    defaultValue={search}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => {
                        setSearch("");
                        debouncedSearch("");
                    }}>
                        <AntDesign name="closecircle" size={18} color="#6B7280" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Catégories */}
            <View style={styles.categoriesWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.selectedCategory,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === category && styles.selectedCategoryText,
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Liste des utilisateurs */}
            {isLoading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF6B41" />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUserCard}
                    keyExtractor={(item) => item._id?.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetching && hasMore ? (
                            <ActivityIndicator size="small" color="#FF6B41" />
                        ) : null
                    }
                    ListEmptyComponent={<EmptyListMessage />}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshing={isLoading}
                    onRefresh={resetAndFetchUsers}
                />
            )}

            {/* Modal de filtrage par distance */}
            <Modal
                visible={isFilterModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filtrer par distance</Text>
                        <View style={styles.distanceContainer}>
                            <TouchableOpacity
                                style={styles.distanceButton}
                                onPress={() => setTempDistance(prev => Math.max(MIN_DISTANCE, prev - 1))}
                            >
                                <Text style={styles.distanceButtonText}>-</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={styles.distanceInput}
                                value={tempDistance.toString()}
                                keyboardType="numeric"
                                onChangeText={(text) => {
                                    const newDistance = parseInt(text) || 0;
                                    setTempDistance(Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, newDistance)));
                                }}
                            />
                            <TouchableOpacity
                                style={styles.distanceButton}
                                onPress={() => setTempDistance(prev => Math.min(MAX_DISTANCE, prev + 1))}
                            >
                                <Text style={styles.distanceButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.distanceLabel}>
                            Distance maximale : {tempDistance} km
                        </Text>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => {
                                setDistance(tempDistance); // Appliquer la distance temporaire
                                setIsFilterModalVisible(false); // Fermer le modal
                                resetAndFetchUsers(); // Recharger les utilisateurs avec la nouvelle distance
                            }}
                        >
                            <Text style={styles.applyButtonText}>Appliquer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        flex: 1,
        fontSize: 18,
        color: '#181C2E',
        marginLeft: 12,
        fontFamily: "Sen-Bold",
    },
    filterButton: {
        padding: 10,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        height: 50,
        marginHorizontal: 20,
        marginVertical: 15,
        paddingHorizontal: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        paddingLeft: 10,
        fontSize: 16,
        color: "#1F2937",
        fontFamily: "Sen-Regular",
    },
    categoriesWrapper: {
        height: 50,
        marginBottom: 10,
    },
    categoriesContainer: {
        paddingHorizontal: 20,
    },
    categoryButton: {
        paddingHorizontal: 20,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F4F5F7",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedCategory: {
        backgroundColor: "#FF9F43",
    },
    categoryText: {
        fontSize: 14,
        color: "#666",
        fontFamily: "Sen-Medium",
    },
    selectedCategoryText: {
        color: "#fff",
        fontWeight: "bold",
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 50,
        marginRight: 12,
    },
    userHeaderInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 19,
        fontFamily: "Sen-Bold",
        color: "#1F2937",
    },
    userPseudo: {
        fontSize: 15,
        fontFamily: "Sen-Regular",
        color: "#6B7280",
        marginTop: 4,
    },
    cardDetails: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    infoText: {
        fontSize: 15,
        color: "#6B7280",
        marginLeft: 7,
        flex: 1,
        fontFamily: "Sen-Regular",
    },
    sportsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginLeft: 8,
    },
    sportItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
        marginBottom: 5,
    },
    sportIcon: {
        fontSize: 16,
        marginRight: 8,
        fontFamily: "Sen-Regular",
    },
    sportName: {
        fontSize: 15,
        color: "#6B7280",
        fontFamily: "Sen-Regular",
    },
    profileButton: {
        backgroundColor: "#FFF3E0",
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 10,
        alignSelf: "center",
    },
    profileButtonText: {
        color: "#FF8C00",
        fontSize: 17,
        textAlign: "center",
        fontFamily: "Sen-Bold"
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyListText: {
        fontSize: 18,
        color: "#6B7280",
        marginTop: 10,
        fontFamily: "Sen-Regular",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    distanceButton: {
        width: 40,
        height: 40,
        backgroundColor: '#FF9F43',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    distanceButtonText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontFamily: 'Sen-Bold',
    },
    distanceInput: {
        width: 80,
        height: 40,
        backgroundColor: '#F4F5F7',
        borderRadius: 10,
        textAlign: 'center',
        marginHorizontal: 10,
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#1F2937',
    },
    distanceLabel: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    applyButton: {
        backgroundColor: '#FF9F43',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
    },
});