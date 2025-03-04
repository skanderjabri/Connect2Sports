import Global from "../util/Global";
import axios from "axios";
function AssignScoresToTeamsApi(idEvent, scores) {
    try {
        let link = Global.BaseUrl + "/team/assignScoresToTeams/" + idEvent;

        var data = JSON.stringify({
            scores
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
export default AssignScoresToTeamsApi;
