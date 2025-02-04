import React, { useEffect, useRef } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Animated,
    Dimensions,
    Image,
    Platform,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(0)).current;
    const scaleCircle = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.sequence([
                Animated.timing(scaleCircle, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(slideUp, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(fadeIn, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 8000,
                        useNativeDriver: true,
                    }),
                ])
            ),
        ]).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"} // Texte foncé sur iOS, clair sur Android
                backgroundColor={Platform.OS === "android" ? "transparent" : "transparent"} // Bleu sur Android, transparent sur iOS
                translucent
            />
            <LinearGradient
                colors={['#FF9F43', '#FF8A30']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Animated Background Elements */}
            <View style={styles.decorativeContainer}>
                <Animated.View style={[styles.floatingCircle, {
                    transform: [{ rotate: spin }]
                }]} />
                <Animated.View style={[styles.floatingCircle2, {
                    transform: [{ rotate: spin }]
                }]} />
                <View style={styles.glassEffect} />
            </View>

            {/* Main Content */}
            <Animated.View style={[
                styles.mainContent,
                {
                    opacity: fadeIn,
                    transform: [{
                        translateY: slideUp.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                        })
                    }]
                }
            ]}>
                <Animated.View style={[styles.logoContainer, {
                    transform: [{ scale: scaleCircle }]
                }]}>
                    <Image
                        source={require('.././assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.logoGlow} />
                </Animated.View>

                <Text style={styles.title}>Jouez Ensemble</Text>
                <Text style={styles.subtitle}>
                    Trouvez des partenaires sportifs près de chez vous et partagez votre passion.{'\n'}
                    Connectez-vous, jouez, progressez
                </Text>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/LocationAccessScreen')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#FFFFFF', '#F8F8F8']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.buttonContent}>
                            <Text style={styles.primaryButtonText}>COMMENCER</Text>
                            <Animated.View style={[styles.iconContainer, {
                                transform: [{
                                    translateX: slideUp.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-10, 0],
                                    })
                                }]
                            }]}>
                                <AntDesign name="arrowright" size={24} color="#FF7A00" />
                            </Animated.View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    decorativeContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    floatingCircle: {
        position: 'absolute',
        top: -height * 0.2,
        right: -width * 0.2,
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        borderWidth: 40,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    floatingCircle2: {
        position: 'absolute',
        bottom: -height * 0.3,
        left: -width * 0.3,
        width: width * 1,
        height: width * 1,
        borderRadius: width * 0.5,
        borderWidth: 60,
        borderColor: 'rgba(255, 255, 255, 0.07)',
    },
    glassEffect: {
        position: 'absolute',
        top: height * 0.3,
        left: width * 0.1,
        width: width * 0.8,
        height: width * 0.8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        transform: [{ rotate: '45deg' }],
        opacity: 0.5,
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: width * 0.7,
        height: width * 0.7,
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 15,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    logoGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: width * 0.35,
        backgroundColor: 'transparent',
        shadowColor: '#FF7A00',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    logo: {
        width: '90%',
        height: '80%',
    },
    title: {
        fontSize: 42,
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '800',
        fontFamily: "Sen-Bold",
        marginBottom: 20,
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 19,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 30,
        marginBottom: 40,
        opacity: 0.95,
        fontWeight: '500',
        fontFamily: "Sen-Regular",
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    iconContainer: {
        marginLeft: 8,
        opacity: 0.9,
    },
    primaryButtonText: {
        color: '#FF7A00',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 2,
        fontFamily: "Sen-Bold",
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginRight: 4, // Ajout d'une marge pour l'espacement avec l'icône
    },

    primaryButton: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    buttonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});