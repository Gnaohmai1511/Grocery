import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllProducts } from "../controllers/admin.controller.js";
import { getProductById } from "../controllers/product.controller.js";
import {
  getTopProducts,
  getRecommendedProducts,
} from "../controllers/product.controller.js";
const router = Router();

router.get("/", protectRoute, getAllProducts);
router.get("/top", protectRoute, getTopProducts);
router.get("/recommended", protectRoute, getRecommendedProducts);
router.get("/:id", protectRoute, getProductById);
export default router;