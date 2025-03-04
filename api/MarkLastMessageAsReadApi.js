import Global from "../util/Global";
import axios from "axios";

function MarkLastMessageAsReadApi(conversationId, userId) {
    try {
        let link = Global.BaseUrl + "/message/markLastMessageAsRead";
        var data = JSON.stringify({
            conversationId,
            userId
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

export default MarkLastMessageAsReadApi;
