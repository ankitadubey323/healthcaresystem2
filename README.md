# HealthAI — AI-Powered Healthcare Platform

This is my final year project. I built a healthcare web app where patients can talk to an AI doctor, get real doctor suggestions, and book appointments. Doctors can register on the platform and their data gets stored in a vector database (Pinecone) so the AI agent can find and suggest them based on patient symptoms.

---

## What this project does

The project has two parts:

**1. Health AI App**
This is the main app for patients and doctors. Patients can register, track their medicines, find hospitals nearby, upload medical documents, check health news, and use an AI food advisor. Doctors can also register here — when a doctor registers, all their details (specialization, expertise, availability, fees, etc.) get stored directly in Pinecone vector database.

**2. Dr. AI Agent**
This is a separate AI chatbot that patients can talk to. The agent:
- Asks about symptoms one by one like a real doctor
- Searches Pinecone to find a matching doctor based on symptoms
- Shows doctor cards with a "Book Appointment" button
- Lets the patient pick a date from a calendar
- Sends an email to the doctor with Accept/Reject buttons
- If doctor accepts → patient gets a confirmation email with doctor's contact number
- If doctor rejects → patient is asked to pick another date
- Supports voice input and responds in the same language the patient uses (Hindi, English, Hinglish, etc.)

---

## Tech Stack

**Frontend:** React, Vite, Framer Motion

**Backend (Health App):** Node.js, Express, MongoDB, JWT, Cloudinary, Multer

**Backend (AI Agent):** Node.js, Socket.io, LangChain, Groq (llama-3.3-70b), AssemblyAI, Microsoft Edge TTS, Google Calendar API

**Database:** MongoDB Atlas (for user auth), Pinecone (for doctor profiles and vector search)

**Email:** Resend

**Deployment:** Render (both backends), kept alive using UptimeRobot
https://healthcaresystem2-1.onrender.com ---main,
https://healthcaresystem2.onrender.com,
https://ai-agent-19hb.onrender.com,
https://ai-agent-9-nnzd.onrender.com



## How the doctor-patient flow works

Doctor registers on Health AI App
        ↓
Doctor's full profile stored in Pinecone
(name, specialization, expertise, fees, availability, photo, documents)
        ↓
Patient opens Dr. AI Agent
        ↓
Patient describes symptoms (voice or text)
        ↓
Agent asks 2-3 follow-up questions
        ↓
Agent searches Pinecone → finds matching doctor
        ↓
Agent shows doctor card → patient picks a date
        ↓
Doctor receives email with Accept / Reject buttons
        ↓
Accept → Patient gets confirmation email with doctor's phone number
Reject → Patient is asked to pick another date
```





```
healthcare-main/
├── back/               → Express backend (REST API)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/
│       └── pineconeService.js
└── frontend/           → React frontend
    └── src/
        ├── pages/
        │   ├── Register.jsx         (role selection)
        │   ├── DoctorRegister.jsx   (5-step form)
        │   └── Dashboard.jsx
        └── components/
            ├── MedicineTracker.jsx
            └── DocumentVault.jsx

projectwork-ai-agent/
└── backend/
    ├── socket/
    │   └── prompt.js       → AI system prompt
    └── src/
        ├── langchain/
        │   ├── agent.js    → main agent logic
        │   └── pinecone.js → doctor search
        └── services/
            ├── calendar.js → Google Calendar
            ├── email.js    → booking emails
            └── tts.js      → voice output



## Environment Variables

**Health App Backend (.env)**

PORT=5000
MONGODB_URI=
JWT_SECRET=
PINECONE_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=


**AI Agent Backend (.env)**

PORT=3000
GROQ_API_KEY=
ASSEMBLYAI_API_KEY=
PINECONE_API_KEY=
PINECONE_HOST=          (without https://)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
RESEND_API_KEY=
BASE_URL=




## How to run locally

**Health App Backend**
`
cd healthcare-main/back
npm install
npm run dev


**Health App Frontend**

cd healthcare-main/frontend
npm install
npm run dev


**AI Agent Backend**

cd projectwork-ai-agent/backend
npm install
npm run start


**AI Agent Frontend**

cd projectwork-ai-agent/frontend/folder
npm install
npm run dev


For Google Calendar to work, visit `http://localhost:3000/auth/google` and complete the OAuth flow once.



## Pinecone Setup

- Index name: `doctoraiagent`
- Dimension: `1024`
- Model: `llama-text-embed-v2`
- Region: `us-east-1` (AWS)

Make sure both the Health App and AI Agent use the same Pinecone index and API key.



## Things I learned building this

- How RAG (Retrieval Augmented Generation) works in a real project
- Integrating vector databases with LLMs
- Building real-time voice apps with WebSockets
- Handling role-based auth (patient vs doctor)
- Working with Google Calendar API and OAuth
- Sending transactional emails with dynamic content
- Deploying full-stack apps on Render
---

## Author

Ankita Dubey  
B.Tech CSE
