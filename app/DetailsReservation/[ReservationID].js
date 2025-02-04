import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Dimensions,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
    Linking
} from "react-native";
import { AntDesign, FontAwesome5, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import GetSingleReservationApi from "../../api/GetSingleReservationApi";

const { width } = Dimensions.get('window');

export default function DetailsReservation() {
    const router = useRouter();
    const { ReservationID } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState(null);

    useEffect(() => {
        fetchReservation();
    }, [ReservationID]);

    const fetchReservation = async () => {
        try {
            const response = await GetSingleReservationApi(ReservationID);
            setReservation(response.reservation);
            setLoading(false);
        } catch (error) {
            console.log("Erreur " + error);
            setLoading(false);
        }
    };

    const handleQRCodePress = () => {
        const reservationUrl = `http://localhost:3000/reservations/${reservation._id}`;
        Linking.openURL(reservationUrl);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            </SafeAreaView>
        );
    }

    if (!reservation) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <AntDesign name="frowno" size={80} color="#A0AEC0" />
                    <Text style={styles.emptyTitle}>Réservation Introuvable</Text>
                    <Text style={styles.emptyText}>
                        Nous n'avons pas pu trouver les détails de votre réservation.
                        Veuillez contacter notre support si le problème persiste.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

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
                <Text style={styles.headerTitle}>Détails de Réservation</Text>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Salle Information Card */}
                <View style={styles.salleCard}>
                    <Image
                        source={{ uri: reservation.salle.photos[0] }}
                        style={styles.salleImage}
                    />
                    <View style={styles.salleDetails}>
                        <Text style={styles.salleName}>{reservation.salle.nom}</Text>
                        <View style={styles.salleInfoRow}>
                            <Ionicons name="location-outline" size={18} color="#FF7622" />
                            <Text style={styles.salleInfoText}>{reservation.salle.adresse}</Text>
                        </View>
                    </View>
                </View>

                {/* Reservation Details */}
                <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Informations de Réservation</Text>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIconLabel}>
                            <Feather name="calendar" size={18} color="#FF7622" />
                            <Text style={styles.detailLabel}>Date de Réservation</Text>
                        </View>
                        <Text style={styles.detailValue}>
                            {new Date(reservation.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIconLabel}>
                            <MaterialIcons name="confirmation-number" size={18} color="#FF7622" />
                            <Text style={styles.detailLabel}>Numéro de Réservation</Text>
                        </View>
                        <Text style={styles.detailValue}>
                            {reservation._id.slice(-8).toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* QR Code Section with Offer */}
                <TouchableOpacity
                    style={styles.qrCodeContainer}
                    onPress={handleQRCodePress}
                >
                    <View style={styles.qrCodeHeader}>
                        <MaterialIcons name="qr-code" size={24} color="#FF7622" />
                        <Text style={styles.qrCodeTitle}>Code de Réservation</Text>
                    </View>

                    <QRCode
                        value={`http://localhost:3000/reservations/${reservation._id}`}
                        size={200}
                        color="#000"
                        backgroundColor="white"
                    />

                    <View style={styles.offerBanner}>
                        <FontAwesome5 name="gift" size={20} color="white" />
                        <Text style={styles.offerText}>
                            Scannez ce code et obtenez 10% de réduction pour votre première réservation !
                        </Text>
                    </View>

                    <Text style={styles.qrCodeSubtitle}>
                        Présentez ce code au responsable de la salle
                    </Text>
                </TouchableOpacity>

                {/* Additional Information */}
                <View style={styles.additionalInfoSection}>
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle-outline" size={24} color="#FF7622" />
                        <Text style={styles.infoText}>
                            Ce code QR est unique et personnel. Il contient toutes les informations de votre réservation.
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="security" size={24} color="#FF7622" />
                        <Text style={styles.infoText}>
                            Votre code est sécurisé et ne peut être utilisé qu'une seule fois.
                        </Text>
                    </View>
                </View>
            </ScrollView>
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
        backgroundColor: '#F7F9FC',
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
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    salleCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    salleImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 15,
    },
    salleDetails: {
        flex: 1,
    },
    salleName: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        marginBottom: 6,
        color: '#2D3748',
    },
    salleInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    salleInfoText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#718096',
        fontFamily: "Sen-Regular"
    },
    detailsSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        marginBottom: 10,
        color: '#2D3748',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F4F5F7',
    },
    detailIconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#718096',
        marginLeft: 10,
        fontFamily: "Sen-Medium"
    },
    detailValue: {
        fontSize: 14,
        fontFamily: 'Sen-SemiBold',
        color: '#2D3748',
    },
    qrCodeContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    qrCodeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    qrCodeTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        marginLeft: 10,
        color: '#2D3748',
    },
    qrCodeSubtitle: {
        marginTop: 18,
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        fontFamily: "Sen-Regular"
    },
    offerBanner: {
        flexDirection: 'row',
        backgroundColor: '#FF7622',
        borderRadius: 10,
        padding: 10,
        marginTop: 15,
        alignItems: 'center',
    },
    offerText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Sen-SemiBold',
        marginLeft: 10,
        flex: 1,
    },
    additionalInfoSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#718096',
        marginLeft: 10,
        flex: 1,
        fontFamily: 'Sen-Regular'
    },
});