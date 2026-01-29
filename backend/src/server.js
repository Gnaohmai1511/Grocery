import express from "express";
import path from "path";
import cors from "cors";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { functions, inngest } from "./config/inngest.js";
import adminRoutes from "./routes/admin.route.js";
import usersRoutes from "./routes/user.route.js";
import ordersRoutes from "./routes/order.route.js";
import reviewsRoutes from "./routes/review.route.js";
import productsRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(clerkMiddleware());// request authentication middleware
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true })); // credentials: true allows the browser to send the cookies to the server with the request

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/admin",adminRoutes);// Admin routes
app.use("/api/users",usersRoutes);// Users routes
app.use("/api/orders",ordersRoutes);
app.use("/api/reviews",reviewsRoutes);
app.use("/api/products",productsRoutes);
app.use("/api/cart",cartRoutes);

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

const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log("Server is up and running");
  });
};

startServer();