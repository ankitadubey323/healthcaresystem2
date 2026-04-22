import mongoose from 'mongoose'

const doseLogSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  taken: { type: Boolean, default: null },
  takenAt: { type: Date },
}, { _id: false })

const scheduleSchema = new mongoose.Schema({
  time: { type: String, required: true },
  label: { type: String, default: '' },
}, { _id: false })

const medicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  dosage: { type: String, default: '' },
  frequency: { type: Number, default: 1 },
  schedules: [scheduleSchema],
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  days: { type: Number, default: 1 },
  instructions: { type: String, default: '' },
  color: { type: String, default: '#6366f1' },
  isActive: { type: Boolean, default: true },
  doseLogs: [doseLogSchema],
}, { timestamps: true })

export default mongoose.model('Medicine', medicineSchema)