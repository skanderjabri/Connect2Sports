import Global from "../util/Global";

import axios from "axios";

function MarkNotificationsAsReadApi(id) {
    try {
        let link = Global.BaseUrl + "/notifications/read/" + id;
        return axios
            .put(link, {
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

export default MarkNotificationsAsReadApi;
