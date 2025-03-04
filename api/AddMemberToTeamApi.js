import Global from "../util/Global";
import axios from "axios";
function AddMemberToTeamApi(idTeam, idUser, role, isLeader) {
    try {
        let link = Global.BaseUrl + "/team/addMemberToTeam/" + idTeam;

        var data = JSON.stringify({
            idUser,
            role,
            isLeader,
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
export default AddMemberToTeamApi;
