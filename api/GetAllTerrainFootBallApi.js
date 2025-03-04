import Global from "../util/Global";
import axios from "axios";

function GetAllTerrainFootBallApi(page, limit) {
    try {
        let link = Global.BaseUrl + `/football-terrains/getFootballTerrain?page=${page}&limit=${limit}`;
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

export default GetAllTerrainFootBallApi;
