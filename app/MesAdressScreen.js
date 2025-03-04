import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MesAdressScreen() {
    const [coordonnes, setCoordonnes] = useState({
        latitude: 36.82783670051698, //36.793674,
        longitude: 10.137857038377689,//10.159424,
        latitudeDelta: 0.5, // Zoom réduit
        longitudeDelta: 0.5, // Zoom réduit
    });

    const [adresse, setAdresse] = useState("Chargement de l'adresse...");

    const getAdresseFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`,
                {
                    headers: {
                        'User-Agent': 'VotreNomDeProjet/1.0 (votre@email.com)',
                    },
                }
            );
//            console.log(response.data);

        } catch (error) {
            console.error('Erreur:', error);
            setAdresse("Erreur lors de la récupération de l'adresse");
        }
    };

    useEffect(() => {
        getAdresseFromCoordinates(coordonnes.latitude, coordonnes.longitude);
    }, [coordonnes]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Titre de l'écran */}
            <Text style={styles.title}>Mes Adresses</Text>
            {/* Carte */}
            <MapView
                style={styles.map}
                initialRegion={coordonnes}
                region={coordonnes}
            >
                {/* Marqueur pour afficher l'emplacement */}
                <Marker
                    coordinate={{
                        latitude: coordonnes.latitude,
                        longitude: coordonnes.longitude,
                    }}
                    title="Mon Emplacement"
                    description="Ceci est mon emplacement actuel"
                />
            </MapView>
            <Text style={styles.adresse}>{adresse}</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
    },
    map: {
        width: '100%',
        height: 300, // Hauteur fixe
    },
    adresse: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 8,
    },
});