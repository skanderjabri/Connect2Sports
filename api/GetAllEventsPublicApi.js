import Global from "../util/Global";
import axios from "axios";

function GetAllEventsPublicApi() {
    try {
        let link = Global.BaseUrl + "/evenement/getPublicEvenements";
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

export default GetAllEventsPublicApi;
