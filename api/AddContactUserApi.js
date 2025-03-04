import Global from "../util/Global";
import axios from "axios";
function AddContactUserApi(email, subject, message) {
    try {
        let link = Global.BaseUrl + "/contact/addContactUser";

        var data = JSON.stringify({
            email, subject, message
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
export default AddContactUserApi;
