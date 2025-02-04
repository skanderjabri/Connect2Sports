import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Global from "../util/Global";
import { getUserData } from "../util/StorageUtils";

export default function MenuScreen() {
    const [userDataStorage, setUserDataStorage] = useState(null);
    const [progressVisible, setProgressVisible] = useState(true);

    const router = useRouter();



    useEffect(() => {
        Promise.all([fetchUserData()])
            .then(() => setProgressVisible(false))
            .catch((error) =>
                console.log("Erreur lors du chargement des données: " + error)
            );
    }, []);


    const fetchUserData = async () => {
        const data = await getUserData(); // Appel de la fonction externe
        // console.log(data)
        setUserDataStorage(data.user);
    };

    const menuItems = [
        {
            id: 1,
            section: 1,
            title: 'Informations personnelles',
            icon: 'person-outline',
            color: '#FF6B6B',
            link: "/DetailsProfilScreen"
        },
        {
            id: 2,
            section: 1,
            title: 'Adresses',
            icon: 'location-outline',
            color: '#4263EB',
            link: "/MesAdressScreen"

        },
        {
            id: 11,
            section: 2,
            title: 'Mes réservations',
            icon: 'barbell',
            color: '#51CF66',
            link: "/MesReservationsSalles"

        },
        {
            id: 3,
            section: 2,
            title: 'Favoris',
            icon: 'heart-outline',
            color: '#4263EB',
            link: "/ListFavorisScreen"

        },
        {
            id: 4,
            section: 2,
            title: 'Statistiques et Performances',
            icon: 'stats-chart',
            color: '#4263EB',
            hideArrow: true,
            link: "/DetailsProfilScreen"

        },
        {
            id: 5,
            section: 2,
            title: 'Notifications',
            icon: 'notifications-outline',
            color: '#FFB84D',
            link: "/DetailsProfilScreen"

        },
        {
            id: 6,
            section: 2,
            title: 'Mes Rencontres',
            icon: 'people-outline',
            color: '#4263EB',
            link: "/DetailsProfilScreen"

        },
        {
            id: 7,
            section: 3,
            title: 'FAQ',
            icon: 'help-circle-outline',
            color: '#FF6B6B',
            link: "/DetailsProfilScreen"

        },
        {
            id: 8,
            section: 3,
            title: 'Avis des utilisateurs',
            icon: 'star-outline',
            color: '#51CF66',
            link: "/DetailsProfilScreen"

        },
        {
            id: 9,
            section: 3,
            title: 'Paramètres',
            icon: 'settings-outline',
            color: '#4263EB',
            link: "/DetailsProfilScreen"

        },
        {
            id: 10,
            section: 4,
            title: 'Se déconnecter',
            icon: 'log-out-outline',
            color: '#FF6B6B',
            link: "/DetailsProfilScreen"

        }
    ];

    const MenuItem = ({ item }) => (
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push(item.link)} >
            <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            {!item.hideArrow && (
                <Ionicons name="chevron-forward" size={20} color="#C8C8C8" />
            )}
        </TouchableOpacity>
    );

    const renderSection = (sectionItems) => (
        <View style={styles.section}>
            {sectionItems.map(item => (
                <MenuItem key={item.id} item={item} />
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <AntDesign name="left" size={14} color="#181C2E" style={{ fontFamily: "Sen-Medium" }} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profil</Text>
                </View>

                {userDataStorage && (
                    <View style={styles.profileInfo}>
                        <Image
                            source={{ uri: Global.BaseFile + userDataStorage.photoProfil }}
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                        <View style={styles.profileTextContainer}>
                            <Text style={styles.profileName}>{userDataStorage.nom} {userDataStorage.prenom}</Text>
                            <Text style={styles.profileRole}>{userDataStorage.pseudo}</Text>
                        </View>
                    </View>
                )}

                {/* Menu Sections */}
                {renderSection(menuItems.filter(item => item.section === 1))}
                {renderSection(menuItems.filter(item => item.section === 2))}
                {renderSection(menuItems.filter(item => item.section === 3))}
                {renderSection(menuItems.filter(item => item.section === 4))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,

    },
    scrollView: {
        flex: 1,
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

    profileInfo: {
        flexDirection: 'row', // Aligner horizontalement
        alignItems: 'center', // Centrer verticalement
        paddingVertical: 20,
        paddingHorizontal: 20, // Ajouter un padding pour l'espacement
    },

    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 15, // Ajouter de l’espace entre l’image et le texte
    },

    profileTextContainer: {
        flex: 1, // Permet au texte d'occuper tout l'espace disponible
    },

    profileName: {
        fontSize: 21,
        marginBottom: 3,
        fontFamily: 'Sen-Bold',
        color: '#32343E',
        textTransform: "capitalize"
    },

    profileRole: {
        fontSize: 15,
        fontFamily: 'Sen-Regular',
        color: '#A0A5BA',
        marginTop: 5,

    }, section: {
        backgroundColor: '#F6F8FA',
        borderRadius: 15,
        marginHorizontal: 20,
        marginBottom: 15,
        paddingVertical: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    menuItemText: {
        fontSize: 17,
        color: '#32343E',
        fontFamily: "Sen-Regular"
    },
});