import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    TextInput,
    Dimensions,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react'
import { AntDesign, Entypo, FontAwesome5, Ionicons } from '@expo/vector-icons';
import GetAllReservationByUserApi from "../api/GetAllReservationByUserApi";
import { getUserData } from "../util/StorageUtils";
export default function MesReservationsSalles() {
    const [loading, setLoading] = useState(true);
    const [MesReservations, setMesReservations] = useState([])
    const router = useRouter();

    useEffect(() => {
        fetechReservations()
    }, [MesReservations]);


    const fetechReservations = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            const response = await GetAllReservationByUserApi(userId);
            setMesReservations(response.reservations);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
        }
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
                <AntDesign name="inbox" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucune réservation disponible pour le moment.</Text>
            <Text style={styles.emptyText}>
                Vous n'avez pas réservé de salle. Réservez-en une, puis consultez vos réservations.</Text>
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
                    <Text><AntDesign name="left" size={14} color="#181C2E" style={{ fontFamily: "Sen-Medium" }} /></Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mes réservations</Text>
            </View>
            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {MesReservations.length > 0 ? (
                        <FlatList
                            data={MesReservations}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.reservationsList}
                            renderItem={({ item }) => (
                                <View style={styles.reservationCardContainer}>
                                    <TouchableOpacity
                                        style={styles.reservationCard}
                                        onPress={() => router.push(`/DetailsReservation/${item._id}`)}
                                    >
                                        <View style={styles.reservationCardInner}>
                                            <Image
                                                source={{ uri: item.salle.photos[0] }}
                                                style={styles.reservationImage}
                                            />
                                            <View style={styles.reservationContent}>
                                                <Text style={styles.salleTitle} numberOfLines={1}>
                                                    {item.salle.nom}
                                                </Text>
                                                <View style={styles.reservationInfoContainer}>
                                                    <View style={styles.reservationInfoRow}>
                                                        <Ionicons name="location-outline" size={16} color="#FF7622" />
                                                        <Text style={styles.reservationInfoText} numberOfLines={1}>
                                                            {item.salle.adresse}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.reservationInfoRow}>
                                                        <AntDesign name="calendar" size={16} color="#FF7622" />
                                                        <Text style={styles.reservationInfoText}>
                                                            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.reservationActionIcon}>
                                                <AntDesign name="right" size={20} color="#FF7622" />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
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
        textAlign: "center",
        marginTop: 20

    },
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reservationsList: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    reservationCardContainer: {
        marginBottom: 16,
    },
    reservationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    reservationCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    reservationImage: {
        width: 90,
        height: 90,
        borderRadius: 15,
        marginRight: 16,
    },
    reservationContent: {
        flex: 1,
        justifyContent: 'center',
    },
    salleTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#181C2E',
        marginBottom: 8,
    },
    reservationInfoContainer: {
        gap: 6,
    },
    reservationInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reservationInfoText: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#718096',
        flex: 1,
    },
    reservationActionIcon: {
        padding: 8,
    },

});