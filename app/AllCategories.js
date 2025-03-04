import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    StatusBar,
    Platform,
    SafeAreaView,
    RefreshControl,
    Dimensions,
    Image,
    ImageBackground
} from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import GetAllCategoriesApi from "../api/GetAllCategoriesApi";

const { width } = Dimensions.get('window');

export default function AllCategories() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        setLoading(true);
        return GetAllCategoriesApi()
            .then((response) => {
                setCategories(response.categories);
                setLoading(false);
            })
            .catch((error) => {
                console.log("Erreur " + error);
                setLoading(false);
            });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCategories().finally(() => setRefreshing(false));
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryCard}
          //  onPress={() => router.push(`/category/${item._id}`)}
        >
            <View style={styles.cardContent}>
                <View style={styles.iconWrapper}>
                    <Text style={styles.categoryIcon}>{item.icon}</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.categoryName}>{item.nom}</Text>
                    <Text style={styles.categoryType}>
                        {item.typeSport === "individuel" ? "Individuel" : "Collectif"}
                    </Text>
                </View>
                <View style={styles.arrowContainer}>
                    <AntDesign name="right" size={18} color="#C4C4C4" />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.promoContainer}>
            <View style={styles.promoCard}>
                <View style={styles.promoContent}>
                    <View style={styles.promoTextContainer}>
                        <Text style={styles.promoTitle}>Partagez votre passion!</Text>
                        <Text style={styles.promoSubtitle}>
                            Invitez un ami à participer à votre prochaine séance et à vivre une expérience inoubliable avec CONNECT2SPORT .
                        </Text>
                        <View style={styles.promoButton}>
                            <Text style={styles.promoButtonText}>Inviter maintenant</Text>
                        </View>
                    </View>
                    <View style={styles.promoBubbleContainer}>
                        <View style={[styles.promoBubble, styles.bubbleYoga]}>
                            <Text style={styles.bubbleIcon}>🧘</Text>
                        </View>
                        <View style={[styles.promoBubble, styles.bubbleFootball]}>
                            <Text style={styles.bubbleIcon}>⚽</Text>
                        </View>
                        <View style={[styles.promoBubble, styles.bubbleTennis]}>
                            <Text style={styles.bubbleIcon}>🎾</Text>
                        </View>
                    </View>
                </View>
            </View>
            <Text style={styles.sectionTitle}>Toutes les catégories</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <AntDesign name="left" size={14} color="#181C2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Catégorie disponible</Text>
            </View>

            {loading ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#FF7622"]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucune catégorie disponible</Text>
                        </View>
                    }
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
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
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    categoryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconWrapper: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryIcon: {
        fontSize: 28,
    },
    textContainer: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 4,
    },
    categoryType: {
        fontSize: 14,
        fontFamily: "Sen-Regular",
        color: '#6C757D',
    },
    arrowContainer: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#6C757D',
        textAlign: 'center',
    },
    // Styles pour la section promotionnelle
    promoContainer: {
        marginBottom: 20,
    },
    promoCard: {
        backgroundColor: '#F9F5FF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E8D5FF',
    },
    promoContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    promoTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    promoTitle: {
        fontSize: 22,
        fontFamily: "Sen-Bold",
        color: '#5D1EB5',
        marginBottom: 8,
    },
    promoSubtitle: {
        fontSize: 14,
        fontFamily: "Sen-Regular",
        color: '#715191',
        lineHeight: 20,
        marginBottom: 16,
    },
    promoButton: {
        backgroundColor: '#FF7622',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    promoButtonText: {
        color: '#FFFFFF',
        fontFamily: "Sen-Bold",
        fontSize: 14,
    },
    promoBubbleContainer: {
        position: 'relative',
        width: 110,
        height: 110,
    },
    promoBubble: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    bubbleYoga: {
        backgroundColor: '#FFEFD5',
        top: 0,
        left: 0,
        zIndex: 3,
    },
    bubbleFootball: {
        backgroundColor: '#DCFCE7',
        top: 20,
        right: 0,
        zIndex: 2,
    },
    bubbleTennis: {
        backgroundColor: '#FEE2E2',
        bottom: 0,
        left: 15,
        zIndex: 1,
    },
    bubbleIcon: {
        fontSize: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Sen-Bold",
        color: '#181C2E',
        marginBottom: 12,
    },
});