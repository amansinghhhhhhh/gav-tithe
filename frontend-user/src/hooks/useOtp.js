import { useState, useRef } from "react";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { verifyOtpApi } from "../services/api";

function useOtp() {
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const confirmRef = useRef(null);
    const recaptchaRef = useRef(null);

    // reCAPTCHA setup
    const setupRecaptcha = () => {
        // Purana clear karo
        if (recaptchaRef.current) {
            recaptchaRef.current.clear();
            recaptchaRef.current = null;
        }

        recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => { },
            "expired-callback": () => {
                setError("reCAPTCHA expire ho gaya, dobara try karo");
                recaptchaRef.current = null;
            },
        });

        return recaptchaRef.current;
    };

    // Step 1 — OTP bhejo
    const sendOtp = async (mobile) => {
        setError("");
        setLoading(true);
        try {
            const verifier = setupRecaptcha();
            const phoneNumber = `+91${mobile}`;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
            confirmRef.current = confirmation;
            setOtpSent(true);
        } catch (err) {
            console.error("OTP send error:", err);
            setError(getErrorMessage(err.code));
            // Reset on error
            if (recaptchaRef.current) {
                recaptchaRef.current.clear();
                recaptchaRef.current = null;
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2 — OTP verify karo + backend se JWT lo
    const verifyOtp = async (otp, mobile, name) => {
        setError("");
        setLoading(true);
        try {
            if (!confirmRef.current) throw new Error("Pehle OTP bhejo");

            const result = await confirmRef.current.confirm(otp);
            const idToken = await result.user.getIdToken();

            console.log("📤 Sending to backend:", { mobile, name }); // debug

            const data = await verifyOtpApi(idToken, mobile, name);

            console.log("📥 Backend response:", data); // debug

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

    const reset = () => {
        setOtpSent(false);
        setOtpVerified(false);
        setError("");
        confirmRef.current = null;
        if (recaptchaRef.current) {
            recaptchaRef.current.clear();
            recaptchaRef.current = null;
        }
    };

    return { otpSent, otpVerified, loading, error, sendOtp, verifyOtp, reset };
}

// Firebase error codes → readable messages
function getErrorMessage(code) {
    const messages = {
        "auth/invalid-phone-number": "Invalid phone number",
        "auth/too-many-requests": "Bahut zyada requests, thodi der baad try karo",
        "auth/invalid-verification-code": "OTP galat hai",
        "auth/code-expired": "OTP expire ho gaya, dobara bhejo",
        "auth/missing-phone-number": "Phone number daalo",
        "auth/quota-exceeded": "SMS quota exceed ho gaya",
        "auth/captcha-check-failed": "reCAPTCHA fail hua, page refresh karo",
    };
    return messages[code] || null;
}

export default useOtp;