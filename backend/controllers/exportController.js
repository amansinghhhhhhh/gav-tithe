const User = require("../models/User");
const FormData = require("../models/FormData");
const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } = require("docx");

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const statusLabel = (s) => {
    const map = {
        draft: "Draft",
        submitted: "Submitted",
        under_review: "Under Review",
        approved: "Approved",
        rejected: "Rejected",
        not_started: "Not Started",
    };
    return map[s] || s || "—";
};

const getData = async (userId) => {
    const user = await User.findById(userId).select("-password").lean();
    if (!user) return null;
    const form = await FormData.findOne({ userId }).lean();
    return { user, form };
};

const safe = (v, fallback = "—") =>
    v === undefined || v === null || v === "" ? fallback : String(v);

const addressString = (addr) => {
    if (typeof addr === "string") return addr;
    if (!addr) return "—";
    return [addr.dist, addr.taluka, addr.village, addr.pincode].filter(Boolean).join(", ") || "—";
};

const fileName = (name, ext) => {
    const base = (name || "applicant").replace(/[^\w.-]/g, "_").replace(/_+/g, "_").slice(0, 60);
    return `applicant_${base}.${ext}`;
};

// ── PDF export ────────────────────────────────────────────────────────────────
const exportFormPdf = async (req, res) => {
    try {
        const { userId } = req.params;
        const { user, form } = await getData(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const s1 = form?.section1 || {};
        const s2 = form?.section2 || {};
        const s3 = form?.section3 || {};
        const s4 = form?.section4 || {};

        const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 50, right: 50 } });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName(user.name, "pdf")}"`);
        doc.pipe(res);

        // Header
        doc.font("Helvetica-Bold").fontSize(16).fillColor("#7f1d1d").text("Gav Tithe Udyojak — Application Form", { align: "center" });
        doc.font("Helvetica").fontSize(10).fillColor("#444").text("Maharashtra Chamber of Commerce, Industry & Agriculture (MACCIA)", { align: "center" });
        doc.moveDown(1);

        // Status banner
        const status = form ? statusLabel(form.status) : "Not Started";
        doc.font("Helvetica-Bold").fontSize(11).fillColor("#b45309")
            .text(`Status: ${status}${form?.editAllowed ? "  |  Edit Allowed" : ""}`)
            .text(`Submitted On: ${form ? fmtDate(form.submittedAt) : "—"}`)
            .text(`Registered On: ${fmtDate(user.createdAt)}`);
        doc.moveDown(0.5);

        const drawSection = (title, rows) => {
            doc.font("Helvetica-Bold").fontSize(13).fillColor("#7f1d1d").text(title);
            doc.moveDown(0.3);
            rows.forEach(([label, value]) => {
                doc.font("Helvetica-Bold").fontSize(10).fillColor("#333").text(label, { continued: true });
                doc.font("Helvetica").fillColor("#111").text(`: ${value}`);
            });
            doc.moveDown(0.7);
        };

        drawSection("1. Personal Information", [
            ["Full Name", safe(s1.fullName || user.name)],
            ["Date of Birth", safe(s1.dob)],
            ["Gender", safe(s1.gender)],
            ["Mobile", safe(s1.mobile || user.mobile)],
            ["Email", safe(s1.email || user.email)],
            ["Education", safe(s1.education)],
            ["Address", addressString(s1.address)],
        ]);

        drawSection("2. Business Information", [
            ["Business Name", safe(s2.businessName)],
            ["Business Type", safe(s2.businessType)],
            ["Sector", s2.sector === "other" ? `Other — ${safe(s2.sectorOther)}` : safe(s2.sector)],
            ["Business Status", safe(s2.businessStatus)],
            ["Employment", safe(s2.employment)],
            ["Investment", safe(s2.investment)],
        ]);

        drawSection("3. Financial Information", [
            ["Had Loan", safe(s3.hadLoan)],
            ["Loan Type", s3.loanType === "other" ? `Other — ${safe(s3.loanTypeOther)}` : safe(s3.loanType)],
            ["Repayment Status", safe(s3.repaymentStatus)],
            ["CIBIL Score", safe(s3.cibilScore)],
            ["Past Difficulty", safe(s3.pastDifficulty)],
        ]);

        drawSection("4. KYC & Bank Details", [
            ["Aadhaar Number", safe(s4.aadhaar)],
            ["PAN Number", safe(s4.pan)],
            ["Udyam Number", safe(s4.udyam)],
            ["Bank Name", safe(s4.bankName)],
            ["Account Number", safe(s4.accountNo)],
        ]);

        const docs = s4.docs || {};
        drawSection("Documents Uploaded", [
            ["Aadhaar Front", docs.aadhaarFront ? "✅ Uploaded" : "—"],
            ["Aadhaar Back", docs.aadhaarBack ? "✅ Uploaded" : "—"],
            ["PAN Card", docs.pan ? "✅ Uploaded" : "—"],
            ["Udyam Certificate", docs.udyam ? "✅ Uploaded" : "—"],
            ["Passport Photo", docs.passport ? "✅ Uploaded" : "—"],
        ]);

        if (form?.adminRemark) {
            drawSection("Admin Remark", [["Remark", safe(form.adminRemark)]]);
        }

        doc.font("Helvetica").fontSize(8).fillColor("#999")
            .text(`Generated on ${new Date().toLocaleString("en-IN")}`, { align: "center" });
        doc.end();
    } catch (err) {
        console.error("PDF export error:", err.message);
        res.status(500).json({ message: "Export failed" });
    }
};

// ── DOCX export ───────────────────────────────────────────────────────────────
const exportFormDocx = async (req, res) => {
    try {
        const { userId } = req.params;
        const { user, form } = await getData(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const s1 = form?.section1 || {};
        const s2 = form?.section2 || {};
        const s3 = form?.section3 || {};
        const s4 = form?.section4 || {};
        const docs = s4.docs || {};

        const kvRows = (rows) => rows.map(([k, v]) =>
            new TableRow({
                children: [
                    new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 20 })] })] }),
                    new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: v, size: 20 })] }),
                ],
            })
        );

        const sectionTitle = (t) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } });

        const children = [
            new Paragraph({ text: "Gav Tithe Udyojak — Application Form", heading: HeadingLevel.TITLE }),
            new Paragraph({ text: "Maharashtra Chamber of Commerce, Industry & Agriculture (MACCIA)", size: 20, color: "444444" }),
            new Paragraph({ text: `Status: ${form ? statusLabel(form.status) : "Not Started"}${form?.editAllowed ? "  |  Edit Allowed" : ""}`, size: 22, bold: true, color: "B45309", spacing: { before: 200 } }),
            new Paragraph({ text: `Submitted On: ${form ? fmtDate(form.submittedAt) : "—"}`, size: 20 }),
            new Paragraph({ text: `Registered On: ${fmtDate(user.createdAt)}`, size: 20 }),

            sectionTitle("1. Personal Information"),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: kvRows([
                    ["Full Name", safe(s1.fullName || user.name)],
                    ["Date of Birth", safe(s1.dob)],
                    ["Gender", safe(s1.gender)],
                    ["Mobile", safe(s1.mobile || user.mobile)],
                    ["Email", safe(s1.email || user.email)],
                    ["Education", safe(s1.education)],
                    ["Address", addressString(s1.address)],
                ]),
            }),

            sectionTitle("2. Business Information"),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: kvRows([
                    ["Business Name", safe(s2.businessName)],
                    ["Business Type", safe(s2.businessType)],
                    ["Sector", s2.sector === "other" ? `Other — ${safe(s2.sectorOther)}` : safe(s2.sector)],
                    ["Business Status", safe(s2.businessStatus)],
                    ["Employment", safe(s2.employment)],
                    ["Investment", safe(s2.investment)],
                ]),
            }),

            sectionTitle("3. Financial Information"),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: kvRows([
                    ["Had Loan", safe(s3.hadLoan)],
                    ["Loan Type", s3.loanType === "other" ? `Other — ${safe(s3.loanTypeOther)}` : safe(s3.loanType)],
                    ["Repayment Status", safe(s3.repaymentStatus)],
                    ["CIBIL Score", safe(s3.cibilScore)],
                    ["Past Difficulty", safe(s3.pastDifficulty)],
                ]),
            }),

            sectionTitle("4. KYC & Bank Details"),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: kvRows([
                    ["Aadhaar Number", safe(s4.aadhaar)],
                    ["PAN Number", safe(s4.pan)],
                    ["Udyam Number", safe(s4.udyam)],
                    ["Bank Name", safe(s4.bankName)],
                    ["Account Number", safe(s4.accountNo)],
                ]),
            }),

            sectionTitle("Documents Uploaded"),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: kvRows([
                    ["Aadhaar Front", docs.aadhaarFront ? "Uploaded" : "—"],
                    ["Aadhaar Back", docs.aadhaarBack ? "Uploaded" : "—"],
                    ["PAN Card", docs.pan ? "Uploaded" : "—"],
                    ["Udyam Certificate", docs.udyam ? "Uploaded" : "—"],
                    ["Passport Photo", docs.passport ? "Uploaded" : "—"],
                ]),
            }),
        ];

        if (form?.adminRemark) {
            children.push(sectionTitle("Admin Remark"));
            children.push(new Paragraph({ text: safe(form.adminRemark), size: 20 }));
        }

        const doc = new Document({ sections: [{ children }] });
        const buffer = await Packer.toBuffer(doc);

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName(user.name, "docx")}"`);
        res.send(buffer);
    } catch (err) {
        console.error("DOCX export error:", err.message);
        res.status(500).json({ message: "Export failed" });
    }
};

module.exports = { exportFormPdf, exportFormDocx };
