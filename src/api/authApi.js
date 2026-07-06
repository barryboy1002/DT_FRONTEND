import api from "./axios";

export async function loginUser(email, password) {
    const response = await api.post("/auth/login", {
        email,
        password
    });
    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
}

export async function registerBusinessOwner(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
}

export async function createUser(data) {
    const response = await api.post("/auth/createUser", data);
    return response.data;
}

export async function updateUser(userId, data) {
    const response = await api.put(`/auth/users/${userId}`, data);
    return response.data;
}

export async function deleteUser(userId) {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
}

export async function getUsers() {
    const response = await api.get("/auth/users");
    return response.data;
}