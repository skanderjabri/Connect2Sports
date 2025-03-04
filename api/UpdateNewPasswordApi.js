import Global from "../util/Global";
import axios from "axios";
function UpdateNewPasswordApi(
    email,
    newpass,
    confirmpass
) {
    try {
        let link = Global.BaseUrl + "/user/UpdateNewPassword/" + email;
        var data = JSON.stringify({
            newpass,
            confirmpass
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
export default UpdateNewPasswordApi;
