const mongoose = require("mongoose");

const DRPEntrySchema = new mongoose.Schema(
  {
    sector: {
      type: String,
      required: true,
      trim: true,
    },
    odop: {
      type: String,
      default: "General",
      trim: true,
    },
    variantName: {
      type: String,
      required: true,
      trim: true,
    },
    variantId: {
      type: Number,
      required: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    investmentRange: {
      type: String,
      required: true,
    },
    investmentMin: {
      type: Number,
      required: true,
    },
    investmentMax: {
      type: Number,
      required: true,
    },
    roi: {
      type: Number,
      required: true,
    },
    jobs: {
      type: Number,
      required: true,
    },
    subsidyPercent: {
      type: Number,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

DRPEntrySchema.index({ sector: 1, odop: 1, location: 1 });

module.exports = mongoose.model("DRPEntry", DRPEntrySchema);
