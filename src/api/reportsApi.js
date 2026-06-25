import api from "./axios";

export async function getSalesTrend(
    period = "monthly"
){
    const response = await api.get(
        `/reports/sales-trend?period=${period}`
    );

    return response.data;
}

export async function getProductDistribution(
    period = "monthly"
){
    const response = await api.get(
        `/reports/product-distribution?period=${period}`
    );

    return response.data;
}