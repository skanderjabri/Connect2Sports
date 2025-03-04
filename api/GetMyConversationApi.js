import Global from "../util/Global";

import axios from "axios";

function GetMyConversationApi(userId) {
    try {
        let link = Global.BaseUrl + "/conversations/" + userId;
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

export default GetMyConversationApi;
