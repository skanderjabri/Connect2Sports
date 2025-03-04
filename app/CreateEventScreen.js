import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    TextInput,
    SafeAreaView,
    Platform,
    StatusBar,
    Image,
    Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserData } from '../util/StorageUtils';
import GetAllCategoriesApi from "../api/GetAllCategoriesApi";
import CreateEventApi from "../api/CreateEventApi";
import GetAllPlacesApi from "../api/GetAllPlacesApi";
import GetAllPlaceSalleApi from "../api/GetAllPlaceSalleApi";

export default function CreateEventScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [ListeSports, setListeSports] = useState([]);
    const [iduser, setIdUser] = useState(null);

    // États pour les champs du formulaire
    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");
    const [dateHeureDebut, setDateHeureDebut] = useState(new Date());
    const [lieu, setLieu] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(1);
    const [typeEvenement, setTypeEvenement] = useState("match");
    const [selectedSport, setSelectedSport] = useState(null);
    const [visibilite, setVisibilite] = useState("public");
    const [condtionsReglement, setCondtionsReglement] = useState([""]);

    // États pour le DateTimePicker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [Place, setPlaces] = useState([]);
    const [isPlaceModalVisible, setIsPlaceModalVisible] = useState(false);
    const [salles, setSalles] = useState([]); // Liste complète des salles

    useEffect(() => {
        Promise.all([fetechCategories(), fetechUser(), fetchPlace(), fetchPlaceSalle()])
            .then(() => setLoading(false))
            .catch((error) => {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Erreur lors du chargement des données",
                });
            });
    }, []);

    const fetechUser = async () => {
        const data = await getUserData();
        setIdUser(data.user._id);
    };

    const fetechCategories = () => {
        return GetAllCategoriesApi()
            .then((response) => {
                setListeSports(response.categories);
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };

    const fetchPlace = () => {
        return GetAllPlacesApi()
            .then((response) => {
                setPlaces(response.places);
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };

    const fetchPlaceSalle = () => {
        return GetAllPlaceSalleApi()
            .then((response) => {
                setSalles(response.placesSalles);
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateHeureDebut(selectedDate);
        }
    };

    const onChangeTime = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setDateHeureDebut(selectedTime);
        }
    };

    const formatDateFr = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    };

    const formatTime24h = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const addCondition = () => {
        if (condtionsReglement.length < 5) {
            setCondtionsReglement([...condtionsReglement, ""]);
        }
    };

    const removeCondition = (index) => {
        const newConditions = condtionsReglement.filter((_, i) => i !== index);
        setCondtionsReglement(newConditions);
    };

    const updateCondition = (index, value) => {
        const newConditions = [...condtionsReglement];
        newConditions[index] = value;
        setCondtionsReglement(newConditions);
    };

    const validateForm = () => {
        if (!titre || !description || !lieu || !selectedSport) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Champs manquants',
                textBody: 'Veuillez remplir tous les champs obligatoires.',
            });
            return false;
        }
        if (condtionsReglement.some((condition) => condition.trim() === "")) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Règlement incomplet',
                textBody: 'Veuillez remplir toutes les conditions de règlement.',
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (selectedSport?.nom.toLowerCase() === "tennis" && maxParticipants !== 2) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Pour le tennis, le nombre maximum de participants doit être égal à 2.',
                button: 'OK',
            });
            return;
        }

        const computedTypeEvenement = selectedSport?.typeParticipation === "participation" ? "seance" : "match";
        const nomSporttype = selectedSport?.nom;

        setIsSubmitting(true);

        try {
            const response = await CreateEventApi(
                titre,
                description,
                dateHeureDebut.toISOString(),
                lieu,
                maxParticipants,
                computedTypeEvenement,
                iduser,
                selectedSport._id,
                "ouvert",
                visibilite,
                condtionsReglement,
                nomSporttype
            );

            if (response.message === "Evenement existe") {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Erreur",
                    textBody: "L'événement est déjà enregistré.",
                    button: 'OK',
                });
            } else if (response.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Événement créé',
                    textBody: 'Votre demande d\'événement a été envoyée avec succès !',
                    button: 'OK',
                });
                setTitre("");
                setDescription("");
                setLieu("");
                setMaxParticipants(1);
                setSelectedSport(null);
                setCondtionsReglement([""]);
                setDateHeureDebut(new Date());
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: 'Une erreur s\'est produite lors de la création de l\'événement.',
                    button: 'OK',
                });
            }
        } catch (error) {
            console.error("Erreur lors de la participation :", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur s\'est produite. Veuillez réessayer plus tard.',
                button: 'OK',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Composant Modal pour le choix du lieu
    // Composant Modal pour le choix du lieu - version améliorée
    const PlaceModal = ({ isVisible, onClose, places, salles, selectedSport, onSelectPlace }) => {
        const [customPlace, setCustomPlace] = useState("");
        const [showCustomInput, setShowCustomInput] = useState(false);

        // On définit les catégories qui utilisent le tableau "places"
        const sportsWithPlaces = ["Football", "Tennis", "Padel", "EMS (sport avec électrodes)"];
        let lieuxAAfficher = [];
        if (selectedSport && sportsWithPlaces.includes(selectedSport.nom)) {
            // Définir une chaîne de filtrage en fonction du sport sélectionné
            let filterStr = "";
            switch (selectedSport.nom.toLowerCase()) {
                case "football":
                    filterStr = "foot";
                    break;
                case "tennis":
                    filterStr = "tennis";
                    break;
                case "padel":
                    filterStr = "padel";
                    break;
                case "ems (sport avec électrodes)":
                    filterStr = "ems";
                    break;

             }
            lieuxAAfficher = places.filter(place =>
                place.__t.toLowerCase().includes(filterStr)
            );
        } else {
            // Pour toutes les autres catégories, utiliser le tableau "salles"
            lieuxAAfficher = salles;
        }

        const handleCustomPlaceSubmit = () => {
            if (customPlace.trim()) {
                onSelectPlace(customPlace.trim());
            }
        };

        return (
            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choisissez un lieu</Text>
                            <TouchableOpacity style={styles.modalCloseIcon} onPress={onClose}>
                                <AntDesign name="close" size={22} color="#181C2E" />
                            </TouchableOpacity>
                        </View>

                        {showCustomInput ? (
                            <View style={styles.customInputContainer}>
                                <TouchableOpacity
                                    style={styles.backToListButton}
                                    onPress={() => setShowCustomInput(false)}
                                >
                                    <AntDesign name="arrowleft" size={20} color="#FF7622" />
                                    <Text style={styles.backToListText}>Retour à la liste</Text>
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.customPlaceInput}
                                    placeholder="Entrez le lieu de votre choix"
                                    value={customPlace}
                                    onChangeText={setCustomPlace}
                                    placeholderTextColor="#A0A0A0"
                                />

                                <TouchableOpacity
                                    style={styles.customPlaceSubmitButton}
                                    onPress={handleCustomPlaceSubmit}
                                >
                                    <Text style={styles.customPlaceSubmitText}>Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.modalSubtitle}>
                                    Sélectionnez un lieu dans la liste ou ajoutez le vôtre
                                </Text>

                                <ScrollView
                                    style={styles.placesScrollView}
                                    contentContainerStyle={styles.placesContainer}
                                >
                                    {lieuxAAfficher.map((lieu) => (
                                        <TouchableOpacity
                                            key={lieu._id}
                                            style={styles.placeCard}
                                            onPress={() => onSelectPlace(lieu.nom)}
                                        >
                                            <Image
                                                source={{ uri: lieu.photos[0] }}
                                                style={styles.placeImage}
                                                resizeMode="stretch"
                                            />
                                            <View style={styles.placeInfo}>
                                                <Text style={styles.placeName}>{lieu.nom}</Text>
                                                <Text style={styles.placeAddress}>{lieu.adresse}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    <TouchableOpacity
                                        style={styles.otherPlaceCard}
                                        onPress={() => setShowCustomInput(true)}
                                    >
                                        <View style={styles.otherPlaceIcon}>
                                            <AntDesign name="plus" size={28} color="#FF7622" />
                                        </View>
                                        <Text style={styles.otherPlaceText}>Autres</Text>
                                        <Text style={styles.otherPlaceSubtext}>Ajouter mon propre lieu</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        );
    }
    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <AntDesign name="left" size={14} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Créer un événement</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                        <View style={styles.formContainer}>
                            {/* Section Sport */}
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Sélectionnez un sport</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.sportsScrollView}
                                >
                                    {ListeSports.map((sport) => (
                                        <TouchableOpacity
                                            key={sport._id}
                                            style={[
                                                styles.sportCard,
                                                selectedSport?._id === sport._id && styles.sportCardSelected
                                            ]}
                                            onPress={() => setSelectedSport(sport)}
                                        >
                                            <Text style={styles.sportIcon}>{sport.icon}</Text>
                                            <Text style={[
                                                styles.sportName,
                                                selectedSport?._id === sport._id && styles.sportNameSelected
                                            ]}>{sport.nom}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Section Informations Principales */}
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Informations de l'événement</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>Titre</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ex: Match amical de football"
                                        value={titre}
                                        onChangeText={setTitre}
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>Description</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Décrivez votre événement..."
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={4}
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>Lieu</Text>
                                    <TouchableOpacity
                                        style={styles.choosePlaceButton}
                                        onPress={() => setIsPlaceModalVisible(true)}
                                    >
                                        <Text style={styles.choosePlaceButtonText}>
                                            {lieu ? lieu : "Choisir un lieu"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Nouvelle section visibilité */}
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>Visibilité</Text>
                                    <View style={styles.visibilityContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.visibilityButton,
                                                visibilite === "public" && styles.visibilityButtonSelected
                                            ]}
                                            onPress={() => setVisibilite("public")}
                                        >
                                            <MaterialIcons
                                                name="public"
                                                size={24}
                                                color={visibilite === "public" ? "#FF7622" : "#181C2E"}
                                            />
                                            <Text style={[
                                                styles.visibilityText,
                                                visibilite === "public" && styles.visibilityTextSelected
                                            ]}>Public</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.visibilityButton,
                                                visibilite === "prive" && styles.visibilityButtonSelected
                                            ]}
                                            onPress={() => setVisibilite("prive")}
                                        >
                                            <MaterialIcons
                                                name="lock"
                                                size={24}
                                                color={visibilite === "prive" ? "#FF7622" : "#181C2E"}
                                            />
                                            <Text style={[
                                                styles.visibilityText,
                                                visibilite === "prive" && styles.visibilityTextSelected
                                            ]}>Privé</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Section Date et Heure */}
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Date et Heure</Text>
                                <View style={styles.dateTimeWrapper}>
                                    <TouchableOpacity
                                        style={styles.dateTimeButton}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <AntDesign name="calendar" size={24} color="#FF7622" />
                                        <Text style={styles.dateTimeText}>
                                            {formatDateFr(dateHeureDebut)}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.dateTimeButton}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <AntDesign name="clockcircle" size={24} color="#FF7622" />
                                        <Text style={styles.dateTimeText}>
                                            {formatTime24h(dateHeureDebut)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dateHeureDebut}
                                        mode="date"
                                        onChange={onChangeDate}
                                        locale="fr-FR"
                                        display={Platform.OS === 'ios' ? 'inline' : 'default'}

                                    />
                                )}
                                {showTimePicker && (
                                    <DateTimePicker
                                        value={dateHeureDebut}
                                        mode="time"
                                        onChange={onChangeTime}
                                        is24Hour={true}
                                        locale="fr-FR"
                                        display={Platform.OS === 'ios' ? 'inline' : 'default'}

                                    />
                                )}
                            </View>

                            {/* Les autres sections restent identiques */}
                            {/* Section Participants */}
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Nombre de participants</Text>
                                <View style={styles.participantsWrapper}>
                                    <TouchableOpacity
                                        style={styles.participantButton}
                                        onPress={() => setMaxParticipants(Math.max(1, maxParticipants - 1))}
                                    >
                                        <AntDesign name="minus" size={24} color="#FF7622" />
                                    </TouchableOpacity>
                                    <Text style={styles.participantCount}>{maxParticipants}</Text>
                                    <TouchableOpacity
                                        style={styles.participantButton}
                                        onPress={() => setMaxParticipants(maxParticipants + 1)}
                                    >
                                        <AntDesign name="plus" size={24} color="#FF7622" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Section Règlement */}
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Règlement</Text>
                                {condtionsReglement.map((condition, index) => (
                                    <View key={index} style={styles.reglementRow}>
                                        <TextInput
                                            style={styles.reglementInput}
                                            placeholder={`Règle ${index + 1}`}
                                            value={condition}
                                            onChangeText={(text) => updateCondition(index, text)}
                                            placeholderTextColor="#A0A0A0"
                                        />
                                        {index > 0 && (
                                            <TouchableOpacity
                                                style={styles.removeReglementButton}
                                                onPress={() => removeCondition(index)}
                                            >
                                                <AntDesign name="close" size={20} color="#FF4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                                {condtionsReglement.length < 5 && (
                                    <TouchableOpacity
                                        style={styles.addReglementButton}
                                        onPress={addCondition}
                                    >
                                        <AntDesign name="plus" size={20} color="#FF7622" />
                                        <Text style={styles.addReglementText}>Ajouter une règle</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Bouton de soumission */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isSubmitting && { backgroundColor: 'gray' }
                                ]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Créer l'événement</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}

                <PlaceModal
                    isVisible={isPlaceModalVisible}
                    onClose={() => setIsPlaceModalVisible(false)}
                    places={Place}
                    salles={salles}
                    selectedSport={selectedSport}
                    onSelectPlace={(selectedPlace) => {
                        setLieu(selectedPlace);
                        setIsPlaceModalVisible(false);
                    }}
                />
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F4F5F7',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Nouveaux styles améliorés
    scrollView: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    formContainer: {
        padding: 16,
    },
    sectionContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 16,
    },
    sportsScrollView: {
        marginBottom: 8,
    },
    sportCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        alignItems: 'center',
        minWidth: 100,
        borderWidth: 2,
        borderColor: '#F8F9FA',
    },
    sportCardSelected: {
        backgroundColor: '#FFF5EE',
        borderColor: '#FF7622',
    },
    sportIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    sportName: {
        fontSize: 14,
        fontFamily: "Sen-Regular",
        color: '#181C2E',
    },
    sportNameSelected: {
        color: '#FF7622',
        fontFamily: "Sen-Bold",
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#181C2E',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    dateTimeWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    dateTimeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    dateTimeText: {
        marginLeft: 12,
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#181C2E',
    },
    participantsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
    },
    participantButton: {
        width: 48,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    participantCount: {
        fontSize: 24,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginHorizontal: 24,
    },
    reglementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reglementInput: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#181C2E',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    removeReglementButton: {
        marginLeft: 12,
        width: 40,
        height: 40,
        backgroundColor: '#FFF5F5',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addReglementButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5EE',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    addReglementText: {
        marginLeft: 8,
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#FF7622',
    },
    submitButton: {
        backgroundColor: '#FF7622',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    submitButtonText: {
        fontSize: 18,
        fontFamily: "Sen-Bold",
        color: '#FFFFFF',
    },
    visibilityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    visibilityButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    visibilityButtonSelected: {
        backgroundColor: '#FFF5EE',
        borderColor: '#FF7622',
    },
    visibilityText: {
        marginLeft: 8,
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#181C2E',
    },
    visibilityTextSelected: {
        color: '#FF7622',
        fontFamily: "Sen-Bold",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    placesScrollContent: {
        paddingBottom: 10,
    },
    placeCard: {
        width: 200,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginRight: 10,
        overflow: 'hidden',
    },
    placeImage: {
        width: '100%',
        height: 120,
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        padding: 10,
    },
    placeAddress: {
        fontSize: 14,
        color: '#6B6E82',
        padding: 10,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#FF7622',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
    choosePlaceButton: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    choosePlaceButtonText: {
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#181C2E',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end', // Aligné en bas pour un effet de drawer
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 16,
        width: '100%',
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F4F5F7',
    },
    modalCloseIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F4F5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
    },
    modalSubtitle: {
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#6B6E82',
        marginBottom: 16,
    },

    // Styles pour la liste des lieux
    placesScrollView: {
        maxHeight: 500,
    },
    placesContainer: {
        paddingBottom: 20,
    },
    placeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    placeImage: {
        width: '100%',
        height: 150,
    },
    placeInfo: {
        padding: 16,
    },
    placeName: {
        fontSize: 18,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 4,
    },
    placeAddress: {
        fontSize: 14,
        fontFamily: "Sen-Regular",
        color: '#6B6E82',
    },

    // Styles pour l'option "Autres"
    otherPlaceCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderStyle: 'dashed',
    },
    otherPlaceIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF5EE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    otherPlaceText: {
        fontSize: 18,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 4,
    },
    otherPlaceSubtext: {
        fontSize: 14,
        fontFamily: "Sen-Regular",
        color: '#6B6E82',
    },

    // Styles pour le formulaire personnalisé
    customInputContainer: {
        paddingTop: 12,
    },
    backToListButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backToListText: {
        marginLeft: 8,
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#FF7622',
    },
    customPlaceInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#181C2E',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        marginBottom: 20,
    },
    customPlaceSubmitButton: {
        backgroundColor: '#FF7622',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    customPlaceSubmitText: {
        fontSize: 16,
        fontFamily: "Sen-Bold",
        color: '#FFFFFF',
    },
});

