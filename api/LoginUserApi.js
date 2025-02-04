import Global from "../util/Global";
import axios from "axios";

function LoginUserApi(email, password) {
    try {
        let link = Global.BaseUrl + "/user/loginUser";
        var data = JSON.stringify({
            email, password
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

export default LoginUserApi;
