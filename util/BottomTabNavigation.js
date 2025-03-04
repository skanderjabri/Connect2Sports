import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

const BottomTabNavigation = ({ unreadMessages, unreadNotifications }) => {
    const router = useRouter();
    
  
    return (
        <View style={styles.container}>
            <View style={styles.bottomNav}>
                {/* Grille */}
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => router.push("/CommunityScreen")}
                >
                    <Ionicons name="people-outline" size={29} color="#666" />
                </TouchableOpacity>

                {/* Chat avec badge */}
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => router.push("/ChatScreen")}
                >
                    <View>
                        <Ionicons name="chatbubbles-outline" size={24} color="#666" />
                        {unreadMessages > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadMessages}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Home - Button principal */}
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => router.push("/EvenementScreen")}
                >
                    <View style={styles.homeButtonInner}>
                        <Ionicons name="trophy-outline" size={28} color="white" />
                    </View>
                </TouchableOpacity>

                {/* Notifications avec badge */}
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => router.push("/ListNotificationScreen")}
                >
                    <View>
                        <Ionicons name="notifications-outline" size={24} color="#666" />
                        {unreadNotifications > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadNotifications}</Text>
                            </View>
                        )}
                    </View>
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
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    badge: {
        position: 'absolute',
        right: -6,
        top: -6,
        backgroundColor: '#FF8C00',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default BottomTabNavigation;
