import express from "express";
import path from "path";
import { ENV } from "./config/env.js";
import { connect } from "http2";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'

const app = express();
const __dirname = path.resolve();

app.use(clerkMiddleware()); // request authentication middleware

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../admin", "dist", "index.html"));
  });
}

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  connectDB();
});