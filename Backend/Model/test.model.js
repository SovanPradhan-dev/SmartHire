import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  category: String,
  question: String,
  options: [String],
  answer: String,
  explanation: String
});

const TestModel = mongoose.model("testmodel", testSchema , 'questions');
export default TestModel;
