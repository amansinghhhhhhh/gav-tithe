export const AVATAR_GRADIENTS = [
    "linear-gradient(135deg, #142952, #1e3a6e)",
    "linear-gradient(135deg, #F97316, #ea580c)",
    "linear-gradient(135deg, #1A7A3C, #16a34a)",
    "linear-gradient(135deg, #7c3aed, #6d28d9)",
    "linear-gradient(135deg, #0ea5e9, #0284c7)",
];

export const initials = (name) => {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const avatarGrad = (name) => {
    let h = 0;
    for (const ch of String(name || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
};

export const Avatar = ({ name, size = 34 }) => (
    <div
        style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: avatarGrad(name),
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.37,
            fontWeight: 700,
            flexShrink: 0,
        }}
    >
        {initials(name)}
    </div>
);
