import Global from "../util/Global";

import axios from "axios";

function DeleteRequestByIdApi(id) {
    try {
        let link = Global.BaseUrl + "/participation/deleteRequestById/" + id;


        return axios
            .delete(link, {
                headers: {
                    "Content-Type": "application/json",
                    charset: "utf-8",
                },
            })
            .then((response) => {
                return response.data;
            });
    } catch (error) {
        console.log(error);
    }
}

export default DeleteRequestByIdApi;
