const BASE = import.meta.env.VITE_API_BASE || "https://gav-tithe-production.up.railway.app/api";

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("gtu_token");
export const setToken = (t) => localStorage.setItem("gtu_token", t);
export const clearToken = () => localStorage.removeItem("gtu_token");

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

// ── Generic fetch wrapper ─────────────────────────────────────────────────────
const apiFetch = async (url, options = {}) => {
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("API error:", err);
        return { success: false, message: "Network error — backend chal raha hai?" };
    }
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const verifyOtpApi = async (idToken, mobile, name) => {
    const data = await apiFetch(`${BASE}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, mobile, name }),
    });
    if (data.token) setToken(data.token);
    return data;
};

export const registerEmail = async (email, password, mobile, name) => {
    const data = await apiFetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, mobile, name }),
    });
    if (data.token) setToken(data.token);
    return data;
};

export const loginEmail = async (email, password) => {
    const data = await apiFetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    return data;
};

export const getMe = async () => {
    return apiFetch(`${BASE}/auth/me`, { headers: authHeaders() });
};

export const logout = () => clearToken();

// ── Form ──────────────────────────────────────────────────────────────────────

// Save one section as draft
// section: "section1" | "section2" | "section3" | "section4"
// data: section state object
export const saveSection = async (section, data) => {
    console.log(`💾 Saving ${section}...`, data);
    return apiFetch(`${BASE}/form/save`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ section, data }),
    });
};

// Submit full form
export const submitForm = async (formData) => {
    const res = await fetch(`${BASE}/form/submit`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${getToken()}`,
            // ⚠️ Content-Type bilkul mat lagao
        },
        body: formData,
    });
    return res.json();
};

// Get my saved form (load draft)
export const getMyForm = async () => {
    return apiFetch(`${BASE}/form`, { headers: authHeaders() });
};

// Upload document
export const uploadDoc = async (docType, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch(`${BASE}/form/upload/${docType}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
    });
};


export const markEmailVerified = async () => {
    return apiFetch(`${BASE}/auth/verify-email`, {
        method: "POST",
        headers: authHeaders(),
    });
};