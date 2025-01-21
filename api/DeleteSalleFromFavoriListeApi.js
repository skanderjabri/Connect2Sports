import Global from "../util/Global";

import axios from "axios";

function DeleteSalleFromFavoriListeApi(userId, salleDeSportId) {
    try {
        let link = Global.BaseUrl + "/favoris/removeSalleDeSportFromFavoris/" + userId + "/" + salleDeSportId;


        return axios
            .delete(link, {
                headers: {
                    "Content-Type": "application/json",
                    charset: "utf-8",
                },
            })
            .then((response) => {
                return response.data;
            });
    } catch (error) {
        console.log(error);
    }
}

export default DeleteSalleFromFavoriListeApi;
