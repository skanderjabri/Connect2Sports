import Global from "../util/Global";
import axios from "axios";
function CreateEventApi(
    titre,
    description,
    dateHeureDebut,
    lieu,
    maxParticipants,
    typeEvenement,
    idOrganisateur,
    idSport,
    statut,
    visibilite,
    condtionsReglement,
    nomSporttype
) {
    try {
        let link = Global.BaseUrl + "/evenement/addevenement";

        var data = JSON.stringify({
            titre,
            description,
            dateHeureDebut,
            lieu,
            maxParticipants,
            typeEvenement,
            idOrganisateur,
            idSport,
            statut,
            visibilite,
            condtionsReglement,
            nomSporttype
        });
        return axios
            .post(link, data, {
                headers: {
                    "Content-Type": "application/json",
                    charset: "utf-8",
                },
            })
            .then((response) => {
                return response.data;
            });
    } catch (error) {
        throw new Error(error);

    }
}
export default CreateEventApi;
