import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Image,
    StatusBar,
    Platform,
    SafeAreaView,
    TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { getUserData } from '../util/StorageUtils';
import Global from "../util/Global";
import GetAllCategoriesApi from "../api/GetAllCategoriesApi";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
export default function CreateCommunityScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [listeCategories, setListeCategories] = useState([]);
    const [iduser, setIdUser] = useState(null);
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSport, setSelectedSport] = useState(null);
    const [maxParticipants, setMaxParticipants] = useState('');
    const [tag, setTag] = useState('');
    const [tags, setTags] = useState([]);
    const [rule, setRule] = useState('');
    const [rules, setRules] = useState([]);

    useEffect(() => {
        Promise.all([fetechCategories(), fetechUser()])
            .then(() => setLoading(false))
            .catch((error) => {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: "Erreur lors du chargement des données"
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
                setListeCategories(response.categories);
            })
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };

    const addTag = () => {
        if (tag.trim()) {
            setTags([...tags, tag.trim()]);
            setTag('');
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const addRule = () => {
        if (rule.trim()) {
            setRules([...rules, rule.trim()]);
            setRule('');
        }
    };

    const removeRule = (index) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        if (!title.trim()) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Le titre est obligatoire'
            });
            return false;
        }

        if (!description.trim()) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'La description est obligatoire'
            });
            return false;
        }

        if (!selectedSport) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez sélectionner une catégorie de sport'
            });
            return false;
        }

        if (!maxParticipants || parseInt(maxParticipants) < 2) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Le nombre minimum de participants doit être de 2'
            });
            return false;
        }

        if (tags.length < 1) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Ajoutez au moins un tag'
            });
            return false;
        }

        if (rules.length < 1) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Ajoutez au moins une règle'
            });
            return false;
        }

        if (!image) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "L'image de la communauté est obligatoire"
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        // Activer l'état de soumission
        setIsSubmitting(true);

        try {

            // Créer un objet FormData
            const formData = new FormData();

            // Ajouter chaque champ dans FormData
            formData.append('title', title);
            formData.append('description', description);
            formData.append('adminId', iduser);
            formData.append('sportType', selectedSport);
            formData.append('maxParticipants', parseInt(maxParticipants, 10));
            tags.forEach((ta, index) => {
                formData.append(`tags[${index}]`, ta);
            });
            rules.forEach((ru, index) => {
                formData.append(`regles[${index}]`, ru);
            });
            if (image) {
                const fileType = image.split('.').pop();
                formData.append("image", {
                    uri: image,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                });
            }
            // Envoyer la requête avec Axios
            const response = await axios.post(
                "http://192.168.1.16:9001/api/communities/createCommunity",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            // Gérer la réponse du serveur
            if (response.data.message === "communauté existante") {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: 'Une communauté avec ce titre existe déjà.',
                });
            } else if (response.data.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'La communauté a été créée avec succès.',
                });

                // Vider tous les champs après un succès
                setTitle('');
                setDescription('');
                setSelectedSport(null);
                setMaxParticipants('');
                setTag('');
                setTags([]);
                setRule('');
                setRules([]);
                setImage(null);
            }

        } catch (error) {
            console.log("Erreur lors de l'envoi de la requête :", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: "Une erreur s'est produite lors de la création de la communauté.",
            });
        } finally {
            // Désactiver l'état de soumission
            setIsSubmitting(false);
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

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <AntDesign name="left" size={14} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Construire une communauté</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <ScrollView
                        style={styles.formContainer}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent} // Ajout du padding en bas
                    >
                        <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                            {image ? (
                                <Image
                                    source={{ uri: image }}
                                    style={styles.selectedImage}
                                    resizeMode='stretch'

                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Feather name="image" size={40} color="#9EA3AE" />
                                    <Text style={styles.imagePlaceholderText}>
                                        Ajouter une image
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Titre</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Nom de votre communauté"
                                placeholderTextColor="#9EA3AE"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Décrivez votre communauté"
                                multiline
                                numberOfLines={4}
                                placeholderTextColor="#9EA3AE"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Catégorie de sport</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.categoriesContainer}
                                contentContainerStyle={styles.categoriesContent} // Ajout du padding horizontal
                            >
                                {listeCategories.map((category) => (
                                    <TouchableOpacity
                                        key={category._id}
                                        style={[
                                            styles.categoryItem,
                                            selectedSport === category._id && styles.selectedCategoryItem
                                        ]}
                                        onPress={() => setSelectedSport(category._id)}
                                    >
                                        <Text style={styles.categoryIcon}>
                                            {category.icon}
                                        </Text>
                                        <Text style={[
                                            styles.categoryName,
                                            selectedSport === category._id && styles.selectedText
                                        ]}>
                                            {category.nom}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre maximum de participants</Text>
                            <TextInput
                                style={styles.input}
                                value={maxParticipants}
                                onChangeText={setMaxParticipants}
                                placeholder="20"
                                keyboardType="numeric"
                                placeholderTextColor="#9EA3AE"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tags</Text>
                            <View style={styles.tagsContainer}>
                                {tags.map((t, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{t}</Text>
                                        <TouchableOpacity onPress={() => removeTag(index)}>
                                            <Ionicons name="close-circle" size={20} color="#FF7622" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.tagInputContainer}>
                                <TextInput
                                    style={styles.tagInput}
                                    value={tag}
                                    onChangeText={setTag}
                                    placeholder="Ajouter un tag"
                                    placeholderTextColor="#9EA3AE"
                                    onSubmitEditing={addTag}
                                />
                                <TouchableOpacity style={styles.addButton} onPress={addTag}>
                                    <Ionicons name="add-circle" size={24} color="#FF7622" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Règles</Text>
                            {rules.map((r, index) => (
                                <View key={index} style={styles.ruleItem}>
                                    <Text style={styles.ruleText}>{r}</Text>
                                    <TouchableOpacity onPress={() => removeRule(index)}>
                                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.ruleInputContainer}>
                                <TextInput
                                    style={styles.ruleInput}
                                    value={rule}
                                    onChangeText={setRule}
                                    placeholder="Ajouter une règle"
                                    multiline
                                    placeholderTextColor="#9EA3AE"
                                />
                                <TouchableOpacity style={styles.addButton} onPress={addRule}>
                                    <Ionicons name="add-circle" size={24} color="#FF7622" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isSubmitting} // Désactiver le bouton pendant la soumission
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" /> // Afficher un indicateur de chargement
                            ) : (
                                <Text style={styles.submitButtonText}>Créer la communauté</Text>
                            )}
                        </TouchableOpacity>
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
    formContainer: {
        flex: 1,
        padding: 16,
    },
    scrollViewContent: {
        paddingBottom: 32, // Ajout du padding en bas
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: '#181C2E',
        marginBottom: 8,
        fontFamily: "Sen-Bold",
    },
    input: {
        backgroundColor: '#F4F5F7',
        borderRadius: 12,
        padding: 16,
        fontFamily: "Sen-Regular",
        fontSize: 16,
        color: '#181C2E',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    imagePickerContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#F4F5F7',
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: '#9EA3AE',
        fontFamily: "Sen-Regular",
    },
    categoriesContainer: {
        flexDirection: 'row',
        marginVertical: 8,
    },
    categoriesContent: {
        paddingHorizontal: 8, // Ajout du padding horizontal
    },
    categoryItem: {
        width: 120,
        height: 120,
        backgroundColor: '#F4F5F7',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedCategoryItem: {
        backgroundColor: '#FFE6D9',
        borderWidth: 1,
        borderColor: '#FF7622',
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 14,
        textAlign: 'center',
        color: '#181C2E',
        fontFamily: "Sen-Regular",
    },
    selectedText: {
        color: '#FF7622',
        fontFamily: "Sen-Bold",
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F5F7',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 14,
        color: '#181C2E',
        fontFamily: "Sen-Regular",
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagInput: {
        flex: 1,
        backgroundColor: '#F4F5F7',
        borderRadius: 12,
        padding: 16,
        fontFamily: "Sen-Regular",
        fontSize: 16,
        color: '#181C2E',
        marginRight: 8,
    },
    ruleInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ruleInput: {
        flex: 1,
        backgroundColor: '#F4F5F7',
        borderRadius: 12,
        padding: 16,
        fontFamily: "Sen-Regular",
        fontSize: 16,
        color: '#181C2E',
        marginRight: 8,
    },
    addButton: {
        marginLeft: 8,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F4F5F7',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    ruleText: {
        fontSize: 14,
        color: '#181C2E',
        fontFamily: "Sen-Regular",
    },
    submitButton: {
        backgroundColor: '#FF7622',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32, // Ajout du padding en bas
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: "Sen-Bold",
    },
});