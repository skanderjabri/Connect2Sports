import Global from "../util/Global";
import axios from "axios";
function CreateReviewSalleApi(user, SalleID, rating, comment) {
    try {
        let link = Global.BaseUrl + "/reviews/addReview";

        var data = JSON.stringify({
            user,
            salle: SalleID,
            rating,
            comment
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
export default CreateReviewSalleApi;
