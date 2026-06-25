import api from "./axios";

export async function getRecentSales(){
    const response =
        await api.get(
            "/sales/recent"
        );

    return response.data;
}

export async function createSale(saleData) {
    const response = await api.post("/sales", saleData);
    return response.data;
}