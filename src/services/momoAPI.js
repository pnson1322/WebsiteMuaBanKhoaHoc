import axios from "./axios";

export const confirmMomoPayment = async (query) => {
    return axios.get("/Checkout/MomoConfirm", {
        params: query,
    });
};
