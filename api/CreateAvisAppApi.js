import Global from "../util/Global";
import axios from "axios";
function CreateAvisAppApi(
    idUser,
    note,
    commentaire
) {
    try {
        let link = Global.BaseUrl + "/avisapp/create";
        var data = JSON.stringify({
            idUser,
            note,
            commentaire
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
export default CreateAvisAppApi;
