const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

// Profile Schema
const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  full_name: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar_url: { type: String, default: '' },
  banner_url: { type: String, default: '' },
  year_of_study: { type: String, default: '' },
  major: { type: String, default: '' },
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

// Subject Schema
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

// UserSubject Schema
const userSubjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  can_teach: { type: Boolean, default: false },
  can_learn: { type: Boolean, default: true },
  proficiency_level: { type: String, default: '' },
}, { timestamps: true });

userSubjectSchema.index({ user: 1, subject: 1 }, { unique: true });
const UserSubject = mongoose.model('UserSubject', userSubjectSchema);

// Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  category: { type: String, enum: ['Development', 'Design', 'Science', 'Business'], required: true },
  banner_url: { type: String, default: '' },
  rating: { type: Number, default: 4.6 },
  price: { type: Number, default: 0 }, // Price in rupees
  currency: { type: String, default: 'INR' },
  duration: { type: String, default: '1 hour' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  description: { type: String, default: '' },
  total_students: { type: Number, default: 0 },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

// TutoringRequest Schema
const tutoringRequestSchema = new mongoose.Schema({
  from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

const TutoringRequest = mongoose.model('TutoringRequest', tutoringRequestSchema);

// ChatRoom Schema
const chatRoomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  tutoring_request: { type: mongoose.Schema.Types.ObjectId, ref: 'TutoringRequest' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  title: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  last_activity: { type: Date, default: Date.now }
}, { timestamps: true });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  chat_room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  message_type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
  read_by: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    read_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// CourseReview Schema
const courseReviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  session_date: { type: Date },
  is_verified: { type: Boolean, default: false }
}, { timestamps: true });

courseReviewSchema.index({ course: 1, reviewer: 1 }, { unique: true });
const CourseReview = mongoose.model('CourseReview', courseReviewSchema);

// Session Schema (for tracking completed sessions)
const sessionSchema = new mongoose.Schema({
  tutoring_request: { type: mongoose.Schema.Types.ObjectId, ref: 'TutoringRequest', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  start_time: { type: Date, required: true },
  end_time: { type: Date },
  status: { type: String, enum: ['scheduled', 'active', 'completed', 'cancelled'], default: 'scheduled' },
  notes: { type: String, default: '' },
  chat_room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

module.exports = {
  User,
  Profile,
  Subject,
  UserSubject,
  Course,
  TutoringRequest,
  ChatRoom,
  Message,
  CourseReview,
  Session
};
