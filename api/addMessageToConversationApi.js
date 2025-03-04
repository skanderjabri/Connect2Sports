import Global from "../util/Global";
import axios from "axios";
function AddMessageToConversationApi(conversationId, sender, content) {
    try {
        let link = Global.BaseUrl + "/addMessageToConversation";

        var data = JSON.stringify({
            conversationId,
            sender,
            content
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
export default AddMessageToConversationApi;
