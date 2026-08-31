const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const DRPEntry = require("./models/DRPEntry");

const SEED_DATA = [
  { sector: "Manufacturing", odop: "General", variantName: "Soap Manufacturing", variantId: 1045, location: "Mumbai", investmentRange: "₹0.5L - ₹2L", investmentMin: 0.5, investmentMax: 2, roi: 51, jobs: 6, subsidyPercent: 25, tags: ["PMEGP", "DIC", "MSME"], category: "Manufacturing" },
  { sector: "Food Processing", odop: "Jaggery", variantName: "Namkeen Production", variantId: 1041, location: "Kolhapur", investmentRange: "₹5L - ₹25L", investmentMin: 5, investmentMax: 25, roi: 40, jobs: 7, subsidyPercent: 45, tags: ["PMFME", "FSSAI", "Food"], category: "Food" },
  { sector: "Food Processing", odop: "General", variantName: "Bakery Production", variantId: 1037, location: "Yavatmal", investmentRange: "₹10L - ₹50L", investmentMin: 10, investmentMax: 50, roi: 23, jobs: 15, subsidyPercent: 40, tags: ["PMFME", "FSSAI", "Food"], category: "Food" },
  { sector: "Herbal/Ayurvedic", odop: "General", variantName: "Herbal Oil", variantId: 1044, location: "Buldhana", investmentRange: "₹10L - ₹50L", investmentMin: 10, investmentMax: 50, roi: 51, jobs: 12, subsidyPercent: 45, tags: ["AYUSH", "PMFME", "Herbal"], category: "Herbal" },
  { sector: "Herbal/Ayurvedic", odop: "Cashew", variantName: "Tulsi Extract", variantId: 1049, location: "Ratnagiri", investmentRange: "₹2L - ₹10L", investmentMin: 2, investmentMax: 10, roi: 31, jobs: 16, subsidyPercent: 30, tags: ["AYUSH", "PMFME", "Herbal"], category: "Herbal" },
  { sector: "Renewable Energy", odop: "General", variantName: "Biogas Plant", variantId: 1042, location: "Gondia", investmentRange: "₹2L - ₹10L", investmentMin: 2, investmentMax: 10, roi: 24, jobs: 18, subsidyPercent: 30, tags: ["MNRE", "PMEGP", "Green Energy"], category: "Green Energy" },
  { sector: "Animal Husbandry", odop: "General", variantName: "Cattle/Buffalo Farming", variantId: 1033, location: "Nandurbar", investmentRange: "₹25L - ₹1Cr", investmentMin: 25, investmentMax: 100, roi: 43, jobs: 5, subsidyPercent: 35, tags: ["NABARD", "NLM", "Animal Husbandry"], category: "Animal Husbandry" },
  { sector: "Textile", odop: "General", variantName: "Textile Weaving", variantId: 1036, location: "Gadchiroli", investmentRange: "₹1L - ₹5L", investmentMin: 1, investmentMax: 5, roi: 24, jobs: 22, subsidyPercent: 40, tags: ["Textile Ministry", "PMEGP", "Textile"], category: "Textile" },
  { sector: "Textile", odop: "General", variantName: "Bedsheet Manufacturing", variantId: 1040, location: "Sindhudurg", investmentRange: "₹0.5L - ₹2L", investmentMin: 0.5, investmentMax: 2, roi: 44, jobs: 30, subsidyPercent: 40, tags: ["Textile Ministry", "PMEGP", "Textile"], category: "Textile" },
  { sector: "Agro-Processing", odop: "General", variantName: "Chilli Processing", variantId: 1043, location: "Washim", investmentRange: "₹5L - ₹25L", investmentMin: 5, investmentMax: 25, roi: 44, jobs: 21, subsidyPercent: 25, tags: ["PMFME", "ODOP", "Agro"], category: "Agro" },
  { sector: "Dairy", odop: "General", variantName: "Milk Powder", variantId: 1047, location: "Nandurbar", investmentRange: "₹25L - ₹1Cr", investmentMin: 25, investmentMax: 100, roi: 15, jobs: 18, subsidyPercent: 35, tags: ["NABARD", "DIDF", "Dairy"], category: "Dairy" },
  { sector: "Infrastructure", odop: "Onion", variantName: "Warehouse", variantId: 1048, location: "Nashik", investmentRange: "₹1L - ₹5L", investmentMin: 1, investmentMax: 5, roi: 15, jobs: 24, subsidyPercent: 25, tags: ["NABARD", "MIDH", "Infrastructure"], category: "Infrastructure" },
  { sector: "Manufacturing", odop: "Onion", variantName: "Electrical Parts", variantId: 1050, location: "Nashik", investmentRange: "₹1L - ₹5L", investmentMin: 1, investmentMax: 5, roi: 52, jobs: 31, subsidyPercent: 35, tags: ["PMEGP", "DIC", "MSME"], category: "Manufacturing" },
  { sector: "Food Processing", odop: "Floriculture", variantName: "Biscuit Manufacturing", variantId: 1046, location: "Satara", investmentRange: "₹0.5L - ₹2L", investmentMin: 0.5, investmentMax: 2, roi: 24, jobs: 27, subsidyPercent: 25, tags: ["PMFME", "FSSAI", "Food"], category: "Food" },
  { sector: "Service", odop: "General", variantName: "Travel Agency", variantId: 1031, location: "Nanded", investmentRange: "₹25L - ₹1Cr", investmentMin: 25, investmentMax: 100, roi: 53, jobs: 4, subsidyPercent: 25, tags: ["PMEGP", "CMEGP", "Service"], category: "Service" },
  { sector: "Renewable Energy", odop: "General", variantName: "Biogas Plant", variantId: 1032, location: "Wardha", investmentRange: "₹5L - ₹25L", investmentMin: 5, investmentMax: 25, roi: 34, jobs: 15, subsidyPercent: 30, tags: ["MNRE", "PMEGP", "Green Energy"], category: "Green Energy" },
  { sector: "Food Processing", odop: "General", variantName: "Chapati Manufacturing", variantId: 1034, location: "Gondia", investmentRange: "₹25L - ₹1Cr", investmentMin: 25, investmentMax: 100, roi: 46, jobs: 31, subsidyPercent: 25, tags: ["PMFME", "FSSAI", "Food"], category: "Food" },
  { sector: "Textile", odop: "General", variantName: "Wool Processing", variantId: 1035, location: "Nanded", investmentRange: "₹2L - ₹10L", investmentMin: 2, investmentMax: 10, roi: 33, jobs: 4, subsidyPercent: 50, tags: ["Textile Ministry", "PMEGP", "Textile"], category: "Textile" },
  { sector: "Renewable Energy", odop: "General", variantName: "Solar Water Heater", variantId: 1038, location: "Mumbai", investmentRange: "₹1L - ₹5L", investmentMin: 1, investmentMax: 5, roi: 18, jobs: 25, subsidyPercent: 40, tags: ["MNRE", "PMEGP", "Green Energy"], category: "Green Energy" },
  { sector: "Renewable Energy", odop: "General", variantName: "Solar Water Heater", variantId: 1039, location: "Parbhani", investmentRange: "₹2L - ₹10L", investmentMin: 2, investmentMax: 10, roi: 16, jobs: 8, subsidyPercent: 45, tags: ["MNRE", "PMEGP", "Green Energy"], category: "Green Energy" },
  { sector: "Dairy", odop: "General", variantName: "Lassi/Buttermilk Production", variantId: 850, location: "Dhule", investmentRange: "₹0.5L - ₹2L", investmentMin: 0.5, investmentMax: 2, roi: 30, jobs: 21, subsidyPercent: 25, tags: ["NABARD", "DIDF", "Dairy"], category: "Dairy" },
  { sector: "Agro-Processing", odop: "General", variantName: "Groundnut Processing", variantId: 849, location: "Amravati", investmentRange: "₹10L - ₹50L", investmentMin: 10, investmentMax: 50, roi: 35, jobs: 25, subsidyPercent: 45, tags: ["PMFME", "ODOP", "Agro"], category: "Agro" },
  { sector: "Textile", odop: "Dairy", variantName: "Textile Weaving", variantId: 851, location: "Pune", investmentRange: "₹1L - ₹5L", investmentMin: 1, investmentMax: 5, roi: 52, jobs: 8, subsidyPercent: 30, tags: ["Textile Ministry", "PMEGP", "Textile"], category: "Textile" },
  { sector: "Dairy", odop: "Coconut", variantName: "Curd Production", variantId: 845, location: "Ratnagiri", investmentRange: "₹10L - ₹50L", investmentMin: 10, investmentMax: 50, roi: 37, jobs: 29, subsidyPercent: 50, tags: ["NABARD", "DIDF", "Dairy"], category: "Dairy" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    let created = 0;
    let updated = 0;

    for (const entry of SEED_DATA) {
      const result = await DRPEntry.findOneAndUpdate(
        { variantId: entry.variantId },
        { $set: entry },
        { upsert: true, new: true }
      );
      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }
    }

    console.log(`\n🎉 Seed complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Total:   ${SEED_DATA.length}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
