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
    Modal,
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
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

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

        // Vérifier que les conditions d'utilisation sont acceptées
        if (!termsAccepted) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Erreur',
                textBody: 'Veuillez accepter les conditions générales d\'utilisation.',
            });
            return false;
        }

        return true; // Le formulaire est valide
    };

    // Fonction appelée lors de la soumission du formulaire
    const handleSignUp = () => {
        if (validateForm()) {
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

    const TermsModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#FF9F43', '#FF7622']}
                        style={styles.modalHeader}
                    >
                        <Text style={styles.modalTitle}>Conditions d'utilisation</Text>
                    </LinearGradient>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.modalSectionTitle}>Conditions d'utilisation de l'application Connect2Sport</Text>
                        <Text style={styles.modalDate}>Dernière mise à jour : Mars 2025</Text>

                        <Text style={styles.modalText}>
                            Bienvenue sur Connect2Sport, l'application qui permet aux sportifs de se connecter, de partager leur passion et de rencontrer d'autres passionnés de sport. En utilisant cette application, vous acceptez les conditions d'utilisation suivantes. Veuillez les lire attentivement avant de poursuivre.
                        </Text>

                        <Text style={styles.modalSubtitle}>1. Acceptation des conditions</Text>
                        <Text style={styles.modalText}>
                            En téléchargeant, en accédant ou en utilisant l'application Connect2Sport, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application.
                        </Text>

                        <Text style={styles.modalSubtitle}>2. Description du service</Text>
                        <Text style={styles.modalText}>
                            Connect2Sport est une plateforme qui permet aux utilisateurs de :
                        </Text>
                        <Text style={styles.modalListItem}>• Créer un profil sportif.</Text>
                        <Text style={styles.modalListItem}>• Rechercher et contacter d'autres sportifs.</Text>
                        <Text style={styles.modalListItem}>• Organiser des rencontres sportives.</Text>
                        <Text style={styles.modalListItem}>• Partager des informations, des événements et des conseils liés au sport.</Text>
                        <Text style={styles.modalText}>
                            L'application est destinée à un usage personnel et non commercial.
                        </Text>

                        <Text style={styles.modalSubtitle}>3. Inscription et compte utilisateur</Text>
                        <Text style={styles.modalText}>
                            Pour utiliser Connect2Sport, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de votre compte et de votre mot de passe. Vous acceptez de ne pas partager vos identifiants avec des tiers.
                        </Text>

                        <Text style={styles.modalSubtitle}>4. Engagements des utilisateurs</Text>
                        <Text style={styles.modalText}>
                            En utilisant Connect2Sport, vous vous engagez à :
                        </Text>
                        <Text style={styles.modalListItem}>• Respecter les autres utilisateurs et à ne pas publier de contenu offensant, discriminatoire ou illégal.</Text>
                        <Text style={styles.modalListItem}>• Ne pas utiliser l'application à des fins frauduleuses, commerciales ou publicitaires sans autorisation.</Text>
                        <Text style={styles.modalListItem}>• Ne pas perturber le bon fonctionnement de l'application ou tenter d'accéder à des données non autorisées.</Text>

                        <Text style={styles.modalSubtitle}>5. Protection des données personnelles</Text>
                        <Text style={styles.modalText}>
                            Vos données personnelles sont collectées et traitées conformément à notre Politique de confidentialité. Nous nous engageons à protéger votre vie privée et à ne pas partager vos informations avec des tiers sans votre consentement.
                        </Text>

                        <Text style={styles.modalSubtitle}>6. Propriété intellectuelle</Text>
                        <Text style={styles.modalText}>
                            Tous les contenus, logos, designs et fonctionnalités de l'application Connect2Sport sont la propriété exclusive de ses créateurs. Vous n'êtes pas autorisé à reproduire, modifier ou distribuer ces éléments sans autorisation écrite.
                        </Text>

                        <Text style={styles.modalSubtitle}>7. Limitation de responsabilité</Text>
                        <Text style={styles.modalText}>
                            Connect2Sport ne peut être tenu responsable :
                        </Text>
                        <Text style={styles.modalListItem}>• Des rencontres ou interactions entre utilisateurs en dehors de l'application.</Text>
                        <Text style={styles.modalListItem}>• Des dommages directs ou indirects résultant de l'utilisation de l'application.</Text>
                        <Text style={styles.modalListItem}>• Du contenu publié par les utilisateurs.</Text>

                        <Text style={styles.modalSubtitle}>8. Modifications des conditions</Text>
                        <Text style={styles.modalText}>
                            Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Les utilisateurs seront informés des changements via l'application ou par email.
                        </Text>

                        <Text style={styles.modalSubtitle}>9. Résiliation</Text>
                        <Text style={styles.modalText}>
                            Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation de ces conditions d'utilisation.
                        </Text>

                        <Text style={styles.modalSubtitle}>10. Contact</Text>
                        <Text style={styles.modalText}>
                            Pour toute question ou réclamation concernant ces conditions d'utilisation, vous pouvez nous contacter à l'adresse email suivante : connectsport986@gmail.com.
                        </Text>
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Fermer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
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
                                placeholder="Votre nom"
                                value={nom}
                                onChangeText={setNom}
                                placeholderTextColor="#676767"
                            />
                        </View>
                        <View style={[styles.inputContainer, { marginTop: 5 }]} >
                            <Text style={styles.label}>PRÉNOM  :</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Votre prénom"
                                value={prenom}
                                onChangeText={setPrenom}
                                placeholderTextColor="#676767"
                            />
                        </View>
                        <View style={[styles.inputContainer, { marginTop: 5 }]}>
                            <Text style={styles.label}>EMAIL :</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Votre email"
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

                        {/* Checkbox de conditions d'utilisation */}
                        <View style={styles.termsContainer}>
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => setTermsAccepted(!termsAccepted)}
                            >
                                {termsAccepted && (
                                    <Ionicons name="checkmark" size={20} color="#FF9F43" />
                                )}
                            </TouchableOpacity>
                            <View style={styles.termsTextContainer}>
                                <Text style={styles.termsText}>
                                    J'accepte les
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(true)}>
                                    <Text style={styles.termsLink}> conditions générales d'utilisation</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
                            <Text style={styles.loginButtonText}>S'inscrire</Text>
                        </TouchableOpacity>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Vous avez un compte ? </Text>
                            <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
                                <Text style={styles.signupLink}>SE CONNECTER</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Modal des conditions d'utilisation */}
                <TermsModal />
            </SafeAreaView>
        </AlertNotificationRoot>
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
    // Styles du checkbox et des conditions
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#FF9F43',
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    termsTextContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    termsText: {
        color: '#646982',
        fontFamily: 'Sen-Regular',
        fontSize: 15,
    },
    termsLink: {
        color: '#FF7622',
        fontFamily: 'Sen-Bold',
        fontSize: 15,
    },
    // Styles du modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.9,
        height: height * 0.8,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalHeader: {
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Sen-Bold',
    },
    modalContent: {
        padding: 20,
    },
    modalSectionTitle: {
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#32343E',
        marginBottom: 10,
    },
    modalDate: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#646982',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    modalText: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#32343E',
        marginBottom: 15,
        lineHeight: 22,
    },
    modalSubtitle: {
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        color: '#32343E',
        marginTop: 10,
        marginBottom: 8,
    },
    modalListItem: {
        fontSize: 14,
        fontFamily: 'Sen-Regular',
        color: '#32343E',
        marginBottom: 5,
        paddingLeft: 10,
        lineHeight: 20,
    },
    closeButton: {
        backgroundColor: '#FF9F43',
        padding: 15,
        margin: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
        textTransform: 'uppercase',
    },
    // Autres styles
    loginButton: {
        backgroundColor: '#FF9F43',
        borderRadius: 8,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 15,
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