// ── Firebase error code → translation key ───────────────────────────────────
// User ko raw Firebase message kabhi mat dikhao — hamesha mapped message.
// Koi bhi tool/service ka naam (Firebase, reCAPTCHA, etc.) user-facing text me nahi hai.
const FB_ERROR_MAP = {
    "auth/invalid-email": "fb_invalid_email",
    "auth/user-not-found": "fb_user_not_found",
    "auth/wrong-password": "fb_wrong_password",
    "auth/invalid-credential": "fb_invalid_credential",
    "auth/invalid-login-credentials": "fb_invalid_credential",
    "auth/email-already-in-use": "fb_email_in_use",
    "auth/weak-password": "fb_weak_password",
    "auth/too-many-requests": "fb_too_many_requests",
    "auth/network-request-failed": "fb_network",
    "auth/operation-not-allowed": "fb_generic",
    "auth/user-disabled": "fb_user_disabled",
    "auth/requires-recent-login": "fb_recent_login",
    "auth/invalid-phone-number": "fb_invalid_phone",
    "auth/missing-phone-number": "fb_missing_phone",
    "auth/invalid-verification-code": "fb_bad_otp",
    "auth/code-expired": "fb_otp_expired",
    "auth/quota-exceeded": "fb_quota",
    "auth/captcha-check-failed": "fb_captcha",
    "auth/invalid-app-credential": "fb_generic",
    "auth/invalid-action-code": "fb_invalid_link",
    "auth/expired-action-code": "fb_expired_link",
    "auth/popup-closed-by-user": "fb_popup_closed",
    "auth/cancelled-popup-request": "fb_popup_closed",
    "auth/account-exists-with-different-credential": "fb_account_exists",
};

export function firebaseErrorKey(code) {
    return FB_ERROR_MAP[code] || "fb_generic";
}
