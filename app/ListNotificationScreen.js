import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import GetMyNotificationsApi from '../api/GetMyNotificationsApi';
import MarkNotificationsAsReadApi from "../api/MarkNotificationsAsReadApi";
import moment from 'moment';
import 'moment/locale/fr';
import Global from '../util/Global';
import { getUserData } from '../util/StorageUtils';

export default function ListNotificationScreen() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Premier useEffect pour charger les notifications
    useEffect(() => {
        fetechNotification();
    }, []);

    // Deuxième useEffect pour gérer le nettoyage lors du départ de l'écran
    useEffect(() => {
        // Cette fonction sera appelée lorsque le composant sera démonté
        return () => {
            if (notifications.length > 0) {
                MarkNotificationsAsRead()
                    .then(() => {
                    })
                    .catch((error) => {
                    });
            }
        };
    }, [notifications]); // Dépendance aux notifications pour avoir accès à leur état actuel

    const fetechNotification = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            const response = await GetMyNotificationsApi(userId);
            setNotifications(response.notifications);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
        }
    };
    const MarkNotificationsAsRead = async () => {
        const data = await getUserData();
        const userId = data.user._id;
        return MarkNotificationsAsReadApi(userId);
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
                <Ionicons name="notifications-off-outline" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyText}>
                Vous n'avez pas encore reçu de notifications. Revenez plus tard pour voir les mises à jour.
            </Text>
        </View>
    );

    const renderNotification = ({ item }) => {
        const now = moment();
        const notificationDate = moment(item.createdAt);
        const duration = moment.duration(now.diff(notificationDate));

        let timeAgo = '';
        if (duration.asMinutes() < 60) {
            timeAgo = `${Math.floor(duration.asMinutes())} minutes`;
        } else if (duration.asHours() < 24) {
            const hours = Math.floor(duration.asHours());
            const minutes = Math.floor(duration.asMinutes()) % 60;
            timeAgo = `${hours} heure${hours > 1 ? 's' : ''} et ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            timeAgo = notificationDate.fromNow();
        }

        return (
            <View key={item._id} style={[styles.notificationItem, item.lu === 0 ? styles.unreadNotification : null]}>
                <Image source={{ uri: item.emetteur.photoProfil }} style={styles.avatar} />
                <View style={styles.notificationContent}>
                    <Text style={[styles.notificationText, item.lu === 0 ? styles.unreadText : null]}>
                        <Text style={styles.name}>{item.emetteur.nom} {item.emetteur.prenom} </Text>
                        <Text style={{ fontFamily: 'Sen-Regular', fontSize: 14 }}>{item.message}</Text>
                    </Text>
                    <Text style={styles.time}>{timeAgo}</Text>
                </View>
                {item.lu === 0 && <View style={styles.unreadDot} />}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <AntDesign name="left" size={14} color="#181C2E" style={{ fontFamily: "Sen-Medium" }} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState />
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
    },
    emptyText: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '80%',
        fontFamily: "Sen-Regular",
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 40,
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
        justifyContent: 'center',
    },
    notificationText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
    },
    name: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
    },
    time: {
        fontSize: 12,
        color: '#666',
        marginTop: 6,
        fontFamily: 'Sen-Regular',

    },
    unreadNotification: {
        backgroundColor: '#E8F0FE', // Fond bleu clair pour une meilleure distinction
        borderLeftWidth: 4, // Bordure à gauche pour attirer l'attention
        borderLeftColor: '#FF7622', // Couleur vive pour la bordure
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        elevation: 2, // Ombre pour un effet plus marqué (Android)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    unreadDot: {
        width: 10,
        height: 10,
        backgroundColor: '#FF3B30', // Rouge vif pour attirer l'œil
        borderRadius: 5,
        position: 'absolute',
        right: 15,
        top: 15,
    },
    notificationText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
    },
    unreadText: {
        fontWeight: "bold", // Texte plus visible pour les non lues
        color: '#181C2E',
    },
});