import Global from "../util/Global";

import axios from "axios";

function CancelInvitationApi(id) {
    try {
        let link = Global.BaseUrl + "/request/refuseDemande/" + id;
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

export default CancelInvitationApi;
