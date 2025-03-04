import Global from "../util/Global";
import axios from "axios";
function RejoindreCommunityApi(communityId, userId) {
    try {
        let link = Global.BaseUrl + "/communities/join";
        var data = JSON.stringify({
            communityId,
            userId,
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
export default RejoindreCommunityApi;
