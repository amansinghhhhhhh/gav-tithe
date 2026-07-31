import { useState, useRef, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../config/firebase";
import { verifyOtpApi } from "../services/api";
import { firebaseErrorKey } from "../services/firebaseErrors";
import { useLang } from "../context/LangContext";

function useOtp() {
    const { t } = useLang();
    const [otpSent, setOtpSent] = useState(false);
    // Fix 2: localStorage se verified state load karo refresh pe
    const [otpVerified, setOtpVerified] = useState(
        () => localStorage.getItem("otp_verified") === "true"
    );
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
        // ❌ DOM container replace mat karo — grecaptcha ka global state purane
        // detached widget se bound rehta hai, naya verifier purana consumed
        // token uthata hai → auth/invalid-app-credential (2nd attempt pe fail).
        // clear() hi kaafi hai — same container dobara render hota hai.
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
                    setError(t("fb_captcha"));
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

        // ✅ Har send pe destroy mat karo — verifier reuse karo; invisible
        // reCAPTCHA har signInWithPhoneNumber call pe fresh token deta hai.
        // (Purana pattern: destroy + DOM replace → consumed token → invalid-app-credential)

        try {
            const verifier = getRecaptcha();
            // render() explicitly mat karo — signInWithPhoneNumber internally call karta hai
            const phoneNumber = `+91${mobile}`;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
            confirmRef.current = confirmation;
            setOtpSent(true);
        } catch (err) {
            console.error("OTP send error:", err);
            setError(t(firebaseErrorKey(err.code)));
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
            localStorage.setItem("otp_verified", "true"); // persist karo
            return data;
        } catch (err) {
            console.error("OTP verify error:", err);
            setError(t(firebaseErrorKey(err.code)));
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
        localStorage.removeItem("otp_verified"); // logout/reset pe clear karo
        destroyRecaptcha();
    };

    return { otpSent, otpVerified, loading, error, sendOtp, verifyOtp, reset };
}

export default useOtp;