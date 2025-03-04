import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    StatusBar,
    SafeAreaView,
    FlatList,
    RefreshControl,
    Dimensions,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    StyleSheet,
    Platform
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useCallback } from 'react';
import {
    AntDesign,
    Ionicons,
    MaterialIcons,
    Feather
} from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/fr';
import { getUserData } from "../../util/StorageUtils";
import GetPostByEventApi from "../../api/GetPostByEventApi";
import Global from "../../util/Global";
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import axios from "axios";
const PostEventScreen = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [listPost, setListPost] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [idUserConnecte, setIdUserConnecte] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([getCurrentUser(), fetchPostsEvent()]);
        } catch (error) {
            console.log("Erreur lors du chargement des données: " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getCurrentUser = async () => {
        try {
            const data = await getUserData();
            setIdUserConnecte(data.user._id);
        } catch (error) {
            console.log("Erreur récupération utilisateur connecté:", error);
        }
    };

    const fetchPostsEvent = async () => {
        try {
            const response = await GetPostByEventApi(id);
            setListPost(response.postevent);
        } catch (error) {
            console.log("Erreur " + error);
        }
    };



    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };


    const pickImages = async () => {
        try {

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedImages([...selectedImages, ...result.assets]);
            }
        } catch (error) {
            console.log("Erreur lors de la sélection des images:", error);
        }
    };

    const removeImage = (indexToRemove) => {
        setSelectedImages(selectedImages.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async () => {
        if (message.trim() === '') {
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('idEvenement', id);
            formData.append('message', message);
            formData.append('idParticipant', idUserConnecte);

            selectedImages.forEach((image, index) => {
                const imageUri = image.uri;
                const imageName = imageUri.split('/').pop();
                const imageType = 'image/' + (imageName.split('.').pop() === 'png' ? 'png' : 'jpeg');

                formData.append('images', {
                    uri: imageUri,
                    name: imageName,
                    type: imageType,
                });
            });

            const response = await axios.post(
                "http://192.168.1.16:9001/api/postEvent/create",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            if (response.data.message == "ok") {
                setModalVisible(false);
                setMessage('');
                setSelectedImages([]);
                onRefresh();
            }

        } catch (error) {
            console.log("Erreur lors de l'envoi du post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSelectedImage = ({ item, index }) => (
        <View style={styles.selectedImageContainer}>
            <Image source={{ uri: item.uri }} style={styles.selectedImage} />
            <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
            >
                <AntDesign name="closecircle" size={20} color="#FF4444" />
            </TouchableOpacity>
        </View>
    );

    const renderPostImages = ({ item: imageUrl }) => (
        <Image
            source={{ uri: Global.BaseFile + imageUrl }}
            style={styles.postImage}
            resizeMode="contain"
        />
    );

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbox-outline" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucun post disponible</Text>
            <Text style={styles.emptyText}>
                Soyez le premier à partager un moment de cet événement !
            </Text>
        </View>
    );

    const renderPost = ({ item }) => (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: Global.BaseFile + item.idParticipant.photoProfil }}
                        style={styles.profilePic}
                    />
                    <View style={styles.nameAndTime}>
                        <Text style={styles.userName}>
                            {item.idParticipant.prenom} {item.idParticipant.nom}
                        </Text>
                        <Text style={styles.timeStamp}>
                            {moment(item.createdAt).locale('fr').fromNow()}
                        </Text>
                    </View>
                </View>
            </View>

            {item.message && (
                <Text style={styles.messageText}>{item.message}</Text>
            )}

            {item.images && item.images.length > 0 && (
                <FlatList
                    data={item.images}
                    renderItem={renderPostImages}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(imageUrl, index) => `${imageUrl}-${index}`}
                    style={styles.imagesList}
                    ItemSeparatorComponent={() => <View style={styles.imageSeparator} />}
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <AntDesign name="left" size={14} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Posts de l'événement</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <FlatList
                    data={listPost}
                    renderItem={renderPost}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.contentContainer}
                    ListEmptyComponent={EmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FF7622"]}
                            tintColor="#FF7622"
                        />
                    }
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <AntDesign name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContainer}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Créer un post</Text>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <AntDesign name="close" size={24} color="#1E293B" />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.messageInput}
                                placeholder="Partagez un moment..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                value={message}
                                onChangeText={setMessage}
                            />

                            {selectedImages.length > 0 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.selectedImagesContainer}
                                >
                                    {selectedImages.map((image, index) => (
                                        <View key={index} style={styles.selectedImageContainer}>
                                            <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => removeImage(index)}
                                            >
                                                <AntDesign name="closecircle" size={20} color="#FF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.imagePickerButton}
                                    onPress={pickImages}
                                >
                                    <Feather name="image" size={24} color="#FF7622" />
                                    <Text style={styles.imagePickerText}>Ajouter des photos</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        (!message) && styles.submitButtonDisabled
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting || (!message)}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#FF7622" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Publier</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default PostEventScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FF7622',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#FF7622',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
    },
    headerTitle: {
        fontSize: 20,
        marginLeft: 16,
        color: '#FFFFFF',
        fontFamily: 'Sen-Bold',
        letterSpacing: 0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    postContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#64748B',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profilePic: {
        width: 48,
        height: 48,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#FF7622',
    },
    nameAndTime: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        color: '#1E293B',
        fontFamily: 'Sen-Bold',
        textTransform: 'capitalize',
    },
    timeStamp: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: 'Sen-Regular',
        marginTop: 2,
    },
    messageText: {
        fontSize: 15,
        color: '#334155',
        fontFamily: 'Sen-Regular',
        marginBottom: 16,
        lineHeight: 22,
    },
    imagesList: {
        marginTop: 12,
    },
    postImage: {
        width: Dimensions.get('window').width * 0.68,
        height: 260,
        borderRadius: 20,
    },
    imageSeparator: {
        width: 12,
    },
    separator: {
        height: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        marginTop: 80,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        backgroundColor: '#EEF2FF',
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyTitle: {
        fontSize: 24,
        color: '#1E293B',
        fontFamily: 'Sen-Bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: '#64748B',
        fontFamily: 'Sen-Regular',
        textAlign: 'center',
        lineHeight: 22,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#FF7622',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Sen-Bold',
        color: '#1E293B',
        letterSpacing: 0.5,
    },
    closeButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    messageInput: {
        fontFamily: 'Sen-Regular',
        fontSize: 16,
        color: '#1E293B',
        paddingVertical: 16,
        maxHeight: 120,
        minHeight: 60,
    },
    selectedImagesContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
    },
    selectedImageContainer: {
        marginRight: 12,
        position: 'relative',
    },
    selectedImage: {
        width: 120,
        height: 120,
        borderRadius: 16,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    imagePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FF762215',
        borderRadius: 16,
    },
    imagePickerText: {
        marginLeft: 8,
        color: '#FF7622',
        fontFamily: 'Sen-Regular',
        fontSize: 15,
    },
    submitButton: {
        backgroundColor: '#FF7622',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonDisabled: {
        backgroundColor: '#CBD5E1',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Sen-Bold',
        fontSize: 16,
    },
});