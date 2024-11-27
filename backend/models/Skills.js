const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skills: [
      {
        skill: {
          type: String,
          required: true,
        },
        proficiency: {
          type: Number,
          enum: [0, 1, 2], // Only 0, 1, or 2 are valid
          required: true,
        },
        dateGained: {
          type: Date,
          default: Date.now,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Skills", skillSchema);
