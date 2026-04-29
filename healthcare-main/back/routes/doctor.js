import express from "express";
import multer from "multer";
import {
  registerDoctor,
  loginDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  searchDoctors,
} from "../controllers/doctorController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Multer — files memory mein rakho (Cloudinary pe directly upload honge)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File fields jo form mein honge
const uploadFields = upload.fields([
  { name: "profilePhoto",            maxCount: 1 },
  { name: "degreeCertificate",       maxCount: 1 },
  { name: "registrationCertificate", maxCount: 1 },
  { name: "identityProof",           maxCount: 1 },
  { name: "additionalCertificates",  maxCount: 5 },
]);

// ── Public routes ─────────────────────────────────────────────────
router.post("/register", uploadFields, registerDoctor);
router.post("/login",    loginDoctor);
router.get("/search",    searchDoctors);

// ── Protected routes (token chahiye) ─────────────────────────────
router.get("/profile",   protect, getDoctorProfile);
router.put("/profile",   protect, updateDoctorProfile);

export default router;
