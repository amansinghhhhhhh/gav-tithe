import { useState } from "react";
import translations from "../constants/translations";

function useLang() {
    // Default: Marathi
    const [lang, setLang] = useState("mr");

    // t("key") => returns translated string
    const t = (key) => translations[lang]?.[key] || key;

    const toggleLang = () => setLang((prev) => (prev === "mr" ? "en" : "mr"));

    return { lang, setLang, toggleLang, t };
}

export default useLang;