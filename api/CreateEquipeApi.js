import Global from "../util/Global";
import axios from "axios";
function CreateEquipeApi(
    idEvent,
    nom
) {
    try {
        let link = Global.BaseUrl + "/team/createTeam";
        var data = JSON.stringify({
            idEvent,
            nom
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
export default CreateEquipeApi;
