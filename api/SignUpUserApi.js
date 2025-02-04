import Global from "../util/Global";
import axios from "axios";
function SignUpUserApi(
    nom,
    prenom,
    email,
    password,
    numeroTelephone,
    photoProfil,
    coordonnees,
    adresse,
    sportsPratiques,
    niveauSportif,
    disponibilitesTimes,
    disponibilitesPlaces,
    pseudo,
    description,
) {
    try {
        let link = Global.BaseUrl + "/user/addUser";
        const formData = new FormData();
        formData.append("nom", nom);
        formData.append("prenom", prenom);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("numeroTelephone", numeroTelephone);
        formData.append("photoProfil", photoProfil);
        formData.append("coordonnees", coordonnees);
        formData.append("adresse", adresse);
        formData.append("sportsPratiques", sportsPratiques);
        formData.append("niveauSportif", niveauSportif);
        formData.append("disponibilitesTimes", disponibilitesTimes);
        formData.append("disponibilitesPlaces", disponibilitesPlaces);
        formData.append("pseudo", pseudo);
        formData.append("description", description);
        return axios
            .post(link, formData)
            .then((response) => {
                return response.data;
            });
    } catch (error) {
        // Gestion plus détaillée de l'erreur
        if (error.response) {
            // Le serveur a répondu avec un statut d'erreur
            throw new Error(`Erreur serveur: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
            // La requête a été faite mais pas de réponse reçue
            throw new Error("Pas de réponse du serveur. Vérifiez votre connexion internet.");
        } else {
            // Une erreur s'est produite lors de la configuration de la requête
            throw new Error(`Erreur de configuration: ${error.message}`);
        }
    }
}
export default SignUpUserApi;
