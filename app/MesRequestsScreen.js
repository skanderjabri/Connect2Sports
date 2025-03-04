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
    Alert,
    RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import MesRequestsReceivedByUserApi from "../api/MesRequestsReceivedByUserApi";
import moment from 'moment';
import 'moment/locale/fr';
import Global from '../util/Global';
import { getUserData } from '../util/StorageUtils';
import ConfirmInvitationApi from "../api/ConfirmInvitationApi";
import CancelInvitationApi from "../api/CancelInvitationApi";

export default function MesRequestsScreen() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // État pour gérer le rafraîchissement

    const router = useRouter();

    useEffect(() => {
        fetchRequest();
    }, []);

    const fetchRequest = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            const response = await MesRequestsReceivedByUserApi(userId);
            setRequests(response.requests);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false)
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRequest();
    };

    const handleAccept = async (requestId) => {
        try {
            const response = await ConfirmInvitationApi(requestId);
            if (response.message === "ok") {
                setRequests(requests.filter(request => request._id !== requestId));
            } else {
                Alert.alert("Erreur", "Une erreur s'est produite lors de la confirmation de l'invitation.");
            }
        } catch (error) {
            Alert.alert("Erreur", "Une erreur s'est produite lors de la confirmation de l'invitation.");
        }
    };

    const handleRefuse = async (requestId) => {
        try {
            const response = await CancelInvitationApi(requestId);
            if (response.message === "ok") {
                setRequests(requests.filter(request => request._id !== requestId));
            } else {
                Alert.alert("Erreur", "Une erreur s'est produite lors de l'annulation de l'invitation.");
            }
        } catch (error) {
            Alert.alert("Erreur", "Une erreur s'est produite lors de l'annulation de l'invitation.");
        }
    };


    const InvitationItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.userInfo}>
                {item.Id_Emetteur.photoProfil ? (
                    <Image
                        source={{
                            uri: Global.BaseFile + item.Id_Emetteur.photoProfil
                        }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.Id_Emetteur.prenom[0].toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={styles.textContainer}>
                    <Text style={styles.name}>
                        {item.Id_Emetteur.prenom} {item.Id_Emetteur.nom}
                    </Text>
                    <Text style={styles.date}>
                        {moment(item.createdAt).locale('fr').fromNow()}
                    </Text>
                </View>
            </View>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item._id)}>
                    <AntDesign name="check" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Accepter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton} onPress={() => handleRefuse(item._id)}>
                    <AntDesign name="close" size={20} color="#FF4B4B" />
                    <Text style={[styles.buttonText, styles.rejectText]}>Refuser</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
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
                <Text style={styles.headerTitle}>Mes invitations</Text>
            </View>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {requests.length > 0 ? (
                        <FlatList
                            data={requests}
                            renderItem={({ item }) => <InvitationItem item={item} />}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            refreshControl={ // Ajoutez RefreshControl ici
                                <RefreshControl
                                    refreshing={refreshing} // Contrôle l'état de rafraîchissement
                                    onRefresh={onRefresh} // Fonction appelée lors du rafraîchissement
                                    colors={["#FF8C00"]} // Couleur du spinner (optionnel)
                                    tintColor="#FF8C00" // Couleur du spinner (iOS)
                                />
                            }
                        />
                    ) : (
                        <EmptyState />
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <View style={styles.iconContainer}>
            <Ionicons name="information-circle-outline" size={60} color="#A0AEC0" />
        </View>
        <Text style={styles.emptyTitle}>Aucune invitation</Text>
        <Text style={styles.emptyText}>
            Aucune invitation n'a encore été reçue. Revenez plus tard pour consulter les nouveautés.
        </Text>
    </View>
);


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
    listContainer: {
        padding: 16,
    },
    itemContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FF7622',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Sen-Bold',
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    name: {
        fontSize: 16,
        color: '#181C2E',
        fontFamily: 'Sen-Bold',
        marginBottom: 4,
        textTransform: 'capitalize'
    },
    date: {
        fontSize: 14,
        color: '#718096',
        fontFamily: 'Sen-Regular',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#32D583',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        flex: 1,
        marginRight: 8,
        justifyContent: 'center',
    },
    rejectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        flex: 1,
        marginLeft: 8,
        justifyContent: 'center',
    },
    buttonText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'Sen-Bold',
        color: '#fff',
    },
    rejectText: {
        color: '#FF4B4B',
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
        marginTop: 20
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});