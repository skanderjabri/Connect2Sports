import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';

const index = () => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkLocationUser = async () => {
            try {
                // Récupérer les données depuis AsyncStorage
                const locationUser = await AsyncStorage.getItem("LocationUser");
                const userinformation = await AsyncStorage.getItem("user");

                // Vérifier les conditions
                if (locationUser && userinformation) {
                    // Si locationUser ET userinformation existent, naviguer vers HomeScreen
                    router.replace("HomeScren");
                } else if (locationUser) {
                    // Si seulement locationUser existe, naviguer vers LoginScreen
                    router.replace("LoginScreen");
                } else {
                    // Si ni locationUser ni userinformation n'existent, naviguer vers SplashScreen
                    router.replace("SplashScreen");
                }
            } catch (error) {
                console.error("Erreur lors de la vérification des données:", error);
                router.replace("SplashScreen"); // En cas d'erreur, naviguer vers SplashScreen
            } finally {
                setIsLoading(false); // Arrêter le chargement
            }
        };
        checkLocationUser();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FF7622" />
            </View>
        );
    }

    return null;
};

export default index;