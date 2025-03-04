import Global from "../util/Global";
import axios from "axios";
function UpdateEventApi(
    eventId,
    titre,
    description,
    dateHeureDebut,
    lieu,
    maxParticipants,
    typeEvenement,
    visibilite,
    condtionsReglement
) {
    try {
        let link = Global.BaseUrl + "/evenement/updateEvenement/" + eventId;
        var data = JSON.stringify({
            eventId,
            titre,
            description,
            dateHeureDebut,
            lieu,
            maxParticipants,
            typeEvenement,
            visibilite,
            condtionsReglement

        });
        return axios
            .put(link, data, {
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
export default UpdateEventApi;
