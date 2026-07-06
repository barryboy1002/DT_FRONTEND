import api from "./axios";

export async function getRecentSales(){
    const response =
        await api.get(
            "/sales?limit=10"
        );

    return response.data;
}

export async function createSale(saleData) {
    const response = await api.post("/sales", saleData);
    return response.data;
}

export async function getSales(params) {
    const response = await api.get("/sales", { params });
    return response.data;
}

export async function getSale(saleId) {
    const response = await api.get(`/sales/${saleId}`);
    return response.data;
}

export async function refundSale(saleId, reason) {
    const response = await api.post(`/sales/${saleId}/refund`, { reason });
    return response.data;
}
