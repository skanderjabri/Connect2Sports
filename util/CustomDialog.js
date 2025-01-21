import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Dialog, ALERT_TYPE } from 'react-native-alert-notification';

const CustomDialog = ({ type, title, textBody, button, onPressButton }) => {
    return (
        <Dialog
            type={type}
            title={title}
            textBody={textBody}
            button={button}
            onPressButton={onPressButton}
            titleStyle={styles.dialogTitle} // Appliquer le style personnalisé au titre
            textBodyStyle={styles.dialogTextBody} // Appliquer le style personnalisé au texte du corps
            buttonStyle={styles.dialogButton} // Appliquer le style personnalisé au bouton
        />
    );
};

// test
// const CustomDialog = ({ type, title, textBody, button, onPressButton }) => {
//     return (
//         <Dialog
//             type={type}
//             title={title}
//             textBody={textBody}
//             button={button}
//             onPressButton={onPressButton}
//             titleStyle={styles

//             // Appliquer le style personnalisé au titre
//             titleStyle={styles.dialogTitle} // Appliquer le style personnalisé au titre
//             textBodyStyle={styles.dialogTextBody} // Appliquer le style personn
const styles = StyleSheet.create({
    dialogTitle: {
        fontFamily: 'Sen-Bold', // Changer la police du titre
        fontSize: 20, // Changer la taille de la police du titre
        color: '#FF7622', // Changer la couleur du titre
    },
    dialogTextBody: {
        fontFamily: 'Sen-Regular', // Changer la police du texte du corps
        fontSize: 16, // Changer la taille de la police du texte du corps
        color: '#181C2E', // Changer la couleur du texte du corps
    },
    dialogButton: {
        fontFamily: 'Sen-Bold', // Changer la police du bouton
        fontSize: 18, // Changer la taille de la police du bouton
        color: '#FF7622', // Changer la couleur du bouton
    },
});

export default CustomDialog;