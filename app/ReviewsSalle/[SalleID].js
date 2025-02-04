import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Dimensions,
    SafeAreaView,
    TouchableWithoutFeedback
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification';
import { AntDesign, Entypo } from '@expo/vector-icons';
import GetReviewsBySalleApi from "../../api/GetReviewsBySalleApi";
import CreateReviewSalleApi from "../../api/CreateReviewSalleApi";
import { getUserData } from "../../util/StorageUtils";
import Global from "../../util/Global";
const ReviewsSalle = () => {
    const router = useRouter();
    const { SalleID } = useLocalSearchParams();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        Promise.all([fetechReviews()]).then(() => setIsLoading(false)).catch((error) => console.log("Erreur lors du chargement des données: " + error));
    }, [SalleID]);

    const fetechReviews = () => {
        return GetReviewsBySalleApi(SalleID)
            .then((response) => setReviews(response.reviews))
            .catch((error) => {
                console.log("Erreur " + error);
                throw error;
            });
    };

    const handleCreateReview = async () => {
        if (rating === 0 || comment.trim() === "") {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Attention',
                textBody: 'Veuillez remplir tous les champs',
                button: 'OK',
            });
            return;
        }
        try {
            const data = await getUserData();

            const user = data.user._id;

            const response = await CreateReviewSalleApi(user, SalleID, rating, comment);
            if (response.message === "ok") {
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Votre avis a été ajouté avec succès',
                    button: 'OK',
                });
                setModalVisible(false);
                setRating(0);
                setComment("");
                fetechReviews();
            }


        } catch (error) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur est survenue lors de la création de l\'avis',
                button: 'OK',
            });
        }
    };

    const RatingStars = ({ rating, interactive = false, onRatingChange = null }) => (
        <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => interactive && onRatingChange && onRatingChange(star)}
                    disabled={!interactive}
                >
                    <AntDesign
                        name="star"
                        size={interactive ? 30 : 16}
                        color={star <= rating ? "#FFB800" : "#E0E0E0"}
                        style={styles.starIcon}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    const ReviewItem = ({ review }) => {
        const date = new Date(review.createdAt).toLocaleDateString('fr-FR');
        return (
            <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                    <View style={styles.userInfo}>
                        <Image source={{ uri: Global.BaseFile + review.user.photoProfil }} style={styles.userImage} />
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{review.user.prenom} {review.user.nom}</Text>
                            <Text style={styles.reviewDate}>{date}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Entypo name="dots-three-horizontal" size={24} color="#C4C4C4" />
                    </TouchableOpacity>
                </View>

                <RatingStars rating={review.rating} />
                <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
        );
    };

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <AntDesign name="left" size={14} color="#181C2E" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Avis</Text>
                    </View>

                    {isLoading ? (
                        <View style={styles.spinnerContainer}>
                            <ActivityIndicator size="large" color="#FF7622" />
                        </View>
                    ) : (
                        <>
                            <ScrollView style={styles.reviewsContainer}>
                                {reviews.length === 0 ? (
                                    <View style={styles.noReviewsContainer}>
                                        <Text style={styles.noReviewsText}>Aucun avis pour le moment</Text>
                                    </View>
                                ) : (
                                    reviews.map((review) => <ReviewItem key={review._id} review={review} />)
                                )}
                            </ScrollView>

                            <TouchableOpacity style={styles.addReviewButton} onPress={() => setModalVisible(true)}>
                                <AntDesign name="plus" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Modal for submitting a review */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Ajouter un Avis</Text>
                                    <Text style={styles.modalLabel}>Évaluation:</Text>
                                    <RatingStars
                                        rating={rating}
                                        interactive={true}
                                        onRatingChange={(newRating) => setRating(newRating)}
                                    />
                                    <Text style={styles.modalLabel}>Commentaire:</Text>
                                    <TextInput
                                        style={styles.commentInput}
                                        multiline={true}
                                        placeholder="Écrivez votre commentaire"
                                        value={comment}
                                        onChangeText={setComment}
                                    />
                                    <TouchableOpacity style={styles.submitButton} onPress={handleCreateReview}>
                                        <Text style={styles.submitButtonText}>Soumettre</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { width: 45, height: 45, backgroundColor: '#F4F5F7', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, color: '#181C2E', marginLeft: 12, fontFamily: "Sen-Bold" },
    spinnerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    reviewsContainer: { padding: 16 },
    noReviewsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
    noReviewsText: { fontSize: 16, color: '#666', fontFamily: "Sen-Regular" },
    reviewItem: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, marginBottom: 16 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    userImage: { width: 60, height: 60, borderRadius: 50, marginRight: 12 },
    userDetails: { justifyContent: 'center' },
    userName: { fontSize: 17, fontFamily: "Sen-Bold", color: '#32343E', marginBottom: 4 },
    reviewDate: { fontSize: 12, color: '#808080', fontFamily: "Sen-Regular" },
    ratingContainer: { flexDirection: 'row', marginBottom: 8 },
    starIcon: { marginRight: 4 },
    reviewText: { fontSize: 15, color: '#747783', lineHeight: 20, fontFamily: "Sen-Regular" },
    addReviewButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF7622',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: Dimensions.get('window').height * 0.5 },
    modalTitle: { fontSize: 20, fontFamily: "Sen-Bold", color: '#181C2E', textAlign: "center", marginBottom: 20 },
    modalLabel: { fontSize: 17, color: '#181C2E', fontFamily: "Sen-Regular", marginBottom: 10, marginTop: 20 },
    commentInput: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', fontFamily: "Sen-Regular", fontSize: 16, marginBottom: 20 },
    submitButton: { backgroundColor: '#FF7622', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 20 },
    submitButtonText: { color: '#FFF', fontSize: 19, fontFamily: "Sen-Bold" },
});

export default ReviewsSalle;
