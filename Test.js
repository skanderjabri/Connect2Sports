import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

const ConfirmationSalle = () => {
    const router = useRouter();
    const { SalleID } = useLocalSearchParams();

    const handleConfirmation = () => {
        Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Félicitations',
            textBody: 'Votre participation a été confirmée avec succès!',
        });
        setTimeout(() => router.back(), 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <FontAwesome name="arrow-left" size={24} color="#1a1a1a" />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="handshake-o" size={60} color="#FF8C00" />
                </View>

                <Text style={styles.title}>Rejoignez-nous!</Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                        <FontAwesome name="check-circle" size={24} color="#4CAF50" />
                        <Text style={styles.infoText}>Accès à tous les équipements</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <FontAwesome name="users" size={24} color="#FF8C00" />
                        <Text style={styles.infoText}>Communauté active et dynamique</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <FontAwesome name="trophy" size={24} color="#FFD700" />
                        <Text style={styles.infoText}>Atteignez vos objectifs avec nous</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmation}
                >
                    <Text style={styles.confirmButtonText}>Confirmer ma participation</Text>
                    <FontAwesome name="check" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    backButton: {
        padding: 15,
    },
    content: {
        flex: 1,
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
        fontSize: 28,
        fontFamily: "Sen-Bold",
        color: '#1a1a1a',
        marginBottom: 30,
        textAlign: 'center',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 40,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
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
    },
    infoText: {
        fontSize: 16,
        fontFamily: "Sen-Regular",
        color: '#1a1a1a',
        marginLeft: 15,
        flex: 1,
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
});

export default ConfirmationSalle;
