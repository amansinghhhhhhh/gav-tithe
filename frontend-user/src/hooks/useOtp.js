import { useState, useRef, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../config/firebase";
import { verifyOtpApi } from "../services/api";

function useOtp() {
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const confirmRef = useRef(null);
    const recaptchaRef = useRef(null);

    // ── Cleanup on unmount ──────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            destroyRecaptcha();
        };
    }, []);

    const destroyRecaptcha = () => {
        try {
            if (recaptchaRef.current) {
                recaptchaRef.current.clear();
            }
        } catch (_) { }
        recaptchaRef.current = null;

        // DOM container bhi reset karo — Firebase dobara inject kar sake
        const el = document.getElementById("recaptcha-container");
        if (el) el.innerHTML = "";
    };

    // ── reCAPTCHA initialize (ek baar) ─────────────────────────────────────
    const getRecaptcha = () => {
        // Already initialized hai toh reuse karo
        if (recaptchaRef.current) return recaptchaRef.current;

        recaptchaRef.current = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "invisible",
                callback: () => { },
                "expired-callback": () => {
                    setError("reCAPTCHA expire ho gaya, dobara try karo");
                    destroyRecaptcha();
                },
            }
        );

        return recaptchaRef.current;
    };

    // ── Step 1: OTP bhejo ───────────────────────────────────────────────────
    const sendOtp = async (mobile) => {
        setError("");
        setLoading(true);

        // Pehle purana recaptcha saaf karo (resend case)
        if (confirmRef.current) {
            destroyRecaptcha();
        }

        try {
            const verifier = getRecaptcha();

            // render() explicitly call karo — invisible hone pe bhi zaroori hai
            await verifier.render();

            const phoneNumber = `+91${mobile}`;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
            confirmRef.current = confirmation;
            setOtpSent(true);
        } catch (err) {
            console.error("OTP send error:", err);
            setError(getErrorMessage(err.code) || "OTP bhejne mein problem aayi");
            destroyRecaptcha();
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: OTP verify karo ─────────────────────────────────────────────
    const verifyOtp = async (otp, mobile, name) => {
        setError("");
        setLoading(true);
        try {
            if (!confirmRef.current) throw new Error("Pehle OTP bhejo");

            const result = await confirmRef.current.confirm(otp);
            const idToken = await result.user.getIdToken();

            const data = await verifyOtpApi(idToken, mobile, name);
            if (!data.success) throw new Error(data.message);

            setOtpVerified(true);
            return data;
        } catch (err) {
            console.error("OTP verify error:", err);
            setError(getErrorMessage(err.code) || err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ── Reset ───────────────────────────────────────────────────────────────
    const reset = () => {
        setOtpSent(false);
        setOtpVerified(false);
        setError("");
        confirmRef.current = null;
        destroyRecaptcha();
    };

    return { otpSent, otpVerified, loading, error, sendOtp, verifyOtp, reset };
}

// ── Firebase error codes → readable messages ────────────────────────────────
function getErrorMessage(code) {
    const messages = {
        "auth/invalid-phone-number": "Phone number galat hai",
        "auth/too-many-requests": "Bahut zyada requests, thodi der baad try karo",
        "auth/invalid-verification-code": "OTP galat hai",
        "auth/code-expired": "OTP expire ho gaya, dobara bhejo",
        "auth/missing-phone-number": "Phone number daalo",
        "auth/quota-exceeded": "SMS quota exceed ho gaya",
        "auth/captcha-check-failed": "reCAPTCHA fail hua, page refresh karo",
        "auth/network-request-failed": "Network error, internet check karo",
    };
    return messages[code] || null;
}

export default useOtp;