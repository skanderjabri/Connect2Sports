import Global from "../util/Global";
import axios from "axios";
function AddReservationSalleApi(user, salle) {
    try {
        let link = Global.BaseUrl + "/reservationSalle/addReservation";

        var data = JSON.stringify({
            user,
            salle
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
export default AddReservationSalleApi;
