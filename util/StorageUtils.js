// storageUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fonction pour récupérer les données de l'utilisateur
export const getUserData = async () => {
    try {
        // Récupérer les chaînes JSON de l'utilisateur et de la localisation
        const userString = await AsyncStorage.getItem('user');
        const locationString = await AsyncStorage.getItem('LocationUser');

        // Convertir les chaînes JSON en objets JavaScript
        const userData = userString ? JSON.parse(userString) : null;
        const locationData = locationString ? JSON.parse(locationString) : null;

        // Retourner un objet contenant les deux ensembles de données
        return {
            user: userData,
            location: locationData
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des données de l'utilisateur :", error);
        return null;
    }
};

export const removeUserData = async () => {
    try {
        await AsyncStorage.removeItem('user');
       // await AsyncStorage.removeItem('LocationUser');
        
        // Supprime l'objet utilisateur
    } catch (error) {
        console.error("Erreur lors de la suppression des données utilisateur :", error);
    }
};
