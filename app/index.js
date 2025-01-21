import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,

} from "react-native";
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import GetAllCategoriesApi from "../api/GetAllCategoriesApi";
import GetAllSalleDeSportsApi from "../api/GetAllSalleDeSportsApi";
import { useRouter } from 'expo-router';

const Sport2ConnectScreen = () => {
    const router = useRouter();
    const [categories, setCategories] = useState([])
    const [salles, setSalles] = useState([])
    const [progressVisible, setProgressVisible] = useState(true)

    useEffect(() => {
        Promise.all([fetechCategories(), fetechSalles()])
            .then(() => setProgressVisible(false))
            .catch((error) =>
                console.log("Erreur lors du chargement des données: " + error)
            );
    }, []);


    const fetechCategories = () => {
        return GetAllCategoriesApi()
            .then((response) => {
                setCategories(response.categories)
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };

    const fetechSalles = () => {
        return GetAllSalleDeSportsApi(1, 8)
            .then((response) => {
                setSalles(response.salles)
            })
            .catch((error) => {
                console.log("Erreur  " + error);
                throw error;
            });
    };


    const suggestedUsers = [
        {
            id: 1,
            name: "Emine Beji",
            sport: "Basketball",
            distance: "9 Km",
        },
        {
            id: 2,
            name: "Emine Bousselmi",
            sport: "Athlétisme",
            distance: "5 Km",
        },
        {
            id: 3,
            name: "Iskander Jabri",
            sport: "Athlétisme",
            distance: "3 Km",
        },
    ];



    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            <TouchableOpacity style={styles.menuButton}>
                                <Ionicons name="menu" size={24} color="black" />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.userName}>ISKANDER JABRI</Text>
                                <Text style={styles.location}>Tunisie, Tunis, Kef ▼</Text>
                            </View>
                        </View>
                        <TouchableOpacity>
                            <View style={styles.avatar} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.welcomeText}>Bienvenue Sur CONNECT2SPORT !</Text>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="gray" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher un terrain, sportif, catégorie"
                            placeholderTextColor="#676767"
                        />
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Toutes Les Catégories</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Voir tout <AntDesign name="caretright" size={11} color="#FF8C00" style={{ fontFamily: "Sen-Medium" }} /> </Text>
                        </TouchableOpacity>
                    </View>
                    {!progressVisible && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoriesContainer}
                        >

                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category._id}
                                    style={styles.categoryButton}>
                                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                                    <Text style={styles.categoryText}>{category.nom}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                    )}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Utilisateurs Suggérés</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Voir tout <AntDesign name="caretright" size={11} color="#FF8C00" style={{ fontFamily: "Sen-Medium" }} /></Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.usersContainer}
                    >
                        {suggestedUsers.map((user) => (
                            <View key={user.id} style={styles.userCard}>
                                <Image
                                    source={{
                                        uri: "https://c1.staticflickr.com/1/578/21820499801_7cb12b1043_b.jpg",
                                    }}
                                    style={styles.userImage}
                                />
                                <Text style={styles.userName}>{user.name}</Text>
                                <Text style={styles.userSport}>{user.sport}</Text>
                                <Text style={styles.userDistance}>{user.distance}</Text>
                                <TouchableOpacity style={styles.profileButton}>
                                    <Text style={styles.profileButtonText}>Voir profil</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.containerTerrain}>
                        <View style={styles.headerTerrain}>
                            <Text style={styles.headerTitleTerrain}>Salles de sport proches</Text>
                            <TouchableOpacity onPress={() => router.push("/SallesScreen")} // Utilisez la méthode router.push
                            >
                                <Text style={styles.headerLinkTerrain}>Voir tout <AntDesign name="caretright" size={11} color="#FF8C00" style={{ fontFamily: "Sen-Medium" }} /></Text>
                            </TouchableOpacity>
                        </View>
                        {!progressVisible && (

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContainerTerrain}
                            >

                                {salles.map((s) => (
                                    <TouchableOpacity key={s._id} style={styles.cardTerrain}
                                        onPress={() => router.push(`/DetailsSalle/${s._id}`)} // Utilisez la méthode router.push
                                    >
                                        <Image source={{ uri: s.photos[0] }} style={styles.imageTerrain} />
                                        <View style={styles.cardContentTerrain}>
                                            <Text style={styles.titleTerrain}>{s.nom}</Text>
                                            <Text style={styles.descriptionTerrain} numberOfLines={2}>
                                                {s.description}
                                            </Text>
                                            <View style={styles.infoRowTerrain}>
                                                <View style={styles.infoItemTerrain}>
                                                    <Text>🚩</Text>
                                                    <Text style={styles.infoTextTerrain}>{s.adresse}</Text>
                                                </View>
                                                {/*   <View style={styles.infoItemTerrain}>
                                                    <MaterialIcons name="local-shipping" size={16} color="#4CAF50" />
                                                    <Text style={styles.infoTextTerrain}>{s.adresse}</Text>
                                                </View>
                                                <View style={styles.infoItemTerrain}>
                                                    <MaterialIcons name="access-time" size={16} color="#FF5722" />
                                                    <Text style={styles.infoTextTerrain}>{s.adresse}</Text>
                                                </View>*/}

                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </ScrollView>
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem}
                        onPress={() =>
                            router.push("/ListFavorisScreen")}
                    >
                        <Ionicons name="grid-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}
                        onPress={() =>
                            router.push("/LoginScreen")}
                    >
                        <Ionicons name="menu-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItemHome}>
                        <Ionicons name="home-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}
                        onPress={() =>
                            router.push("/SignUpScreen")}
                    >
                        <Ionicons name="notifications-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() =>
                        router.push("/MenuScreen")}
                    >
                        <Ionicons name="person-outline" size={24} color="black"
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuButton: {
        marginRight: 12,
    },
    userName: {
        fontSize: 15,
        fontFamily: "Sen-Medium"
    },
    location: {
        fontSize: 14,
        color: "gray",
        fontFamily: "Sen-Regular"
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ddd",
    },
    welcomeText: {
        color: "1E1D1D",
        fontSize: 20,
        padding: 16,
        fontFamily: "Sen-SemiBold"
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        margin: 16,
        padding: 12,
        backgroundColor: "#f5f5f5",
        borderRadius: 25,
    },
    searchInput: {
        marginLeft: 8,
        flex: 1,
        fontFamily: "Sen-Regular"
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        color: "#32343E",
        fontFamily: "Sen-Bold"
    },
    seeAllText: {
        color: "#FF8C00",
        fontFamily: "Sen-Medium"
    },
    categoriesContainer: {
        paddingHorizontal: 12,
    },
    categoryButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
    },
    activeCategoryButton: {
        backgroundColor: "#FF9F43",
    },
    categoryIcon: {
        marginRight: 8,
        fontSize: 18,
    },
    categoryText: {
        fontSize: 14,
        color: "black",
        fontFamily: "Sen-Regular"
    },
    activeCategoryText: {
        color: "white",
    },
    usersContainer: {
        paddingHorizontal: 12,
        paddingBottom: 5
    },
    userCard: {
        width: 150,
        marginHorizontal: 8,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userImage: {
        width: "100%",
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    userSport: {
        color: "gray",
        fontSize: 14,
        fontFamily: "Sen-Regular"
    },
    userDistance: {
        fontSize: 12,
        color: "gray",
        marginTop: 4,
        fontFamily: "Sen-Regular"

    },
    profileButton: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#FF8C00",
        marginTop: 8,
        alignItems: "center",
    },
    profileButtonText: {
        color: "#FF8C00",
        fontFamily: "Sen-Medium"
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    navItem: {
        padding: 8,
    },
    navItemHome: {
        backgroundColor: "#FF8C00",
        padding: 16,
        borderRadius: 30,
        marginTop: -30,
    },
    containerTerrain: {
        marginTop: 30,
        paddingHorizontal: 16,
    },
    headerTerrain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTitleTerrain: {
        fontSize: 16,
        color: '#333',
        fontFamily: "Sen-Bold"
    },
    headerLinkTerrain: {
        fontSize: 14,
        color: '#F18904',
        fontFamily: "Sen-Regular"
    },
    scrollContainerTerrain: {
        flexDirection: 'row',
        marginBottom: 20

    },
    cardTerrain: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginRight: 16,
        overflow: 'hidden',
        width: 300,
        elevation: 3,
    },
    imageTerrain: {
        width: '100%',
        height: 150,
    },
    cardContentTerrain: {
        padding: 10,
    },
    titleTerrain: {
        fontSize: 15,
        color: '#333',
        marginBottom: 5,
        fontFamily: "Sen-SemiBold"
    },
    descriptionTerrain: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
        fontFamily: "Sen-Regular"

    },
    infoRowTerrain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItemTerrain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoTextTerrain: {
        marginLeft: 5,
        fontSize: 12,
        color: '#333',
        fontFamily: 'Sen-Regular'
    },


});

export default Sport2ConnectScreen;
