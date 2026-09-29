// Display-only place renames (values/backend keys unchanged)
const RENAME = {
    district: {
        Ahmednagar: { en: "Ahilya Nagar", mr: "अहिल्यानगर" },
        Aurangabad: { en: "Chhatrapati Sambhaji Nagar", mr: "छत्रपती संभाजीनगर" },
        Osmanabad: { en: "Dharashiv", mr: "धाराशिव" },
    },
    taluka: {
        Velhe: { en: "Rajgad", mr: "राजगड" },
    },
    village: {},
};

export const override = (kind, lang, s) => RENAME[kind]?.[s]?.[lang] || null;
