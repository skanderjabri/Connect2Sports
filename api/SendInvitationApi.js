import Global from "../util/Global";
import axios from "axios";
function SendInvitationApi(Id_Emetteur, Id_Recepteur) {
    try {
        let link = Global.BaseUrl + "/request/addRequest";
        var data = JSON.stringify({
            Id_Emetteur,
            Id_Recepteur,
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
export default SendInvitationApi;
