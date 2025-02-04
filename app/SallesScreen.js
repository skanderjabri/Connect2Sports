import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    FlatList,
    Dimensions,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import GetAllSalleDeSportsApi from "../api/GetAllSalleDeSportsApi";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // Import des icônes Expo

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;

// Composant pour l'écran de chargement initial
const LoadingScreen = () => (
    <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
            <Image
                source={require('.././assets/images/loading.gif')}
                style={styles.loadingImage}
            />
            <Text style={styles.loadingTitle}>Chargement en cours</Text>
            <Text style={styles.loadingSubtitle}>Découvrez nos meilleures salles de sport</Text>
        </View>
    </View>
);

// Composant pour les états vides
const EmptyStateMessage = ({ message, icon }) => (
    <View style={styles.emptyStateContainer}>
        <Icon name={icon} size={60} color="#CCCCCC" />
        <Text style={styles.emptyStateText}>{message}</Text>
    </View>
);

const SallesScreen = () => {
    const router = useRouter();
    const [salles, setSalles] = useState([]); // Liste complète des salles
    const [filteredSalles, setFilteredSalles] = useState([]); // Salles filtrées
    const [isLoading, setIsLoading] = useState(true); // Chargement initial
    const [isLoadingMore, setIsLoadingMore] = useState(false); // Chargement supplémentaire
    const [page, setPage] = useState(1); // Page actuelle
    const [hasMore, setHasMore] = useState(true); // Y a-t-il plus de données à charger ?
    const [search, setSearch] = useState(""); // Texte de recherche
    const [activeCategory, setActiveCategory] = useState("Tous"); // Catégorie active

    const categories = ["Tous", "Musculation", "Cardio", "Yoga", "CrossFit"];

    // Charger les salles initiales
    useEffect(() => {
        fetchSalles(1);
    }, []);

    // Filtrer les salles lorsque la catégorie ou la recherche change
    useEffect(() => {
        let filtered = salles;

        // Filtrer par catégorie
        if (activeCategory !== "Tous") {
            filtered = filtered.filter((salle) =>
                salle.activites.includes(activeCategory)
            );
        }

        // Filtrer par recherche
        if (search) {
            filtered = filtered.filter((salle) =>
                salle.nom.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredSalles(filtered);
    }, [activeCategory, search, salles]);

    // Fonction pour charger les salles
    const fetchSalles = async (page) => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);

        try {
            const response = await GetAllSalleDeSportsApi(page, 8);
            if (response.salles.length > 0) {
                setSalles((prevSalles) => [...prevSalles, ...response.salles]);
                setPage(page + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.log("Erreur lors du chargement des salles : ", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Charger plus de salles
    const handleLoadMore = () => {
        if (hasMore && !isLoadingMore) {
            fetchSalles(page);
        }
    };

    // Rendu du footer de chargement
    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#FF6B6B" />
            </View>
        );
    };

    // Rendu d'un élément de la liste
    const renderItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100)}
            style={styles.cardContainer}
            key={item._id}
        >
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => router.push(`/DetailsSalle/${item._id}`)}
            >
                <View style={styles.card}>
                    <Image
                        source={{ uri: item.photos[0] }}
                        style={styles.image}
                    />
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.8)"]}
                        style={styles.gradient}
                    />
                    <View style={styles.contentContainer}>
                        <BlurView intensity={20} style={styles.statusContainer}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Ouvert</Text>
                        </BlurView>

                        <View style={styles.infoContainer}>
                            <Text style={styles.gymName}>{item.nom}</Text>
                            <View style={styles.detailsContainer}>
                                <View style={styles.row}>
                                    <Icon name="location-outline" size={16} color="#fff" />
                                    <Text style={styles.address}>{item.adresse}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Icon name="call-outline" size={16} color="#fff" />
                                    <Text style={styles.openDays}>{item.telephone}</Text>
                                </View>
                            </View>
                        </View>
                        {/*   
                         <TouchableOpacity style={styles.favoriteButton}>
                            <Icon name="heart-outline" size={24} color="#fff" />
                        </TouchableOpacity> 
                    */}

                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    // [Suite de la première partie...]

    const renderEmptyState = () => {
        if (search || activeCategory !== "Tous") {
            return (
                <EmptyStateMessage
                    message={`Aucune salle ne correspond à ${search ? 'votre recherche' : 'cette catégorie'}`}
                    icon="search-outline"
                />
            );
        }
        return (
            <EmptyStateMessage
                message="Aucune salle disponible pour le moment"
                icon="fitness-outline"
            />
        );
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <AntDesign name="left" size={14} color="#181C2E" style={{ fontFamily: "Sen-Medium" }} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Découvrez nos salles</Text>
            </View>

            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    placeholder="Rechercher une salle..."
                    placeholderTextColor="#999"
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.categoriesWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            onPress={() => setActiveCategory(category)}
                            style={[
                                styles.categoryButton,
                                activeCategory === category && styles.activeCategoryButton,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    activeCategory === category && styles.activeCategoryText,
                                ]}
                                numberOfLines={1}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredSalles}
                keyExtractor={(item, index) => item._id ? item._id.toString() : `salle-${index}`}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContainer,
                    filteredSalles.length === 0 && styles.emptyListContainer
                ]}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,
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
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 16,
        paddingHorizontal: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: "#333",
        fontFamily: "Sen-Regular",
    },
    categoriesWrapper: {
        height: 50,
        marginBottom: 10,
    },
    categoriesContainer: {
        paddingHorizontal: 20,
        height: '100%',
        alignItems: 'center',
    },
    categoryButton: {
        width: 110,
        height: 40,
        paddingVertical: 0,
        borderRadius: 20,
        backgroundColor: "#fff",
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeCategoryButton: {
        backgroundColor: "#FF8C00",
    },
    categoryText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        fontFamily: "Sen-Medium",
        paddingHorizontal: 10,
    },
    activeCategoryText: {
        color: "#fff",
        fontFamily: "Sen-Regular"
    },
    listContainer: {
        padding: 20,
    },
    cardContainer: {
        marginBottom: 20,
    },
    card: {
        width: CARD_WIDTH,
        height: 200,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "70%",
    },
    // Styles pour le loading
    loaderContainer: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    loaderContent: {
        alignItems: "center",
        padding: 20,
    },
    loadingImage: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    loadingTitle: {
        fontSize: 24,
        fontFamily: "Sen-Bold",
        color: "#333",
        marginBottom: 10,
    },
    loadingSubtitle: {
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: "#666",
        textAlign: "center",
    },
    // Styles pour l'état vide
    emptyStateContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        minHeight: 300,
    },
    emptyStateText: {
        marginTop: 20,
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
    },
    emptyListContainer: {
        flexGrow: 1,
    },
    loadingMoreContainer: {
        paddingVertical: 20,
        alignItems: "center",
    },
    contentContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
    },
    statusContainer: {
        position: "absolute",
        top: -80,
        left: 15,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.9)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4CAF50",
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        color: "#333",
        fontFamily: "Sen-SemiBold"
    },
    infoContainer: {
        flex: 1,
    },
    gymName: {
        fontSize: 21,
        color: "#fff",
        marginBottom: 8,
        fontFamily: "Sen-Bold"
    },
    detailsContainer: {
        gap: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    address: {
        fontSize: 15,
        color: "#fff",
        marginLeft: 6,
        fontFamily: "Sen-Regular"
    },
    openDays: {
        fontSize: 15,
        color: "#fff",
        marginLeft: 6,
        fontFamily: "Sen-Regular"
    },
    favoriteButton: {
        position: "absolute",
        top: -80,
        right: 15,
        backgroundColor: "rgba(0,0,0,0.3)",
        padding: 10,
        borderRadius: 30,
    }
});

export default SallesScreen;