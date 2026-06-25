import api from "./axios";

export async function getStockMovements(params) {
    const response = await api.get("/stock/movements", { params });
    return response.data;
}

export async function getLowStock() {
    const response = await api.get("/stock/lowStock");
    return response.data;
}

export async function getOutOfStock() {
    const response = await api.get("/stock/OutOfStock");
    return response.data;
}
