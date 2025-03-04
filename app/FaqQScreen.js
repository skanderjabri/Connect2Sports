import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
    StyleSheet,
    Dimensions,
    RefreshControl,
    Animated
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const FaqQScreen = () => {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const router = useRouter();

    const faqData = [
        {
            icon: "create-outline",
            question: "Comment créer un compte ?",
            answer: "Pour créer un compte, allez sur la page d'inscription, remplissez le formulaire et validez votre adresse e-mail."
        },
        {
            icon: "calendar-outline",
            question: "Comment participer à un événement ?",
            answer: "Accédez à la page des événements, choisissez un événement et cliquez sur 'Participer'. Vous recevrez une confirmation par e-mail."
        },
        {
            icon: "help-buoy-outline",
            question: "Comment contacter le support ?",
            answer: "Vous pouvez nous contacter via le formulaire de contact dans la section 'Contactez-nous' ou envoyer un e-mail à connectsport986@gmail.com ."
        },
        {
            icon: "key-outline",
            question: "Comment récupérer mon mot de passe ?",
            answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion et suivez les instructions pour réinitialiser votre mot de passe."
        },
        {
            icon: "trophy-outline",
            question: "Comment gagner des points ?",
            answer: "Vous gagnez des points en participant à des événements, en invitant des amis et en complétant des défis."
        }
    ];

    // Initialisez animations après la déclaration de faqData
    const [animations] = useState(() => faqData.map(() => new Animated.Value(0)));

    const toggleQuestion = (index) => {
        // Animation de rotation pour l'icône
        Animated.timing(animations[index], {
            toValue: expandedIndex === index ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />

            {/* Header amélioré */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <AntDesign name="left" size={20} color="#FF7622" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Foire aux questions</Text>
            </View>

            {/* Texte d'introduction */}
            <View style={styles.introContainer}>
                <Text style={styles.introTitle}>Comment pouvons-nous vous aider ?</Text>
                <Text style={styles.introText}>Consultez nos questions fréquemment posées ci-dessous</Text>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {faqData.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.faqItem,
                            expandedIndex === index && styles.faqItemExpanded
                        ]}
                        onPress={() => toggleQuestion(index)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.questionRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon} size={20} color="#FF7622" />
                            </View>
                            <View style={styles.questionContent}>
                                <Text style={styles.question}>{item.question}</Text>
                                <Animated.View style={{
                                    transform: [{
                                        rotate: animations[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '180deg']
                                        })
                                    }]
                                }}>
                                    <AntDesign
                                        name="down"
                                        size={16}
                                        color="#A0A0A0"
                                    />
                                </Animated.View>
                            </View>
                        </View>

                        {expandedIndex === index && (
                            <View style={styles.answerContainer}>
                                <Text style={styles.answer}>{item.answer}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Espace supplémentaire en bas */}
                <View style={styles.bottomSpace} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingVertical: 20,
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginLeft: 16,
    },
    introContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    introTitle: {
        fontSize: 24,
        fontFamily: 'Sen-Bold',
        color: '#32343E',
        marginBottom: 8,
    },
    introText: {
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#747783',
    },
    scrollContainer: {
        paddingHorizontal: 16,
    },
    faqItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    faqItemExpanded: {
        backgroundColor: '#FFF5F1',
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFE5D8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    questionContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    question: {
        flex: 1,
        fontSize: 16,
        fontFamily: "Sen-Bold",
        color: '#32343E',
        marginRight: 12,
    },
    answerContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#FFE5D8',
        marginLeft: 52,
    },
    answer: {
        fontSize: 15,
        fontFamily: "Sen-Regular",
        color: '#747783',
        lineHeight: 24,
    },
    bottomSpace: {
        height: 40,
    }
});

export default FaqQScreen;