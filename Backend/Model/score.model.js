import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number ,default: 0},
  score_inter : { type: Number, default: 0},
});

export default mongoose.model("Score", scoreSchema);
