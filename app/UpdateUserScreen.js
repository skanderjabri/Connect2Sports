import {
    View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, StatusBar,
    Platform,
    SafeAreaView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GetUserByIdApi from '../api/GetUserByIdApi';
import GetAllCategoriesApi from '../api/GetAllCategoriesApi';
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification'; // Import de l'alerte personnalisée
import UpdateUserApi from '../api/UpdateUserApi';
import Global from '../util/Global';
import { getUserData } from '../util/StorageUtils';

export default function UpdateUserScreen() {
    // États de base
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // États utilisateur
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [numeroTelephone, setNumeroTelephone] = useState('');
    const [description, setDescription] = useState('');
    const [photoProfil, setPhotoProfil] = useState('');
    const [pseudo, setPseudo] = useState('');
    const [niveauSportif, setNiveauSportif] = useState('');


    // États pour les listes
    const [disponibilitesTimes, setDisponibilitesTimes] = useState([]);
    const [disponibilitesPlaces, setDisponibilitesPlaces] = useState([]);
    const [sportsPratiques, setSportsPratiques] = useState([]);

    // États pour les nouveaux éléments
    const [newDisponibilite, setNewDisponibilite] = useState('');
    const [newLieuPrefere, setNewLieuPrefere] = useState('');

    const router = useRouter();

    useEffect(() => {
        Promise.all([fetchCategories(), fetchUser()])
            .then(() => setLoading(false))
            .catch((error) =>
                console.log("Erreur lors du chargement des données: " + error)
            );
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await GetAllCategoriesApi();
            setCategories(response.categories);
        } catch (error) {
            console.log("Erreur lors de la récupération des catégories: " + error);
        }
    };

    const fetchUser = async () => {
        try {
            const data = await getUserData(); // Appel de la fonction externe

            const id = data.user._id; // Récupération de l'ID de l'utilisateur

            const response = await GetUserByIdApi(id);
            const user = response.user;

            // Mise à jour de tous les états
            setNom(user.nom);
            setPrenom(user.prenom);
            setEmail(user.email);
            setNumeroTelephone(user.numeroTelephone || '');
            setDescription(user.description);
            setPhotoProfil(user.photoProfil);
            setPseudo(user.pseudo || '');
            setDisponibilitesTimes(user.disponibilitesTimes || []);
            setDisponibilitesPlaces(user.disponibilitesPlaces || []);
            setSportsPratiques(user.sportsPratiques || []);
            setNiveauSportif(user.niveauSportif)
        } catch (error) {
            console.log("Erreur lors de la récupération des données: " + error);
        }
    };

    const validateFields = () => {
        // Vérification des champs obligatoires
        if (!nom || !prenom) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Le nom et le prénom sont obligatoires.',
                button: 'OK',
            });
            return false;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez entrer un email valide.',
                button: 'OK',
            });
            return false;
        }

        if (!numeroTelephone || !/^\d{8}$/.test(numeroTelephone)) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
                button: 'OK',
            });
            return false;
        }

        if (!description) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'La description est obligatoire.',
                button: 'OK',
            });
            return false;
        }

        if (!pseudo) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Le pseudo est obligatoire.',
                button: 'OK',
            });
            return false;
        }

        if (disponibilitesTimes.length < 2) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez ajouter au moins deux disponibilités.',
                button: 'OK',
            });
            return false;
        }

        if (disponibilitesPlaces.length < 2) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez ajouter au moins deux lieux préférés.',
                button: 'OK',
            });
            return false;
        }

        if (sportsPratiques.length < 2) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez sélectionner au moins deux sports pratiqués.',
                button: 'OK',
            });
            return false;
        }

        return true;
    };

    const handleUpdate = async () => {
        if (!validateFields()) {
            return; // Arrête la fonction si la validation échoue
        }
        const data = await getUserData(); // Appel de la fonction externe

        const id = data.user._id; // Récupération de l'ID de l'utilisateur

        try {

            const formattedData = {
                nom: nom.trim(),
                prenom: prenom.trim(),
                numeroTelephone: numeroTelephone.trim(),
                email: email.trim().toLowerCase(),
                photoProfil: photoProfil,
                sportsPratiques: sportsPratiques.map(sport => sport._id),
                niveauSportif: niveauSportif,
                disponibilitesTimes: disponibilitesTimes,
                disponibilitesPlaces: disponibilitesPlaces,
                pseudo: pseudo.trim(),
                description: description.trim(),
                //   adresse: "Mhamedia, Tunis, Tunisie"

            };
            const response = await UpdateUserApi(id, formattedData)
            if (response.message == "ok") {
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Profil mis à jour avec succès!',
                    button: 'OK',
                });
                setTimeout(() => {
                    router.push('/DetailsProfilScreen'); // Naviguer après le toast
                }, 1500); // Délai de 1.5 secondes pour laisser le toast s'afficher

            }
            else {
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Une erreur s'est produite lors de la modification du profil.",
                    button: 'OK',
                });
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Impossible de contacter le serveur. Vérifiez votre connexion.",
                button: 'OK',
            });
        }


    };

    const handleAddDisponibilite = () => {
        if (newDisponibilite.trim()) {
            setDisponibilitesTimes([...disponibilitesTimes, newDisponibilite]);
            setNewDisponibilite('');
        }
    };

    const handleAddLieuPrefere = () => {
        if (newLieuPrefere.trim()) {
            setDisponibilitesPlaces([...disponibilitesPlaces, newLieuPrefere]);
            setNewLieuPrefere('');
        }
    };

    const handleDeleteDisponibilite = (index) => {
        const updatedDisponibilites = disponibilitesTimes.filter((_, i) => i !== index);
        setDisponibilitesTimes(updatedDisponibilites);
    };

    const handleDeleteLieuPrefere = (index) => {
        const updatedLieux = disponibilitesPlaces.filter((_, i) => i !== index);
        setDisponibilitesPlaces(updatedLieux);
    };

    const handleToggleSport = (sport) => {
        const isSelected = sportsPratiques.some((s) => s._id === sport._id);
        if (isSelected) {
            const updatedSports = sportsPratiques.filter((s) => s._id !== sport._id);
            setSportsPratiques(updatedSports);
        } else {
            setSportsPratiques([...sportsPratiques, {
                _id: sport._id,
                nom: sport.nom,
                icon: sport.icon
            }]);
        }
    };

    if (loading) {
        return (
            <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color="#FF7622" />
            </View>
        );
    }

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <AntDesign name="left" size={14} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Modifier le profil</Text>
                </View>

                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{ uri: Global.BaseFile + photoProfil }}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity style={styles.editIconButton}>
                                <Ionicons name="pencil" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nom :</Text>
                            <TextInput
                                style={styles.input}
                                value={nom}
                                onChangeText={setNom}
                                placeholder="Votre nom"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Prénom :</Text>
                            <TextInput
                                style={styles.input}
                                value={prenom}
                                onChangeText={setPrenom}
                                placeholder="Votre prénom"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>EMAIL</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Votre email"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>NUMÉRO DE TÉLÉPHONE</Text>
                            <TextInput
                                style={styles.input}
                                value={numeroTelephone}
                                onChangeText={setNumeroTelephone}
                                placeholder="Votre numéro de téléphone"
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>NIVEAU SPORTIF</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.niveauxContainer}>
                                {["Débutant", "Intermédiaire", "Avancé", "Professionnel"].map((niveau) => (
                                    <TouchableOpacity
                                        key={niveau}
                                        style={[
                                            styles.niveauItem,
                                            niveauSportif === niveau && styles.selectedNiveauItem
                                        ]}
                                        onPress={() => setNiveauSportif(niveau)}
                                    >
                                        <Text style={[
                                            styles.niveauText,
                                            niveauSportif === niveau && styles.selectedNiveauText
                                        ]}>
                                            {niveau}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>BIO</Text>
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Votre bio"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PSEUDO</Text>
                            <TextInput
                                style={styles.input}
                                value={pseudo}
                                onChangeText={setPseudo}
                                placeholder="Votre pseudo"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>SPORTS PRATIQUÉS</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                                {categories.map((category) => {
                                    const isSelected = sportsPratiques.some((s) => s._id === category._id);
                                    return (
                                        <TouchableOpacity
                                            key={category._id}
                                            style={[styles.categoryItem, isSelected && styles.selectedCategoryItem]}
                                            onPress={() => handleToggleSport(category)}
                                        >
                                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                                            <Text style={styles.categoryName}>{category.nom}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>DISPONIBILITÉS</Text>
                            {disponibilitesTimes.map((time, index) => (
                                <View key={index} style={styles.itemContainer}>
                                    <Text style={styles.itemText}>{time}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteDisponibilite(index)}>
                                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.addContainer}>
                                <TextInput
                                    style={styles.addInput}
                                    value={newDisponibilite}
                                    onChangeText={setNewDisponibilite}
                                    placeholder="Ajouter une disponibilité"
                                />
                                <TouchableOpacity onPress={handleAddDisponibilite}>
                                    <Ionicons name="add-circle-outline" size={24} color="#51CF66" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>LIEUX PRÉFÉRÉS</Text>
                            {disponibilitesPlaces.map((place, index) => (
                                <View key={index} style={styles.itemContainer}>
                                    <Text style={styles.itemText}>{place}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteLieuPrefere(index)}>
                                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.addContainer}>
                                <TextInput
                                    style={styles.addInput}
                                    value={newLieuPrefere}
                                    onChangeText={setNewLieuPrefere}
                                    placeholder="Ajouter un lieu préféré"
                                />
                                <TouchableOpacity onPress={handleAddLieuPrefere}>
                                    <Ionicons name="add-circle-outline" size={24} color="#51CF66" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleUpdate}
                        >
                            <Text style={styles.saveButtonText}>SAUVEGARDER</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AlertNotificationRoot>
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
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F4F5F7',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
    },
    scrollContainer: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editIconButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#FF7622',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#181C2E',
        marginBottom: 8,
        fontFamily: 'Sen-Bold',
        textTransform: "capitalize"
    },
    input: {
        backgroundColor: '#F0F5FA',
        borderRadius: 12,
        padding: 20,
        fontSize: 15,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
    },
    bioInput: {
        height: 100,
        paddingTop: 15,
    },
    saveButton: {
        backgroundColor: '#FF7622',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
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
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F0F5FA',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    itemText: {
        fontSize: 15,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
    },
    addContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F5FA',
        borderRadius: 12,
        padding: 15,
    },
    addInput: {
        flex: 1,
        fontSize: 15,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
    },
    categoriesContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    categoryItem: {
        alignItems: 'center',
        backgroundColor: '#F0F5FA',
        borderRadius: 12,
        padding: 15,
        marginRight: 10,
    },
    selectedCategoryItem: {
        backgroundColor: '#51CF66',
    },
    categoryIcon: {
        fontSize: 24,
    },
    categoryName: {
        fontSize: 14,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
        marginTop: 5,
    },
    niveauxContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    niveauItem: {
        backgroundColor: '#F0F5FA',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedNiveauItem: {
        backgroundColor: '#51CF66',
        borderColor: '#51CF66',
    },
    niveauText: {
        fontSize: 14,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
    },
    selectedNiveauText: {
        color: '#FFFFFF',
        fontFamily: 'Sen-Bold',
    },


});