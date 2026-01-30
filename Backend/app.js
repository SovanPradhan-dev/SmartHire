import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/dbconnection.js";
import questionRoutes from "./Routes/test.routes.js";
import userRouter from "./Routes/user.routes.js" ;
import compilerRoutes from "./Routes/compiler.route.js" ;
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api", questionRoutes);
app.use("/code", compilerRoutes ) ;
app.use("/user", userRouter ) ; 

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
connectDB();