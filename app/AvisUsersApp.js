import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    StatusBar,
    Platform,
    SafeAreaView,
    RefreshControl,
    Dimensions,
    Image,
    ImageBackground,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import GetAllAvisAppApi from '../api/GetAllAvisAppApi';
import Global from "../util/Global";
import CreateAvisAppApi from "../api/CreateAvisAppApi";
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { getUserData } from "../util/StorageUtils";
export default function AvisUsersApp() {
    const router = useRouter();
    const [avisApp, setAvisApp] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [idUser, setidUser] = useState(null);

    useEffect(() => {
        fetchAvisApplication();
    }, []);

    const fetchAvisApplication = () => {
        setLoading(true);

        return GetAllAvisAppApi()
            .then((response) => {
                setAvisApp(response.avisapp);
                setLoading(false);
            })
            .catch((error) => {
                console.log("Erreur " + error);
                setLoading(false);
            });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAvisApplication().finally(() => setRefreshing(false));
    };

    const handleSubmitAvis = async () => {
        if (comment.trim() == "") {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez remplir le champ commentaire',
            })
            return;
        }
        const data = await getUserData();
        setidUser(data.user._id);
        setSubmitting(true);
        try {
            const response = await CreateAvisAppApi(idUser, rating, comment)
            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Votre avis a été envoyé avec succès',
                })
            }
            else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Erreur',
                    textBody: 'Une erreur est survenue lors de l\'envoi de votre avis',
                })
            }

        }
        catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur est survenue lors de l\'envoi de votre avis',
            })
        }
        finally {
            setSubmitting(false);
            setModalVisible(false);
            // Réinitialiser le formulaire
            setRating(0);
            setComment('');
            // Rafraîchir la liste des avis
            fetchAvisApplication();

        }
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.avisItem}>
                <View style={styles.userInfoContainer}>
                    <Image
                        source={{
                            uri: item.idUser.photoProfil
                                ? Global.BaseFile + item.idUser.photoProfil
                                : 'https://via.placeholder.com/50'
                        }}
                        style={styles.profileImage}
                    />
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{item.idUser.prenom} {item.idUser.nom}</Text>
                        <View style={styles.ratingContainer}>
                            {Array(5).fill(0).map((_, index) => (
                                <AntDesign
                                    key={index}
                                    name={index < item.note ? "star" : "staro"}
                                    size={16}
                                    color={index < item.note ? "#FFD700" : "#C4C4C4"}
                                />
                            ))}
                        </View>
                    </View>
                </View>
                <Text style={styles.commentText}>{item.commentaire}</Text>
                <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Text>
            </View>
        );
    };

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Avis utilisateurs</Text>
                </View>

                {loading ? (
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={avisApp}
                            renderItem={renderItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.listContainer}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={["#FF7622"]}
                                />
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={60} color="#C4C4C4" />
                                    <Text style={styles.emptyText}>Aucun avis disponible</Text>
                                </View>
                            }
                        />

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <AntDesign name="plus" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <Modal
                            transparent={true}
                            visible={modalVisible}
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <KeyboardAvoidingView
                                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                                    style={styles.modalContainer}
                                >
                                    <View style={styles.modalContent}>
                                        <View style={styles.modalHeader}>
                                            <Text style={styles.modalTitle}>Donnez votre avis</Text>
                                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                                <AntDesign name="close" size={24} color="#181C2E" />
                                            </TouchableOpacity>
                                        </View>

                                        <ScrollView style={styles.modalBody}>
                                            <View style={styles.infoContainer}>
                                                <MaterialIcons name="rate-review" size={48} color="#FF7622" />
                                                <Text style={styles.infoText}>
                                                    Votre opinion est importante ! Aidez-nous à améliorer l'application en partageant votre expérience.
                                                </Text>
                                            </View>

                                            <Text style={styles.ratingLabel}>Notez l'application</Text>
                                            <View style={styles.ratingInputContainer}>
                                                {Array(5).fill(0).map((_, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => setRating(index + 1)}
                                                    >
                                                        <AntDesign
                                                            name={index < rating ? "star" : "staro"}
                                                            size={36}
                                                            color={index < rating ? "#FFD700" : "#C4C4C4"}
                                                            style={styles.ratingInput}
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            <Text style={styles.commentLabel}>Votre avis </Text>
                                            <TextInput
                                                style={styles.commentInput}
                                                placeholder="Partagez votre expérience, suggérez des améliorations..."
                                                placeholderTextColor="#A0AEC0"
                                                value={comment}
                                                onChangeText={setComment}
                                                multiline={true}
                                                numberOfLines={4}
                                                textAlignVertical="top"
                                            />
                                        </ScrollView>

                                        <TouchableOpacity
                                            style={[
                                                styles.submitButton,
                                                (!rating || submitting) && styles.submitButtonDisabled
                                            ]}
                                            onPress={handleSubmitAvis}
                                            disabled={!rating || submitting}
                                        >
                                            {submitting ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.submitButtonText}>Envoyer mon avis</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </KeyboardAvoidingView>
                            </TouchableWithoutFeedback>
                        </Modal>
                    </>
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
        flex: 1,
        marginLeft: 12,
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 80, // Espace pour le bouton flottant
    },
    avisItem: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    userInfoContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E9ECEF',
    },
    userDetails: {
        marginLeft: 12,
        justifyContent: 'center',
    },
    userName: {
        fontSize: 16,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    commentText: {
        fontSize: 15,
        color: '#4A5568',
        fontFamily: "Sen-Regular",
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: '#718096',
        fontFamily: "Sen-Regular",
        textAlign: 'right',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#718096',
        fontFamily: "Sen-Regular",
        marginTop: 12,
    },

    // Styles pour le bouton flottant
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF7622',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    // Styles pour le modal
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 30,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
    },
    modalBody: {
        padding: 16,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#4A5568',
        fontFamily: "Sen-Regular",
    },
    ratingLabel: {
        fontSize: 16,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 12,
    },
    ratingInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    ratingInput: {
        marginHorizontal: 8,
    },
    commentLabel: {
        fontSize: 16,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 12,
    },
    commentInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        height: 120,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        fontSize: 15,
        color: '#4A5568',
        fontFamily: "Sen-Regular",
        marginBottom: 20,
    },
    suggestionContainer: {
        marginBottom: 20,
    },
    suggestionTitle: {
        fontSize: 16,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 12,
    },
    suggestionItems: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F2',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    suggestionText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#4A5568',
        fontFamily: "Sen-Regular",
    },
    submitButton: {
        backgroundColor: '#FF7622',
        borderRadius: 12,
        paddingVertical: 14,
        marginHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#E9ECEF',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: "Sen-Bold",
    },
});