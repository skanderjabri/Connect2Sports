import Global from "../util/Global";
import axios from "axios";
function CreateReviewParticipationApi(
    idUser,
    idEvent,
    note,
    commentaire,
    badges,

) {
    try {
        let link = Global.BaseUrl + "/reviewparticipant/CreateReviewParticipation";

        var data = JSON.stringify({
            idUser,
            idEvent,
            note,
            commentaire,
            badges,
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
export default CreateReviewParticipationApi;
