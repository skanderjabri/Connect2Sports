import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    StatusBar,
    Platform,
    SafeAreaView,
    TextInput,
    Dimensions,
    RefreshControl,
    Modal
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import GetFriendsApi from '../api/GetFriendsApi';
import { getUserData } from '../util/StorageUtils';
import Global from "../util/Global";
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import AddMessageApi from "../api/addMessageApi";
export default function ListAmisScreen() {
    const router = useRouter();
    const [listAmis, setListAmis] = useState([]);
    const [filteredAmis, setFilteredAmis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [IdUserConnecte, setIdUserConnecte] = useState(null);

    useEffect(() => {
        fetchFriends();
        getCurrentUser();
    }, []);



    const getCurrentUser = async () => {
        try {
            const data = await getUserData();
            setIdUserConnecte(data.user._id);
        } catch (error) {
            console.log("Erreur récupération utilisateur connecté:", error);
        }
    };

    useEffect(() => {
        filterFriends();
    }, [searchQuery, listAmis]);

    const fetchFriends = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            const response = await GetFriendsApi(userId);
            setListAmis(response.friends);
            setFilteredAmis(response.friends);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterFriends = () => {
        const filtered = listAmis.filter(ami =>
            ami.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ami.prenom.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredAmis(filtered);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFriends();
    };

    const handleSendMessage = async () => {
        if (!message.trim()) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez écrire un message',
            });
            return;
        }

        setIsSendingMessage(true);

        try {
            const response = await AddMessageApi(IdUserConnecte, selectedUser._id, message);
            if (response.message === "ok") {
                setMessage('');
                setIsMessageModalVisible(false);
                router.push(`/ChatDetailsScreen/${response.conversation._id}?otherUserName=${encodeURIComponent(selectedUser.nom + ' ' + selectedUser.prenom)}`);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Erreur lors de l\'envoi du message.',
            });
        } finally {
            setIsSendingMessage(false);
            setSelectedUser(null);
        }
    };
 
    const handleMessageButtonPress = (user) => {
        setSelectedUser(user);
        setIsMessageModalVisible(true);
    };



    const renderFriendItem = ({ item }) => (
        <TouchableOpacity style={styles.friendItem} onPress={() => router.push(`/DetailsUser/${item._id}`)}>
            <View style={styles.imageContainer}>
                <Image
                    source={{
                        uri: Global.BaseFile + item.photoProfil
                    }}
                    style={styles.profileImage}
                />
                <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>
                    {item.prenom} {item.nom}
                </Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <MaterialIcons name="location-on" size={16} color="#FF7622" />
                        <Text style={styles.statText}>{item.adresse}</Text>
                    </View>
                    {/* 
                       <View style={styles.statItem}>
                        <MaterialIcons name="location-on" size={16} color="#FF7622" />
                        <Text style={styles.statText}>5 matchs</Text>
                    </View>
                    
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialIcons name="emoji-events" size={16} color="#FF7622" />
                        <Text style={styles.statText}>3 victoires</Text>
                    </View>

                    */}
                </View>


            </View>
            <TouchableOpacity style={styles.messageButton1}
                onPress={() => handleMessageButtonPress(item)}

            >
                <Ionicons name="chatbubble-outline" size={20} color="#FF7622" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Vous n'avez pas encore d'amis</Text>
            <Text style={styles.emptyText}>
                Vous n'avez pas encore d'amis dans votre compte. Commencez à explorer et à envoyer des invitations pour connecter avec d'autres utilisateurs ! 🌟
            </Text>
        </View>
    );

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"}
                    backgroundColor={Platform.OS === "android" ? "transparent" : "transparent"}
                    translucent
                />
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <AntDesign name="left" size={14} color="#181C2E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ami(e)s</Text>
                    <TouchableOpacity style={styles.addButton}
                        onPress={() => router.push('/UsersScreen')}
                    >
                        <AntDesign name="adduser" size={20} color="#FF7622" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#718096" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un(e) ami(e)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#718096"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            style={styles.clearButton}
                        >
                            <Ionicons name="close-circle" size={20} color="#718096" />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator size="large" color="#FF7622" />
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        {listAmis.length > 0 ? (
                            <FlatList
                                data={filteredAmis}
                                renderItem={renderFriendItem}
                                keyExtractor={item => item._id}
                                contentContainerStyle={styles.listContainer}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={["#FF7622"]}
                                    />
                                }
                            />
                        ) : (
                            <EmptyState />
                        )}
                    </View>
                )}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isMessageModalVisible}
                    onRequestClose={() => {
                        setIsMessageModalVisible(false);
                        setSelectedUser(null);
                    }}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    Message à {selectedUser?.prenom} {selectedUser?.nom}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsMessageModalVisible(false);
                                        setSelectedUser(null);
                                    }}
                                    style={styles.closeButton}
                                >
                                    <AntDesign name="close" size={24} color="#32343E" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.messageInput}
                                placeholder="Écrivez votre message..."
                                multiline={true}
                                value={message}
                                onChangeText={setMessage}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    isSendingMessage && styles.disabledButton
                                ]}
                                onPress={handleSendMessage}
                                disabled={isSendingMessage}
                            >
                                {isSendingMessage ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.sendButtonText}>Envoyer</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
        justifyContent: 'space-between',
    },
    backButton: {
        width: 45,
        height: 45,
        backgroundColor: '#F4F5F7',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 45,
        height: 45,
        backgroundColor: '#FFF5F1',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
        flex: 1,
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F5F7',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontFamily: "Sen-Regular",
        fontSize: 16,
        color: '#2D3748',
    },
    clearButton: {
        padding: 4,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 20,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    imageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E2E8F0',
    },
    onlineIndicator: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#48BB78',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    friendInfo: {
        marginLeft: 16,
        flex: 1,
    },
    friendName: {
        fontSize: 18,
        color: '#2D3748',
        fontFamily: "Sen-Bold",
        marginBottom: 6,
        textTransform: "capitalize"
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        marginLeft: 6,
        color: '#718096',
        fontFamily: "Sen-Regular",
        fontSize: 14,
    },
    statDivider: {
        width: 1,
        height: 12,
        backgroundColor: '#CBD5E0',
        marginHorizontal: 12,
    },
    messageButton1: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F7FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 23,
        color: '#2D3748',
        marginBottom: 12,
        fontFamily: "Sen-Bold",
        textAlign: "center"
    },
    emptyText: {
        fontSize: 17,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '90%',
        fontFamily: "Sen-Regular",
        marginTop: 20,
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        padding: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#32343E',
    },
    closeButton: {
        padding: 5,
    },
    messageInput: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 10,
        padding: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        fontFamily: 'Sen-Regular',
        fontSize: 16,
        marginBottom: 20,
    },
    sendButton: {
        backgroundColor: "#FF7622",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: "#A0A0A0", // Couleur grise pour indiquer que le bouton est désactivé
    },
    sendButtonText: {
        color: "#fff",
        fontFamily: "Sen-Bold",
        fontSize: 16,
    }, friendActionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end', // Aligner à droite
        gap: 10,
        marginTop: 20,
    },
    messageButton: {
        flexDirection: 'row', // Pour aligner l'icône et le texte
        alignItems: 'center',
        backgroundColor: '#F4F5F7',
        borderRadius: 18,
        paddingHorizontal: 50, // Augmenter l'espace horizontal
        height: 45,
    },

    messageButtonText: {
        marginLeft: 8,
        color: '#FF7622',
        fontSize: 16,
        fontFamily: "Sen-Bold",
    },

});