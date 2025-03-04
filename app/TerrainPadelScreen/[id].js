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
    StatusBar,
    Platform,
    SafeAreaView,
    Linking
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import GetPadelTerrainByIdApi from '../../api/GetPadelTerrainByIdApi';
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
const { width } = Dimensions.get('window');
const SPACING = 15;

export default function TerrainPadelScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [terrain, setTerrainPadel] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const scrollX = new Animated.Value(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchSalle(); // Charger les données de la salle
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            } finally {
                setIsLoading(false); // Arrêter le chargement
            }
        };

        fetchData();
    }, [id]);

    const fetchSalle = async () => {
        try {
            const response = await GetPadelTerrainByIdApi(id);
            setTerrainPadel(response.terrain);
        } catch (error) {
            console.error("Error fetching salle data:", error);
        }
    };
    const handleSocialMediaPress = async (url) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                console.log("Impossible d'ouvrir l'URL:", url);
            }
        } catch (error) {
            console.error("Erreur lors de l'ouverture du lien:", error);
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />
            {isLoading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
                    {/* Image Carousel avec overlay gradient */}
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
                            {terrain.photos.map((photo, index) => (
                                <View key={index} style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: photo }}
                                        style={styles.carouselImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.imageOverlay} />
                                </View>
                            ))}
                        </ScrollView>

                        {/* Dots modernisés */}
                        <View style={styles.dotsContainer}>
                            {terrain.photos.map((_, index) => {
                                const inputRange = [
                                    (index - 1) * width, // Utiliser `screenWidth` au lieu de `width`
                                    index * width,
                                    (index + 1) * width,
                                ];
                                const dotWidth = scrollX.interpolate({ // Renommer `width` en `dotWidth`
                                    inputRange,
                                    outputRange: [8, 16, 8],
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
                                        style={[
                                            styles.dot,
                                            { width: dotWidth, opacity } // Utiliser `dotWidth` ici
                                        ]}
                                    />
                                );
                            })}
                        </View>
                    </View>

                    {/* Bouton retour modernisé */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <View style={styles.backButtonInner}>
                            <FontAwesome name="arrow-left" size={20} color="white" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.contentContainer}>
                        {/* Header Section modernisé */}
                        <View style={styles.headerSection}>
                            <Text style={styles.title}>{terrain.nom}</Text>
                            <View style={styles.badgesContainer}>
                                <View style={styles.badge}>
                                    <FontAwesome name="users" size={16} color="#FF7622" />
                                    <Text style={styles.badgeText}>Active</Text>
                                </View>
                            </View>
                        </View>

                        {/* Description Card modernisée */}
                        <View style={styles.card}>
                            <Text style={styles.description}>{terrain.description}</Text>
                        </View>

                        {/* Info Cards modernisées */}
                        <View style={styles.infoCardsContainer}>
                            {[
                                { icon: "phone", text: terrain.telephone },
                                { icon: "envelope", text: terrain.email },
                                { icon: "map-marker", text: terrain.adresse }
                            ].map((item, index) => (
                                <TouchableOpacity key={index} style={styles.infoCard}>
                                    <View style={styles.iconContainer}>
                                        <FontAwesome name={item.icon} size={20} color="#FF7622" />
                                    </View>
                                    <Text style={styles.infoCardText}>{item.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Horaires modernisés */}
                        {terrain?.horairesOuverture.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
                                <View style={styles.hoursContainer}>
                                    {terrain.horairesOuverture.map((horaire, index) => (
                                        <View
                                            key={horaire._id}
                                            style={[
                                                styles.hourRow,
                                                index === terrain.horairesOuverture.length - 1 && { borderBottomWidth: 0 }
                                            ]}
                                        >
                                            <Text style={styles.dayText}>{horaire.jour}</Text>
                                            <View style={styles.timeContainer}>
                                                <Text style={[
                                                    styles.timeText,
                                                    horaire.ferme && styles.closedText
                                                ]}>
                                                    {horaire.ferme
                                                        ? "Fermé"
                                                        : `${horaire.ouverture} - ${horaire.fermeture}`}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Activités modernisées */}
                        {terrain?.activites.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Activités</Text>
                                <View style={styles.tagsContainer}>
                                    {terrain.activites.map((activite, index) => (
                                        <View key={index} style={styles.tagCard}>
                                            <Text style={styles.tagText}>{activite}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Équipements modernisés */}
                        {terrain?.equipements.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Équipements</Text>
                                <View style={styles.equipmentGrid}>
                                    {terrain.equipements.map((equipement, index) => (
                                        <View key={index} style={styles.equipmentCard}>
                                            <View style={styles.checkCircle}>
                                                <FontAwesome name="check" size={12} color="white" />
                                            </View>
                                            <Text style={styles.equipmentText}>{equipement}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Tarifs modernisés */}
                        {terrain?.tarifs.length > 0 && (
                            <View style={[styles.section, styles.lastSection]}>
                                <Text style={styles.sectionTitle}>Tarifs</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.pricingContainer}
                                >
                                    {terrain.tarifs.map((tarif, index) => (
                                        <View key={tarif._id} style={styles.pricingCard}>
                                            <View style={styles.pricingHeader}>
                                                <Text style={styles.serviceTitle}>{tarif.service}</Text>
                                            </View>
                                            <View style={styles.pricingContent}>
                                                <Text style={styles.priceText}>{tarif.prixParMois}</Text>
                                                <Text style={styles.currency}>TND</Text>
                                                <Text style={styles.periodText}>/mois</Text>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Avis</Text>
                            <TouchableOpacity
                                style={styles.seeAllReviewsButton}
                                onPress={() => router.push(`/ReviewPlace/${id}`)}
                            >
                                <Text style={styles.seeAllReviewsText}>Voir tous les avis</Text>
                                <FontAwesome name="arrow-right" size={18} color="#FF8C00" />
                            </TouchableOpacity>
                        </View>
                        {terrain?.reseauxSociaux &&
                            (terrain.reseauxSociaux.facebook || terrain.reseauxSociaux.instagram) && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Réseaux Sociaux</Text>
                                    <View style={styles.socialContainer}>
                                        {terrain.reseauxSociaux.facebook && (
                                            <TouchableOpacity
                                                style={styles.socialButton}
                                                onPress={() => handleSocialMediaPress(terrain.reseauxSociaux.facebook)}
                                            >
                                                <View style={[styles.socialIconContainer, styles.facebookContainer]}>
                                                    <FontAwesome name="facebook" size={24} color="white" />
                                                </View>
                                                <Text style={styles.socialText}>Facebook</Text>
                                                <FontAwesome name="external-link" size={16} color="#666" />
                                            </TouchableOpacity>
                                        )}

                                        {terrain.reseauxSociaux.instagram && (
                                            <TouchableOpacity
                                                style={styles.socialButton}
                                                onPress={() => handleSocialMediaPress(terrain.reseauxSociaux.instagram)}
                                            >
                                                <View style={[styles.socialIconContainer, styles.instagramContainer]}>
                                                    <FontAwesome name="instagram" size={24} color="white" />
                                                </View>
                                                <Text style={styles.socialText}>Instagram</Text>
                                                <FontAwesome name="external-link" size={16} color="#666" />
                                            </TouchableOpacity>
                                        )}
                                        {terrain.siteWeb && (
                                            <TouchableOpacity
                                                style={styles.socialButton}
                                                onPress={() => handleSocialMediaPress(terrain.siteWeb)}
                                            >
                                                <View style={[styles.socialIconContainer, styles.SiteContainer]}>
                                                    <FontAwesome name="paperclip" size={24} color="white" />
                                                </View>
                                                <Text style={styles.socialText}>Site web</Text>
                                                <FontAwesome name="external-link" size={16} color="#666" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    carouselContainer: {
        height: 310,
        position: 'relative',
    },
    imageContainer: {
        position: 'relative',
        width,
        height: 380,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        backgroundGradient: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
    },
    carouselImage: {
        width,
        height: 380,
    },
    dotsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        gap: 8,
    },
    dot: {
        height: 4,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    backButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    contentContainer: {
        backgroundColor: "white",
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: SPACING,
        paddingTop: SPACING * 2,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING * 1.5,
    },
    title: {
        fontSize: 28,
        color: '#1a1a1a',
        flex: 1,
        fontFamily: "Sen-Bold",
        letterSpacing: -0.5,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,118,34,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    badgeText: {
        fontSize: 14,
        color: '#FF7622',
        fontFamily: "Sen-Bold",
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: SPACING * 1.5,
        marginBottom: SPACING * 2,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        fontFamily: "Sen-Regular",
    },
    infoCardsContainer: {
        gap: 12,
        marginBottom: SPACING * 2,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: SPACING,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,118,34,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoCardText: {
        fontSize: 15,
        color: '#1a1a1a',
        flex: 1,
        fontFamily: "Sen-Medium",
    },
    section: {
        marginBottom: SPACING * 2.5,
    },
    sectionTitle: {
        fontSize: 22,
        color: '#1a1a1a',
        marginBottom: SPACING * 1.5,
        fontFamily: "Sen-Bold",
        letterSpacing: -0.5,
    },
    hoursContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: SPACING * 1.5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    dayText: {
        fontSize: 15,
        color: '#1a1a1a',
        fontFamily: "Sen-Bold",
    },
    timeContainer: {
        backgroundColor: 'rgba(255,118,34,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    timeText: {
        fontSize: 14,
        color: '#FF7622',
        fontFamily: "Sen-Medium",
    },
    closedText: {
        color: '#FF4444',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tagCard: {
        backgroundColor: 'rgba(255,118,34,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
    },
    tagText: {
        color: '#FF7622',
        fontSize: 14,
        fontFamily: "Sen-Medium",
    },
    equipmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    equipmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: SPACING,
        borderRadius: 16,
        gap: 12,
        width: (width - (SPACING * 3)) / 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    equipmentText: {
        fontSize: 14,
        color: '#1a1a1a',
        flex: 1,
        fontFamily: "Sen-Medium",
    },
    pricingContainer: {
        paddingVertical: SPACING,
        paddingRight: SPACING,
    },
    pricingCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: width / 2.2,
        marginRight: SPACING,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    pricingHeader: {
        backgroundColor: 'rgba(255,118,34,0.1)',
        padding: SPACING,
        alignItems: 'center',
    },
    pricingContent: {
        padding: SPACING * 1.5,
        alignItems: 'center',
    },
    serviceTitle: {
        fontSize: 18,
        color: '#FF7622',
        fontFamily: "Sen-Bold",
        textAlign: "center",
    },
    priceText: {
        fontSize: 32,
        color: '#1a1a1a',
        fontFamily: "Sen-Bold",
        letterSpacing: -1,
    },
    currency: {
        fontSize: 16,
        color: '#666',
        fontFamily: "Sen-Bold",
        marginTop: 4,
    },
    periodText: {
        fontSize: 14,
        color: '#666',
        fontFamily: "Sen-Regular",
        marginTop: 2,
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    lastSection: {
        marginBottom: SPACING * 4,
    },
    socialContainer: {
        gap: 12,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: SPACING,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    socialIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    facebookContainer: {
        backgroundColor: '#1877F2',
    },
    instagramContainer: {
        backgroundColor: '#E4405F',
    },
    SiteContainer: {
        backgroundColor: '#00BFB3',
    },
    socialText: {
        fontSize: 16,
        color: '#1a1a1a',
        fontFamily: "Sen-Medium",
        flex: 1,
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