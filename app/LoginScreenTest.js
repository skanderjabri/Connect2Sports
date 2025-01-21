import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState('IskanderJabri@gmail.com');
    const [password, setPassword] = useState('123456789');

    return (
        <SafeAreaView style={styles.container}>
            {/* Background Pattern */}
            <View style={styles.backgroundPattern}>
                <View style={styles.sunburst} />
                <View style={styles.dottedLine} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>Se connecter</Text>
                <Text style={styles.subtitle}>
                    Veuillez vous connecter à votre compte existant
                </Text>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>EMAIL :</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>MOT DE PASSE :</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity style={styles.eyeIcon}>
                                <Ionicons name="eye-outline" size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.checkboxRow}>
                        <View style={styles.rememberMe}>
                            <TouchableOpacity style={styles.checkbox} />
                            <Text style={styles.rememberText}>Souviens-toi</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.forgotPassword}>Mot de passe oublié</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.connectButton}>
                        <Text style={styles.connectButtonText}>SE CONNECTER</Text>
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                        <Text style={styles.noAccountText}>Vous n'avez pas de compte ? </Text>
                        <TouchableOpacity>
                            <Text style={styles.signupText}>S'INSCRIRE</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.orText}>Ou</Text>

                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="facebook" size={20} color="#3B5998" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="google" size={20} color="#DB4437" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="apple" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF9F59',
    },
    backgroundPattern: {
        ...StyleSheet.absoluteFillObject,
    },
    sunburst: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dottedLine: {
        position: 'absolute',
        top: 50,
        right: 30,
        width: 100,
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'white',
        opacity: 0.8,
        marginBottom: 30,
    },
    form: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F6F6F6',
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 15,
        fontSize: 14,
        color: '#333',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
    },
    checkboxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    rememberMe: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 4,
        marginRight: 8,
    },
    rememberText: {
        color: '#666',
        fontSize: 14,
    },
    forgotPassword: {
        color: '#FF9F59',
        fontSize: 14,
    },
    connectButton: {
        backgroundColor: '#FF9F59',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    connectButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    noAccountText: {
        color: '#666',
        fontSize: 14,
    },
    signupText: {
        color: '#FF9F59',
        fontSize: 14,
        fontWeight: '600',
    },
    orText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginBottom: 15,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialButton: {
        width: 45,
        height: 45,
        backgroundColor: '#F6F6F6',
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
});