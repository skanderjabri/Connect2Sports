import Global from "../util/Global";
import axios from "axios";

function SearchApi(searchQuery) {
    try {
        let link = Global.BaseUrl + "/app/search?searchQuery=" + searchQuery;
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
        throw new Error(error);

    }
}

export default SearchApi;
