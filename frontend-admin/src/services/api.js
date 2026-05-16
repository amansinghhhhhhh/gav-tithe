const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("admin_token");
export const setToken = (t) => localStorage.setItem("admin_token", t);
export const clearToken = () => localStorage.removeItem("admin_token");

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

const apiFetch = async (url, options = {}) => {
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        if (!res.ok) {
            return { success: false, message: data.message || "Something went wrong, please try again." };
        }
        return data;
    } catch (err) {
        console.error("API error:", err);
        return { success: false, message: "Network error" };
    }
};

export const loginAdmin = async (email, password) => {
    const data = await apiFetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    return data;
};

export const getMe = async () =>
    apiFetch(`${BASE}/auth/me`, { headers: authHeaders() });

export const getAllUsers = async () =>
    apiFetch(`${BASE}/admin/users`, { headers: authHeaders() });

export const getUserDetail = async (userId) =>
    apiFetch(`${BASE}/admin/users/${userId}`, { headers: authHeaders() });

export const updateUserStatus = async (userId, status, remark = "") =>
    apiFetch(`${BASE}/admin/users/${userId}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status, remark }),
    });

export const openDoc = async (fileId) => {
    const res = await fetch(`${BASE}/admin/docs/${fileId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Document fetch failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
};