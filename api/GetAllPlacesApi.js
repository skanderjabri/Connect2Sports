import Global from "../util/Global";
import axios from "axios";

function GetAllPlacesApi() {
    try {
        let link = Global.BaseUrl + "/place/getAllPlaces";
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

export default GetAllPlacesApi;
