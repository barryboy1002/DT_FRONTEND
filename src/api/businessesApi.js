import api from "./axios";

export async function getMpesaSettings() {
    const response = await api.get("/businesses/mpesa-settings");
    return response.data;
}

export async function updateMpesaSettings(payload) {
    const response = await api.put("/businesses/mpesa-settings", payload);
    return response.data;
}
