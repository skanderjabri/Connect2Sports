import Global from "../util/Global";

import axios from "axios";

function isUserInFavorisApi(userId, favoriUserID) {
    try {
        let link = Global.BaseUrl + "/favoris/isUserInFavoris/" + userId + "/" + favoriUserID;
        return axios
            .get(link, {
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

export default isUserInFavorisApi;
