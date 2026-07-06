import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/",
    headers: {
        'Content-Type': 'application/json'
    }
});

const getErrorMessage = (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const serverMessage = data?.message || data?.error || data?.details || "";

    if (typeof serverMessage === "string" && serverMessage.trim()) {
        return serverMessage;
    }

    if (Array.isArray(serverMessage)) {
        return serverMessage.join(", ");
    }

    if (status === 401) {
        return "Your session has expired. Please sign in again.";
    }

    if (status === 403) {
        return "You don’t have permission to perform this action.";
    }

    if (status === 404) {
        return "The requested resource was not found.";
    }

    if (status >= 500) {
        return "We couldn’t complete your request right now. Please try again.";
    }

    if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
        return "Network error. Please check your connection and try again.";
    }

    return "Something went wrong. Please try again.";
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        error.userMessage = getErrorMessage(error);
        return Promise.reject(error);
    }
);

export { getErrorMessage };
export default api;
