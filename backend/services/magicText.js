// MagicText SMS gateway — transactional OTP SMS (DLT template approved)
// Template text must EXACTLY match the DLT template; only {#num#} is substituted.
const TEMPLATE_TEXT_EN =
    "Your Gaon Tithe Udyojak Website registration OTP is {#num#}. Enter it to verify your mobile number and complete registration on website. Thank you.";
const TEMPLATE_TEXT_MR =
    "हा OTP: {#num#} गाव तिथे उद्योजक वेबसाईटवर टाकून मोबाईल नंबर verify करा.";

const TIMEOUT_MS = 12000;

async function sendOtpSms(mobile10, otp, lang = "en") {
    const API_URL = process.env.MAGICTEXT_API_URL;
    const AUTH_KEY = process.env.MAGICTEXT_AUTHENTIC_KEY;
    const SENDER_ID = process.env.MAGICTEXT_SENDER_ID;
    const ROUTE = process.env.MAGICTEXT_ROUTE || "1";
    const isMr = String(lang).toLowerCase() === "mr";
    const TEMPLATE_ID = isMr
        ? process.env.MAGICTEXT_TEMPLATE_ID_MR
        : process.env.MAGICTEXT_TEMPLATE_ID;
    const TEMPLATE_TEXT = isMr ? TEMPLATE_TEXT_MR : TEMPLATE_TEXT_EN;

    if (!API_URL || !AUTH_KEY || !SENDER_ID || !TEMPLATE_ID) {
        throw new Error(
            isMr
                ? "MagicText not configured (MAGICTEXT_TEMPLATE_ID_MR missing)"
                : "MagicText not configured (check MAGICTEXT_* env vars)"
        );
    }

    const message = TEMPLATE_TEXT.replace("{#num#}", String(otp));
    const params = new URLSearchParams({
        "authentic-key": AUTH_KEY,
        senderid: SENDER_ID,
        route: ROUTE,
        number: `91${mobile10}`,
        message,
        templateid: TEMPLATE_ID,
    });
    // Non-ASCII (Devanagari) → unicode=2 (UCS-2); bina iske gateway GSM-7 maankar garble karta hai → DLT reject
    if (/[^\x00-\x7F]/.test(message)) params.set("unicode", "2");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(`${API_URL}?${params.toString()}`, { signal: controller.signal });
        const text = await res.text();
        let data = null;
        try {
            data = JSON.parse(text);
        } catch (_) {
            data = null;
        }
        const ok = data && String(data.Status || "").toLowerCase() === "success";
        if (!ok) {
            const desc = (data && data.Description) || text.slice(0, 200) || `HTTP ${res.status}`;
            const code = (data && data.Code) || "?";
            throw new Error(`MagicText: ${desc} (code ${code})`);
        }
        return data;
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { sendOtpSms, TEMPLATE_TEXT_EN, TEMPLATE_TEXT_MR };
