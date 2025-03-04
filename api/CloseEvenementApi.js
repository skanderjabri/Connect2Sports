import Global from "../util/Global";

import axios from "axios";

function CloseEvenementApi(id) {
    try {
        let link = Global.BaseUrl + "/evenement/closeEvenement/" + id;
        return axios
            .post(link, {
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

export default CloseEvenementApi;
