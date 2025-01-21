import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Animated,
    Platform,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import GetSalleByIdApi from "../../api/GetSalleByIdApi";
import IsSalleDeSportInFavorisApi from "../../api/IsSalleDeSportInFavorisApi";
import AddSalleDeSportInFavorisApi from "../../api/AddSalleDeSportInFavorisApi";
import GetAverageRatingSalleApi from "../../api/GetAverageRatingSalleApi";
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';



const { width } = Dimensions.get('window');
const SPACING = 15;

const DetailsSalle = () => {
    const [salle, setSalle] = useState(null);
    const [inFavoris, setInFavoris] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [averageRating, setaverageRating] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollX = new Animated.Value(0);
    const router = useRouter();
    const { SalleID } = useLocalSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchSalle(); // Charger les données de la salle
                await verifSalleInFavoris();
                await getAverageRating() // Vérifier si la salle est dans les favoris
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            } finally {
                setIsLoading(false); // Arrêter le chargement
            }
        };

        fetchData();
    }, [SalleID]);



    const fetchSalle = async () => {
        try {
            const response = await GetSalleByIdApi(SalleID);
            setSalle(response.salle);
        } catch (error) {
            console.error("Error fetching salle data:", error);
        }
    };

    const getAverageRating = async () => {
        try {
            const response = await GetAverageRatingSalleApi(SalleID);
            setaverageRating(response.averageRating);
        } catch (error) {
            console.error("Error fetching salle data:", error);
        }
    };


    const verifSalleInFavoris = async () => {
        let userId = "6784e6e953de2713eb4df5b5"; // Remplacez par l'ID de l'utilisateur connecté
        let salleDeSportId = SalleID; // Utilisez directement SalleID depuis les paramètres

        try {
            const response = await IsSalleDeSportInFavorisApi(userId, salleDeSportId);
            if (response.isFavorite) {
                setInFavoris(true);
            } else {
                setInFavoris(false); // Mettre à jour l'état pour indiquer que la salle n'est pas dans les favoris
            }
        } catch (error) {
            console.error("Error checking if salle is in favoris:", error);
            setInFavoris(false); // En cas d'erreur, supposer que la salle n'est pas dans les favoris
        }
    };
    const addToFavoriteOrRemoveInFavoris = async () => {
        let user = "6784e6e953de2713eb4df5b5"; // ID de l'utilisateur connecté
        let favoriteSalleDeSport = SalleID; // ID de la salle de sport

        try {
            const response = await AddSalleDeSportInFavorisApi(user, favoriteSalleDeSport);
            if (response.message === "ok") {
                // La salle a été ajoutée aux favoris
                setInFavoris(true); // Mettre à jour l'état local
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'La salle a été ajoutée à vos favoris.',
                });
            } else if (response.message === "deleted") {
                // La salle a été supprimée des favoris
                setInFavoris(false); // Mettre à jour l'état local
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'La salle a été supprimée de vos favoris.',
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout ou de la suppression des favoris:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur s\'est produite. Veuillez réessayer.',
            });
        }
    };


    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    if (!salle && !isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <Text style={styles.errorText}>Unable to fetch salle details.</Text>
            </View>
        );
    }

    return (
        <AlertNotificationRoot>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                        scrollEventThrottle={16}
                    >
                        {salle.photos.map((photo, index) => (
                            <Image
                                key={index}
                                source={{ uri: photo }}
                                style={styles.carouselImage}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>
                    <View style={styles.dotsContainer}>
                        {salle.photos.map((_, index) => {
                            const inputRange = [
                                (index - 1) * width,
                                index * width,
                                (index + 1) * width,
                            ];
                            const scale = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.8, 1.4, 0.8],
                                extrapolate: 'clamp',
                            });
                            const opacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.4, 1, 0.4],
                                extrapolate: 'clamp',
                            });
                            return (
                                <Animated.View
                                    key={index}
                                    style={[styles.dot, { transform: [{ scale }], opacity }]}
                                />
                            );
                        })}
                    </View>
                </View>

                {/* Navigation Buttons */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()
                    }
                >
                    <FontAwesome name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={addToFavoriteOrRemoveInFavoris} // Appeler la fonction ici
                >
                    <FontAwesome
                        name={inFavoris ? "heart" : "heart-o"} // Utiliser "heart" si la salle est dans les favoris
                        size={24}
                        color={inFavoris ? "#FF6B6B" : "white"} // Couleur rose si la salle est dans les favoris
                    />
                </TouchableOpacity>

                {/* Content Container */}
                <View style={styles.contentContainer}>
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>{salle.nom}</Text>
                        <View style={styles.badgesContainer}>
                            <View style={styles.badge}>
                                <FontAwesome name="star" size={16} color="#FFD700" />
                                <Text style={styles.badgeText}>{averageRating}</Text>
                            </View>
                            <View style={styles.badge}>
                                <FontAwesome name="users" size={16} color="#FF6B6B" />
                                <Text style={styles.badgeText}>Active</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description Card */}
                    <View style={styles.card}>
                        <Text style={styles.description}>{salle.description}</Text>
                    </View>

                    {/* Info Cards */}
                    <View style={styles.infoCardsContainer}>
                        <TouchableOpacity style={styles.infoCard}>
                            <FontAwesome name="phone" size={24} color="#FF8C00" />
                            <Text style={styles.infoCardText}>{salle.telephone}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.infoCard}>
                            <FontAwesome name="envelope" size={24} color="#FF8C00" />
                            <Text style={styles.infoCardText}>{salle.email}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.infoCard}>
                            <FontAwesome name="map-marker" size={24} color="#FF8C00" />
                            <Text style={styles.infoCardText}>{salle.adresse}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Section: Horaires */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
                        <View style={styles.hoursContainer}>
                            {salle.horairesOuverture.map((horaire) => (
                                <View key={horaire._id} style={styles.hourRow}>
                                    <Text style={styles.dayText}>{horaire.jour}</Text>
                                    <Text style={styles.timeText}>
                                        {horaire.ferme
                                            ? "Fermé"
                                            : `${horaire.ouverture} - ${horaire.fermeture}`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Activities Tags */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Activités</Text>
                        <View style={styles.tagsContainer}>
                            {salle.activites.map((activite, index) => (
                                <View key={index} style={styles.tagCard}>
                                    <Text style={styles.tagText}>{activite}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Equipment Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Équipements</Text>
                        <View style={styles.equipmentGrid}>
                            {salle.equipements.map((equipement, index) => (
                                <View key={index} style={styles.equipmentCard}>
                                    <FontAwesome name="check-circle" size={20} color="#4CAF50" />
                                    <Text style={styles.equipmentText}>{equipement}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Pricing Cards */}
                    <View style={[styles.section,]}>
                        <Text style={styles.sectionTitle}>Tarifs</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {salle.tarifs.map((tarif) => (
                                <View key={tarif._id} style={styles.pricingCard}>
                                    <Text style={styles.serviceTitle}>{tarif.service}</Text>
                                    <Text style={styles.priceText}>{tarif.prixParMois} TND</Text>
                                    <Text style={styles.periodText}>/mois</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Coaches Section */}
                    <View style={[styles.section, styles.lastSection]}>
                        <Text style={styles.sectionTitle}>Nos Coachs</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {salle.coachs.map((coach) => (
                                <View key={coach._id} style={styles.coachCard}>
                                    <Image
                                        source={{ uri: coach.image }}
                                        style={styles.coachImage}
                                    />
                                    <View style={styles.coachInfo}>
                                        <Text style={styles.coachName}>{coach.nom}</Text>
                                        <Text style={styles.coachFunction}>{coach.fonction}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Avis</Text>
                        <TouchableOpacity
                            style={styles.seeAllReviewsButton}
                            onPress={() => router.push(`/ReviewsSalle/${SalleID}`)}
                        >
                            <Text style={styles.seeAllReviewsText}>Voir tous les avis</Text>
                            <FontAwesome name="arrow-right" size={18} color="#FF8C00" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </AlertNotificationRoot>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselContainer: {
        height: 300,
        position: 'relative',
    },
    carouselImage: {
        width,
        height: 300,
    },
    dotsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        marginHorizontal: 4,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 10,
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        position: 'absolute',
        top: 20,
        right: 10,
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        backgroundColor: "white",
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: SPACING,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING,
    },
    title: {
        fontSize: 24,
        color: '#1a1a1a',
        flex: 1,
        fontFamily: "Sen-SemiBold"
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        gap: 5,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    badgeText: {
        fontSize: 14,
        color: '#1a1a1a',
        fontFamily: "Sen-Bold"
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: SPACING,
        marginBottom: SPACING,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        fontFamily: "Sen-Regular"
    },
    infoCardsContainer: {
        flexDirection: 'column',
        gap: 10,
        marginBottom: SPACING,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: SPACING,
        borderRadius: 15,
        gap: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    infoCardText: {
        fontSize: 16,
        color: '#1a1a1a',
        flex: 1,
        fontFamily: "Sen-Regular"
    },
    section: {
        marginBottom: SPACING * 2,
    },
    lastSection: {
        marginBottom: SPACING * 4,
    },
    sectionTitle: {
        fontSize: 20,
        color: '#1a1a1a',
        marginBottom: SPACING,
        fontFamily: "Sen-Bold"
    },
    hoursContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: SPACING,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dayText: {
        fontSize: 16,
        color: '#1a1a1a',
        fontFamily: "Sen-SemiBold"
    },
    timeText: {
        fontSize: 16,
        color: '#666',
        fontFamily: "Sen-Regular"
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tagCard: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 25,
    },
    tagText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: "Sen-Regular"
    },
    equipmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    equipmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: SPACING,
        borderRadius: 15,
        gap: 10,
        width: (width - (SPACING * 3)) / 2,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    equipmentText: {
        fontSize: 14,
        color: '#1a1a1a',
        flex: 1,
        fontFamily: "Sen-Regular"
    },
    pricingCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: SPACING,
        marginRight: SPACING,
        width: width / 2.5,
        alignItems: 'center',
        marginBottom: 5,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    serviceTitle: {
        fontSize: 18,
        color: '#1a1a1a',
        marginBottom: 5,
        fontFamily: "Sen-Medium",
        textAlign: "center",
    },
    priceText: {
        fontSize: 24,
        color: '#FF8C00',
        fontFamily: "Sen-Bold",
    },
    periodText: {
        fontSize: 14,
        color: '#666',
        fontFamily: "Sen-Regular"
    },
    coachCard: {
        marginBottom: 5,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: SPACING,
        marginRight: SPACING,
        width: width / 2.5,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    coachImage: {
        width: 120,
        height: 120,
        borderRadius: 70,
        marginBottom: 10,
    },
    coachInfo: {
        alignItems: 'center',
    },
    coachName: {
        fontSize: 16,
        color: '#1a1a1a',
        marginBottom: 4,
        fontFamily: "Sen-Bold"
    },
    coachFunction: {
        fontSize: 14,
        color: '#666',
        fontFamily: "Sen-Regular"
    },
    errorText: {
        fontSize: 16,
        color: '#FF6B6B',
    },
    seeAllReviewsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: SPACING,
        borderRadius: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    seeAllReviewsText: {
        fontSize: 18,
        color: '#1a1a1a',
        fontFamily: "Sen-Regular",
    },

});

export default DetailsSalle;
