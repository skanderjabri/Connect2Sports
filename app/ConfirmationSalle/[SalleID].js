import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { getUserData } from "../../util/StorageUtils";
import AddReservationSalleApi from '../../api/AddReservationSalleApi';

const ConfirmationSalle = () => {
    const router = useRouter();
    const { SalleID } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);


    const handleConfirmation = async () => {
        try {
            setLoading(true); // Indiquer que le chargement est en cours
            const data = await getUserData();
            const user = data.user._id;

            const response = await AddReservationSalleApi(user, SalleID);
            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Félicitations',
                    textBody: 'Votre participation a été confirmée avec succès!',
                });

                //  setTimeout(() => router.back(), 2000); // Retour à l'écran précédent après 2s
                return;
            }

            if (response.message == "reservation existe") {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Réservation existante',
                    textBody: 'Vous avez déjà une réservation pour cette salle.',
                });
                return;
            }

            // Si une autre erreur survient
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur est survenue lors de la réservation. Veuillez réessayer.',
            });

        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Une erreur inattendue est survenue.',
            });
            console.error("Erreur de réservation :", error);
        } finally {
            setLoading(false); // Réactiver le bouton après la requête
        }
    };



    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"}
                    backgroundColor={Platform.OS === "android" ? "transparent" : "transparent"}
                    translucent
                />
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <AntDesign name="left" size={14} color="#181C2E" style={{ fontFamily: "Sen-Medium" }} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Confirmation de Réservation</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="handshake-o" size={60} color="#FF8C00" />
                    </View>

                    <Text style={styles.title}>Vous êtes à un pas de rejoindre notre salle de sport !</Text>

                    <View style={styles.promotionBanner}>
                        <Text style={styles.promotionText}>
                            🎉 Profitez de -10% sur votre premier mois d'abonnement ! 🏋️‍♀️
                        </Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.sectionDescription}>
                            En confirmant votre réservation, vous accédez à une expérience sportive unique avec des équipements de pointe et un accompagnement personnalisé.
                        </Text>

                        <View style={styles.infoItem}>
                            <FontAwesome name="check-circle" size={24} color="#4CAF50" />
                            <Text style={styles.infoText}>
                                Accès illimité à tous les équipements high-tech, disponibles 24/7.
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <FontAwesome name="users" size={24} color="#FF8C00" />
                            <Text style={styles.infoText}>
                                Intégrez une communauté sportive bienveillante et motivante.
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <FontAwesome name="trophy" size={24} color="#FFD700" />
                            <Text style={styles.infoText}>
                                Programme d'entraînement personnalisé pour maximiser vos résultats.
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <FontAwesome name="clock-o" size={24} color="#1E90FF" />
                            <Text style={styles.infoText}>
                                Réservation flexible : modifiez ou annulez à tout moment.
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            loading && {
                                backgroundColor: '#CCCCCC', shadowOpacity: 0.1, width: '80%',
                                justifyContent: "center",
                                alignSelf: 'center',
                                alignItems: "center"
                            }
                        ]}
                        onPress={handleConfirmation}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" style={styles.loader} />
                        ) : (
                            <>
                                <Text style={styles.confirmButtonText}>Confirmer ma réservation</Text>
                                <FontAwesome name="check" size={24} color="#FFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView >
        </AlertNotificationRoot>
    );
};

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
    content: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    title: {
        fontSize: 24,
        fontFamily: "Sen-Bold",
        color: '#1a1a1a',
        marginBottom: 20,
        textAlign: 'center',
    },
    promotionBanner: {
        backgroundColor: '#FFF3E0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    promotionText: {
        fontFamily: "Sen-Bold",
        color: '#FF8C00',
        fontSize: 16,
        textAlign: 'center',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 20,
    },
    sectionDescription: {
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
        marginTop: 10,
    },
    infoText: {
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#1a1a1a',
        marginLeft: 14,
        flex: 1,
    },
    noteText: {
        fontSize: 14,
        fontFamily: "Sen-Regular",
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF8C00',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 15,
        gap: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: "Sen-Bold",
    },
    loader: {


    }

});

export default ConfirmationSalle;