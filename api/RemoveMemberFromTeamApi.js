import Global from "../util/Global";
import axios from "axios";

function RemoveMemberFromTeamApi(idTeam, idUser) {
    try {
        let link = Global.BaseUrl + "/team/removeMemberFromTeam/" + idTeam + "/" + idUser;
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
        console.log(error);
    }
}

export default RemoveMemberFromTeamApi;
