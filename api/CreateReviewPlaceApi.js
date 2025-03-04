import Global from "../util/Global";
import axios from "axios";
function CreateReviewPlaceApi(user, place, rating, comment) {
    try {
        let link = Global.BaseUrl + "/reviewsplace/createReviewPlace";

        var data = JSON.stringify({
            user,
            place,
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
export default CreateReviewPlaceApi;
