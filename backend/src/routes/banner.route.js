import { Router } from "express";
import { getAllBanners } from "../controllers/banner.controller.js";

const router = Router();

router.get("/", getAllBanners);

export default router;