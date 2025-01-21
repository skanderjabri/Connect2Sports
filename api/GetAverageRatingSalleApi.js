import Global from "../util/Global";

import axios from "axios";

function GetAverageRatingSalleApi(salleId) {
    try {
        let link = Global.BaseUrl + "/salles/" + salleId + "/average-rating";
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

export default GetAverageRatingSalleApi;
