import Global from "../util/Global";
import axios from "axios";
function SendMessageInCommunityApi(communityId, senderId, content) {
    try {
        let link = Global.BaseUrl + "/community/message";
        var data = JSON.stringify({
            communityId, senderId, content
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
export default SendMessageInCommunityApi;
