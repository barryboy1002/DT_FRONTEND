import api from "./axios";

export async function getRecentSales(){
    const response =
        await api.get(
            "/sales/recent"
        );

    return response.data;
}