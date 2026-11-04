const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.8;
const SKIP_BELOW_BYTES = 700 * 1024;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });

// KYC photo ko upload se pehle compress karo — slow rural network par 5MB upload timeout hota tha
export const compressImageForUpload = async (file) => {
  if (!file || !IMAGE_TYPES.includes(file.type)) return file;
  if (file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const img = await loadImage(file);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return file;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // PNG transparency ko white background do — JPEG me black na dikhe
    if (file.type === "image/png") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const baseName = (file.name || "document").replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
};
