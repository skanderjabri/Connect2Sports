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
    Animated,
    RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef } from 'react';
import GetAllAvisEventApi from "../../api/GetAllAvisEventApi";
import { AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/fr';
import Global from "../../util/Global";

export default function ListeAvisEvent() {
    const [avis, setAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sortOption, setSortOption] = useState('recent');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const sortMenuAnimation = useRef(new Animated.Value(0)).current;

    const router = useRouter();
    const { id } = useLocalSearchParams();

    useEffect(() => {
        fetchReviewEvent();
    }, []);

    const fetchReviewEvent = async () => {
        try {
            const response = await GetAllAvisEventApi(id);
            setAvis(response.reviews);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchReviewEvent();
    };

    const getSortedReviews = () => {
        const sortedReviews = [...avis];
        switch (sortOption) {
            case 'recent':
                return sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'highestRating':
                return sortedReviews.sort((a, b) => b.note - a.note);
            case 'lowestRating':
                return sortedReviews.sort((a, b) => a.note - b.note);
            default:
                return sortedReviews;
        }
    };

    const toggleSortMenu = () => {
        const toValue = showSortMenu ? 0 : 1;
        setShowSortMenu(!showSortMenu);
        Animated.spring(sortMenuAnimation, {
            toValue,
            useNativeDriver: true,
            friction: 8,
            tension: 70,
        }).start();
    };

    const handleSortOption = (option) => {
        setSortOption(option);
        toggleSortMenu();
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <MaterialIcons name="rate-review" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucun avis pour cet événement</Text>
            <Text style={styles.emptyText}>
                Vous n'avez pas encore reçu de retour de la part des utilisateurs pour cet événement.
            </Text>
        </View>
    );

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.userInfo}>
                <Image
                    source={{
                        uri: Global.BaseFile + item.idParticipant.photoProfil

                    }}
                    style={styles.userImage}
                />
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                        {item.idParticipant.prenom} {item.idParticipant.nom}
                    </Text>
                    <Text style={styles.reviewDate}>
                        {moment(item.createdAt).locale('fr').fromNow()}
                    </Text>
                </View>
            </View>

            <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesome
                        key={star}
                        name={star <= item.note ? "star" : "star-o"}
                        size={16}
                        color={star <= item.note ? "#FFB800" : "#CBD5E1"}
                        style={styles.starIcon}
                    />
                ))}
            </View>

            {item.commentaire && (
                <Text style={styles.reviewText}>
                    {item.commentaire}
                </Text>
            )}

            {item.badges && item.badges.length > 0 && (
                <View style={styles.badgesContainer}>
                    {item.badges.map((badge, index) => (
                        <View key={index} style={styles.badge}>
                            <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                    ))}
                </View>
            )}
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
                    <AntDesign name="left" size={14} color="#181C2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Les avis</Text>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={toggleSortMenu}
                >
                    <MaterialIcons name="sort" size={24} color="#181C2E" />
                </TouchableOpacity>
            </View>
            <Animated.View style={[
                styles.sortMenu,
                {
                    opacity: sortMenuAnimation,
                    transform: [{
                        translateY: sortMenuAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                        })
                    }],
                    display: showSortMenu ? 'flex' : 'none'
                }
            ]}>
                <TouchableOpacity
                    style={[styles.sortOption, sortOption === 'recent' && styles.selectedSort]}
                    onPress={() => handleSortOption('recent')}
                >
                    <Text style={[styles.sortText, sortOption === 'recent' && styles.selectedSortText]}>
                        Plus récents
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sortOption, sortOption === 'oldest' && styles.selectedSort]}
                    onPress={() => handleSortOption('oldest')}
                >
                    <Text style={[styles.sortText, sortOption === 'oldest' && styles.selectedSortText]}>
                        Plus anciens
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sortOption, sortOption === 'highestRating' && styles.selectedSort]}
                    onPress={() => handleSortOption('highestRating')}
                >
                    <Text style={[styles.sortText, sortOption === 'highestRating' && styles.selectedSortText]}>
                        Meilleures notes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sortOption, sortOption === 'lowestRating' && styles.selectedSort]}
                    onPress={() => handleSortOption('lowestRating')}
                >
                    <Text style={[styles.sortText, sortOption === 'lowestRating' && styles.selectedSortText]}>
                        Notes les plus basses
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <View style={styles.content}>
                    {avis.length > 0 ? (
                        <FlatList
                            data={getSortedReviews()}
                            keyExtractor={(item) => item._id}
                            renderItem={renderReviewItem}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={["#FF7622"]}
                                />
                            }
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <EmptyState />
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        zIndex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: '#1E293B',
        fontFamily: 'Sen-Bold',
    },
    sortButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
    },
    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 3,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 30,
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        color: '#1E293B',
        fontFamily: 'Sen-Bold',
        textTransform: 'capitalize',
        marginBottom: 2,
    },
    reviewDate: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Sen-Regular',
    },
    ratingContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    starIcon: {
        marginRight: 4,
    },
    reviewText: {
        fontSize: 14,
        color: '#334155',
        fontFamily: 'Sen-Regular',
        lineHeight: 20,
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    badge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 12,
        color: '#475569',
        fontFamily: 'Sen-Regular',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#F1F5F9',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        color: '#1E293B',
        fontFamily: 'Sen-Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'Sen-Regular',
        textAlign: 'center',
    },
    sortMenu: {
        position: 'absolute',
        top: Platform.OS === "android" ? StatusBar.currentHeight + 70 : 90,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 2,
    },
    sortOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    selectedSort: {
        backgroundColor: '#F1F5F9',
    },
    sortText: {
        fontSize: 14,
        color: '#475569',
        fontFamily: 'Sen-Regular',
    },
    selectedSortText: {
        color: '#FF7622',
        fontFamily: 'Sen-Bold',
    },
});