import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { Header } from "../components/Header";
import { privacyMr, privacyEn } from "../constants/privacyContent";
import { termsMr, termsEn } from "../constants/termsContent";
import { disclaimerMr, disclaimerEn } from "../constants/disclaimerContent";

const DOCS = {
    privacy: { mr: privacyMr, en: privacyEn },
    terms: { mr: termsMr, en: termsEn },
    disclaimer: { mr: disclaimerMr, en: disclaimerEn },
};

const TITLES = {
    privacy: { mr: "गोपनीयता धोरण", en: "Privacy Policy" },
    terms: { mr: "सेवा अटी", en: "Terms of Service" },
    disclaimer: { mr: "अस्वीकरण", en: "Disclaimer" },
};

const p = { fontSize: 15, color: "#374151", lineHeight: 1.8, margin: "0 0 14px", textAlign: "left" };

export default function LegalPage({ doc = "privacy" }) {
    const { lang } = useLang();
    const navigate = useNavigate();
    const blocks = DOCS[doc]?.[lang === "mr" ? "mr" : "en"] || [];
    const title = TITLES[doc]?.[lang === "mr" ? "mr" : "en"] || "Privacy Policy";

    useEffect(() => {
        document.title = `${title} | Gaon Tithe Udyojak`;
        window.scrollTo(0, 0);
    }, [title]);

    return (
        <div>
            <Header />
            <div
                style={{
                    minHeight: "100vh",
                    background: "#f3f4f6",
                    display: "flex",
                    justifyContent: "center",
                    padding: "32px 16px 56px",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 16,
                        maxWidth: 860,
                        width: "100%",
                        padding: "32px 36px 40px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.10)",
                    }}
                >
                    <span
                        onClick={() => navigate(-1)}
                        style={{
                            fontSize: 14,
                            color: "#F97316",
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "inline-block",
                            marginBottom: 18,
                        }}
                    >
                        ← {lang === "mr" ? "मागे" : "Back"}
                    </span>

                    {blocks.map((b, i) => {
                        if (b.t === "h1")
                            return (
                                <h1 key={i} style={{ fontSize: 26, color: "#560A0A", margin: "0 0 6px", fontWeight: 800 }}>
                                    {b.x}
                                </h1>
                            );
                        if (b.t === "sub")
                            return (
                                <p key={i} style={{ fontSize: 16, color: "#142952", fontWeight: 700, margin: "0 0 4px" }}>
                                    {b.x}
                                </p>
                            );
                        if (b.t === "meta")
                            return (
                                <p key={i} style={{ fontSize: 13, color: "#6b7280", margin: "0 0 2px" }}>
                                    {b.x}
                                </p>
                            );
                        if (b.t === "h2")
                            return (
                                <h2
                                    key={i}
                                    style={{
                                        fontSize: 19,
                                        color: "#560A0A",
                                        fontWeight: 700,
                                        margin: "28px 0 12px",
                                        paddingBottom: 6,
                                        borderBottom: "1.5px solid #fde8e8",
                                    }}
                                >
                                    {b.x}
                                </h2>
                            );
                        if (b.t === "h3")
                            return (
                                <h3 key={i} style={{ fontSize: 16.5, color: "#142952", fontWeight: 700, margin: "20px 0 10px" }}>
                                    {b.x}
                                </h3>
                            );
                        if (b.t === "ul")
                            return (
                                <ul key={i} style={{ ...p, paddingLeft: 22, listStyle: "disc", marginBottom: 16 }}>
                                    {b.x.map((item, j) => (
                                        <li key={j} style={{ marginBottom: 6, color: "#374151", lineHeight: 1.7 }}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            );
                        if (b.t === "quote")
                            return (
                                <blockquote
                                    key={i}
                                    style={{
                                        ...p,
                                        background: "#fff7ed",
                                        borderLeft: "4px solid #F97316",
                                        borderRadius: 8,
                                        padding: "14px 16px",
                                        fontStyle: "italic",
                                        margin: "0 0 14px",
                                    }}
                                >
                                    {b.x}
                                </blockquote>
                            );
                        return (
                            <p key={i} style={{ ...p, whiteSpace: "pre-line" }}>
                                {b.x}
                            </p>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
