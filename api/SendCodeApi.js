import Global from "../util/Global";
import axios from "axios";

function SendCodeApi(email) {
    try {
        let link = Global.BaseUrl + "/user/resetpassword";
        var data = JSON.stringify({
            email
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

export default SendCodeApi;
