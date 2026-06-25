import api from "./axios";

export async function getSuppliers(params) {
    const response = await api.get("/suppliers", { params });
    return response.data;
}

export async function getSupplier(supplierId) {
    const response = await api.get(`/suppliers/${supplierId}`);
    return response.data;
}

export async function createSupplier(supplierData) {
    const response = await api.post("/suppliers", supplierData);
    return response.data;
}

export async function updateSupplier(supplierId, supplierData) {
    const response = await api.put(`/suppliers/${supplierId}`, supplierData);
    return response.data;
}

export async function deleteSuppliers(ids) {
    const response = await api.delete("/suppliers", {
        data: { ids }
    });
    return response.data;
}
