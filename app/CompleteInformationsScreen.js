import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import GetAllCategoriesApi from '../api/GetAllCategoriesApi';
import SignUpUserApi from '../api/SignUpUserApi';
import axios from 'axios';
const { width } = Dimensions.get('window');

export default function CompleteInformationsScreen() {
    const { nom, prenom, email, password } = useLocalSearchParams();
    const router = useRouter();

    // États pour les informations de base
    const [numeroTelephone, setNumeroTelephone] = useState('');
    const [description, setDescription] = useState('');
    const [pseudo, setPseudo] = useState('');
    const [niveauSportif, setNiveauSportif] = useState('');
    const [disponibilitesTimes, setDisponibilitesTimes] = useState([]);
    const [disponibilitesPlaces, setDisponibilitesPlaces] = useState([]);
    const [newDisponibilite, setNewDisponibilite] = useState('');
    const [newLieuPrefere, setNewLieuPrefere] = useState('');
    const [loading, setLoading] = useState(false);
    const [sportsPratiques, setSportsPratiques] = useState([]);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const adresse = "Tunise , mhadmia ";
    const coordonnees = {
        longitude: 10.137857038377689,
        latitude: 36.793674,
    }
    useEffect(() => {
        Promise.all([fetchCategories()])
            .then(() => setIsLoading(false))
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

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Permission refusée',
                textBody: "Nous avons besoin de votre permission pour accéder à vos photos.",
                button: 'OK',
            });
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
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

    const handleToggleSport = (sport) => {
        const isSelected = sportsPratiques.some((s) => s._id === sport._id);
        if (isSelected) {
            setSportsPratiques(sportsPratiques.filter((s) => s._id !== sport._id));
        } else {
            setSportsPratiques([...sportsPratiques, sport]);
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

    const validateFields = () => {
        if (!numeroTelephone.trim() || !description.trim() || !pseudo.trim() || !niveauSportif.trim()) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Tous les champs sont obligatoires.',
            });
            return false;
        }

        if (!/^\d{8}$/.test(numeroTelephone.trim())) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
            });
            return false;
        }

        if (sportsPratiques.length < 2) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez sélectionner au moins deux sports.',
            });
            return false;
        }

        if (disponibilitesTimes.length < 1) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez ajouter au moins une disponibilité de temps.',
            });
            return false;
        }

        if (disponibilitesPlaces.length < 1) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez ajouter au moins un lieu préféré.',
            });
            return false;
        }

        if (!image) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez sélectionner une photo de profil.',
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateFields()) return;

        setLoading(true);
        try {
            const sportsPratiquesIds = sportsPratiques.map((sport) => sport._id);

            const formData = new FormData();
            formData.append("nom", nom.trim());
            formData.append("prenom", prenom.trim());
            formData.append("email", email.trim());
            formData.append("password", password.trim());
            formData.append("numeroTelephone", numeroTelephone.trim());
            formData.append("coordonnees[latitude]", coordonnees.latitude);
            formData.append("coordonnees[longitude]", coordonnees.longitude);
            formData.append("adresse", adresse.trim());
            formData.append("niveauSportif", niveauSportif.trim());
            formData.append("pseudo", pseudo.trim());
            formData.append("description", description.trim());

            disponibilitesTimes.forEach((time, index) => {
                formData.append(`disponibilitesTimes[${index}]`, time);
            });

            disponibilitesPlaces.forEach((place, index) => {
                formData.append(`disponibilitesPlaces[${index}]`, place);
            });

            sportsPratiquesIds.forEach((sportId, index) => {
                formData.append(`sportsPratiques[${index}]`, sportId);
            });

            if (image) {
                const fileType = image.split('.').pop();
                formData.append("photoProfil", {
                    uri: image,
                    name: `profile.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            const response = await axios.post(
                "http://192.168.1.16:9001/api/user/addUser",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.message === "user existe") {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "L'utilisateur existe déjà dans le système."
                });
                return;
            }

            if (response.data.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Votre profil a été complété avec succès!'
                });

                setTimeout(() => {
                    router.push('/LoginScreen');
                }, 1500);
            }

        } catch (error) {
            console.error("Erreur détaillée:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: `Erreur lors de l'inscription: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={['#FF7622', '#FF9A62']}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <AntDesign name="left" size={14} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Compléter votre profil</Text>
                    </View>
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>
                            Bienvenue {prenom}{' '}{nom} ! 👋
                        </Text>
                        <Text style={styles.welcomeSubText}>
                            Complétez votre profil pour commencer l'aventure
                        </Text>
                    </View>
                </LinearGradient>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.formCard}>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <MaterialCommunityIcons name="camera" size={16} color="#FF7622" />
                                {" "}PHOTO DE PROFIL
                            </Text>
                            <TouchableOpacity
                                style={styles.imagePickerContainer}
                                onPress={pickImage}
                            >
                                {image ? (
                                    <Image
                                        source={{ uri: image }}
                                        style={styles.selectedImage}
                                        resizeMode='stretch'
                                    />

                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <MaterialCommunityIcons
                                            name="camera-plus"
                                            size={40}
                                            color="#9EA3AE"
                                        />
                                        <Text style={styles.imagePlaceholderText}>
                                            Ajouter une photo
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <MaterialCommunityIcons name="phone" size={16} color="#FF7622" />
                                {" "}NUMÉRO DE TÉLÉPHONE
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={numeroTelephone}
                                onChangeText={setNumeroTelephone}
                                placeholder="Votre numéro de téléphone"
                                keyboardType="phone-pad"
                                placeholderTextColor="#9EA3AE"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <MaterialCommunityIcons name="account" size={16} color="#FF7622" />
                                {" "}PSEUDO
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={pseudo}
                                onChangeText={setPseudo}
                                placeholder="Choisissez un pseudo unique"
                                placeholderTextColor="#9EA3AE"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <MaterialCommunityIcons name="trophy" size={16} color="#FF7622" />
                                {" "}NIVEAU SPORTIF
                            </Text>
                            <ScrollView
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.niveauxScrollContent}
                            >
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


                        {!isLoading && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    <MaterialCommunityIcons name="basketball" size={16} color="#FF7622" />
                                    {" "}SPORTS PRATIQUÉS
                                </Text>
                                <ScrollView
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.sportsScrollContent}
                                >
                                    {categories.map((sport) => (
                                        <TouchableOpacity
                                            key={sport._id}
                                            style={[
                                                styles.sportItem,
                                                sportsPratiques.some(s => s._id === sport._id) && styles.selectedSportItem
                                            ]}
                                            onPress={() => handleToggleSport(sport)}
                                        >
                                            <Text style={styles.sportIcon}>{sport.icon}</Text>
                                            <Text style={[
                                                styles.sportName,
                                                sportsPratiques.some(s => s._id === sport._id) && styles.selectedSportName
                                            ]}>
                                                {sport.nom}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                <MaterialCommunityIcons name="text" size={16} color="#FF7622" />
                                {" "}BIO
                            </Text>
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Parlez-nous un peu de vous..."
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor="#9EA3AE"
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#FF7622', '#FF9A62']}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>TERMINER L'INSCRIPTION</Text>
                                )}
                            </LinearGradient>
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
        backgroundColor: '#F8F9FA',
    },
    headerGradient: {
        paddingTop: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        color: '#FFF',
        fontFamily: "Sen-Bold",
    },
    welcomeContainer: {
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 24,
        color: '#FFF',
        fontFamily: 'Sen-Bold',
        marginBottom: 8,
        textTransform: "capitalize"
    },
    welcomeSubText: {
        fontSize: 16,
        color: '#FFF',
        opacity: 0.9,
        fontFamily: 'Sen-Regular',
    },
    scrollContainer: {
        flex: 1,
        marginTop: -20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: '#181C2E',
        marginBottom: 12,
        fontFamily: 'Sen-Bold',
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#181C2E',
        fontFamily: 'Sen-Regular',
        borderWidth: 1,
        borderColor: '#E8ECF4',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    bioInput: {
        height: 120,
        paddingTop: 16,
    },
    niveauxScrollContent: {
        paddingVertical: 8,
    },
    niveauItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E8ECF4',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    selectedNiveauItem: {
        backgroundColor: '#FFF',
        borderColor: '#FF7622',
        borderWidth: 2,
    },
    niveauText: {
        fontSize: 14,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
    },
    selectedNiveauText: {
        color: '#FF7622',
        fontFamily: 'Sen-Bold',
    },
    sportsScrollContent: {
        paddingVertical: 8,
    },
    sportItem: {
        width: (width - 80) / 3,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        margin: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8ECF4',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    selectedSportItem: {
        backgroundColor: '#FFF',
        borderColor: '#FF7622',
        borderWidth: 2,
    },
    sportIcon: {
        fontSize: 24,
        marginBottom: 8,
        color: '#6B6E82',
    },
    sportName: {
        fontSize: 13,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
        textAlign: 'center',
    },
    selectedSportName: {
        color: '#FF7622',
        fontFamily: 'Sen-Bold',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E8ECF4',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    itemText: {
        fontSize: 15,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
    },
    addContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E8ECF4',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    addInput: {
        flex: 1,
        fontSize: 15,
        color: '#6B6E82',
        fontFamily: 'Sen-Regular',
    },
    imagePickerContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E8ECF4',
        borderStyle: 'dashed',
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 8,
        fontSize: 14,
        color: '#9EA3AE',
        fontFamily: 'Sen-Regular',
    },
    submitButton: {
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradientButton: {
        borderRadius: 12,
        padding: 16,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        textAlign: 'center',
    }

});