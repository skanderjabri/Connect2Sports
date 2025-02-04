import Global from "../util/Global";
import axios from "axios";
function CheckRequestBetweenUsersApi(Id_User1, Id_User2) {
    try {
        let link = Global.BaseUrl + "/request/checkRequestBetweenUsers";

        var data = JSON.stringify({
            Id_User1,
            Id_User2,
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
export default CheckRequestBetweenUsersApi;
