import Global from "../util/Global";

import axios from "axios";

function GetParticipationByIdApi(id) {
    try {
        let link = Global.BaseUrl + "/participation/GetParticipationById/" + id;
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

export default GetParticipationByIdApi;
