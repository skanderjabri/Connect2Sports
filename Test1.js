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
import React, { useEffect, useState } from "react";
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Global from "../util/Global";
import { getUserData } from "../util/StorageUtils";
import GetAllRequestEventByIdUserApi from "../api/GetAllRequestEventByIdUserApi";
import moment from "moment";
import "moment/locale/fr";

export default function MesParticipationApi() {
    const [participationsEvents, setParticipationsEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const router = useRouter();

    useEffect(() => {
        fetchRequest();
    }, []);

    const fetchRequest = async () => {
        try {
            const data = await getUserData();
            const userId = data.user._id;
            const response = await GetAllRequestEventByIdUserApi(userId);
            setParticipationsEvents(response.invitations);
        } catch (error) {
            console.log("Erreur : " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRequest();
    };

    const getStatusColor = (statut) => {
        switch (statut) {
            case 1: return "#22C55E"; // Accepté - Vert
            case 2: return "#EF4444"; // Refusé - Rouge
            default: return "#F59E0B"; // En attente - Orange
        }
    };

    const getStatusText = (statut) => {
        switch (statut) {
            case 1: return "Accepté";
            case 2: return "Refusé";
            default: return "En attente";
        }
    };

    const getEventStatusColor = (statut) => {
        switch (statut) {
            case "termine": return "#64748B"; // Terminé - Gris
            case "ouvert": return "#22C55E"; // Ouvert - Vert
            default: return "#F59E0B"; // Autre - Orange
        }
    };

    const FilterButton = ({ title, isSelected, onPress }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                isSelected && styles.filterButtonActive,
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.filterButtonText,
                    isSelected && styles.filterButtonTextActive,
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );

    const filteredParticipations = participationsEvents.filter((participation) => {
        if (selectedStatus === "all") return true;
        if (selectedStatus === "accepted") return participation.statut === 1;
        if (selectedStatus === "rejected") return participation.statut === 2;
        if (selectedStatus === "pending") return participation.statut === 0;
        return true;
    });

    const renderEventCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.sportInfo}>
                    <MaterialCommunityIcons
                        name="run-fast"
                        size={24}
                        color="#3498db"
                    />
                    <Text style={styles.sportName}>{item.idEvenement.nomSporttype}</Text>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.statut) },
                    ]}
                >
                    <Text style={styles.statusText}>{getStatusText(item.statut)}</Text>
                </View>
            </View>
            <Text style={styles.eventTitle}>{item.idEvenement.titre}</Text>
            <View style={styles.eventDetails}>
                <View style={styles.detailItem}>
                    <Ionicons name="location" size={18} color="#64748B" />
                    <Text style={styles.detailText}>{item.idEvenement.lieu}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={18} color="#64748B" />
                    <Text style={styles.detailText}>
                        {moment(item.idEvenement.dateHeureDebut).format("DD MMM YYYY, HH:mm")}
                    </Text>
                </View>
            </View>
            <View style={styles.eventStatus}>
                <View
                    style={[
                        styles.eventStatusBadge,
                        { backgroundColor: getEventStatusColor(item.idEvenement.statut) },
                    ]}
                >
                    <Text style={styles.eventStatusText}>
                        {item.idEvenement.statut.charAt(0).toUpperCase() +
                            item.idEvenement.statut.slice(1)}
                    </Text>
                </View>
            </View>
        </View>
    );

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
                <AntDesign name="exclamationcircleo" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucune participation</Text>
            <Text style={styles.emptyText}>
                Vous n'avez pas encore rejoint d'événements. Recherchez-en un et commencez à participer !
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <AntDesign name="arrowleft" size={24} color="#181C2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mes Participations</Text>
            </View>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#3498db" />
                </View>
            ) : (
                <>
                    <View style={styles.filterContainer}>
                        <FilterButton
                            title="Tous"
                            isSelected={selectedStatus === "all"}
                            onPress={() => setSelectedStatus("all")}
                        />
                        <FilterButton
                            title="Acceptés"
                            isSelected={selectedStatus === "accepted"}
                            onPress={() => setSelectedStatus("accepted")}
                        />
                        <FilterButton
                            title="Refusés"
                            isSelected={selectedStatus === "rejected"}
                            onPress={() => setSelectedStatus("rejected")}
                        />
                        <FilterButton
                            title="En attente"
                            isSelected={selectedStatus === "pending"}
                            onPress={() => setSelectedStatus("pending")}
                        />
                    </View>

                    {filteredParticipations.length > 0 ? (
                        <FlatList
                            data={filteredParticipations}
                            keyExtractor={(item) => item._id}
                            renderItem={renderEventCard}
                            contentContainerStyle={styles.listContainer}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor="#3498db"
                                    colors={["#3498db"]}
                                />
                            }
                        />
                    ) : (
                        <EmptyState />
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        color: "#181C2E",
        marginLeft: 12,
        fontFamily: "Sen-Bold",
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#F4F5F7",
    },
    filterButtonActive: {
        backgroundColor: "#3498db",
    },
    filterButtonText: {
        fontSize: 14,
        fontFamily: "Sen-Regular",
        color: "#64748B",
    },
    filterButtonTextActive: {
        color: "#fff",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sportInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sportName: {
        fontSize: 16,
        fontFamily: "Sen-Bold",
        color: "#181C2E",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontFamily: "Sen-Bold",
        color: "#FFFFFF",
    },
    eventTitle: {
        fontSize: 18,
        fontFamily: "Sen-Bold",
        color: "#181C2E",
        marginBottom: 12,
    },
    eventDetails: {
        flexDirection: "column",
        gap: 8,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        fontFamily: "Sen-Regular",
        color: "#64748B",
    },
    eventStatus: {
        marginTop: 12,
    },
    eventStatusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    eventStatusText: {
        fontSize: 12,
        fontFamily: "Sen-Bold",
        color: "#FFFFFF",
    },
    listContainer: {
        flexGrow: 1,
        paddingBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#F7FAFC",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 23,
        color: "#2D3748",
        marginBottom: 12,
        fontFamily: "Sen-Bold",
        textAlign: "center",
    },
    emptyText: {
        fontSize: 17,
        color: "#718096",
        textAlign: "center",
        lineHeight: 24,
        maxWidth: "90%",
        fontFamily: "Sen-Regular",
    },
    spinnerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});