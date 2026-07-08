const mongoose = require("mongoose");

const knowledgeBaseSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.models.KnowledgeBase || mongoose.model("KnowledgeBase", knowledgeBaseSchema, "knowledge_base");
