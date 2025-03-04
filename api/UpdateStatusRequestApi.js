import Global from "../util/Global";
import axios from "axios";
function UpdateStatusRequestApi(id, status) {
    try {
        let link = Global.BaseUrl + "/participation/UpdateRequestParicipant/" + id + "/" + status;
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
export default UpdateStatusRequestApi;
