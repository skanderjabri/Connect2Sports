import Global from "../util/Global";
import axios from "axios";

function GetUsersAproximitesApi(page, limit, latitude, longitude, distance) {
    try {
        let link = Global.BaseUrl + `/user/getUsers?page=${page}&limit=${limit}&lat=${latitude}&lon=${longitude}&distance=${distance}`;
        return axios
            .get(link, {
                headers: {
                    "Content-Type": "application/json",
                    charset: "utf-8",
                },
            })
            .then((response) => {
                return response.data || [];
                console.log(link);
            });
    } catch (error) {
        console.log(error);
    }
}

export default GetUsersAproximitesApi;
