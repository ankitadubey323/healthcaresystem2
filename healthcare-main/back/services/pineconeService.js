import { Pinecone } from "@pinecone-database/pinecone";

// ─── Pinecone client initialize ───────────────────────────────────
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index("doctoraiagent");

// ─── Embedding banao (llama-text-embed-v2) ────────────────────────
const getEmbedding = async (text) => {
  const response = await pc.inference.embed(
    "llama-text-embed-v2",
    [text],
    { inputType: "passage", truncate: "END" }
  );
  return response.data[0].values;
};

// ─── Dr. ka text banao embedding ke liye ─────────────────────────
const buildDoctorText = (data) => {
  return `
    Doctor Name: ${data.name}
    Specialization: ${data.specialization}
    Expertise: ${(data.expertise || []).join(", ")}
    Qualifications: ${(data.qualifications || []).join(", ")}
    City: ${data.city}
    Languages: ${(data.languages || []).join(", ")}
    Experience: ${data.experience} years
    Bio: ${data.bio || ""}
  `.trim();
};

// ─── 1. Dr. ko Pinecone mein store karo ──────────────────────────
export const storeDoctorInPinecone = async (mongoId, doctorData) => {
  try {
    const text = buildDoctorText(doctorData);
    const embedding = await getEmbedding(text);

    const vector = {
      id: `dr_${mongoId}`,
      values: embedding,
      metadata: {
        mongoId:                String(mongoId),
        name:                   doctorData.name || "",
        email:                  doctorData.email || "",
        phone:                  doctorData.phone || "",
        gender:                 doctorData.gender || "",
        dateOfBirth:            doctorData.dateOfBirth || "",
        city:                   doctorData.city || "",
        profilePhoto:           doctorData.profilePhoto || "",

        // Professional
        specialization:         doctorData.specialization || "",
        expertise:              (doctorData.expertise || []).join(","),
        qualifications:         (doctorData.qualifications || []).join(","),
        registrationNumber:     doctorData.registrationNumber || "",
        experience:             Number(doctorData.experience) || 0,
        languages:              (doctorData.languages || []).join(","),
        consultationFees:       Number(doctorData.consultationFees) || 0,

        // Availability
        availableDays:          (doctorData.availableDays || []).join(","),
        timeSlots:              (doctorData.timeSlots || []).join(","),
        maxAppointmentsPerDay:  Number(doctorData.maxAppointmentsPerDay) || 10,

        // Clinic
        clinicName:             doctorData.clinicName || "",
        clinicAddress:          doctorData.clinicAddress || "",
        clinicPhone:            doctorData.clinicPhone || "",

        // Documents (Cloudinary URLs)
        degreeCertificate:      doctorData.documents?.degreeCertificate || "",
        registrationCertificate:doctorData.documents?.registrationCertificate || "",
        identityProof:          doctorData.documents?.identityProof || "",
        additionalCertificates: (doctorData.documents?.additionalCertificates || []).join(","),

        // Bio & Stats
        bio:                    doctorData.bio || "",
        rating:                 Number(doctorData.rating) || 0,
        totalRatings:           Number(doctorData.totalRatings) || 0,
        isVerified:             false,
        isActive:               true,
        role:                   "doctor",

        // Booked slots (appointment ke liye) — JSON string
        bookedSlots:            "{}",
      },
    };

    await index.upsert([vector]);
    console.log(` Dr. ${doctorData.name} Pinecone mein store ho gaya — ID: dr_${mongoId}`);
    return `dr_${mongoId}`;
  } catch (error) {
    console.error(" Pinecone store error:", error);
    throw new Error("Pinecone mein store karte waqt error aaya");
  }
};

// ─── 2. Dr. ki info Pinecone se lao (by pineconeId) ──────────────
export const getDoctorFromPinecone = async (pineconeId) => {
  try {
    const result = await index.fetch([pineconeId]);
    const record = result.records[pineconeId];
    if (!record) return null;

    // Metadata wapas readable format mein karo
    const m = record.metadata;
    return {
      ...m,
      expertise:               m.expertise ? m.expertise.split(",") : [],
      qualifications:          m.qualifications ? m.qualifications.split(",") : [],
      languages:               m.languages ? m.languages.split(",") : [],
      availableDays:           m.availableDays ? m.availableDays.split(",") : [],
      timeSlots:               m.timeSlots ? m.timeSlots.split(",") : [],
      additionalCertificates:  m.additionalCertificates ? m.additionalCertificates.split(",") : [],
      bookedSlots:             JSON.parse(m.bookedSlots || "{}"),
    };
  } catch (error) {
    console.error(" Pinecone fetch error:", error);
    throw new Error("Pinecone se data lane mein error aaya");
  }
};

// ─── 3. Dr. ki info update karo Pinecone mein ────────────────────
export const updateDoctorInPinecone = async (pineconeId, updatedData) => {
  try {
    // Pehle purana data fetch karo
    const existing = await getDoctorFromPinecone(pineconeId);
    if (!existing) throw new Error("Doctor not found in Pinecone");

    // Merge karo — naya data purane pe override karega
    const merged = { ...existing, ...updatedData };

    // Naya embedding banao
    const text = buildDoctorText(merged);
    const embedding = await getEmbedding(text);

    const vector = {
      id: pineconeId,
      values: embedding,
      metadata: {
        ...merged,
        expertise:              Array.isArray(merged.expertise) ? merged.expertise.join(",") : merged.expertise,
        qualifications:         Array.isArray(merged.qualifications) ? merged.qualifications.join(",") : merged.qualifications,
        languages:              Array.isArray(merged.languages) ? merged.languages.join(",") : merged.languages,
        availableDays:          Array.isArray(merged.availableDays) ? merged.availableDays.join(",") : merged.availableDays,
        timeSlots:              Array.isArray(merged.timeSlots) ? merged.timeSlots.join(",") : merged.timeSlots,
        additionalCertificates: Array.isArray(merged.additionalCertificates) ? merged.additionalCertificates.join(",") : merged.additionalCertificates,
        bookedSlots:            typeof merged.bookedSlots === "object" ? JSON.stringify(merged.bookedSlots) : merged.bookedSlots,
      },
    };

    await index.upsert([vector]);
    console.log(` Dr. update ho gaya Pinecone mein — ID: ${pineconeId}`);
    return true;
  } catch (error) {
    console.error(" Pinecone update error:", error);
    throw new Error("Pinecone mein update karte waqt error aaya");
  }
};

// ─── 4. Specialization/city se doctors dhundo ────────────────────
export const searchDoctors = async (query, topK = 10) => {
  try {
    const embedding = await getEmbedding(query);
    const results = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter: { isActive: { $eq: true } },
    });

    return results.matches.map((match) => {
      const m = match.metadata;
      return {
        pineconeId:    match.id,
        score:         match.score,
        name:          m.name,
        specialization:m.specialization,
        expertise:     m.expertise ? m.expertise.split(",") : [],
        city:          m.city,
        experience:    m.experience,
        consultationFees: m.consultationFees,
        profilePhoto:  m.profilePhoto,
        rating:        m.rating,
        languages:     m.languages ? m.languages.split(",") : [],
        availableDays: m.availableDays ? m.availableDays.split(",") : [],
        isVerified:    m.isVerified,
      };
    });
  } catch (error) {
    console.error(" Pinecone search error:", error);
    throw new Error("Doctors dhundte waqt error aaya");
  }
};

// ─── 5. Dr. delete karo Pinecone se ──────────────────────────────
export const deleteDoctorFromPinecone = async (pineconeId) => {
  try {
    await index.deleteOne(pineconeId);
    console.log(` Dr. delete ho gaya — ID: ${pineconeId}`);
    return true;
  } catch (error) {
    console.error(" Pinecone delete error:", error);
    throw new Error("Pinecone se delete karte waqt error aaya");
  }
};
