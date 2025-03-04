import React, { useState, useRef } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VerifEmailUserApi from '../api/VerifEmailUserApi';
import UpdateNewPasswordApi from '../api/UpdateNewPasswordApi';
const { height, width } = Dimensions.get('window');
import { useLocalSearchParams, useRouter } from 'expo-router';
const Vector142 = require('../assets/images/Vector142.png');
const Ellipse1005 = require('../assets/images/Ellipse1006.png');
import SendCodeApi from '../api/SendCodeApi';
import CheckSecretCode from '../api/CheckSecretCodeApi';

const BackgroundDecorations = () => (
    <View style={StyleSheet.absoluteFill}>
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

export default function ForgetPasswordScreen() {
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [newpass, setnewpass] = useState('');
    const [confirmpass, setconfirmpass] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // États pour gérer le chargement de chaque étape
    const [loadingStep1, setLoadingStep1] = useState(false);
    const [loadingStep2, setLoadingStep2] = useState(false);
    const [loadingStep3, setLoadingStep3] = useState(false);

    // Références pour les inputs du code de vérification
    const codeInputs = useRef([]);

    const handleVerificationCodeChange = (text, index) => {
        if (text.length <= 1) {
            const newCode = [...verificationCode];
            newCode[index] = text;
            setVerificationCode(newCode);

            // Déplacer le focus vers le prochain input
            if (text.length === 1 && index < 5) {
                codeInputs.current[index + 1].focus();
            }
        }
    };

    const handleSubmitEmail = async () => {
        if (email && email.includes('@')) {
            const emailverif = email.trim();
            setLoadingStep1(true); // Activer le chargement pour l'étape 1
            try {
                const response = await VerifEmailUserApi(emailverif);
                if (response.message == "exist user") {
                    const responseCode = await SendCodeApi(emailverif);
                    if (responseCode.msg == "Veuillez consulter votre email pour la récupération du code") {
                        setStep(2);
                    } else {
                        Toast.show({
                            type: ALERT_TYPE.DANGER,
                            title: 'Attention',
                            textBody: "Une erreur est survenue lors de l'envoi de la code de vérification.",
                        });
                    }
                } else {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Attention',
                        textBody: 'Adresse e-mail introuvable.',
                    });
                }
            } catch (error) {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Attention',
                    textBody: "Une erreur est survenue lors de l'envoi de la demande.",
                });
            } finally {
                setLoadingStep1(false); // Désactiver le chargement pour l'étape 1
            }
        } else {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Attention',
                textBody: 'Veuillez entrer une adresse email valide',
            });
        }
    };

    const handleVerifyCode = async () => {
        const code = verificationCode.join('');
        if (code.length === 6) {
            setLoadingStep2(true); // Activer le chargement pour l'étape 2
            try {
                const response = await CheckSecretCode(code);
                if (response.msg == "Code Valide") {
                    setStep(3);
                } else {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Attention',
                        textBody: "Code incorrect. Veuillez vérifier et réessayer !",
                    });
                }
            } catch (error) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Attention',
                    textBody: "Une erreur est survenue lors de l'envoi de la demande.",
                });
            } finally {
                setLoadingStep2(false); // Désactiver le chargement pour l'étape 2
            }
        } else {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Attention',
                textBody: 'Veuillez entrer le code complet',
            });
        }
    };

    const handleResetPassword = async () => {
        if (newpass.length < 8) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Attention',
                textBody: 'Le mot de passe doit contenir au moins 8 caractères',
            });
            return;
        }
        if (newpass !== confirmpass) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Attention',
                textBody: 'Les mots de passe ne correspondent pas',
            });
            return;
        }
        setLoadingStep3(true); // Activer le chargement pour l'étape 3
        try {
            const response = await UpdateNewPasswordApi(email, newpass, confirmpass);
            if (response.message == "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Succès',
                    textBody: 'Votre mot de passe a été changé avec succès'
                });
                setTimeout(() => {
                    router.push('/LoginScreen');
                }, 1500);
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Attention',
                textBody: 'Une erreur est survenue lors du changement du mot de passe',
            });
        } finally {
            setLoadingStep3(false); // Désactiver le chargement pour l'étape 3
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.inputContainer}>
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
                        <TouchableOpacity
                            style={[styles.loginButton, loadingStep1 && styles.disabledButton]}
                            onPress={handleSubmitEmail}
                            disabled={loadingStep1}
                        >
                            {loadingStep1 ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Envoyer le code</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                );

            case 2:
                return (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>CODE DE VÉRIFICATION :</Text>
                        <View style={styles.codeContainer}>
                            {verificationCode.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={el => codeInputs.current[index] = el}
                                    style={styles.codeInput}
                                    value={digit}
                                    onChangeText={(text) => handleVerificationCodeChange(text, index)}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    textAlign="center"
                                />
                            ))}
                        </View>
                        <TouchableOpacity
                            style={[styles.loginButton, loadingStep2 && styles.disabledButton]}
                            onPress={handleVerifyCode}
                            disabled={loadingStep2}
                        >
                            {loadingStep2 ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Vérifier</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                );

            case 3:
                return (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>NOUVEAU MOT DE PASSE :</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Nouveau mot de passe"
                                value={newpass}
                                onChangeText={setnewpass}
                                secureTextEntry={!showPassword}
                                placeholderTextColor="#676767"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { marginTop: 20 }]}>CONFIRMER LE MOT DE PASSE :</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Confirmer le mot de passe"
                                value={confirmpass}
                                onChangeText={setconfirmpass}
                                secureTextEntry={!showConfirmPassword}
                                placeholderTextColor="#676767"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, loadingStep3 && styles.disabledButton, { marginTop: 30 }]}
                            onPress={handleResetPassword}
                            disabled={loadingStep3}
                        >
                            {loadingStep3 ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Réinitialiser</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                );
        }
    };

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    <StatusBar
                        barStyle="dark-content"
                        backgroundColor="transparent"
                        translucent
                    />
                    <LinearGradient
                        colors={['#FF9F43', '#FF9F43']}
                        style={styles.header}
                    >
                        <BackgroundDecorations />
                        <Text style={styles.title}>Mot de passe oublié</Text>
                        <Text style={styles.subtitle}>
                            {step === 1 && "Veuillez entrer votre email pour récupérer un code"}
                            {step === 2 && "Entrez le code de vérification"}
                            {step === 3 && "Créez votre nouveau mot de passe"}
                        </Text>
                    </LinearGradient>
                    <ScrollView style={styles.form}>
                        {renderStep()}
                    </ScrollView>
                </KeyboardAvoidingView>
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
        position: 'relative',
    },
    passwordInput: {
        flex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 20,
        top: 19,
    },
    loginButton: {
        backgroundColor: '#FF9F43',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 25,
        height: 62,
    },
    disabledButton: {
        backgroundColor: '#ccc', // Couleur de fond désactivée
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: "center",
        fontFamily: 'Sen-Bold',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
    },
    codeInput: {
        width: 45,
        height: 45,
        borderRadius: 8,
        backgroundColor: '#F0F5FA',
        fontSize: 20,
        textAlign: 'center',
        color: '#32343E',
        fontFamily: 'Sen-Regular',
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