import Global from "../util/Global";
import axios from "axios";
function AddReviewToEventApi(idEvenement, idParticipant, note, commentaire) {
    try {
        let link = Global.BaseUrl + "/ReviewEvent/createReview";

        var data = JSON.stringify({
            idEvenement, idParticipant, note, commentaire
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
export default AddReviewToEventApi;
