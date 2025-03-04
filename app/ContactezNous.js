import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    ScrollView,
    Image,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator, // Ajout de l'ActivityIndicator
} from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { useRouter } from 'expo-router';
import AddContactUserApi from '../api/AddContactUserApi';

export default function ContactezNous() {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // État pour gérer l'envoi
    const router = useRouter();

    const handleSubmit = async () => {
        if (email.trim() === "" || subject.trim() === "" || message.trim() === "") {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Attention',
                textBody: 'Veuillez remplir tous les champs',
                button: 'OK',
            });
            return;
        }

        setIsSubmitting(true); // Activer l'état de soumission

        try {
            const response = await AddContactUserApi(email, subject, message);
            if (response.message === "ok") {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Félicitations',
                    textBody: 'Votre message a été envoyé avec succès',
                    button: 'OK',
                });
                // Réinitialiser les champs après un envoi réussi
                setEmail('');
                setSubject('');
                setMessage('');
            } else {
                Toast.show({
                    type: ALERT_TYPE.ERROR,
                    title: 'Erreur',
                    textBody: 'Une erreur s\'est produite lors de l\'envoi du message',
                    button: 'OK',
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.ERROR,
                title: 'Erreur',
                textBody: 'Une erreur s\'est produite lors de l\'envoi du message',
                button: 'OK',
            });
        } finally {
            setIsSubmitting(false); // Désactiver l'état de soumission
        }
    };

    return (
        <AlertNotificationRoot>
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="transparent"
                    translucent
                />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <AntDesign name="left" size={20} color="#FF7622" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contactez-nous</Text>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Image */}
                        <Image
                            source={require('.././assets/images/contact.png')} // Assurez-vous d'avoir cette image
                            style={styles.image}
                            resizeMode="contain"
                        />

                        {/* Section d'introduction */}
                        <View style={styles.introContainer}>
                            <Text style={styles.introTitle}>Un problème ?</Text>
                            <Text style={styles.introText}>
                                N'hésitez pas à nous contacter. Notre équipe est là pour vous aider.
                            </Text>
                        </View>

                        {/* Formulaire */}
                        <View style={styles.form}>
                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.iconContainer}>
                                    <MaterialIcons name="email" size={20} color="#FF7622" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Votre email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            {/* Subject Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.iconContainer}>
                                    <MaterialIcons name="subject" size={20} color="#FF7622" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Sujet"
                                    value={subject}
                                    onChangeText={setSubject}
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            {/* Message Input */}
                            <View style={styles.messageContainer}>
                                <View style={styles.iconContainer}>
                                    <MaterialIcons name="message" size={20} color="#FF7622" />
                                </View>
                                <TextInput
                                    style={styles.messageInput}
                                    placeholder="Votre message"
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            {/* Contact Info */}
                            <View style={styles.contactInfoContainer}>
                                <View style={styles.contactInfoItem}>
                                    <Ionicons name="call" size={20} color="#FF7622" />
                                    <Text style={styles.contactInfoText}>+216 29 082 245</Text>
                                </View>
                                <View style={styles.contactInfoItem}>
                                    <Ionicons name="mail" size={20} color="#FF7622" />
                                    <Text style={styles.contactInfoText}>connectsport986@gmail.com
                                    </Text>
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isSubmitting && styles.submitButtonDisabled, // Appliquer un style désactivé
                                ]}
                                onPress={handleSubmit}
                                disabled={isSubmitting} // Désactiver le bouton pendant l'envoi
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFFFFF" /> // Afficher l'indicateur de chargement
                                ) : (
                                    <Text style={styles.submitButtonText}>Envoyer le message</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
}

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
        fontSize: 18,
        fontFamily: 'Sen-Bold',
        color: '#1F2937',
        marginLeft: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: 200,
        marginBottom: 20,
    },
    introContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
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
        lineHeight: 24,
    },
    form: {
        paddingHorizontal: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FB',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 60,
        fontSize: 17,
        fontFamily: 'Sen-Regular',
        color: '#32343E',
    },
    messageContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FB',
        borderRadius: 12,
        marginBottom: 24,
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    messageInput: {
        flex: 1,
        height: 120,
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#32343E',
        paddingTop: 0,
    },
    contactInfoContainer: {
        backgroundColor: '#FFF5F1',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    contactInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactInfoText: {
        marginLeft: 12,
        fontSize: 16,
        fontFamily: 'Sen-Regular',
        color: '#32343E',
    },
    submitButton: {
        backgroundColor: '#FF7622',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    submitButtonDisabled: {
        backgroundColor: '#A0A0A0', // Couleur grise pour le bouton désactivé
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Sen-Bold',
    },
});