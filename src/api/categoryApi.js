import api from "./axios";

export async function getCategories() {
    const response =
        await api.get("/categories");

    return response.data;
}

export async function createCategory(
    name
) {
    const response =
        await api.post(
            "/categories",
            { name }
        );

    return response.data;
}

export async function deleteCategory(
    categoryId
) {
    const response =
        await api.delete(
            `/categories/${categoryId}`
        );

    return response.data;
}