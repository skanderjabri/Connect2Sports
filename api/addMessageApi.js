import Global from "../util/Global";
import axios from "axios";
function AddMessageApi(senderId, recipientId, content) {
    try {
        let link = Global.BaseUrl + "/messages/sendMessage";

        var data = JSON.stringify({
            senderId, recipientId, content
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
export default AddMessageApi;
