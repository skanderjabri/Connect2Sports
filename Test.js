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
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G } from 'react-native-svg';

const { height, width } = Dimensions.get('window');

const BackgroundDecorations = () => (
    <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            {/* Rayons soleil dans le coin supérieur gauche */}
            <G>
                {[...Array(12)].map((_, i) => (
                    <Path
                        key={`ray-${i}`}
                        d="M0,0 L30,30"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="2"
                        transform={`translate(40, 40) rotate(${i * 30})`}
                    />
                ))}
            </G>

            {/* Points formant une courbe */}
            <Path
                d={`M40,${height/6} C ${width/3},${height/4} ${width*2/3},${height/5} ${width-40},${height/6}`}
                stroke="transparent"
                fill="none"
                strokeDasharray="1,12"
                id="motionPath"
            />
            {[...Array(15)].map((_, i) => (
                <Circle
                    key={`dot-${i}`}
                    r="3"
                    fill="rgba(255,255,255,0.2)"
                >
                    <animateMotion
                        dur="0.1"
                        begin="0s"
                        fill="freeze"
                        path={`M40,${height/6} C ${width/3},${height/4} ${width*2/3},${height/5} ${width-40},${height/6}`}
                        keyPoints={`${i/14};${i/14}`}
                        keyTimes="0;1"
                    />
                </Circle>
            ))}
        </Svg>
    </View>
);

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <LinearGradient
                    colors={['#FF9F5A', '#FF8A3D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <BackgroundDecorations />
                    <Text style={styles.title}>Se connecter</Text>
                    <Text style={styles.subtitle}>
                        Veuillez vous connecter à votre compte existant
                    </Text>
                </LinearGradient>

                <View style={styles.form}>
                    {/* Le reste du code reste identique */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>EMAIL :</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="IskanderJabri@gmail.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
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

                    <View style={styles.optionsContainer}>
                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity style={styles.checkbox} />
                            <Text style={styles.checkboxLabel}>Souviens-toi</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.forgotPassword}>Mot de passe oublié</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>SE CONNECTER</Text>
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Vous n'avez pas de compte ? </Text>
                        <TouchableOpacity>
                            <Text style={styles.signupLink}>S'INSCRIRE</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.orText}>Ou</Text>

                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
                            <Ionicons name="logo-facebook" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
                            <Ionicons name="logo-google" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
                            <Ionicons name="logo-apple" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ... Les styles restent les mêmes ...
});