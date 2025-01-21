import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FieldList = () => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />

                </TouchableOpacity>
                <Text style={styles.headerTitle}>Liste Terrain</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Effectuer un recherche"
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Field List */}
            <ScrollView style={styles.listContainer}>
                {/* Soccer Club -SC1 */}
                <TouchableOpacity style={styles.fieldCard}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{
                                uri: "https://www.lesnatchfrancais.com/cdn/shop/articles/image3_062baae9-25d8-4ef4-a8e5-c1647abef668.png",
                            }}
                            style={styles.fieldImage}
                            resizeMode="cover"
                        />
                        <View style={styles.imageOverlay}>
                            <TouchableOpacity style={styles.infoButton}>
                                <Ionicons name="information-circle-outline" size={24} color="white" />
                            </TouchableOpacity>
                            <View style={styles.imageTextContainer}>
                                <Text style={styles.imageText}>Soccer Club -SC1</Text>
                            </View>
                            <TouchableOpacity style={styles.heartButton}>
                                <Ionicons name="heart-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <Ionicons name="person-outline" size={16} color="#FF6B6B" />
                                <Text style={styles.detailText}>14 Participants</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="time-outline" size={16} color="#FF6B6B" />
                                <Text style={styles.detailText}>120 min</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="location-outline" size={16} color="#FF6B6B" />
                                <Text style={styles.detailText}>Tunis</Text>
                            </View>
                        </View>
                        <Text style={styles.description}>
                            Chez Soccer Club jouez au football ⚽ toute la journée. 3 terrains ouverts 7j/7⏰ pour pratiquer votre sport préféré ⚽
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Fs Staduim-Inter */}
                <TouchableOpacity style={styles.fieldCard}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{
                                uri: "https://www.lesnatchfrancais.com/cdn/shop/articles/image3_062baae9-25d8-4ef4-a8e5-c1647abef668.png",
                            }}
                            style={styles.fieldImage}
                            resizeMode="cover"
                        />
                        <View style={styles.imageOverlay}>
                            <TouchableOpacity style={styles.infoButton}>
                                <Ionicons name="information-circle-outline" size={24} color="white" />
                            </TouchableOpacity>
                            <View style={styles.imageTextContainer}>
                                <Text style={styles.imageText}>Fs Staduim-Inter</Text>
                            </View>
                            <TouchableOpacity style={styles.heartButton}>
                                <Ionicons name="heart-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <Ionicons name="person-outline" size={16} color="#FF6B6B" />
                                <Text style={styles.detailText}>14 Participants</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="time-outline" size={16} color="#FF6B6B" />
                                <Text style={styles.detailText}>120 min</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="location-outline" size={16} color="#FF6B6B" />
                                <Text style={styles.detailText}>Tunis</Text>
                            </View>
                        </View>
                        <Text style={styles.description}>
                            Chez Staduim-Inter jouez au football ⚽ toute la journée. 3 terrains ouverts 7j/7⏰ pour pratiquer votre sport préféré ⚽
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
    },
    backButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 16,
    },
    searchWrapper: {
        padding: 16,
        backgroundColor: 'white',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    },
    listContainer: {
        padding: 16,
    },
    fieldCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 180,
    },
    fieldImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 12,
    },
    infoButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageTextContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },
    imageText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    heartButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContainer: {
        padding: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#666',
    },
    description: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
});

export default FieldList;