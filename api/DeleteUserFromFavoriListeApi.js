import Global from "../util/Global";

import axios from "axios";

function DeleteUserFromFavoriListeApi(userId, favoriUserID) {
    try {
        let link = Global.BaseUrl + "/favoris/removeUserFromFavoris/" + userId + "/" + favoriUserID;
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

export default DeleteUserFromFavoriListeApi;
