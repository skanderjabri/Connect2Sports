import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Image,
    StatusBar,
    Platform,
    SafeAreaView,
    TextInput,
    Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import SearchApi from "../api/SearchApi";
import { LinearGradient } from "expo-linear-gradient";
import Global from "../util/Global";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;

export default function SearchScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [resultat, setResultat] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Fonction pour effectuer la recherche
    const handleSearch = async () => {
        if (searchQuery.trim() === "") return;

        try {
            setLoading(true);
            const response = await SearchApi(searchQuery);
            if (response && response.data) {
                setResultat(response.data);
            }
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
        } finally {
            setLoading(false);
        }
    };

    // Grouper les résultats par type
    const groupResultsByType = (results) => {
        return results.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = [];
            }
            acc[item.type].push(item);
            return acc;
        }, {});
    };

    const groupedResults = groupResultsByType(resultat);

    // Composants pour chaque type
    const UserItem = ({ item }) => (
        <TouchableOpacity
            key={item._id}
            style={styles.userCard}
            onPress={() => router.push(`/DetailsUser/${item._id}`)}
        >
            <Image
                source={{
                    uri: Global.BaseFile + item.photoProfil,
                }}
                style={styles.userImage}
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.userImageOverlay}
            />
            <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>{item.nom}{" "}{item.prenom}</Text>
                <TouchableOpacity style={styles.profileButton}>
                    <Text style={styles.profileButtonText}>Voir profil</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const CategoryItem = ({ item }) => (
        <View key={item._id} style={styles.categoryButton}>
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text style={styles.categoryText}>{item.nom}</Text>
        </View>
    );

    const getRouteByType = (type, id) => {
        switch (type) {
            case 'salleDeSport':
                return `/DetailsSalle/${id}`;
            case 'tennisTerrain':
                return `/TerrainTennis/${id}`;
            case 'footBallTerrain':
                return `/TerrainFootBall/${id}`;
            case 'salleEms':
                return `/DetailsSalleEms/${id}`;
            case 'padelTerrain':
                return `/TerrainPadelScreen/${id}`;
            default:
                return `/Details/${id}`;
        }
    };


    const renderTerrainItem = ({ item, type }) => {
        let icon;
        switch (type) {
            case 'salleDeSport':
                icon = <FontAwesome5 name="dumbbell" size={16} color="#FF8C00" />;
                break;
            case 'tennisTerrain':
                icon = <FontAwesome5 name="table-tennis" size={16} color="#4CAF50" />;
                break;
            case 'footBallTerrain':
                icon = <FontAwesome5 name="futbol" size={16} color="#2196F3" />;
                break;
            case 'salleEms':
                icon = <MaterialIcons name="electrical-services" size={16} color="#9C27B0" />;
                break;
            case 'padelTerrain':
                icon = <FontAwesome5 name="table-tennis" size={16} color="#FF5722" />;
                break;
            default:
                icon = <FontAwesome5 name="building" size={16} color="#607D8B" />;
        }

        // Obtenir la route de navigation appropriée
        const navigationRoute = getRouteByType(type, item._id);

        return (
            <TouchableOpacity
                key={item._id}
                style={styles.cardTerrain}
                onPress={() => router.push(navigationRoute)}
            >
                <View style={styles.cardImageContainer}>
                    <Image source={{ uri: item.photos[0] }} style={styles.imageTerrain} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.gradientOverlay}
                    />
                </View>
                <View style={styles.cardContentTerrain}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.titleTerrain}>{item.nom}</Text>
                        <View style={styles.typeTag}>
                            {icon}
                        </View>
                    </View>
                    <Text style={styles.descriptionTerrain} numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View style={styles.infoRowTerrain}>
                        <View style={styles.infoItemTerrain}>
                            <MaterialIcons name="location-on" size={16} color="#FF8C00" />
                            <Text style={styles.infoTextTerrain}>{item.adresse}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    // Fonctions de rendu pour chaque type de terrain
    const SalleDeSportItem = ({ item }) => renderTerrainItem({ item, type: 'salleDeSport' });
    const TennisTerrainItem = ({ item }) => renderTerrainItem({ item, type: 'tennisTerrain' });
    const FootballTerrainItem = ({ item }) => renderTerrainItem({ item, type: 'footBallTerrain' });
    const SalleEmsItem = ({ item }) => renderTerrainItem({ item, type: 'salleEms' });
    const PadelTerrainItem = ({ item }) => renderTerrainItem({ item, type: 'padelTerrain' });

    // Composant pour afficher une section horizontale
    const HorizontalScrollView = ({ title, data, renderItem }) => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {data.map((item, index) => (
                    <View key={index} style={styles.horizontalItem}>
                        {renderItem({ item })}
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const getEmptyStateMessage = () => {
        if (resultat.length === 0 && searchQuery.trim() !== "" && !loading) {
            return (
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="search-outline" size={64} color="#E9ECEF" />
                    <Text style={styles.emptyStateTitle}>Aucun résultat trouvé</Text>
                    <Text style={styles.emptyStateText}>
                        Nous n'avons trouvé aucun résultat pour "{searchQuery}".
                        Essayez avec d'autres termes.
                    </Text>
                </View>
            );
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <AntDesign name="left" size={16} color="#181C2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recherche</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Que recherchez-vous ?"
                        placeholderTextColor="#A9A9A9"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={18} color="#6C757D" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[
                        styles.searchButton,
                        searchQuery.trim() === "" && styles.searchButtonDisabled
                    ]}
                    onPress={handleSearch}
                    disabled={searchQuery.trim() === ""}
                >
                    <Text style={styles.searchButtonText}>Rechercher</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#FF8C00" />
                    <Text style={styles.loaderText}>Recherche en cours...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={
                        Object.keys(groupedResults).length === 0
                            ? styles.emptyScrollViewContent
                            : styles.scrollViewMainContent
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {getEmptyStateMessage()}

                    {Object.keys(groupedResults).map((type) => {
                        let renderItem;
                        let title;

                        switch (type) {
                            case 'user':
                                renderItem = UserItem;
                                title = 'Utilisateurs';
                                break;
                            case 'category':
                                renderItem = CategoryItem;
                                title = 'Catégories';
                                break;
                            case 'salleDeSport':
                                renderItem = SalleDeSportItem;
                                title = 'Salles de sport';
                                break;
                            case 'tennisTerrain':
                                renderItem = TennisTerrainItem;
                                title = 'Terrains de tennis';
                                break;
                            case 'footBallTerrain':
                                renderItem = FootballTerrainItem;
                                title = 'Terrains de football';
                                break;
                            case 'salleEms':
                                renderItem = SalleEmsItem;
                                title = 'Salles EMS';
                                break;
                            case 'padelTerrain':
                                renderItem = PadelTerrainItem;
                                title = 'Terrains de padel';
                                break;
                            default:
                                renderItem = null;
                                title = 'Autres';
                        }

                        return (
                            <HorizontalScrollView
                                key={type}
                                title={title}
                                data={groupedResults[type]}
                                renderItem={renderItem}
                            />
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginBottom: 8,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 52,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#181C2E',
        fontFamily: "Sen-Regular",
        padding: 0,
    },
    clearButton: {
        padding: 5,
    },
    searchButton: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        marginLeft: 12,
        height: 52,
        justifyContent: 'center',
        shadowColor: "#FF8C00",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    searchButtonDisabled: {
        backgroundColor: '#FFD8B0',
        shadowOpacity: 0.1,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontFamily: "Sen-Bold",
        fontSize: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loaderText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6C757D',
        fontFamily: "Sen-Regular",
    },
    emptyScrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    scrollViewMainContent: {
        paddingBottom: 30,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyStateTitle: {
        fontSize: 18,
        color: '#181C2E',
        fontFamily: 'Sen-Bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6C757D',
        fontFamily: 'Sen-Regular',
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
    },
    viewAllButton: {
        padding: 8,
    },
    viewAllText: {
        fontSize: 14,
        color: '#FF8C00',
        fontFamily: "Sen-Medium",
    },
    scrollViewContent: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    horizontalItem: {
        marginRight: 12,
        marginBottom: 4,
        marginTop: 4,
    },
    // Styles pour les terrains (communs)
    cardTerrain: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        width: 280,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    cardImageContainer: {
        position: 'relative',
    },
    imageTerrain: {
        width: '100%',
        height: 160,
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    cardContentTerrain: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleTerrain: {
        fontSize: 18,
        color: '#181C2E',
        fontFamily: "Sen-SemiBold",
        flex: 1,
    },
    typeTag: {
        padding: 8,
        borderRadius: 50,
        backgroundColor: '#F8F9FA',
        marginLeft: 8,
    },
    descriptionTerrain: {
        fontSize: 14,
        color: '#6C757D',
        marginBottom: 12,
        fontFamily: "Sen-Regular",
        lineHeight: 20,
    },
    infoRowTerrain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    infoItemTerrain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoTextTerrain: {
        marginLeft: 6,
        fontSize: 14,
        color: '#181C2E',
        fontFamily: 'Sen-Regular'
    },
    // Styles pour les catégories
    categoryButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 8,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryIcon: {
        marginRight: 8,
        fontSize: 20,
    },
    categoryText: {
        fontSize: 15,
        color: "#181C2E",
        fontFamily: "Sen-Medium"
    },
    // Styles pour les utilisateurs
    userCard: {
        width: 180,
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
    },
    userImage: {
        width: "100%",
        height: "100%",
    },
    userImageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    userInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    userName: {
        fontSize: 18,
        fontFamily: "Sen-Bold",
        color: '#FFFFFF',
        textTransform: 'capitalize',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    profileButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    profileButtonText: {
        color: "#FF8C00",
        fontFamily: "Sen-Bold",
        fontSize: 14,
    },
});