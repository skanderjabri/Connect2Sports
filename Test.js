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
import GetFriendsApi from '../api/GetFriendsApi'
export default function ListAmisScreen() {
    const router = useRouter();

    const [listAmis, setListAmis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);




    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            const response = await GetFriendsApi(userId);
            setListAmis(response.friends);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false)
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFriends();
    };

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
                <Text style={styles.headerTitle}>Ami(e)s</Text>
            </View>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {listAmis.length > 0 ? (
                        <Text>SSSSSSSSS</Text>

                    ) : (
                        <EmptyState />
                    )}
                </View>
            )}
        </SafeAreaView>

    )
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