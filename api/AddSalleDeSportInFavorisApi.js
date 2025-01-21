import Global from "../util/Global";
import axios from "axios";
function AddSalleDeSportInFavorisApi(user, favoriteSalleDeSport) {
    try {
        let link = Global.BaseUrl + "/favoris/addFavoris";

        let typeSallle = "SalleDeSports"
        var data = JSON.stringify({
            user,
            favoriteType: typeSallle,
            favoriteSalleDeSport,
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
export default AddSalleDeSportInFavorisApi;
