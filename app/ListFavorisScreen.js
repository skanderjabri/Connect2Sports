import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image, ScrollView, Platform, StatusBar } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // Import des icônes Expo
import { useRouter } from "expo-router";
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification'; // Import de l'alerte personnalisée
import GetAllSalleInFavorisByUserApi from '../api/GetAllSalleInFavorisByUserApi';
import DeleteSalleFromFavoriListeApi from '../api/DeleteSalleFromFavoriListeApi';
import GetUsersInFavorisListeApi from '../api/GetUsersInFavorisListeApi';
import DeleteUserFromFavoriListeApi from '../api/DeleteUserFromFavoriListeApi';
import Global from '../util/Global';
import { getUserData } from '../util/StorageUtils';


const ListFavorisScreen = () => {
    const [sallesFavoris, setSallesFavoris] = useState([]);
    const [usersFavoris, setUsersFavoris] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetechSallesFavoris(), fetechUsersFavoris()])
            .then(() => setIsLoading(false))
            .catch((error) =>
                console.log("Erreur lors du chargement des données: " + error)
            );
    }, []);

    const fetechSallesFavoris = async () => {
        const data = await getUserData();

        const id = data.user._id;

        return GetAllSalleInFavorisByUserApi(id)
            .then((response) => {
                setSallesFavoris(response.favoris);
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };


    const fetechUsersFavoris = async () => {
        const data = await getUserData();

        const id = data.user._id;
        return GetUsersInFavorisListeApi(id)
            .then((response) => {
                setUsersFavoris(response.UsersFavorites);
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };


    const removeSalleFromFavoris = async (salleDeSportId) => {
        const data = await getUserData();

        const userId = data.user._id;

        try {
            const response = await DeleteSalleFromFavoriListeApi(userId, salleDeSportId);
            if (response.message === "ok") {
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'La salle de sport a été supprimée de vos favoris.',

                    button: 'OK',
                    onPressButton: () => {
                        Dialog.hide();
                    },
                });
                fetechSallesFavoris();

            }
        } catch (error) {
            console.log("Erreur lors de la suppression de la salle de sport: " + error);
            // Afficher une alerte stylisée d'erreur
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur s\'est produite lors de la suppression de la salle de sport.',
                button: 'OK',
            });
        }
    };
    const removeUserInFavoris = async (favoriUserID) => {
        const data = await getUserData();

        const userId = data.user._id;


        try {
            const response = await DeleteUserFromFavoriListeApi(userId, favoriUserID);
            console.log(response)
            if (response.message === "ok") {
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "L'utilisateur a été retiré de vos favoris.",
                    button: 'OK',

                    onPressButton: () => {
                        Dialog.hide();
                    },

                });
                fetechUsersFavoris()

            }
        } catch (error) {
            console.log("Erreur lors de la suppression de la salle de sport: " + error);
            // Afficher une alerte stylisée d'erreur
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur est survenue lors de la suppression de l'utilisateur des favoris.",
                button: 'OK',
            });
        }
    };



    const router = useRouter();
    const [activeTab, setActiveTab] = useState('salle');

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <AntDesign name="left" size={14} color="#181C2E" style={{ fontFamily: "Sen-Medium" }} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Favoris</Text>
                    </View>

                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'salle' && styles.tabActive]}
                            onPress={() => setActiveTab('salle')}
                        >
                            <Text style={[styles.tabText, activeTab === 'salle' && styles.tabTextActive]}>
                                Salles de sports
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'user' && styles.tabActive]}
                            onPress={() => setActiveTab('user')}
                        >
                            <Text style={[styles.tabText, activeTab === 'user' && styles.tabTextActive]}>
                                Utilisateurs
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.spinnerContainer}>
                            <ActivityIndicator size="large" color="#FF7622" />
                        </View>
                    ) : (
                        <ScrollView style={styles.content}>
                            {activeTab === 'salle' && (
                                <ScrollView style={{ marginTop: 20 }}>
                                    {sallesFavoris.length > 0 ? (
                                        sallesFavoris.map((salle) => (
                                            <TouchableOpacity key={salle._id} style={styles.card} onPress={() => router.push(`/DetailsSalle/${salle._id}`)}>
                                                <Image source={{ uri: salle.photos[0] }} style={styles.cardImage} />
                                                <View style={styles.cardContent}>
                                                    <Text style={styles.cardTitle}>{salle.nom}</Text>
                                                    <View style={styles.cardInfo}>
                                                        <FontAwesome name="map-marker" size={19} color="#FF7622" />
                                                        <Text style={styles.cardText}>{salle.adresse}</Text>
                                                    </View>
                                                    <View style={styles.cardInfo}>
                                                        <FontAwesome name="phone" size={19} color="#FF7622" />
                                                        <Text style={styles.cardText}>{salle.telephone}</Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={() => removeSalleFromFavoris(salle._id)}
                                                >
                                                    <AntDesign name="delete" size={24} color="#FF7622" />
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View style={styles.NoDataDiv}>
                                            <FontAwesome name="exclamation-circle" size={50} color="#FF7622" />
                                            <Text style={styles.noDataText}>Aucune salle de sport favorite trouvée.</Text>
                                        </View>

                                    )}
                                </ScrollView>
                            )}

                            {activeTab === 'user' && (
                                <ScrollView style={{ marginTop: 20 }}>
                                    {usersFavoris.length > 0 ? (
                                        usersFavoris.map((user) => (
                                            <TouchableOpacity key={user._id} style={styles.card}
                                            //  onPress={() => router.push(`/DetailsSalle/${salle._id}`)}
                                            >
                                                <Image source={{ uri: Global.BaseFile + user.photoProfil }} style={styles.cardImage} />
                                                <View style={styles.cardContent}>
                                                    <Text style={styles.cardTitle}>{user.nom}{' '}{user.prenom}</Text>
                                                    <View style={styles.cardInfo}>
                                                        <FontAwesome name="map-marker" size={19} color="#FF7622" />
                                                        <Text style={styles.cardText}>{user.adresse}</Text>
                                                    </View>
                                                    {/*
                                              <View style={styles.cardInfo}>
                                                    <FontAwesome name="map-marker" size={19} color="#FF7622" />
                                                    <Text style={styles.cardText}>{user.adresse}</Text>
                                                </View>
                                                <View style={styles.cardInfo}>
                                                    <FontAwesome name="phone" size={19} color="#FF7622" />
                                                    <Text style={styles.cardText}>{user.telephone}</Text>
                                                </View>
                                            */}

                                                </View>
                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={() => removeUserInFavoris(user._id)}
                                                >
                                                    <AntDesign name="delete" size={24} color="#FF7622" />
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View style={styles.NoDataDiv}>
                                            <FontAwesome name="exclamation-circle" size={50} color="#FF7622" />
                                            <Text style={styles.noDataText}>Aucun utilisateur favori n'a été trouvé.
                                            </Text>
                                        </View>

                                    )}
                                </ScrollView>)}
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
};

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
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        paddingVertical: 12,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#FF7622',
    },
    tabText: {
        fontSize: 16,
        color: "#A5A7B9",
        fontFamily: 'Sen-Bold',
    },
    tabTextActive: {
        color: '#FF7622',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    cardImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
    },
    cardTitle: {
        fontSize: 18,
        color: '#181C2E',
        fontFamily: 'Sen-Bold',
        marginBottom: 6,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardText: {
        fontSize: 15,
        color: '#666',
        marginLeft: 6,
        fontFamily: 'Sen-Regular',
    },
    deleteButton: {
        padding: 10,
    },

    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    NoDataDiv: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        marginTop: 250,
        paddingVertical: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#FF7622',
        fontFamily: 'Sen-Bold',
        marginTop: 10,
    },
    dialogTitle: {
        fontFamily: 'Sen-Bold', // Changer la police du titre
        fontSize: 20, // Changer la taille de la police du titre
        color: '#FF7622', // Changer la couleur du titre
    },
    dialogTextBody: {
        fontFamily: 'Sen-Regular', // Changer la police du texte du corps
        fontSize: 16, // Changer la taille de la police du texte du corps
        color: '#181C2E', // Changer la couleur du texte du corps
    },
    dialogButton: {
        fontFamily: 'Sen-Bold', // Changer la police du bouton
        fontSize: 18, // Changer la taille de la police du bouton
        color: '#FF7622', // Changer la couleur du bouton
    },

});

export default ListFavorisScreen;