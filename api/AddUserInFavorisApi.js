import Global from "../util/Global";
import axios from "axios";
function AddUserInFavorisApi(user, favoriteUser) {
    try {
        let link = Global.BaseUrl + "/favoris/addFavoris";

        let typeUser = "User"
        var data = JSON.stringify({
            user,
            favoriteType: typeUser,
            favoriteUser,
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
export default AddUserInFavorisApi;
