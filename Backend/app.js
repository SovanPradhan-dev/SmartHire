import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/dbconnection.js";
import questionRoutes from "./Routes/test.route.js";
import userRouter from "./Routes/user.route.js";
import compilerRoutes from "./Routes/compiler.route.js";
import dns from "dns";

import ftofRoute from "./Routes/ftof.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

dns.setServers(['1.1.1.1', '8.8.8.8']);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Google OAuth (google-auth-library manual flow) lives at:
//   GET /user/google          -> redirect to Google
//   GET /user/google/callback -> exchange code, issue JWT, redirect to frontend
// NOTE: config/passport.js + Routes/auth.route.js are deprecated and unmounted.
app.use("/api", questionRoutes);
app.use("/code", compilerRoutes);
app.use("/user", userRouter);
app.use("/inter", ftofRoute);

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
connectDB();
