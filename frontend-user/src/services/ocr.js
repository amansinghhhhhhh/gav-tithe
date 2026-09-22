import { createWorker, PSM } from "tesseract.js";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// CDN paths — Vite bundling issues se bachne ke liye official CDN use karte hain
const TESS_WORKER_PATH = "https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/worker.min.js";
const TESS_CORE_PATH = "https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0/tesseract-core-simd-lstm.wasm.js";
const TESS_LANG_PATH = "https://tessdata.projectnaptha.com/4.0.0";

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// OCR misread tolerance ke liye canonical map (O/0, I/1, ...)
const CANON = { O: "0", Q: "0", I: "1", L: "1", Z: "2", S: "5", B: "8", G: "6" };
const canonical = (s) => String(s).replace(/[OQILZSBG]/g, (c) => CANON[c]);

export const aadhaarMatches = (typed, ocr) => {
    const a = canonical(String(typed || "").toUpperCase()).replace(/\D/g, "");
    const b = canonical(String(ocr || "").toUpperCase()).replace(/\D/g, "");
    return !!a && !!b && a === b;
};

// Aadhaar: canonical ke baad kitne chars alag hain (0 = exact, 1 = 1-digit misread, null = lengths alag)
export const aadhaarDiff = (typed, ocr) => {
    const a = canonical(String(typed || "").toUpperCase()).replace(/\D/g, "");
    const b = canonical(String(ocr || "").toUpperCase()).replace(/\D/g, "");
    if (!a || !b || a.length !== b.length) return null;
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff;
};

// PAN: strict equal ya sirf 1 char ka OCR misread (Levenshtein <= 1)
export const panMatches = (typed, ocr) => {
    const a = String(typed || "").trim().toUpperCase();
    const b = String(ocr || "").trim().toUpperCase();
    if (!a || !b || a.length !== b.length) return false;
    if (a === b) return true;
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
};

// ── Udyam: UDYAM-MH-08-0001234 (hyphens/spaces ignore; canonical misread tolerance) ──
const normalizeUdyam = (s) => canonical(String(s || "").toUpperCase()).replace(/[^A-Z0-9]/g, "");

export const udyamDiff = (typed, ocr) => {
    const a = normalizeUdyam(typed);
    const b = normalizeUdyam(ocr);
    if (!a || !b || a.length !== b.length) return null;
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff;
};

export const udyamMatches = (typed, ocr) => {
    const diff = udyamDiff(typed, ocr);
    return diff === 0 || diff === 1;
};

let workerPromise = null;

const getWorker = () => {
    if (!workerPromise) {
        workerPromise = createWorker("eng", 1, {
            workerPath: TESS_WORKER_PATH,
            corePath: TESS_CORE_PATH,
            langPath: TESS_LANG_PATH,
            logger: () => {},
        });
    }
    return workerPromise;
};

// ── PDF → canvas → dataURL ────────────────────────────────────────────────────
const renderPdfToImage = async (file) => {
    const buf = await file.arrayBuffer();
    const pdf = await getDocument({ data: buf }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.9);
};

const isPdf = (file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");

// ── Grayscale + contrast boost — glossy/dim photos ke liye ────────────────────
const preprocessToDataUrl = async (src) => {
    try {
        const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = src;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            const v = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128));
            d[i] = d[i + 1] = d[i + 2] = v;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.92);
    } catch (err) {
        console.error("Preprocess error:", err);
        return null;
    }
};

const preprocessFile = async (file) => {
    const url = URL.createObjectURL(file);
    const out = await preprocessToDataUrl(url);
    URL.revokeObjectURL(url);
    return out;
};

// ── Number extraction ─────────────────────────────────────────────────────────
const contextAround = (text, index, len) => ({
    before: text.slice(Math.max(0, index - 50), index),
    after: text.slice(index + len, index + len + 50),
});

// Aadhaar candidate scoring: label bonus, masked-mobile / partial-prefix penalty
const scoreAadhaarCtx = (before, after) => {
    let score = 0;
    const b = (before || "").toUpperCase();
    const a = (after || "").toUpperCase();
    const bTrim = b.replace(/\s+/g, " ").trim();

    // Positive: Aadhaar label nearby
    if (/(AADHAAR|AADHAR|UIDAI|भारतीय\s*विशिष्ट\s*पहचान|आधार)/.test(b) || /(AADHAAR|AADHAR|UIDAI|आधार)/.test(a)) {
        score += 100;
    }

    // Strong negative: aur digits iske baad aa rahe hain → ye prefix hai, poora number nahi
    // e.g. "2716 5550 3566 | 9967" → first window incomplete; last window clean
    if (/^[ \t]*\d/.test(after || "") || /^\d/.test((after || "").trimStart())) {
        score -= 120;
    }

    // Strong negative: masked stars / mobile label before
    if (/\*{2,}\s*\d{0,4}$/.test(bTrim) || /\*{3,}/.test(b.slice(-15))) {
        score -= 200;
    }
    if (/(MOBILE|PHONE|M)\s*:?\s*\d{0,10}$/.test(bTrim.replace(/[^A-Z0-9:* ]/gi, ""))) {
        score -= 200;
    }

    // Negative: digits glued just before (mobile-4 spillover)
    if (/\d\s*$/.test(before || "") && !/\d{4}[ \t]+\d{4}[ \t]+$/.test(before || "")) {
        score -= 60;
    }
    return score;
};

// Collect ALL 12-digit aadhaar candidates (overlapping spaced + contiguous + sliding glued runs)
const collectAadhaarCandidates = (text) => {
    const out = [];
    const seen = new Set();
    const push = (value, index, len) => {
        const v = String(value).replace(/\D/g, "");
        if (v.length !== 12) return;
        const key = `${v}@${index}`;
        if (seen.has(key)) return;
        seen.add(key);
        const { before, after } = contextAround(text, index, len);
        out.push({ value: v, index, score: scoreAadhaarCtx(before, after) });
    };

    // 1) Spaced XXXX XXXX XXXX — overlapping: har position se try karo
    for (let i = 0; i < text.length; i++) {
        if (!/\d/.test(text[i])) continue;
        const m = text.slice(i).match(/^\d{4}[ \t]+\d{4}[ \t]+\d{4}(?!\d)/);
        if (m) push(m[0], i, m[0].length);
    }

    // 2) Contiguous exactly-12 with boundaries
    const plainRe = /(?<!\d)\d{12}(?!\d)/g;
    let pm;
    while ((pm = plainRe.exec(text)) !== null) {
        push(pm[0], pm.index, 12);
    }

    // 3) Long glued digit runs → sliding 12-digit windows (e.g. 2716555035669967)
    const runsRe = /\d{13,}/g;
    let rm;
    while ((rm = runsRe.exec(text)) !== null) {
        const run = rm[0];
        for (let i = 0; i <= run.length - 12; i++) {
            push(run.slice(i, i + 12), rm.index + i, 12);
        }
    }

    return out;
};

const extractAadhaar = (text, hint) => {
    const hintDigits = String(hint || "").replace(/\D/g, "");
    const candidates = collectAadhaarCandidates(text);

    if (candidates.length === 0) {
        // Last resort: exact-12 tokens after split (no partial gluing)
        const tokens = String(text || "").split(/[^0-9]+/).filter((t) => t.length === 12);
        return tokens[0] || null;
    }
    if (candidates.length === 1) return candidates[0].value;

    // Priority 1: user ka typed hint se match (exact ya 1-digit OCR misread)
    if (hintDigits.length === 12) {
        const exact = candidates.find((c) => c.value === hintDigits);
        if (exact) return exact.value;
        const near = candidates.find((c) => {
            const d = aadhaarDiff(hintDigits, c.value);
            return d === 0 || d === 1;
        });
        if (near) return near.value;
    }

    // Priority 2: best context score (label bonus, masked-mobile penalty)
    const sorted = [...candidates].sort((a, b) => b.score - a.score);
    // Tie → pehla (reading order) prefer
    if (sorted.length > 1 && sorted[0].score === sorted[1].score) {
        const first = sorted.reduce((p, c) => (c.index < p.index ? c : p));
        // Agar score tie hai toh lowest index (card layout mein aadhaar usually upar)
        // lekin agar kisi pe label bonus hai toh wo already upar hoga
        return sorted[0].score > 0 ? sorted[0].value : first.value;
    }
    return sorted[0].value;
};

const extractPan = (text) => {
    // 1. spaces ke saath bhi match karo: "ABCDE 1234 F"
    const spaced = text.match(/[A-Z](?:\s?[A-Z]){4}(?:\s?[0-9]){4}\s?[A-Z]/g);
    for (const m of spaced || []) {
        const s = m.replace(/\s+/g, "");
        if (PAN_RE.test(s)) return s;
    }
    // 2. raw contiguous
    const contiguous = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/g);
    if (contiguous) return contiguous[0];
    // 3. compact (saare spaces hata ke)
    const compact = text.replace(/\s+/g, "");
    const m = compact.match(/[A-Z]{5}[0-9]{4}[A-Z]/g);
    if (m) return m[0];
    // 4. fuzzy fallback — 10-char alphanumeric run (match-time tolerance handle karega)
    const runs = compact.match(/[A-Z0-9]{10}/g);
    if (runs && runs.length) return runs[0];
    return null;
};

const extractUdyam = (text) => {
    // 1. separators ke saath: UDYAM-MH-08-0001234 ya UDYAM MH 08 0001234
    const spaced = text.match(/UDYAM[-\s]?[A-Z]{2}[-\s]?\d{2}[-\s]?\d{6,7}/g);
    if (spaced) return spaced[0].replace(/[^A-Z0-9]/g, "");
    // 2. compact: UDYAMMH080001234
    const compact = text.replace(/[^A-Z0-9]/g, "");
    const m = compact.match(/UDYAM[A-Z]{2}\d{2}\d{6,7}/);
    return m ? m[0] : null;
};

const recognize = async (worker, input, sparse) => {
    await worker.setParameters({
        tessedit_pageseg_mode: sparse ? PSM.SPARSE_TEXT : PSM.AUTO,
        tessedit_char_whitelist: sparse ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 " : "",
    });
    const { data } = await worker.recognize(input);
    const text = (data.text || "").toUpperCase();
    console.debug(`[OCR psm=${sparse ? "sparse" : "auto"}]`, JSON.stringify(text.slice(0, 600)));
    return text;
};

// ── Main entry ────────────────────────────────────────────────────────────────
export const extractDocNumber = async (file, opts = {}) => {
    const attempts = [];
    try {
        const worker = await getWorker();
        const pdf = isPdf(file);
        const original = pdf ? await renderPdfToImage(file) : file;

        const inputs = [original];
        const processed = pdf ? await preprocessToDataUrl(original) : await preprocessFile(file);
        if (processed) inputs.push(processed);

        for (const input of inputs) {
            for (const sparse of [false, true]) {
                const text = await recognize(worker, input, sparse);
                attempts.push(text);
                const aadhaar = extractAadhaar(text, opts.aadhaarHint);
                const pan = extractPan(text);
                const udyam = extractUdyam(text);
                if (aadhaar || pan || udyam) {
                    console.debug("[OCR] FOUND aadhaar:", aadhaar, "pan:", pan, "udyam:", udyam);
                    return { ok: true, aadhaar, pan, udyam, rawText: text, attempts };
                }
            }
        }
        return { ok: true, aadhaar: null, pan: null, udyam: null, rawText: "", attempts };
    } catch (err) {
        console.error("OCR error:", err);
        return { ok: false, error: err.message, attempts };
    }
};
