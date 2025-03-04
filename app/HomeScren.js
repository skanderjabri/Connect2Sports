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
    StatusBar,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import GetAllCategoriesApi from "../api/GetAllCategoriesApi";
import GetAllSalleDeSportsApi from "../api/GetAllSalleDeSportsApi";
import GetUsersAproximitesApi from "../api/GetUsersAproximitesApi";
import { useRouter } from 'expo-router';
import { getUserData } from "../util/StorageUtils";
import BottomTabNavigation from "../util/BottomTabNavigation";
import Global from "../util/Global";
import GetMyNotificationCountNotReadApi from "../api/GetMyNotificationCountNotReadApi";
import { useFocusEffect } from '@react-navigation/native';
import GetPadelTerrainApi from "../api/GetPadelTerrainApi";
const DEFAULT_DISTANCE = 15;

export default function HomeScren() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [salles, setSalles] = useState([]);
    const [users, setUsers] = useState([]);
    const [progressVisible, setProgressVisible] = useState(true);
    const [userDataStorage, setUserDataStorage] = useState(null);
    const [locationDataStorage, setlocationDataStorage] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);


    const [facilityCounts, setFacilityCounts] = useState({
        padel: 8,
        gym: 12,
        football: 5,
        ems: 3,
        tennis: 7
    });
    const [userLocation, setUserLocation] = useState({
        latitude: null,
        longitude: null
    });


    useEffect(() => {
        Promise.all([fetechCategories(),
        fetechSalles(),
        fetechUsers(),
        fetchUserData(),
        fetechNotificationNotReadByUser(),
        ])
            .then(() => setProgressVisible(false))
            .catch((error) =>
                console.log("Erreur lors du chargement des données: " + error)
            );
    }, []);


    const fetchUserData = async () => {
        const data = await getUserData(); // Appel de la fonction externe
        // console.log(data)
        setUserDataStorage(data.user);
        setlocationDataStorage(data.location)
    };

    const fetechCategories = () => {
        return GetAllCategoriesApi()
            .then((response) => {
                setCategories(response.categories);

            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };

    const fetechSalles = () => {
        return GetAllSalleDeSportsApi(1, 8)
            .then((response) => {
                setSalles(response.salles);
            })
            .catch((error) => {
                console.log("Erreur  " + error);
                throw error;
            });
    };


    const fetechUsers = async () => {
        const data = await getUserData();
        if (data?.location?.coords) {
            setUserLocation({
                latitude: data.location.coords.latitude,
                longitude: data.location.coords.longitude
            });
        }
        // Récupérer l'ID de l'utilisateur connecté
        const connectedUserId = data.user._id;

        await GetUsersAproximitesApi(1, 9, userLocation.latitude, userLocation.longitude, DEFAULT_DISTANCE)
            .then((response) => {
                // Filtrer les utilisateurs pour exclure l'utilisateur connecté
                const filteredUsers = response.users.filter(user => user._id !== connectedUserId);
                setUsers(filteredUsers); // Mettre à jour l'état avec les utilisateurs filtrés
            })

            .catch((error) => {
                console.log("Erreur  " + error);
                throw error;
            });
    };
    useFocusEffect(
        React.useCallback(() => {
            // Appel initial
            fetechNotificationNotReadByUser();

            const interval = setInterval(() => {
                fetechNotificationNotReadByUser();
            }, 5000);

            // Nettoyage lors du départ de l'écran
            return () => clearInterval(interval);
        }, [])
    );
    const fetechNotificationNotReadByUser = async () => {
        const data = await getUserData();
        return GetMyNotificationCountNotReadApi(data.user._id)
            .then((response) => {
                setUnreadNotifications(response.notifications);
            })
            .catch((error) => {
                console.log("Erreur  " + error);
                throw error;
            });
    };



    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"} // Texte foncé sur iOS, clair sur Android
                backgroundColor={Platform.OS === "android" ? "transparent" : "transparent"} // Bleu sur Android, transparent sur iOS
                translucent
            />
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="menu" size={24} color="black" />
                    </TouchableOpacity>
                    {userDataStorage && locationDataStorage && (
                        <View>
                            <Text style={styles.userName}>{userDataStorage.nom}{" "}{userDataStorage.prenom}</Text>
                            <Text style={styles.location}>{locationDataStorage.address.country} {locationDataStorage.address.city} {locationDataStorage.address.subregion}  ▼</Text>
                        </View>
                    )}

                </View>
                {userDataStorage && locationDataStorage && (

                    <TouchableOpacity onPress={() => router.push("/DetailsProfilScreen")} >
                        <View style={styles.avatar} >
                            <Image
                                source={{ uri: Global.BaseFile + userDataStorage.photoProfil }}
                                style={styles.avatarImage}
                            />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }} >

                <Text style={styles.welcomeText}>Bienvenue Sur CONNECT2SPORT !</Text>

                {/* Remplacer TextInput par TouchableOpacity */}
                <TouchableOpacity
                    style={styles.searchContainer}
                    onPress={() => router.push("/SearchScreen")} // Naviguer vers l'écran de recherche
                >
                    <Ionicons name="search" size={20} color="gray" />
                    <Text style={styles.searchInput}>Rechercher un terrain, sportif, catégorie</Text>
                </TouchableOpacity>


                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Toutes Les Catégories</Text>
                    <TouchableOpacity onPress={() => router.push("/AllCategories")}  >
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
                    <TouchableOpacity onPress={() => router.push("/UsersScreen")} >
                        <Text style={styles.seeAllText}>Voir tout <AntDesign name="caretright" size={11} color="#FF8C00" style={{ fontFamily: "Sen-Medium" }} /></Text>
                    </TouchableOpacity>
                </View>
                {!progressVisible && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.usersContainer}
                    >
                        {users.map((user) => (
                            <View key={user._id} style={styles.userCard}>
                                <Image
                                    source={{
                                        uri: Global.BaseFile + user.photoProfil,
                                    }}
                                    style={styles.userImage}
                                />
                                <Text style={styles.userName} numberOfLines={1}>{user.nom}{" "}{user.prenom}</Text>
                                <View style={styles.userSport}>
                                    {user.sportsPratiques && user.sportsPratiques.length > 0
                                        ? (
                                            <>
                                                {user.sportsPratiques.slice(0, 2).map((sport, index) => (
                                                    <Text key={index} style={styles.sportItem} numberOfLines={1}>
                                                        <Text style={styles.sportIcon}>{sport.icon}</Text>
                                                        {"  "}
                                                        <Text style={styles.sportName}>{sport.nom}</Text>
                                                    </Text>
                                                ))}
                                                {/*   
                                                      {user.sportsPratiques.length > 2 && (
                                                        <Text style={styles.moreSportsText}>
                                                            +{user.sportsPratiques.length - 2} autres
                                                        </Text>
                                                    )}
                                                 */}

                                            </>
                                        )
                                        : <Text style={styles.infoText} numberOfLines={1} >Aucun sport pratiqué</Text>
                                    }
                                </View>
                                <TouchableOpacity style={styles.profileButton}
                                    onPress={() => router.push(`/DetailsUser/${user._id}`)}
                                >
                                    <Text style={styles.profileButtonText}>Voir profil</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Les installations sportives</Text>
                </View>

                {!progressVisible && (
                    <View style={{ paddingHorizontal: 16 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.facilitiesContainer}
                        >
                            <TouchableOpacity
                                style={styles.facilityCard}
                                onPress={() => router.push("/PadelTerrainsScreen")}>
                                <View style={styles.facilityImageContainer}>
                                    <Image
                                        source={{ uri: "https://media.istockphoto.com/id/2163796732/fr/photo/padel-tennis-racket-sport-court-and-balls.jpg?s=612x612&w=0&k=20&c=5h_14sLc006HeghTHf2Doce_SZY8RiTOgAMBu5dp3Gk=" }}
                                        style={styles.facilityImage}
                                    />
                                    <View style={styles.facilityIconContainer}>
                                        <Text style={styles.facilityIcon}>🎾</Text>
                                    </View>
                                </View>
                                <Text style={styles.facilityName}>Terrains de Padel</Text>
                                <Text style={styles.facilityCount}>8 terrains disponibles</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.facilityCard}
                                onPress={() => router.push("/SallesScreen")}>
                                <View style={styles.facilityImageContainer}>
                                    <Image
                                        source={{ uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48" }}
                                        style={styles.facilityImage}
                                    />
                                    <View style={styles.facilityIconContainer}>
                                        <Text style={styles.facilityIcon}>💪</Text>
                                    </View>
                                </View>
                                <Text style={styles.facilityName}>Salles de Sport</Text>
                                <Text style={styles.facilityCount}>12 salles disponibles</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.facilityCard}
                                onPress={() => router.push("/FootballTerrainsScreen")}>
                                <View style={styles.facilityImageContainer}>
                                    <Image
                                        source={{ uri: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68" }}
                                        style={styles.facilityImage}
                                    />
                                    <View style={styles.facilityIconContainer}>
                                        <Text style={styles.facilityIcon}>⚽</Text>
                                    </View>
                                </View>
                                <Text style={styles.facilityName}>Terrains de Football</Text>
                                <Text style={styles.facilityCount}>5 terrains disponibles</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.facilityCard}
                                onPress={() => router.push("/SallesEms")}>
                                <View style={styles.facilityImageContainer}>
                                    <Image
                                        source={{ uri: "https://images.unsplash.com/photo-1518611012118-696072aa579a" }}
                                        style={styles.facilityImage}
                                    />
                                    <View style={styles.facilityIconContainer}>
                                        <Text style={styles.facilityIcon}>⚡</Text>
                                    </View>
                                </View>
                                <Text style={styles.facilityName}>Salles EMS</Text>
                                <Text style={styles.facilityCount}>3 salles disponibles</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.facilityCard}
                                onPress={() => router.push("/TennisTerrain")}>
                                <View style={styles.facilityImageContainer}>
                                    <Image
                                        source={{ uri: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0" }}
                                        style={styles.facilityImage}
                                    />
                                    <View style={styles.facilityIconContainer}>
                                        <Text style={styles.facilityIcon}>🎾</Text>
                                    </View>
                                </View>
                                <Text style={styles.facilityName}>Courts de Tennis</Text>
                                <Text style={styles.facilityCount}>7 courts disponibles</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}


                <View style={styles.containerTerrain}>
                    <View style={styles.headerTerrain}>
                        <Text style={styles.headerTitleTerrain}>Salles de sport proches</Text>
                        <TouchableOpacity onPress={() => router.push("/SallesScreen")}>
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
                                    onPress={() => router.push(`/DetailsSalle/${s._id}`)}>
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
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </ScrollView>
            <BottomTabNavigation
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
            />
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,

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
        fontFamily: "Sen-Medium",
        textTransform: 'capitalize'
    },
    location: {
        fontSize: 14,
        color: "gray",
        fontFamily: "Sen-Regular"
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 50,
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
        padding: 22,
        backgroundColor: "#f5f5f5",
        borderRadius: 25,
    },
    searchInput: {
        marginLeft: 8,
        flex: 1,
        fontFamily: "Sen-Regular",
        color: "#676767",
        fontSize: 15
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
    containerTerrain: {
        marginTop: 10,
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
        marginBottom: 20,
        paddingBottom: 70, // hedhyy nbadelhaa mba3eeed 
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
    sportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    sportIcon: {
        marginRight: 4,
    },
    sportName: {
        marginLeft: 4,
        fontSize: 13,
        color: '#333',
        fontFamily: 'Sen-Regular'
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Sen-Regular'
    },
    moreSportsText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Sen-Regular',
        marginTop: 4,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 50, // Pour un avatar rond
    },
    facilitiesContainer: {
        //   paddingHorizontal: 12,
        paddingBottom: 20,
    },
    facilityCard: {
        width: 180,
        marginHorizontal: 8,
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    facilityImageContainer: {
        position: "relative",
        width: "100%",
        height: 120,
    },
    facilityImage: {
        width: "100%",
        height: "100%",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    facilityIconContainer: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(255, 140, 0, 0.9)",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    facilityIcon: {
        fontSize: 20,
    },
    facilityName: {
        fontSize: 15,
        fontFamily: "Sen-Bold",
        color: "#32343E",
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 4,
    },
    facilityCount: {
        fontSize: 12,
        fontFamily: "Sen-Regular",
        color: "#676767",
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
});

