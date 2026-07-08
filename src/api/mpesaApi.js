import api from "./axios";

export async function initiateMpesaPayment(payload) {
    const response = await api.post("/mpesa/initiate", payload);
    return response.data;
}

export async function getMpesaStatus(transactionId) {
    const response = await api.get(`/mpesa/status/${transactionId}`);
    return response.data;
}
