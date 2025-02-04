import React, { useState, useEffect } from "react";
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
    Platform
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, Entypo, FontAwesome5 } from '@expo/vector-icons';
import GetUsersAproximitesApi from "../api/GetUsersAproximitesApi";
import Global from "../util/Global";
const { width } = Dimensions.get('window');

export default function UsersScreen() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit] = useState(9);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const categories = ["Tous", "Football", "Basketball", "Volley-ball", "Rugby", "Tennis",
        "Tennis de table", "Badminton", "Padel", "Natation", "Surf", "Musculation", "Gymnastique", "Yoga", "EMS (sport avec électrodes)", "Course à pied", "Judo", "Boxe", "Lutte"];
    const [selectedCategory, setSelectedCategory] = useState("Tous");

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        try {
            setIsFetching(true);
            const response = await GetUsersAproximitesApi(page, limit);
            setUsers((prevUsers) => [...prevUsers, ...response.users]);
            setHasMore(response.users.length > 0);
        } catch (error) {
            console.error(error);
        } finally {
            setIsFetching(false);
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !isFetching) {
            setPage(page + 1);
        }
    };

    // Filtrer les utilisateurs par catégorie et recherche
    const filteredUsers = users.filter(user => {
        // Si la catégorie sélectionnée est "Tous", on ne filtre pas par sport
        const matchesCategory = selectedCategory === "Tous" ||
            user.sportsPratiques?.some(sport => sport.nom === selectedCategory);

        // Filtrage par nom ou prénom
        const matchesSearch = search === "" ||
            user.nom.toLowerCase().includes(search.toLowerCase()) ||
            user.prenom.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
    });

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
                        @ {item.pseudo}
                    </Text>
                </View>
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.infoRow}>
                    <Entypo style={{ marginLeft: 6 }} name="location-pin" size={20} color="#FF9F43" />
                    <Text style={styles.infoText} numberOfLines={1}>
                        {item.adresse}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <View style={styles.sportsContainer}>
                        {item.sportsPratiques && item.sportsPratiques.length > 0
                            ? item.sportsPratiques.map((sport, index) => (
                                <View key={index} style={styles.sportItem}>
                                    <Text style={styles.sportIcon}>{sport.icon}</Text>
                                    <Text style={styles.sportName}>{sport.nom}</Text>
                                </View>
                            ))
                            : <Text style={styles.infoText}>Aucun sport pratiqué</Text>
                        }
                    </View>
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

    // Composant pour afficher un message lorsque la liste est vide
    const EmptyListMessage = () => (
        <View style={styles.emptyListContainer}>
            <AntDesign name="frowno" size={50} color="#FF9F43" />
            <Text style={styles.emptyListText}>Aucun utilisateur trouvé</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text><AntDesign name="left" size={14} color="#181C2E" style={{ fontFamily: "Sen-Medium" }} /></Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sportifs à proximité</Text>
            </View>
            <View style={styles.searchContainer}>
                <AntDesign name="search1" size={18} color="#6B7280" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher des sportifs"
                    placeholderTextColor="#6B7280"
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")}>
                        <Text><AntDesign name="closecircle" size={18} color="#6B7280" /></Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Catégories avec ScrollView horizontal */}
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

            {isLoading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF6B41" />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers} // Utiliser les utilisateurs filtrés
                    renderItem={renderUserCard}
                    keyExtractor={(item, index) => item._id ? item._id.toString() : `user-${index}`}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetching ?
                            <ActivityIndicator size="small" color="#FF6B41" />
                            : null
                    }
                    ListEmptyComponent={<EmptyListMessage />} // Afficher le message si la liste est vide
                    contentContainerStyle={styles.listContainer}
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
    categoriesWrapper: {
        height: 50,
        marginBottom: 10,
    },
    categoriesContainer: {
        height: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    categoryButton: {
        paddingHorizontal: 20,
        width: "auto",
        height: 40,
        paddingVertical: 0,
        borderRadius: 20,
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F4F5F7",
    },
    selectedCategory: {
        backgroundColor: "#FF9F43",
    },
    categoryText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        fontFamily: "Sen-Medium",
        paddingHorizontal: 10,
    },
    selectedCategoryText: {
        color: "#fff",
        fontWeight: "bold",
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
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50, // Ajustez la marge selon vos besoins
    },
    emptyListText: {
        fontSize: 18,
        color: "#6B7280",
        marginTop: 10,
        fontFamily: "Sen-Regular",
    },
});