import api from "./axios";

export async function getProducts() {
    const response = await api.get("/products");
    return response.data;
}

export async function getProduct(productId) {
    const response = await api.get(
        `/products/${productId}`
    );

    return response.data;
}

export async function createProduct(data) {
    const response = await api.post(
        "/products",
        data
    );

    return response.data;
}

export async function updateProduct(
    productId,
    data
) {
    const response = await api.put(
        `/products/${productId}`,
        data
    );

    return response.data;
}

export async function deleteProducts(ids) {
    const response = await api.delete(
        "/products",
        {
            data: { ids }
        }
    );

    return response.data;
}