import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
    StyleSheet,
    Dimensions,
    RefreshControl
} from "react-native";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { getUserData } from "../util/StorageUtils";
import { useRouter } from "expo-router";
import GetParticipationsBySportTypeForUserApi from "../api/Stat/GetParticipationsBySportTypeForUserApi";
import GetBadgesByUserApi from "../api/Stat/GetBadgesByUserApi";
import GetUserPointsApi from "../api/Stat/GetUserPointsApi";

const CHART_COLORS = [
    '#FF7622', // Orange principal
    '#4C1D95', // Violet foncé
    '#059669', // Vert émeraude
    '#2563EB', // Bleu
    '#DC2626', // Rouge
    '#D97706', // Orange foncé
    '#7C3AED', // Violet
    '#2DD4BF', // Turquoise
];

export default function StatistiquesPerformances() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [ListeParticipation, setListeParticipation] = useState([]);
    const [ListBadges, setListBadges] = useState([]);
    const [pointsUser, setpointsUser] = useState(null);

    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        try {
            await Promise.all([fetchParticipationByEvent(), fetchBadges(), fetchPointsUser()]);
        } catch (error) {
            console.log("Erreur lors du chargement des données: " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const fetchParticipationByEvent = async () => {
        try {
            const data = await getUserData();
            const id = data?.user?._id;
            if (id) {
                const response = await GetParticipationsBySportTypeForUserApi(id);
                setListeParticipation(response.data || []);
            }
        } catch (error) {
            console.log("Erreur " + error);
        }
    };

    const fetchBadges = async () => {
        try {
            const data = await getUserData();
            const id = data?.user?._id;
            if (id) {
                const response = await GetBadgesByUserApi(id);
                setListBadges(response.data.badges || []);
            }
        } catch (error) {
            console.log("Erreur " + error);
        }
    };

    const fetchPointsUser = async () => {
        try {
            const data = await getUserData();
            const id = data?.user?._id;
            if (id) {
                const response = await GetUserPointsApi(id);
                setpointsUser(response.data);
            }
        } catch (error) {
            console.log("Erreur " + error);
        }
    };

    const pieData = ListeParticipation.map((item, index) => ({
        value: item.count || 0,
        label: item.sport || "Inconnu",
        color: CHART_COLORS[index % CHART_COLORS.length],
        focused: false,
    }));

    const calculateTotal = () => {
        return pieData.reduce((sum, item) => sum + item.value, 0);
    };

    const renderLegend = () => (
        <View style={styles.legendContainer}>
            {pieData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <View style={styles.legendTextContainer}>
                        <Text style={styles.legendLabel}>{item.label}</Text>
                        <Text style={styles.legendValue}>
                            {item.value} participation{item.value > 1 ? 's' : ''}
                        </Text>
                    </View>
                    <Text style={styles.legendPercentage}>
                        {((item.value / calculateTotal()) * 100).toFixed(1)}%
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderPointsSection = () => {
        if (!pointsUser) return null;

        return (
            <View style={styles.pointsSection}>
                <Text style={styles.statsTitle}>Système de Points et Progression</Text>
                <View style={styles.pointsCard}>
                    <Text style={styles.pointsTotal}>
                        Total des points : {pointsUser.totalPoints}
                    </Text>
                    <View style={styles.pointsDetails}>
                        <View style={styles.pointsDetailItem}>
                            <Text style={styles.pointsDetailLabel}>Participations</Text>
                            <Text style={styles.pointsDetailValue}>
                                {pointsUser.totalParticipations} × 5 = {pointsUser.totalParticipations * 5} points
                            </Text>
                        </View>
                        <View style={styles.pointsDetailItem}>
                            <Text style={styles.pointsDetailLabel}>Événements organisés</Text>
                            <Text style={styles.pointsDetailValue}>
                                {pointsUser.totalEventsOrganized} × 10 = {pointsUser.totalEventsOrganized * 10} points
                            </Text>
                        </View>
                        <View style={styles.pointsDetailItem}>
                            <Text style={styles.pointsDetailLabel}>Badges obtenus</Text>
                            <Text style={styles.pointsDetailValue}>
                                {pointsUser.totalBadges} × 2 = {pointsUser.totalBadges * 2} points
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <AntDesign name="left" size={20} color="#FF7622" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Statistiques et Performances</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FF7622"]}
                            tintColor="#FF7622"
                        />
                    }
                >

                    {/* Répartition des participations */}
                    <View style={styles.statsHeader}>
                        <Text style={styles.statsTitle}>Répartition des participations</Text>
                    </View>
                    {pieData.length > 0 ? (
                        <>
                            <View style={styles.statsHeader}>
                                <Text style={styles.statsSubtitle}>
                                    Total: {calculateTotal()} participation{calculateTotal() > 1 ? 's' : ''}
                                </Text>
                            </View>
                            <View style={styles.chartContainer}>
                                <PieChart
                                    data={pieData}
                                    radius={screenWidth * 0.3}
                                    innerRadius={screenWidth * 0.2}
                                    innerCircleColor={'#fff'}
                                    showValuesAsLabels={false}
                                    centerLabelComponent={() => (
                                        <View style={styles.centerLabel}>
                                            <Text style={styles.totalNumber}>
                                                {calculateTotal()}
                                            </Text>
                                            <Text style={styles.centerLabelText}>
                                                Total
                                            </Text>
                                        </View>
                                    )}
                                />
                            </View>
                            {renderLegend()}
                        </>
                    ) : (
                        <View style={styles.emptyBadgesContainer}>
                            <Ionicons name="stats-chart-outline" size={40} color="#A0AEC0" />
                            <Text style={styles.emptyBadgesText}>
                                Aucune participation. Vous n'avez participé à aucun événement pour le moment.
                            </Text>
                        </View>
                    )}

                    {/* Section Badges */}
                    <View style={styles.badgesSection}>
                        <Text style={styles.statsTitle}>Mes Badges</Text>
                        {ListBadges.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.badgesScrollView}
                            >
                                {ListBadges.map((item, index) => (
                                    <View key={index} style={styles.badgeCard}>
                                        <Text style={styles.badgeEmoji}>
                                            {item.badge.split(' ').pop()} {/* Extraire l'emoji */}
                                        </Text>
                                        <Text style={styles.badgeName}>
                                            {item.badge.split(' ').slice(0, -1).join(' ')} {/* Nom sans emoji */}
                                        </Text>
                                        <Text style={styles.badgeCount}>
                                            {item.count} fois obtenu{item.count > 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyBadgesContainer}>
                                <Ionicons name="ribbon-outline" size={40} color="#A0AEC0" />
                                <Text style={styles.emptyBadgesText}>
                                    Vous n'avez pas encore obtenu de badges.
                                    Participez à des événements pour en gagner !
                                </Text>
                            </View>
                        )}
                    </View>
                    {/* Section Système de Points et Progression */}
                    {renderPointsSection()}

                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginLeft: 16,
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexGrow: 1,
        padding: 16,
    },
    statsHeader: {
        marginBottom: 24,
    },
    statsTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    statsSubtitle: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 20,
        paddingVertical: 20,
    },
    legendContainer: {
        marginTop: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    legendTextContainer: {
        flex: 1,
    },
    legendLabel: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
    },
    legendValue: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginTop: 2,
    },
    legendPercentage: {
        fontSize: 14,
        fontFamily: 'Sen-Bold',
        color: '#FF7622',
    },
    centerLabel: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalNumber: {
        fontSize: 28,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
    },
    centerLabelText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        marginTop: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
    },
    badgesSection: {
        marginTop: 32,
        marginBottom: 16,
    },
    badgesScrollView: {
        paddingTop: 16,
        paddingHorizontal: 4,
    },
    badgeCard: {
        backgroundColor: '#FFF5F1',
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        width: 160,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
     },
    badgeEmoji: {
        fontSize: 40,
        marginBottom: 12,
    },
    badgeName: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    badgeCount: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#FF7622',
    },
    emptyBadgesContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginTop: 16,
    },
    emptyBadgesText: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
        textAlign: 'center',
        marginTop: 12,
        maxWidth: '80%',
    },
    pointsSection: {
        marginTop: 30,
        marginBottom: 32,
    },
    pointsCard: {
        backgroundColor: '#FFF5F1',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    pointsTotal: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    pointsDetails: {
        gap: 12,
    },
    pointsDetailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsDetailLabel: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#64748B',
    },
    pointsDetailValue: {
        fontSize: 14,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
    },
});