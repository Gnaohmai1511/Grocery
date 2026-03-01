import { Router } from "express";
import { createProduct, getAllProducts,
         updateProduct, getAllOrders,
         updateOrderStatus,getAllCustomers,
         getDashboardStats, deleteProduct,
         createCoupon,updateCoupon,
         deleteCoupon,getAllCoupons,
        getOrderStatusStats, getRevenueLast7Days,getTopProducts } from "../controllers/admin.controller.js";

import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.use(protectRoute, adminOnly);

router.post("/products", upload.array("images",3) , createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images",3) , updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", updateOrderStatus);
// PUT: Used for full resource replacement, updating the entire resource
// PATCH: Used for partial resource updates, updating a specific part of the resource

router.get("/customers", getAllCustomers);

router.get("/stats", getDashboardStats);
router.get("/coupons", getAllCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);
router.get("/stats/revenue", getRevenueLast7Days);
router.get("/stats/top-products", getTopProducts);
router.get("/stats/order-status", getOrderStatusStats);
export default router