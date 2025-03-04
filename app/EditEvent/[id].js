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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserData } from "../../util/StorageUtils";
import GetAllCategoriesApi from "../../api/GetAllCategoriesApi";
import GetDetailsEventApi from "../../api/GetDetailsEventApi";
import UpdateEventApi from "../../api/UpdateEventApi";

export default function EditEvent() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
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

    // Charger les données au montage du composant
    useEffect(() => {
        loadData();
    }, []);


    // Charger les données nécessaires
    const loadData = async () => {
        try {
            const [userData, eventDetails] = await Promise.all([
                getUserData(),
                GetDetailsEventApi(id),
            ]);
            setIdUser(userData.user._id);
            setEventData(eventDetails.event);
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Impossible de charger les données de l'événement.",
            });
        } finally {
            setLoading(false);
        }
    };
    const formatDateFr = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    };

    // Formatage de l'heure en 24h
    const formatTime24h = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Mettre à jour les états avec les données de l'événement
    const setEventData = (event) => {
        setTitre(event.titre);
        setDescription(event.description);
        setDateHeureDebut(new Date(event.dateHeureDebut));
        setLieu(event.lieu);
        setMaxParticipants(event.maxParticipants);
        setTypeEvenement(event.typeEvenement);
        setVisibilite(event.visibilite);
        setCondtionsReglement(event.condtionsReglement || [""]);
    };

    // Gestion du DateTimePicker
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

    // Gestion des conditions de règlement
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

    // Validation du formulaire
    const validateForm = () => {
        if (!titre || !description || !lieu) {
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

    // Soumission du formulaire
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            const response = await UpdateEventApi(
                id,
                titre,
                description,
                dateHeureDebut.toISOString(),
                lieu,
                maxParticipants,
                typeEvenement,
                visibilite,
                condtionsReglement
            );

            if (response.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: "L'événement a été mis à jour avec succès.",
                });
                router.replace({
                    pathname: `/EventDetailsScreen/${id}`,
                    params: { refresh: true },
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Le nombre maximum de participants ne peut pas être inférieur au nombre de participants déjà confirmés.",
                });
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'événement :", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur s'est produite. Veuillez réessayer plus tard.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <AntDesign name="left" size={14} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Modifier l'événement</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                        <View style={styles.formContainer}>


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
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ex: Stade Municipal"
                                        value={lieu}
                                        onChangeText={setLieu}
                                        placeholderTextColor="#A0A0A0"
                                    />
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
                                        display="default"
                                        onChange={onChangeDate}
                                        locale="fr-FR"
                                    />
                                )}
                                {showTimePicker && (
                                    <DateTimePicker
                                        value={dateHeureDebut}
                                        mode="time"
                                        display="default"
                                        onChange={onChangeTime}
                                        is24Hour={true}
                                        locale="fr-FR"
                                    />
                                )}
                            </View>

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
                                    <Text style={styles.submitButtonText}>Mettre à jour l'événement</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
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
    }
});