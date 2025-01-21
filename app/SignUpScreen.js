import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Image,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
const { height, width } = Dimensions.get('window');

// Importez vos images PNG
const Vector142 = require('../assets/images/Vector142.png'); // Remplacez par le chemin correct
const Ellipse1005 = require('../assets/images/Ellipse1006.png'); // Remplacez par le chemin correct

const BackgroundDecorations = () => (
    <View style={StyleSheet.absoluteFill}>
        {/* Affichez les images PNG */}
        <Image
            source={Ellipse1005}
            style={styles.ellipse1005}
            resizeMode="contain"
        />
        <Image
            source={Vector142}
            style={styles.vector142}
            resizeMode="contain"
        />
    </View>
);


export default function SignUpScreen() {
    const router = useRouter();

    const [nomPrenom, setNomPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [ConfirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Header avec dégradé orange */}
                <LinearGradient
                    colors={['#FF9F43', '#FF9F43']}
                    style={styles.header}
                >
                    <BackgroundDecorations />
                    <Text style={styles.title}>S'inscrire</Text>
                    <Text style={styles.subtitle}>
                        Veuillez vous inscrire pour commencer
                    </Text>
                </LinearGradient>
                {/* Formulaire avec bord arrondi en haut */}
                <ScrollView style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>NOM et prénom :</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Iskander Jabri"
                            value={nomPrenom}
                            onChangeText={setNomPrenom}
                            placeholderTextColor="#676767"
                        />
                    </View>
                    <View style={[styles.inputContainer, { marginTop: 5 }]}>
                        <Text style={styles.label}>EMAIL :</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="IskanderJabri@gmail.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#676767"
                        />
                    </View>

                    <View style={[styles.inputContainer, { marginTop: 5 }]} >
                        <Text style={styles.label}>MOT DE PASSE :</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="123456789"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[styles.inputContainer, { marginTop: 5 }]} >
                        <Text style={styles.label}>Retaper le mot de passe :</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="123456789"
                                value={ConfirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>S’inscrire</Text>
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Vous avez un compte ? </Text>
                        <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
                            <Text style={styles.signupLink}>SE CONNECTER</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 40,
        height: (height / 3) - 20, // Pas de border-radius ici
        justifyContent: 'center', // Centrer verticalement
        alignItems: 'center', // Centrer horizontalement
    },
    title: {
        fontSize: 30,
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center', // Centrer le texte
        fontFamily: 'Sen-Bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
        textAlign: 'center',
        fontFamily: 'Sen-Regular',
    },
    form: {
        flex: 1,
        padding: 29,
        backgroundColor: '#fff', // Fond blanc pour le formulaire
        borderTopLeftRadius: 30, // Bord arrondi en haut à gauche
        borderTopRightRadius: 30, // Bord arrondi en haut à droite
        marginTop: -30, // Décalage pour chevaucher le header

    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        color: '#32343E',
        marginBottom: 5,
        fontFamily: 'Sen-Regular',
        textTransform: 'uppercase'
    },
    input: {
        backgroundColor: '#F0F5FA',
        borderRadius: 8,
        fontSize: 16,
        height: 62,
        color: "#32343E",
        padding: 20,
        fontFamily: 'Sen-Regular',

    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#666',
        borderRadius: 4,
        marginRight: 8,
    },
    checkboxLabel: {
        color: '#666',
        fontFamily: 'Sen-Regular',
        fontSize: 16
    },
    forgotPassword: {
        color: '#FF7622',
        fontFamily: 'Sen-Regular',
        fontSize: 16

    },
    loginButton: {
        backgroundColor: '#FF9F43',
        borderRadius: 8,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 25,
        height: 62,
        textAlign: "center"
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: "center",
        fontFamily: 'Sen-Bold',
        textTransform: 'uppercase'

    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        paddingBottom: 150

    },
    signupText: {
        color: '#646982',
        fontFamily: 'Sen-Regular',
        fontSize: 17

    },
    signupLink: {
        color: '#FF7622',
        fontFamily: 'Sen-Bold',
        fontSize: 17
    },
    orText: {
        textAlign: 'center',
        color: '#646982',
        marginBottom: 20,
        marginTop: 10,
        fontFamily: "Sen-Bold"
    },
    socialContainer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingBottom: 100
    },
    socialButton: {
        width: 62,
        height: 62,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 15
    },
    facebookButton: {
        backgroundColor: '#395998',
    },
    googleButton: {
        backgroundColor: '#169CE8',
    },
    appleButton: {
        backgroundColor: '#1B1F2F',
    },
    // Styles pour les images
    ellipse1005: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 120, // Ajustez la taille selon vos besoins
        height: 100, // Ajustez la taille selon vos besoins
    },
    vector142: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
});