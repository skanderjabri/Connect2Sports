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
    ScrollView,
    StatusBar,

} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ALERT_TYPE, Dialog, Toast, AlertNotificationRoot } from 'react-native-alert-notification';
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

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fonction de validation du formulaire
    const validateForm = () => {
        // Appliquer .trim() sur les valeurs des champs
        const trimmedNom = nom.trim();
        const trimmedPrenom = prenom.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        // Vérifier que tous les champs sont remplis après avoir appliqué .trim()
        if (!trimmedNom || !trimmedPrenom || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Tous les champs sont obligatoires.',
            });
            return false;
        }

        // Vérifier que l'email est valide
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez entrer un email valide.',
            });
            return false;
        }

        // Vérifier que le mot de passe contient au moins 8 caractères
        if (trimmedPassword.length < 8) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Le mot de passe doit contenir au moins 8 caractères.',
            });
            return false;
        }

        // Vérifier que les deux mots de passe sont identiques
        if (trimmedPassword !== trimmedConfirmPassword) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Les mots de passe ne correspondent pas.',
            });
            return false;
        }

        return true; // Le formulaire est valide
    };

    // Fonction appelée lors de la soumission du formulaire
    const handleSignUp = () => {
        if (validateForm()) {
            // Si le formulaire est valide, afficher un message de succès
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Succès',
                textBody: 'Inscription réussie !',
            });

            // Naviguer vers CompleteInformationsScreen avec les données
            router.push({
                pathname: '/CompleteInformationsScreen',
                params: {
                    nom: nom.trim(),
                    prenom: prenom.trim(),
                    email: email.trim(),
                    password: password.trim(),
                },
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AlertNotificationRoot>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    <StatusBar
                        barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"} // Texte foncé sur iOS, clair sur Android
                        backgroundColor={Platform.OS === "android" ? "transparent" : "transparent"} // Bleu sur Android, transparent sur iOS
                        translucent
                    />
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
                            <Text style={styles.label}>NOM  :</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Iskander"
                                value={nom}
                                onChangeText={setNom}
                                placeholderTextColor="#676767"
                            />
                        </View>
                        <View style={[styles.inputContainer, { marginTop: 5 }]} >
                            <Text style={styles.label}>PRÉNOM  :</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Jebri"
                                value={prenom}
                                onChangeText={setPrenom}
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
                            <Text style={styles.label}>RETAPER LE MOT DE PASSE :</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="123456789"
                                    value={confirmPassword}
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

                        <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
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
            </AlertNotificationRoot>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,

    },
    content: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 40,
        height: (height / 3) - 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
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
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
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
    ellipse1005: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 120,
        height: 100,
    },
    vector142: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
});