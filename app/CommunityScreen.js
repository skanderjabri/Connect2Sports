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
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { getUserData } from '../util/StorageUtils';
import Global from "../util/Global";
import GetAllCommunityApi from "../api/GetAllCommunityApi";
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

export default function CommunityScreen() {
    const router = useRouter();
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCommunity();
    }, []); 

    const fetchCommunity = async () => {
        try {
            const response = await GetAllCommunityApi();
            setCommunities(response.communitys);
        } catch (error) {
            console.log("Erreur " + error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCommunity();
    };

    const renderParticipants = (participants) => {
        const activeParticipants = participants.filter(participant => participant.status === 1);
        const maxDisplay = 5;
        const displayCount = Math.min(activeParticipants.length, maxDisplay);
        const hasMore = activeParticipants.length > maxDisplay;

        if (activeParticipants.length === 0) return null;

        return (
            <View style={styles.avatarContainer}>
                {activeParticipants.slice(0, displayCount).map((participant, index) => (
                    <Image
                        key={participant.userId._id}
                        source={{ uri: `${Global.BaseFile}/${participant.userId.photoProfil}` }}
                        style={[
                            styles.participantAvatar,
                            { marginLeft: index > 0 ? -15 : 0 }
                        ]}
                    />
                ))}
                {hasMore && (
                    <View style={styles.moreAvatarsContainer}>
                        <Text style={styles.moreAvatarsText}>+{activeParticipants.length - maxDisplay}</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderTags = (tags) => {
        const maxTags = 5;
        const displayedTags = tags.slice(0, maxTags);

        return (
            <View style={styles.tagsContainer}>
                {displayedTags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderCommunityItem = ({ item }) => (
        <TouchableOpacity
            style={styles.communityCard}
            onPress={() => router.push(`/DetailsCommunityScreen/${item._id}`)}
        >
            <Image
                source={{ uri: `${Global.BaseFile}/${item.image}` }}
                style={styles.communityImage}
                resizeMode="stretch"

            />
            <View style={styles.communityInfo}>
                <Text style={styles.communityTitle}>{item.title}</Text>
                <Text style={styles.communityDescription} numberOfLines={3}>
                    {item.description}
                </Text>

                {/* Admin Info */}
                <View style={styles.adminContainer}>
                    <View style={styles.adminAvatarContainer}>
                        <Image
                            source={{ uri: `${Global.BaseFile}/${item.adminId.photoProfil}` }}
                            style={styles.adminAvatar}
                        />
                        <View style={styles.adminBadge}>
                            <Feather name="star" size={8} color="#fff" />
                        </View>
                    </View>
                    <View style={styles.adminInfo}>
                        <Text style={styles.adminName}>
                            {item.adminId.prenom} {item.adminId.nom}
                        </Text>
                        <Text style={styles.creationDate}>
                            Créé le {moment(item.createdAt).format('D MMMM YYYY')}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Sport Type, Participants Count, and Avatars */}
                <View style={styles.metaContainer}>
                    <View style={styles.sportTypeContainer}>
                        <Text style={styles.sportTypeIcon}>{item.sportType.icon}</Text>
                        <Text style={styles.sportTypeName}>{item.sportType.nom}</Text>
                    </View>
                    <View style={styles.separator} />
                    <Text style={styles.participantsCount}>
                        {item.participants.filter(participant => participant.status === 1).length}/{item.maxParticipants} Membres
                    </Text>
                    <View style={styles.separator} />
                    {renderParticipants(item.participants)}
                </View>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsSection}>
                        <Text style={styles.tagsLabel}>Tags:</Text>
                        {renderTags(item.tags)}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={60} color="#A0AEC0" />
            </View>
            <Text style={styles.emptyTitle}>Aucune communauté</Text>
            <Text style={styles.emptyText}>
                Aucune communauté n'est disponible pour le moment.
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
                <Text style={styles.headerTitle}>Communautés sportives</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/CreateCommunityScreen')}
                >
                    <MaterialIcons name="group-add" size={24} color="#FF7622" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <FlatList
                    data={communities}
                    renderItem={renderCommunityItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={EmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FF7622"]}
                            tintColor="#FF7622"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
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
        backgroundColor: '#FFF5EE',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
        flex: 1,
        marginLeft: 12,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    communityCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    communityImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    communityInfo: {
        padding: 16,
    },
    communityTitle: {
        fontSize: 20,
        color: '#181C2E',
        fontFamily: "Sen-Bold",
        marginBottom: 8,
    },
    communityDescription: {
        fontSize: 15,
        color: '#718096',
        fontFamily: "Sen-Regular",
        marginBottom: 16,
        lineHeight: 20,
    },
    adminContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    adminAvatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    adminAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FF7622',
    },
    adminBadge: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#FF7622',
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    adminInfo: {
        flex: 1,
    },
    adminName: {
        fontSize: 15,
        color: '#2D3748',
        fontFamily: "Sen-Bold",
        textTransform: 'capitalize'
    },
    creationDate: {
        fontSize: 13,
        color: '#718096',
        fontFamily: "Sen-Regular",
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 16,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sportTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    sportTypeIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    sportTypeName: {
        fontSize: 14,
        color: '#2D3748',
        fontFamily: "Sen-Bold",
    },
    participantsCount: {
        fontSize: 14,
        color: '#718096',
        fontFamily: "Sen-Regular",
        backgroundColor: '#F7FAFC',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    separator: {
        width: 1,
        height: 24,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 8,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    participantAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#fff',
    },
    moreAvatarsContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F4F5F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -15,
        borderWidth: 2,
        borderColor: '#fff',
    },
    moreAvatarsText: {
        fontSize: 12,
        color: '#718096',
        fontFamily: "Sen-Bold",
    },
    tagsSection: {
        marginTop: 12,
    },
    tagsLabel: {
        fontSize: 14,
        color: '#2D3748',
        fontFamily: "Sen-Bold",
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#718096',
        fontFamily: "Sen-Regular",
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