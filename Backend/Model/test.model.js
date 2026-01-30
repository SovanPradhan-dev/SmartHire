import mongoose, { mongo } from "mongoose";

const testSchema = new mongoose.Schema({
  category: String,
  question: String,
  options: [String],
  answer: String,
  explanation: String,
  user : {
    type : mongoose.Schema.Types.ObjectId ,
    ref : 'User'
  }
});

const TestModel = mongoose.model("testmodel", testSchema , 'questions');
export default TestModel;
