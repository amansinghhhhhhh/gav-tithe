import { compressImageForUpload } from "./imageCompression";

const BASE = import.meta.env.VITE_API_BASE ||
  (window.location.hostname === "localhost" || window.location.hostname === "192.168.29.4"
    ? "http://localhost:5000/api"
    : "https://gav-tithe-production.up.railway.app/api");

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("gtu_token");
export const setToken = (t) => localStorage.setItem("gtu_token", t);
export const clearToken = () => localStorage.removeItem("gtu_token");

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

// <img> me Authorization header nahi lagta — admin pattern: query token
export const docFileUrl = (fileId) =>
    `${BASE}/form/docs/${fileId}?token=${encodeURIComponent(getToken() || "")}`;

// ── Generic fetch wrapper ─────────────────────────────────────────────────────
const apiFetch = async (url, options = {}, retries) => {
    const { timeoutMs = 30000, retries: optionRetries, ...fetchOptions } = options;
    const method = String(fetchOptions.method || "GET").toUpperCase();
    // POST/PUT/DELETE ko retry mat karo — register/OTP/upload duplicate side effects ho sakte hain
    const maxRetries =
        retries !== undefined
            ? retries
            : optionRetries !== undefined
              ? optionRetries
              : method === "GET"
                ? 1
                : 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        let timeoutId;
        try {
            const controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const res = await fetch(url, { ...fetchOptions, signal: controller.signal });

            // Safe JSON parse — Railway/CDN 502 HTML page jaisi non-JSON responses par res.json() throw karta tha
            let data = null;
            try {
                data = await res.json();
            } catch (_) {
                data = null;
            }

            if (!res.ok) {
                if (data && res.status === 429 && data.retryAfterMinutes) {
                    return { success: false, status: 429, error: data.error, message: data.message || "Too many requests", retryAfterMinutes: data.retryAfterMinutes };
                }
                // Non-JSON error (HTML error page) → server 5xx ho toh api_server, warna network
                const fallback = data ? null : res.status >= 500 ? "api_server" : "api_network";
                return {
                    success: false,
                    status: res.status,
                    error: data?.error,
                    message: (data && data.message) || fallback || "Something went wrong, please try again.",
                    retryAfterMinutes: data?.retryAfterMinutes,
                };
            }
            if (!data) {
                // 2xx par bhi HTML mila toh app treat nahi kar sakta
                return { success: false, status: res.status, message: "api_server" };
            }
            return data;
        } catch (err) {
            const label = `${method} ${url}`;
            console.error(`API error (attempt ${attempt + 1}) ${label}:`, err);
            if (attempt < maxRetries) {
                await new Promise((r) => setTimeout(r, 2000));
                continue;
            }
            if (err.name === "AbortError") {
                return { success: false, status: 0, message: "api_timeout" };
            }
            return { success: false, status: 0, message: "api_network" };
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }
    }
};

// ── API message helper ────────────────────────────────────────────────────────
// api_*/err_* codes ko t() se human-readable banao, baaki server messages as-is
export const apiMsg = (res, t) => {
    const m = res?.message;
    if (typeof m === "string" && /^(api_|err_|fb_)/.test(m)) return t(m);
    return m || t("err_upload_failed");
};

// ── Auth ──────────────────────────────────────────────────────────────────────

// OTP error codes → translation keys (backend ke `error` field se)
const OTP_ERR_KEYS = {
    invalid_phone: "otp_error_phone",
    rate_limited: "otp_error_rate",
    expired: "otp_error_expired",
    invalid_code: "otp_error_code",
    sms_failed: "otp_error_send",
    session_expired: "otp_error_session",
    otp_required: "otp_error_verify",
};

export const otpErrMsg = (data, t) => {
    if (data?.error && OTP_ERR_KEYS[data.error]) return t(OTP_ERR_KEYS[data.error]);
    const m = data?.message;
    if (typeof m === "string" && /^(api_|err_|fb_)/.test(m)) return t(m);
    return m || t("otp_error_send");
};

export const sendOtpApi = (mobile, purpose = "profile", lang = "en") =>
    apiFetch(`${BASE}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, purpose, lang }),
    });

export const verifyOtpApi = async (mobile, otp, purpose = "profile", name) => {
    const data = await apiFetch(`${BASE}/auth/otp/verify`, {
        method: "POST",
        // ✅ authHeaders() use karo — logged-in user ka JWT token bhi jayega (profile purpose)
        headers: authHeaders(),
        body: JSON.stringify({ mobile, otp, purpose, name }),
    });
    if (data.token) setToken(data.token);
    return data;
};

export const registerEmail = async ({ email, password, mobile, name, firebaseUid, otpToken }) => {
    const body = { email, password, mobile, name };
    if (firebaseUid) body.firebaseUid = firebaseUid;
    if (otpToken) body.otpToken = otpToken;
    const data = await apiFetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (data.token) setToken(data.token);
    return data;
};

export const loginEmail = async (identifier, password, firebaseIdToken = null) => {
    const body = { identifier, password };
    if (firebaseIdToken) body.firebaseIdToken = firebaseIdToken;
    const data = await apiFetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (data.token) setToken(data.token);
    return data;
};

export const getMe = async () => {
    return apiFetch(`${BASE}/auth/me`, { headers: authHeaders() });
};

export const logout = () => clearToken();

export const checkEmail = (email) =>
    apiFetch(`${BASE}/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

export const checkMobile = (mobile) =>
    apiFetch(`${BASE}/auth/check-mobile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
    });

export const checkSamePassword = (identifier, newPassword) =>
    apiFetch(`${BASE}/auth/check-same-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier.includes("@") ? identifier : undefined, mobile: !identifier.includes("@") ? identifier : undefined, newPassword }),
    });

export const resetPasswordMobile = async (resetToken, newPassword) => {
    return apiFetch(`${BASE}/auth/reset-password-mobile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
    });
};

// Email reset ke baad MongoDB hash sync (Firebase already updated by confirmPasswordReset)
export const resetPasswordEmail = async (idToken, newPassword) => {
    return apiFetch(`${BASE}/auth/reset-password-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, newPassword }),
    });
};

// ── Form ──────────────────────────────────────────────────────────────────────

export const saveSection = async (section, data) => {
    return apiFetch(`${BASE}/form/save`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ section, data }),
    });
};

export const submitForm = async (data) => {
    return apiFetch(`${BASE}/form/submit`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
};

export const getMyForm = async () => {
    return apiFetch(`${BASE}/form`, { headers: authHeaders() });
};

export const createEditRequest = async (message) => {
    return apiFetch(`${BASE}/form/edit-request`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message }),
    });
};

export const getEditRequest = async () => {
    return apiFetch(`${BASE}/form/edit-request`, { headers: authHeaders() });
};

const parseUploadResponse = (xhr) => {
    let data = null;
    try {
        data = JSON.parse(xhr.responseText);
    } catch (_) {
        data = null;
    }

    if (xhr.status >= 200 && xhr.status < 300) {
        if (!data) return { success: false, status: xhr.status, message: "api_server" };
        return data;
    }
    if (data && xhr.status === 429 && data.retryAfterMinutes) {
        return { success: false, status: 429, error: data.error, message: data.message || "Too many requests", retryAfterMinutes: data.retryAfterMinutes };
    }
    return {
        success: false,
        status: xhr.status,
        error: data?.error,
        message: (data && data.message) || (xhr.status >= 500 ? "api_server" : "api_network"),
        retryAfterMinutes: data?.retryAfterMinutes,
    };
};

// XHR use karte hain taaki upload progress mile; timeout 120s (slow network), retry nahi
export const uploadDoc = async (docType, file, ocr = null, onProgress) => {
    const uploadFile = await compressImageForUpload(file);
    const fd = new FormData();
    fd.append("file", uploadFile);
    if (ocr) fd.append("ocr", ocr);

    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${BASE}/form/upload/${docType}`);
        xhr.timeout = 120000;

        const token = getToken();
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        if (typeof onProgress === "function") {
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
                }
            };
        }

        xhr.onload = () => {
            if (typeof onProgress === "function") onProgress(100);
            resolve(parseUploadResponse(xhr));
        };
        xhr.onerror = () => resolve({ success: false, status: 0, message: "api_network" });
        xhr.ontimeout = () => resolve({ success: false, status: 0, message: "api_upload_timeout" });
        xhr.onabort = () => resolve({ success: false, status: 0, message: "api_upload_timeout" });

        xhr.send(fd);
    });
};

export const removeDoc = async (docType) => {
    return apiFetch(`${BASE}/form/doc/${docType}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
};

export const markEmailVerified = async () => {
    return apiFetch(`${BASE}/auth/verify-email`, {
        method: "POST",
        headers: authHeaders(),
    });
};

// ── Status check (public — no auth) ──────────────────────────────────────────
export const checkStatusById = async (uniqueId) => {
    return apiFetch(`${BASE}/form/status/${encodeURIComponent(uniqueId)}`);
};

// ── Assessment ───────────────────────────────────────────────────────────────
export const getMyAssessment = async () => {
    return apiFetch(`${BASE}/assessment`, { headers: authHeaders() });
};

export const saveAssessmentRespondent = async (data) => {
    return apiFetch(`${BASE}/assessment/respondent`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
};

export const saveAssessmentAnswer = async (questionId, selectedOptions = [], text = "") => {
    return apiFetch(`${BASE}/assessment/answer`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ questionId, selectedOptions, text }),
    });
};

export const completeAssessment = async () => {
    return apiFetch(`${BASE}/assessment/complete`, {
        method: "POST",
        headers: authHeaders(),
    });
};

export const retakeAssessment = async () => {
    return apiFetch(`${BASE}/assessment/retake`, {
        method: "POST",
        headers: authHeaders(),
    });
};

// ── DRP Library ────────────────────────────────────────────────────────────
export const getDRPEntries = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.sector && params.sector !== "All") query.set("sector", params.sector);
  if (params.investmentRange && params.investmentRange !== "All") query.set("investmentRange", params.investmentRange);
  if (params.district && params.district !== "All Districts") query.set("district", params.district);
  const qs = query.toString();
  return apiFetch(`${BASE}/drp${qs ? "?" + qs : ""}`, { headers: authHeaders() });
};

// ── Seva First Innovation Challenge ────────────────────────────────────────
export const getMySevaApps = async () => {
  return apiFetch(`${BASE}/seva/mine`, { headers: authHeaders() });
};

export const submitSevaApplication = async (formData) => {
  // formData = FormData (multipart) — text fields + files (ppt/idProof/prototype/research)
    return apiFetch(`${BASE}/seva/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
        timeoutMs: 120000,
    });
};

export const sevaFileUrl = (fileId) =>
  `${BASE}/seva/docs/${fileId}?token=${encodeURIComponent(getToken() || "")}`;

export const sevaAdminFileUrl = (fileId, adminToken) =>
  `${BASE}/seva/admin/file/${fileId}?token=${encodeURIComponent(adminToken || "")}`;