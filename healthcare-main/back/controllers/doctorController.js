import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import Doctor from "../models/Doctor.js";
import {
  storeDoctorInPinecone,
  getDoctorFromPinecone,
  updateDoctorInPinecone,
  deleteDoctorFromPinecone,
} from "../services/pineconeService.js";

// ─── JWT token banao ──────────────────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ─── 1. REGISTER ─────────────────────────────────────────────────
// POST /api/doctor/register
// Form data + files (multipart)
export const registerDoctor = async (req, res) => {
  try {
    const {
      // Personal
      name, email, password, phone, gender, dateOfBirth, city,
      // Professional
      specialization, expertise, qualifications, registrationNumber,
      experience, languages, consultationFees,
      // Availability
      availableDays, timeSlots, maxAppointmentsPerDay,
      // Clinic
      clinicName, clinicAddress, clinicPhone,
      // Bio
      bio,
    } = req.body;

    // ── Check karo email already exist toh nahi karta ──
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Yeh email already registered hai" });
    }

    // ── Files Cloudinary pe upload karo ──────────────────
    const uploadToCloudinary = async (file, folder) => {
      if (!file) return "";
      return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: `healthcare/doctors/${folder}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    };

    // Profile photo
    const profilePhoto = await uploadToCloudinary(
      req.files?.profilePhoto?.[0], "photos"
    );

    // Documents
    const degreeCertificate = await uploadToCloudinary(
      req.files?.degreeCertificate?.[0], "documents"
    );
    const registrationCertificate = await uploadToCloudinary(
      req.files?.registrationCertificate?.[0], "documents"
    );
    const identityProof = await uploadToCloudinary(
      req.files?.identityProof?.[0], "documents"
    );

    // Additional certificates (multiple files)
    const additionalCertificates = [];
    if (req.files?.additionalCertificates) {
      for (const file of req.files.additionalCertificates) {
        const url = await uploadToCloudinary(file, "documents");
        additionalCertificates.push(url);
      }
    }

    // ── MongoDB mein sirf login info save karo ────────────
    const doctor = await Doctor.create({ email, password, role: "doctor" });

    // ── Pinecone mein poora data store karo ───────────────
    const doctorData = {
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      city,
      profilePhoto,
      specialization,
      // Frontend se string ya array dono aa sakta hai
      expertise:      typeof expertise === "string" ? JSON.parse(expertise || "[]") : expertise || [],
      qualifications: typeof qualifications === "string" ? JSON.parse(qualifications || "[]") : qualifications || [],
      registrationNumber,
      experience:     Number(experience),
      languages:      typeof languages === "string" ? JSON.parse(languages || "[]") : languages || [],
      consultationFees: Number(consultationFees),
      availableDays:  typeof availableDays === "string" ? JSON.parse(availableDays || "[]") : availableDays || [],
      timeSlots:      typeof timeSlots === "string" ? JSON.parse(timeSlots || "[]") : timeSlots || [],
      maxAppointmentsPerDay: Number(maxAppointmentsPerDay) || 10,
      clinicName,
      clinicAddress,
      clinicPhone,
      documents: {
        degreeCertificate,
        registrationCertificate,
        identityProof,
        additionalCertificates,
      },
      bio,
      rating: 0,
      totalRatings: 0,
    };

    const pineconeId = await storeDoctorInPinecone(doctor._id, doctorData);

    // ── MongoDB mein pineconeId save karo ────────────────
    doctor.pineconeId = pineconeId;
    await doctor.save();

    // ── Token banao aur response bhejo ───────────────────
    const token = generateToken(doctor._id, "doctor");

    res.status(201).json({
      success: true,
      message: "Doctor registration successful!",
      token,
      doctor: {
        id:        doctor._id,
        pineconeId,
        email,
        name,
        role:      "doctor",
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Registration mein error aaya" });
  }
};

// ─── 2. LOGIN ────────────────────────────────────────────────────
// POST /api/doctor/login
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email aur password dono chahiye" });
    }

    // ── MongoDB se dhundo ─────────────────────────────────
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: "Email ya password galat hai" });
    }

    // ── Password match karo ───────────────────────────────
    const isMatch = await doctor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email ya password galat hai" });
    }

    // ── Pinecone se poora profile lao ─────────────────────
    const profile = await getDoctorFromPinecone(doctor.pineconeId);

    const token = generateToken(doctor._id, "doctor");

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      doctor: {
        id:         doctor._id,
        pineconeId: doctor.pineconeId,
        email:      doctor.email,
        role:       doctor.role,
        // Pinecone se aaya poora profile
        ...profile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Login mein error aaya" });
  }
};

// ─── 3. PROFILE GET ───────────────────────────────────────────────
// GET /api/doctor/profile
// (Protected route — token chahiye)
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor nahi mila" });
    }

    const profile = await getDoctorFromPinecone(doctor.pineconeId);

    res.status(200).json({
      success: true,
      doctor: {
        id:         doctor._id,
        pineconeId: doctor.pineconeId,
        email:      doctor.email,
        role:       doctor.role,
        ...profile,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: error.message || "Profile lane mein error aaya" });
  }
};

// ─── 4. PROFILE UPDATE ────────────────────────────────────────────
// PUT /api/doctor/profile
// (Protected route)
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor nahi mila" });
    }

    // Pinecone mein update karo
    await updateDoctorInPinecone(doctor.pineconeId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile update ho gaya!",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: error.message || "Profile update mein error aaya" });
  }
};

// ─── 5. DOCTORS SEARCH ───────────────────────────────────────────
// GET /api/doctor/search?q=cardiologist+delhi
// (Public route — koi bhi search kar sakta hai)
export const searchDoctors = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query chahiye" });
    }

    const { searchDoctors: search } = await import("../services/pineconeService.js");
    const doctors = await search(q);

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: error.message || "Search mein error aaya" });
  }
};