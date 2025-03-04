import Global from "../util/Global";
import axios from "axios";

function ManageCommunityApi(communityId, adminId, userId, action) {
    try {
        let link = Global.BaseUrl + "/communities/manage";
        var data = JSON.stringify({
            communityId,
            adminId,
            userId,
            action
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

export default ManageCommunityApi;
