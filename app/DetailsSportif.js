import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const DetailsSportif = () => {
    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails sportif</Text>
            </View>

            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={{
                        uri: "https://www.lesnatchfrancais.com/cdn/shop/articles/image3_062baae9-25d8-4ef4-a8e5-c1647abef668.png", // Remplacez par votre image
                    }}
                    style={styles.profileImage}
                />
                <View style={styles.professionalBadge}>
                    <Text style={styles.badgeText}>Professionnel</Text>
                </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
                <Text style={styles.name}>Mohamed Bousselmi</Text>
                <Text style={styles.location}>
                    <MaterialIcons name="location-on" size={16} color="#666" /> Tunis, Kef
                </Text>
                <View style={styles.ratingSection}>
                    <MaterialIcons name="star" size={16} color="#F4B400" />
                    <Text style={styles.rating}>4.9</Text>
                    <Text style={styles.reviews}>(10 Avis)</Text>
                </View>
            </View>

            {/* Sports Practiced Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sports pratiqués</Text>
                <View style={styles.sportsContainer}>
                    {[
                        { name: "Football", icon: "soccer" },
                        { name: "Tennis", icon: "tennis" },
                        { name: "Fitness", icon: "dumbbell" },
                        { name: "Course À Pied", icon: "run" },
                    ].map((sport, index) => (
                        <View key={index} style={styles.sportItem}>
                            <MaterialCommunityIcons
                                name={sport.icon}
                                size={40}
                                color="#36688D"
                            />
                            <Text style={styles.sportName}>{sport.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Preferred Locations */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lieux préférés</Text>
                <Text style={styles.sectionText}>
                    Salle Omnisports La Marsa, Soccer Club - SC1, Lac
                </Text>
            </View>

            {/* Availability Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Disponibilités</Text>
                <View style={styles.availabilityContainer}>
                    <Text style={styles.availability}>Lundi 18h-20h</Text>
                    <Text style={styles.availability}>Mercredi 18h-20h</Text>
                </View>
            </View>

            {/* Description Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionText}>
                    Mohamed Bousselmi est un athlète polyvalent, passionné par le tennis et le football. Avec
                    son énergie et son esprit d'équipe, il excelle sur les terrains tout en inspirant ses
                    coéquipiers.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
    imageContainer: {
        position: "relative",
    },
    profileImage: {
        width: "100%",
        height: 200,
        borderRadius: 12,
    },
    professionalBadge: {
        position: "absolute",
        bottom: 10,
        left: 10,
        backgroundColor: "#666",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
    },
    infoSection: {
        marginVertical: 10,
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    location: {
        fontSize: 14,
        color: "#666",
        marginVertical: 5,
    },
    ratingSection: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5,
    },
    rating: {
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 5,
    },
    reviews: {
        fontSize: 14,
        color: "#666",
        marginLeft: 5,
    },
    section: {
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    sportsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    sportItem: {
        alignItems: "center",
        marginRight: 15,
        marginBottom: 10,
    },
    sportName: {
        fontSize: 12,
        marginTop: 5,
    },
    sectionText: {
        fontSize: 14,
        color: "#666",
    },
    availabilityContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    availability: {
        backgroundColor: "#edf2fb",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 10,
        marginBottom: 10,
        fontSize: 14,
        color: "#333",
    },
});

export default DetailsSportif;
