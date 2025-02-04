import Global from "../util/Global";
import axios from "axios";
function UpdateUserApi(id, user) {
    try {
        let link = Global.BaseUrl + "/user/updateUser/" + id;
        var data = JSON.stringify(user);  
        return axios
            .put(link, data, {
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
export default UpdateUserApi;
