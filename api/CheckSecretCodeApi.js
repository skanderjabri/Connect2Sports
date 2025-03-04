import Global from "../util/Global";
import axios from "axios";

function CheckSecretCode(code) {
    try { 
        let link = Global.BaseUrl + "/user/CheckSecretCode";
        var data = JSON.stringify({
            code
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

export default CheckSecretCode;
