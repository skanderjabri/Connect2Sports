import {
    View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar,
    Platform,
    SafeAreaView,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GetUserByIdApi from '../api/GetUserByIdApi';
import Global from '../util/Global';
import { getUserData } from '../util/StorageUtils';
import GetReviewStatsByUserApi from '../api/GetReviewStatsByUserApi';
export default function DetailsProfilScreen() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [averageRating, setaverageRating] = useState(null);
    const [totalReviews, settotalReviews] = useState(null);
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchUser(), fetchStatReviews()]);
        } catch (error) {
            console.log("Erreur lors du chargement des données: " + error);
        } finally {
            setLoading(false);
        }
    };
    const fetchUser = async () => {
        const data = await getUserData(); // Appel de la fonction externe

        const id = data.user._id; // Récupération de l'ID de l'utilisateur
        try {
            const response = await GetUserByIdApi(id);
            setUser(response.user);
        } catch (error) {
            console.log("Erreur lors de la récupération des données: " + error);
        }
    };


    const fetchStatReviews = async () => {
        try {
            const data = await getUserData();
            const id = data?.user?._id;
            if (id) {
                const response = await GetReviewStatsByUserApi(id);
                setaverageRating(response.averageRating);
                settotalReviews(response.totalReviews);
            }
        } catch (error) {
            console.log("Erreur " + error);
        }
    };


    if (loading) {
        return (
            <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color="#FF7622" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Aucune donnée utilisateur trouvée.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.leftHeader}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <AntDesign name="left" size={14} color="#181C2E" style={{ fontFamily: "Sen-Medium" }} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Informations</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/UpdateUserScreen")}
                >
                    <Text style={styles.modifyButton}>MODIFIER</Text>
                </TouchableOpacity>
            </View>

            {/* Contenu dynamique */}
            <ScrollView style={styles.scrollContainer}>
                {/* Section Profil */}
                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: Global.BaseFile + user.photoProfil }}
                        style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user.nom} {user.prenom}</Text>
                        <Text style={styles.profileRole}>{user.pseudo}</Text>
                    </View>
                </View>

                {/* Section Avis */}
                <View style={styles.reviewsSection}>
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.reviewsTitle}>Avis </Text>
                        <TouchableOpacity
                            onPress={() => router.push("/MesReviewsEvent")}
                        >
                            <Text style={styles.viewAllButton}>Voir tous les avis</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.ratingContainer}>
                        <Entypo name="star" size={20} color="#FF7622" />
                        <Text style={styles.ratingNumber}>{averageRating}</Text>
                        <Text style={styles.reviewCount}>Total {totalReviews} avis</Text>
                    </View>
                </View>

                {/* Section Informations */}
                <View style={styles.infoSection}>
                    <View style={styles.infoField}>
                        <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B15' }]}>
                            <Ionicons name="person-outline" size={22} color="#FF6B6B" />
                        </View>
                        <View style={styles.fieldTextContainer}>
                            <Text style={styles.fieldLabel}>NOM ET PRÉNOM</Text>
                            <Text style={styles.fieldValue}>{user.nom} {user.prenom}</Text>
                        </View>
                    </View>

                    <View style={styles.infoField}>
                        <View style={[styles.iconContainer, { backgroundColor: '#4263EB15' }]}>
                            <Ionicons name="mail-outline" size={22} color="#4263EB" />
                        </View>
                        <View style={styles.fieldTextContainer}>
                            <Text style={styles.fieldLabel}>EMAIL</Text>
                            <Text style={styles.fieldValue}>{user.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoField}>
                        <View style={[styles.iconContainer, { backgroundColor: '#FFB84D15' }]}>
                            <Ionicons name="call-outline" size={22} color="#FFB84D" />
                        </View>
                        <View style={styles.fieldTextContainer}>
                            <Text style={styles.fieldLabel}>NUMÉRO DE TÉLÉPHONE</Text>
                            <Text style={styles.fieldValue}>{user.numeroTelephone || "Non renseigné"}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.infoSection}>
                    <View style={styles.infoField}>
                        <View style={[styles.iconContainer, { backgroundColor: '#4263EB15' }]}>
                            <Ionicons name="trophy-outline" size={22} color="#4263EB" />
                        </View>
                        <View style={styles.fieldTextContainer}>
                            <Text style={styles.fieldLabel}>NIVEAU SPORTIF</Text>
                            <Text style={styles.fieldValue}>{user.niveauSportif}</Text>
                        </View>
                    </View>

                    <View style={styles.infoField}>
                        <View style={[styles.iconContainer, { backgroundColor: '#51CF6615' }]}>
                            <Ionicons name="basketball-outline" size={22} color="#51CF66" />
                        </View>
                        <View style={styles.fieldTextContainer}>
                            <Text style={styles.fieldLabel}>SPORTS PRATIQUÉS</Text>
                            <Text style={styles.fieldValue}>
                                {user.sportsPratiques.map((sport, index) => (
                                    `${sport.icon}  ${sport.nom}${index < user.sportsPratiques.length - 1 ? ', ' : ''}`
                                ))}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoField}>
                        <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B15' }]}>
                            <Ionicons name="location-outline" size={22} color="#FF6B6B" />
                        </View>
                        <View style={styles.fieldTextContainer}>
                            <Text style={styles.fieldLabel}>LIEUX PRÉFÉRÉS</Text>
                            <Text style={styles.fieldValue}>
                                {user.disponibilitesPlaces.map((place, index) => (
                                    `${place}${index < user.disponibilitesPlaces.length - 1 ? ', ' : ''}`
                                ))}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoField}>
                        <View style={[styles.iconContainer, { backgroundColor: '#4263EB15' }]}>
                            <Ionicons name="time-outline" size={22} color="#4263EB" />
                        </View>
                        <View style={styles.fieldTextContainer}>
                            <Text style={styles.fieldLabel}>DISPONIBILITÉS</Text>
                            <Text style={styles.fieldValue}>
                                {user.disponibilitesTimes.map((time, index) => (
                                    `${time}${index < user.disponibilitesTimes.length - 1 ? ', ' : ''}`
                                ))}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section Bio */}
                <View style={styles.infoSection}>
                    <View style={styles.bioSection}>
                        <Text style={styles.bioTitle}>BIO</Text>
                        <Text style={styles.bioText}>{user.description}</Text>
                    </View>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
    },
    leftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
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
    modifyButton: {
        color: '#FF7622',
        marginLeft: 12,
        fontFamily: 'Sen-Bold',
    },
    scrollContainer: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 25,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    profileInfo: {
        alignItems: 'center',
    },
    profileName: {
        fontSize: 24,
        fontFamily: 'Sen-Bold',
        color: '#1A2530',
        marginBottom: 5,
    },
    profileRole: {
        fontSize: 16,
        color: '#707B81',
        fontFamily: 'Sen-Regular',
    },
    reviewsSection: {
        backgroundColor: '#F6F8FA',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 15,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewsTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1A2530',
    },
    viewAllButton: {
        color: '#FF7622',
        fontSize: 14,
        fontFamily: 'Sen-Bold',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingNumber: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1A2530',
        marginLeft: 8,
        marginRight: 12,
    },
    reviewCount: {
        fontSize: 14,
        color: '#707B81',
        fontFamily: 'Sen-Regular',
    },
    infoSection: {
        backgroundColor: "#F6F8FA",
        paddingHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 20,
    },
    infoField: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F4F5F7',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    fieldTextContainer: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 15,
        color: '#32343E',
        fontFamily: 'Sen-Regular',
        marginBottom: 5,
    },
    fieldValue: {
        fontSize: 15,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
    },
    bioSection: {
        padding: 20,
    },
    bioTitle: {
        fontSize: 15,
        fontFamily: 'Sen-Bold',
        color: '#32343E',
        marginBottom: 10,
    },
    bioText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#707B81',
        fontFamily: 'Sen-Regular',
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#FF0000',
        textAlign: 'center',
        marginTop: 20,
    },
});