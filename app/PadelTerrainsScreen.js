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
    Dimensions,
    TextInput,
    
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import GetPadelTerrainApi from "../api/GetPadelTerrainApi";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;

export default function PadelTerrainsScreen() {
    const router = useRouter();
    const [sallePadels, setSallePadels] = useState([]); // Données complètes
    const [filteredPadels, setFilteredPadels] = useState([]); // Données filtrées
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(9);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche

    useEffect(() => {
        fetchSallePadel();
    }, []);

    // Fonction pour récupérer les données
    const fetchSallePadel = async (isLoadMore = false) => {
        try {
            const response = await GetPadelTerrainApi(isLoadMore ? page + 1 : 1, limit);
            if (isLoadMore) {
                if (response.padelsTerrains.length > 0) {
                    setSallePadels((prev) => [...prev, ...response.padelsTerrains]);
                    setFilteredPadels((prev) => [...prev, ...response.padelsTerrains]); // Mettre à jour les données filtrées
                    setPage(page + 1);
                } else {
                    setHasMore(false);
                }
            } else {
                setSallePadels(response.padelsTerrains);
                setFilteredPadels(response.padelsTerrains); // Initialiser les données filtrées
                setPage(1);
                setHasMore(true);
            }
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fonction pour filtrer les terrains par nom
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query) {
            const filtered = sallePadels.filter((terrain) =>
                terrain.nom.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredPadels(filtered);
        } else {
            setFilteredPadels(sallePadels); // Réinitialiser si la recherche est vide
        }
    };

    // Fonction pour rafraîchir la liste
    const onRefresh = () => {
        setRefreshing(true);
        fetchSallePadel();
    };

    // Rendu d'une carte de terrain de padel
    const renderPadelCard = ({ item }) => (
        <View style={styles.cardContainer} key={item._id}>
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => router.push(`/TerrainPadelScreen/${item._id}`)}
            >
                <View style={styles.card}>
                    <Image source={{ uri: item.photos[0] }} style={styles.image} />
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
                                    <Ionicons name="location-outline" size={16} color="#fff" />
                                    <Text style={styles.address}>{item.adresse}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Ionicons name="call-outline" size={16} color="#fff" />
                                    <Text style={styles.openDays}>{item.telephone}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );

    // Rendu du footer pour le chargement supplémentaire
    const renderFooter = () => {
        if (!hasMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#FF7622" />
            </View>
        );
    };

    // Rendu si aucun résultat n'est trouvé
    const renderNoResults = () => (
        <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={50} color="#999" />
            <Text style={styles.noResultsText}>Aucun résultat trouvé</Text>
            <Text style={styles.noResultsSubText}>Essayez un autre nom de terrain.</Text>
        </View>
    );

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
                <Text style={styles.headerTitle}>Terrains de Padel</Text>
            </View>

            {/* Champ de recherche */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher par nom..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            </View>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <FlatList
                    data={filteredPadels} // Utiliser les données filtrées
                    renderItem={renderPadelCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.flatListContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    onEndReached={() => hasMore && fetchSallePadel(true)}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderNoResults} // Afficher si aucun résultat
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
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F8F9FA',
        borderRadius: 25,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#181C2E',
        fontFamily: "Sen-Regular",
        marginLeft: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatListContent: {
        padding: 16,
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
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "70%",
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
    image: {
        width: "100%",
        height: "100%",
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    noResultsText: {
        fontSize: 18,
        color: '#666',
        fontFamily: "Sen-Bold",
        marginTop: 16,
    },
    noResultsSubText: {
        fontSize: 14,
        color: '#999',
        fontFamily: "Sen-Regular",
        marginTop: 8,
    },
});