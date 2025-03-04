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
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getUserData } from "../util/StorageUtils";
import { useRouter } from "expo-router";
import GetMesReviewsApi from "../api/GetMesReviewsApi";

export default function MesReviewsEvent() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [ListeReviewEvents, setListeReviewEvents] = useState([]);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const data = await getUserData();
        const id = data.user._id;
        try {
            const response = await GetMesReviewsApi(id);
            setListeReviewEvents(response.reviews);
        } catch (error) {
            console.log("Erreur lors de la récupération des données: " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchReviews();
    }, []);

    const renderStars = (rating) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <AntDesign
                        key={star}
                        name={star <= rating ? "star" : "staro"}
                        size={20}
                        color={star <= rating ? "#FFD700" : "#BFC9DA"}
                        style={styles.starIcon}
                    />
                ))}
            </View>
        );
    };

    const renderReviewCard = (review) => (
        <View key={review._id} style={styles.reviewCard}>
            <View style={styles.sportTypeContainer}>
                <Text style={styles.sportIcon}>{review.idEvent.idSport.icon}</Text>
                <Text style={styles.sportType}>{review.idEvent.nomSporttype}</Text>
            </View>

            <View style={styles.reviewHeader}>
                <Text style={styles.eventTitle}>{review.idEvent.titre}</Text>
                {renderStars(review.note)}
            </View>

            <View style={styles.organizerContainer}>
                <MaterialIcons name="person-outline" size={20} color="#64748B" />
                <Text style={styles.organizerInfo}>
                    Organisé par {review.idEvent.idOrganisateur.prenom} {review.idEvent.idOrganisateur.nom}
                </Text>
            </View>

            <View style={styles.commentContainer}>
                <Text style={styles.commentText}>{review.commentaire}</Text>
            </View>

            <View style={styles.badgesContainer}>
                {review.badges.map((badge, index) => (
                    <View key={index} style={styles.badgeItem}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.dateContainer}>
                <MaterialIcons name="event" size={14} color="#94A3B8" />
                <Text style={styles.dateText}>
                    {new Date(review.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Text>
            </View>
        </View>
    );

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
                <Text style={styles.headerTitle}>Avis sur mes participations</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FF7622"]}
                        />
                    }
                >
                    {ListeReviewEvents.length > 0 ? (
                        ListeReviewEvents.map(review => renderReviewCard(review))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color="#BFC9DA" />
                            <Text style={styles.emptyText}>
                                Vous n'avez pas encore reçu d'avis sur vos participations
                            </Text>
                        </View>
                    )}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sportTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sportIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    sportType: {
        fontSize: 18,
        color: '#64748B',
        fontFamily: 'Sen-Regular',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        flex: 1,
    },
    starsContainer: {
        flexDirection: 'row',
        marginLeft: 8,
    },
    starIcon: {
        marginHorizontal: 1,
    },
    organizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 6
    },
    organizerInfo: {
        fontSize: 15,
        color: '#64748B',
        marginLeft: 8,
        fontFamily: 'Sen-Regular',

    },
    commentContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    commentText: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 20,
        fontFamily: 'Sen-Regular',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    badgeItem: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    badgeText: {
        fontSize: 15,
        color: '#64748B',
        fontFamily: 'Sen-Regular',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    dateText: {
        fontSize: 15,
        color: '#94A3B8',
        marginLeft: 4,
        fontFamily: 'Sen-Regular',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 16,
        maxWidth: '80%',
        fontFamily: 'Sen-Regular',
    },
});