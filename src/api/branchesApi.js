import api from "./axios";

export async function createBranch(data) {
    const response = await api.post("/branches", data);
    return response.data;
}

export async function getBranches() {
    const response = await api.get("/branches");
    return response.data;
}

export async function getBranch(branchId) {
    const response = await api.get(`/branches/${branchId}`);
    return response.data;
}

export async function updateBranch(branchId, data) {
    const response = await api.put(`/branches/${branchId}`, data);
    return response.data;
}

export async function deleteBranch(branchId) {
    const response = await api.delete(`/branches/${branchId}`);
    return response.data;
}
