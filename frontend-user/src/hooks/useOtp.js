import { useState } from "react";
import { sendOtpApi, verifyOtpApi, otpErrMsg } from "../services/api";
import { useLang } from "../context/LangContext";

function useOtp() {
    const { t, lang } = useLang();
    const [otpSent, setOtpSent] = useState(false);
    // Fix 2: localStorage se verified state load karo refresh pe
    // v2: purane Firebase-era key (otp_verified) ke stale values fake-verify na dikhayein
    const [otpVerified, setOtpVerified] = useState(
        () => localStorage.getItem("otp_verified_v2") === "true"
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ── Step 1: OTP bhejo (backend → MagicText SMS) ──────────────────────────
    const sendOtp = async (mobile) => {
        setError("");
        setLoading(true);
        try {
            const data = await sendOtpApi(mobile, "profile", lang);
            if (!data.success) {
                setError(otpErrMsg(data, t));
                return null;
            }
            setOtpSent(true);
            return data;
        } catch (err) {
            console.error("OTP send error:", err);
            setError(t("otp_error_send"));
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: OTP verify karo ──────────────────────────────────────────────
    const verifyOtp = async (otp, mobile, name) => {
        setError("");
        if (!/^\d{6}$/.test(String(otp || ""))) {
            setError(t("otp_error_incomplete"));
            return null;
        }
        setLoading(true);
        try {
            const data = await verifyOtpApi(mobile, otp, "profile", name);
            if (!data.success) {
                setError(otpErrMsg(data, t));
                return null;
            }
            setOtpVerified(true);
            localStorage.setItem("otp_verified_v2", "true"); // persist karo
            return data;
        } catch (err) {
            console.error("OTP verify error:", err);
            setError(t("otp_error_code"));
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ── Reset ────────────────────────────────────────────────────────────────
    const reset = () => {
        setOtpSent(false);
        setOtpVerified(false);
        setError("");
        localStorage.removeItem("otp_verified_v2"); // logout/reset pe clear karo
    };

    return { otpSent, otpVerified, loading, error, sendOtp, verifyOtp, reset };
}

export default useOtp;
