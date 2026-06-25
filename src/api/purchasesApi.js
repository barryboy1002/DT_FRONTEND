import api from "./axios";

export async function getPurchases(params) {
    const response = await api.get("/purchases", { params });
    return response.data;
}

export async function getPurchase(purchaseId) {
    const response = await api.get(`/purchases/${purchaseId}`);
    return response.data;
}

export async function createPurchase(purchaseData) {
    const response = await api.post("/purchases", purchaseData);
    return response.data;
}

export async function getPurchasesByProduct(productId, params) {
    const response = await api.get(`/purchases/product/${productId}`, { params });
    return response.data;
}
