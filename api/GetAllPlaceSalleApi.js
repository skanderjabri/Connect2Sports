import Global from "../util/Global";
import axios from "axios";

function GetAllPlaceSalleApi() {
    try {
        let link = Global.BaseUrl + "/place/getAllPlaceSalle";
        return axios
            .get(link, {
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

export default GetAllPlaceSalleApi;
