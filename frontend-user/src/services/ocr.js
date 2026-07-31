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
const extractAadhaar = (text) => {
    const spaced = text.match(/\d{4}\s+\d{4}\s+\d{4}/g);
    if (spaced) return spaced[0].replace(/\s/g, "");
    const plain = text.match(/\b\d{12}\b/g);
    if (plain) return plain[0];
    const compact = text.replace(/\s+/g, "");
    const m = compact.match(/\d{12}/g);
    return m ? m[0] : null;
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
export const extractDocNumber = async (file) => {
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
                const aadhaar = extractAadhaar(text);
                const pan = extractPan(text);
                if (aadhaar || pan) {
                    console.debug("[OCR] FOUND aadhaar:", aadhaar, "pan:", pan);
                    return { ok: true, aadhaar, pan, rawText: text, attempts };
                }
            }
        }
        return { ok: true, aadhaar: null, pan: null, rawText: "", attempts };
    } catch (err) {
        console.error("OCR error:", err);
        return { ok: false, error: err.message, attempts };
    }
};
