import Global from "../util/Global";
import axios from "axios";
function ParticipEventApi(idEvenement, idUtilisateur, modeParticipation) {
    try {
        let link = Global.BaseUrl + "/participation/createParticipation";
        var data = JSON.stringify({
            idEvenement, idUtilisateur, modeParticipation
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
export default ParticipEventApi;
