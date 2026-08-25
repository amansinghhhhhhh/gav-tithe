const FormData = require("../models/FormData");

/**
 * Generate unique ID based on address
 * Format: MH-{DIST}-{TALUKA}-{VILLAGE}-{COUNTER}
 * Example: MH-ANG-ANG-ANG-001
 */

const extractAbbr = (str) => {
    if (!str || typeof str !== "string") return "XXX";
    const cleaned = str.replace(/[^a-zA-Z\s]/g, "").trim();
    if (cleaned.length === 0) return "XXX";
    return cleaned.substring(0, 3).toUpperCase();
};

const generateUniqueId = async (dist, taluka, village) => {
    const distAbbr = extractAbbr(dist);
    const talukaAbbr = extractAbbr(taluka);
    const villageAbbr = extractAbbr(village);

    const prefix = `MH-${distAbbr}-${talukaAbbr}-${villageAbbr}`;

    const regex = new RegExp(`^${prefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}-(\\d{3})$`);

    const existing = await FormData.find({ uniqueId: { $regex: regex } })
        .sort({ uniqueId: -1 })
        .lean();

    let counter = 1;
    if (existing.length > 0) {
        const lastId = existing[0].uniqueId;
        const lastNum = parseInt(lastId.split("-").pop(), 10);
        counter = lastNum + 1;
    }

    const counterStr = String(counter).padStart(3, "0");
    return `${prefix}-${counterStr}`;
};

module.exports = { generateUniqueId };
