import Global from "../util/Global";
import axios from "axios";
function VerifEmailUserApi(email) {
    try {
        let link = Global.BaseUrl + "/user/ValidateEmail/" + email;
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
        throw new Error(error);
    }
}
export default VerifEmailUserApi;
