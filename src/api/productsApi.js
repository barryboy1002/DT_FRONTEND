import api from "./axios";

export async function getProducts() {
    const response =
        await api.get("/products");

    return response.data;
}

export async function createProduct(
    product
) {
    const response =
        await api.post(
            "/products",
            product
        );

    return response.data;
}

export async function updateProduct(
    id,
    product
) {
    const response =
        await api.put(
            `/products/${id}`,
            product
        );

    return response.data;
}

export async function deleteProducts(
    ids
) {
    const response =
        await api.delete(
            "/products",
            {
                data: { ids }
            }
        );

    return response.data;
}