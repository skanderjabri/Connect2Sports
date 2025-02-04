import Global from "../util/Global";

import axios from "axios";

function ConfirmInvitationApi(id) {
    try {
        let link = Global.BaseUrl + "/request/acceptdemande/" + id;
        return axios
            .post(link, {
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

export default ConfirmInvitationApi;
