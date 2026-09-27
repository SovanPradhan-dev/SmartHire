import mongoose, { Schema } from "mongoose";

const ftofschema = new mongoose.Schema({
    question: {
    type: String,
    required: true,
  },

  answer: {
    type : String,
    required : true,
  },

  keywords: [String],

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },

  topic: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("ftof",ftofschema,"ftof") ;