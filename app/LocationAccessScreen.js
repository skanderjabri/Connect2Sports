import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationAccessScreen = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const handleLocationPermission = useCallback(async () => {
        try {
            setIsLoading(true);
            setLocationError(null);

            // Vérifier les permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Permission de localisation refusée');
                Alert.alert(
                    'Permission refusée',
                    'Vous devez autoriser l\'accès à la localisation pour utiliser toutes les fonctionnalités.'
                );
                return false;
            }

            // Obtenir la position
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            // Obtenir l'adresse
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });

            if (reverseGeocode.length > 0) {
                const locationData = {
                    coords: position.coords,
                    address: reverseGeocode[0],
                    timestamp: new Date().toISOString()
                };

                // Sauvegarder dans AsyncStorage
                await AsyncStorage.setItem('LocationUser', JSON.stringify(locationData));
                // Rediriger vers la page suivante
                router.replace('/LoginScreen');
                return true;
            }

            return false;
        } catch (error) {
            const adress = {
                address: {
                    city: "Tunis",
                    country: "Tunisie",
                    district: "Cité An-Najah",
                    formattedAddress: "153 Rue 4164, Tunis, Tunisie",
                    isoCountryCode: "TN",
                    name: "153",
                    postalCode: null,
                    region: "Tunis",
                    street: "Rue 4164",
                    streetNumber: "153",
                    subregion: "Sijoumi",
                    timezone: null
                },
                coords: {
                    accuracy: 16.658000946044922,
                    altitude: 56.79999923706055,
                    altitudeAccuracy: 7.021490573883057,
                    heading: 0,
                    latitude: 36.7935755,
                    longitude: 10.1592889,
                    speed: 0
                },
                timestamp: "2025-02-02T23:40:16.038Z"
            };

            //console.error('Erreur de localisation:', error);
            await AsyncStorage.setItem('LocationUser', JSON.stringify(adress));
            router.replace('/LoginScreen');
            return true;



            //  setLocationError(error.message);
            /* Alert.alert(
                 'Erreur',
                 'Impossible d\'obtenir votre localisation. Veuillez réessayer.'
             );
             return false;
             */
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('.././assets/images/locale.png')}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.description}>
                    SPORT2CONNECT n'accédera à votre localisation que lorsque vous utilisez l'application.
                </Text>
                {/* BESH NA7EHAA BA3EED  */}
                {locationError && (
                    <Text style={styles.errorText}>{locationError}</Text>
                )}

                <TouchableOpacity
                    style={[
                        styles.button,
                        (isLoading || locationError) && styles.buttonDisabled
                    ]}
                    onPress={handleLocationPermission}
                    disabled={isLoading}
                >
                    <View style={styles.buttonContent}>
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" style={styles.loader} />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>
                                    ACCÉDER À LA LOCALISATION
                                </Text>
                                <Ionicons
                                    name="location-outline"
                                    size={24}
                                    color="#FFFFFF"
                                    style={styles.iconButton}
                                />
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: -50,
    },
    imageContainer: {
        width: '100%',
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    icon: {
        width: 217,
        height: 273,
    },
    button: {
        width: '100%',
        height: 62,
        backgroundColor: '#FF9F43',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 25,
        marginTop: 100,
    },
    buttonDisabled: {
        backgroundColor: '#CCCCCC',
        shadowOpacity: 0.1,
    },
    buttonContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginRight: 10,
        fontFamily: 'Sen-Bold',
    },
    iconButton: {
        marginLeft: 5,
    },
    description: {
        fontSize: 18,
        color: '#646982',
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: 10,
        maxWidth: 350,
        fontFamily: 'Sen-Regular',
        marginTop: 30
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        fontFamily: 'Sen-Regular',
    },
    loader: {
        marginRight: 10,
    }
});

export default LocationAccessScreen;