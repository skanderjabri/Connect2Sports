import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

const BottomTabNavigation = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.bottomNav}>
                {/* Grille */}
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => router.push("/ListFavorisScreen")}
                >
                    <Ionicons name="grid-outline" size={24} color="#666" />
                </TouchableOpacity>

                {/* Menu */}
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => router.push("/LoginScreen")}
                >
                    <Ionicons name="menu-outline" size={24} color="#666" />
                </TouchableOpacity>

                {/* Home - Button principal */}
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => router.push("/SplashScreen")}
                >
                    <View style={styles.homeButtonInner}>
                        <Ionicons name="home-outline" size={28} color="white" />
                    </View>
                </TouchableOpacity>

                {/* Notifications */}
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => router.push("/ListNotificationScreen")}
                >
                    <Ionicons name="notifications-outline" size={24} color="#666" />
                </TouchableOpacity>

                {/* Profil */}
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => router.push("/MenuScreen")}
                >
                    <Ionicons name="person-outline" size={24} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        height: 70,
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    tabButton: {
        flex: 1,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -30, // Dépassement vers le haut
    },
    homeButtonInner: {
        backgroundColor: '#FF8C00',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});

export default BottomTabNavigation;