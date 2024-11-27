const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    job: {
      type: String,
      required: true,
    },
    jobDetails: {
      type: String, // Store the job description or details
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    contactInfo: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
