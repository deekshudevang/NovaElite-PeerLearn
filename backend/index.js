require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edulink';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Mongoose models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
}, { timestamps: true });
userSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.comparePassword = function(candidate){ return bcrypt.compare(candidate, this.password); };
const User = mongoose.model('User', userSchema);

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

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
}, { timestamps: true });
const Subject = mongoose.model('Subject', subjectSchema);

const userSubjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  can_teach: { type: Boolean, default: false },
  can_learn: { type: Boolean, default: true },
  proficiency_level: { type: String, default: '' },
}, { timestamps: true });
userSubjectSchema.index({ user: 1, subject: 1 }, { unique: true });
const UserSubject = mongoose.model('UserSubject', userSubjectSchema);

const tutoringRequestSchema = new mongoose.Schema({
  from_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });
const TutoringRequest = mongoose.model('TutoringRequest', tutoringRequestSchema);

// Course model for catalog
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  category: { type: String, enum: ['Development','Design','Science','Business'], required: true },
  banner_url: { type: String, default: '' },
  rating: { type: Number, default: 4.6 },
}, { timestamps: true });
const Course = mongoose.model('Course', courseSchema);

// App
async function start(){
  await mongoose.connect(MONGODB_URI);
  const app = express();
  // Updated CORS to include port 8081 for frontend
  app.use(cors({ origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173'], credentials: true }));
  app.use(express.json());
  app.use(morgan('dev'));

  // Auth helpers
  function sign(user){
    return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  }
  function auth(req, res, next){
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ')? h.slice(7): '';
    if (!token) return res.status(401).json({ message: 'unauthorized' });
    try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch { return res.status(401).json({ message: 'unauthorized' }); }
  }

  // Routes
  const api = express.Router();
  app.use('/api', api);

  api.get('/health', (req,res)=> res.json({ ok: true }));

  // Auth
  api.post('/auth/signup', async (req,res)=>{
    const { email, password, full_name } = req.body || {};
    if (!email || !password || !full_name) return res.status(400).json({ message: 'missing_fields' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'email_taken' });
    const user = await User.create({ email, password, full_name });
    // ensure profile
    await Profile.create({ user: user._id, full_name });
    const token = sign(user);
    res.json({ token, userId: user._id.toString(), user: { id: user._id.toString(), email: user.email, full_name } });
  });
  api.post('/auth/signin', async (req,res)=>{
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: (email||'').toLowerCase() });
    if (!user) return res.status(401).json({ message: 'invalid_credentials' });
    const ok = await user.comparePassword(password||'');
    if (!ok) return res.status(401).json({ message: 'invalid_credentials' });
    const token = sign(user);
    res.json({ token, userId: user._id.toString(), user: { id: user._id.toString(), email: user.email, full_name: user.full_name } });
  });
  api.post('/auth/signout', (req,res)=>{ res.json({ ok: true }); });

  // Profiles
  api.get('/profiles', async (req,res)=>{
    const limit = Math.min(parseInt(req.query.limit||'20',10)||20, 100);
    const profiles = await Profile.find().limit(limit).lean();
    res.json(profiles.map(p=>({
      id: p.user.toString(),
      full_name: p.full_name,
      bio: p.bio||null,
      avatar_url: p.avatar_url||null,
      banner_url: p.banner_url||null,
      year_of_study: p.year_of_study||null,
      major: p.major||null,
    })));
  });
  api.get('/profiles/:userId', async (req,res)=>{
    const p = await Profile.findOne({ user: req.params.userId }).lean();
    if (!p) return res.status(404).json({ message: 'not_found' });
    // Include user subjects
    const usubs = await UserSubject.find({ user: req.params.userId }).populate('subject').lean();
    res.json({
      id: p.user.toString(),
      full_name: p.full_name,
      bio: p.bio||null,
      avatar_url: p.avatar_url||null,
      banner_url: p.banner_url||null,
      year_of_study: p.year_of_study||null,
      major: p.major||null,
      user_subjects: usubs.map(u=>({
        id: u._id.toString(),
        can_teach: !!u.can_teach,
        can_learn: !!u.can_learn,
        proficiency_level: u.proficiency_level||null,
        subjects: { id: u.subject._id.toString(), name: u.subject.name, description: u.subject.description||null }
      }))
    });
  });
  api.post('/profiles', auth, async (req,res)=>{
    const { id, full_name } = req.body || {};
    const uid = id || req.user.sub;
    const exists = await Profile.findOne({ user: uid });
    if (exists) return res.json({ id: uid, full_name: exists.full_name, bio: exists.bio||null, avatar_url: exists.avatar_url||null, year_of_study: exists.year_of_study||null, major: exists.major||null });
    const p = await Profile.create({ user: uid, full_name: full_name||'' });
    res.json({ id: uid, full_name: p.full_name, bio: null, avatar_url: null, banner_url: null, year_of_study: null, major: null });
  });
  api.put('/profiles/:userId', auth, async (req,res)=>{
    if (req.user.sub !== req.params.userId) return res.status(403).json({ message: 'forbidden' });
    const update = {
      full_name: req.body.full_name,
      bio: req.body.bio,
      avatar_url: req.body.avatar_url,
      banner_url: req.body.banner_url,
      year_of_study: req.body.year_of_study,
      major: req.body.major,
    };
    const p = await Profile.findOneAndUpdate({ user: req.params.userId }, update, { new: true, upsert: true });
    res.json({ id: p.user.toString(), full_name: p.full_name, bio: p.bio||null, avatar_url: p.avatar_url||null, banner_url: p.banner_url||null, year_of_study: p.year_of_study||null, major: p.major||null });
  });

  // Subjects
  api.get('/subjects', async (req,res)=>{
    const subjects = await Subject.find().sort('name').lean();
    res.json(subjects.map(s=>({ id: s._id.toString(), name: s.name, description: s.description||null })));
  });

  // Courses catalog
  api.get('/courses', async (req,res)=>{
    const category = req.query.category;
    const filter = category ? { category } : {};
    const courses = await Course.find(filter).sort('-createdAt').limit(100)
      .populate('instructor','full_name')
      .populate('subject','name')
      .lean();
    res.json(courses.map(c=>({
      id: c._id.toString(),
      title: c.title,
      category: c.category,
      banner_url: c.banner_url || null,
      instructor: { id: c.instructor?._id?.toString?.(), full_name: c.instructor?.full_name },
      subject: { id: c.subject?._id?.toString?.(), name: c.subject?.name },
      rating: c.rating || 4.6,
    })));
  });
  api.get('/subjects/user/:userId', async (req,res)=>{
    const list = await UserSubject.find({ user: req.params.userId }).populate('subject').lean();
    res.json(list.map(u=>({
      id: u._id.toString(),
      can_teach: !!u.can_teach,
      can_learn: !!u.can_learn,
      proficiency_level: u.proficiency_level||null,
      subjects: { id: u.subject._id.toString(), name: u.subject.name, description: u.subject.description||null }
    })));
  });
  api.post('/subjects/user/:userId', auth, async (req,res)=>{
    if (req.user.sub !== req.params.userId) return res.status(403).json({ message: 'forbidden' });
    const subjects = Array.isArray(req.body.subjects)? req.body.subjects: [];
    // replace all
    await UserSubject.deleteMany({ user: req.params.userId });
    for (const s of subjects){
      // allow subject_id by id or name
      let subjectId = s.subject_id;
      if (!subjectId && s.name){
        const subj = await Subject.findOneAndUpdate({ name: s.name }, { $setOnInsert: { description: '' } }, { new: true, upsert: true });
        subjectId = subj._id;
      }
      if (subjectId){
        await UserSubject.create({ user: req.params.userId, subject: subjectId, can_teach: !!s.can_teach, can_learn: !!s.can_learn, proficiency_level: s.proficiency_level||'' });
      }
    }
    res.json({ ok: true });
  });
  api.delete('/subjects/user/:userId', auth, async (req,res)=>{
    if (req.user.sub !== req.params.userId) return res.status(403).json({ message: 'forbidden' });
    await UserSubject.deleteMany({ user: req.params.userId });
    res.json({ ok: true });
  });

  // Tutoring requests
  api.post('/tutoring-requests', auth, async (req,res)=>{
    const { from_user_id, to_user_id, subject_id, message, status } = req.body || {};
    if (req.user.sub !== from_user_id) return res.status(403).json({ message: 'forbidden' });
    const tr = await TutoringRequest.create({ from_user: from_user_id, to_user: to_user_id, subject: subject_id, message: message||'', status: status||'pending' });
    res.json({ id: tr._id.toString(), from_user_id, to_user_id, subject_id, message: tr.message, status: tr.status, created_at: tr.createdAt, updated_at: tr.updatedAt });
  });

  // AI endpoints
  api.get('/ai/summary', async (req, res) => {
    try {
      const counts = await Promise.all([
        User.countDocuments(), Profile.countDocuments(), Subject.countDocuments(), UserSubject.countDocuments().catch(()=>0),
        TutoringRequest.countDocuments(), Course.countDocuments().catch(()=>0)
      ]).catch(()=>[0,0,0,0,0,0]);
      const [users, profiles, subjects, userSubjects, requests, courses] = counts;
      res.json({
        overview: {
          users, profiles, subjects, userSubjects, requests, courses
        },
        endpoints: [
          'POST /api/auth/signup', 'POST /api/auth/signin', 'POST /api/auth/signout',
          'GET /api/profiles', 'GET /api/profiles/:userId', 'PUT /api/profiles/:userId', 'POST /api/profiles',
          'GET /api/subjects', 'GET/POST/DELETE /api/subjects/user/:userId',
          'POST /api/tutoring-requests', 'GET /api/tutoring-requests/user/:userId', 'PATCH /api/tutoring-requests/:id',
          'GET /api/courses?category=Development|Design|Science|Business',
          'POST /api/ai/chat', 'GET /api/ai/summary'
        ]
      });
    } catch (e) { res.status(500).json({ message: 'summary_error' }); }
  });

  api.post('/ai/chat', async (req, res) => {
    const { messages } = req.body || {};
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
    const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages_required' });
    }

    // API summary for better responses
    async function buildApiSummary() {
      const counts = await Promise.all([
        User.countDocuments(), Profile.countDocuments(), Subject.countDocuments(), UserSubject.countDocuments().catch(()=>0),
        TutoringRequest.countDocuments(), Course.countDocuments().catch(()=>0)
      ]).catch(()=>[0,0,0,0,0,0]);
      const [users, profiles, subjects, userSubjects, requests, courses] = counts;
      return [
        'You are PeerLearn AI. Here is the API overview:',
        '- Entities: User, Profile, Subject, UserSubject, TutoringRequest, Course',
        '- Auth: POST /api/auth/signup, /signin, /signout',
        '- Profiles: GET /api/profiles, GET/PUT /api/profiles/:userId, POST /api/profiles',
        '- Subjects: GET /api/subjects; user subjects: GET/POST/DELETE /api/subjects/user/:userId',
        '- Tutoring: POST /api/tutoring-requests, GET /api/tutoring-requests/user/:userId, PATCH /api/tutoring-requests/:id',
        '- Courses: GET /api/courses?category=Development|Design|Science|Business',
        `- Counts: users=${users}, profiles=${profiles}, subjects=${subjects}, courses=${courses}, requests=${requests}`,
      ].join('\n');
    }

    try {
      const apiSummary = await buildApiSummary();

      if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
        // Local smart router so UX works without keys
        const last = String(messages[messages.length - 1]?.content || '').trim().toLowerCase();
        const endpoints = [
          'POST /api/auth/signup', 'POST /api/auth/signin', 'POST /api/auth/signout',
          'GET /api/profiles', 'GET /api/profiles/:userId', 'PUT /api/profiles/:userId', 'POST /api/profiles',
          'GET /api/subjects', 'GET/POST/DELETE /api/subjects/user/:userId',
          'POST /api/tutoring-requests', 'GET /api/tutoring-requests/user/:userId', 'PATCH /api/tutoring-requests/:id',
          'GET /api/courses?category=Development|Design|Science|Business'
        ];
        // endpoints
        if (/(endpoint|api|route)/.test(last)) {
          return res.json({ reply: `Here are the main endpoints:\n- ${endpoints.join('\n- ')}` });
        }
        // recommend courses
        const catMatch = last.match(/(development|design|science|business)/);
        if (/recommend|course/.test(last)) {
          const filter = catMatch ? { category: catMatch[1][0].toUpperCase() + catMatch[1].slice(1) } : {};
          const top = await Course.find(filter).sort('-createdAt').limit(5).populate('instructor','full_name').lean();
          if (top.length) {
            const lines = top.map(c=>`• ${c.title} (${c.category}) — by ${c.instructor?.full_name||'Instructor'}`);
            return res.json({ reply: `Recommended courses${catMatch? ' in '+filter.category: ''}:\n${lines.join('\n')}` });
          }
          return res.json({ reply: 'No courses found yet. Try another category: Development, Design, Science, or Business.' });
        }
        // how to update profile
        if (/update.*profile|profile.*update/.test(last)) {
          return res.json({ reply: 'To update your profile: open Profile (top right) -> edit fields -> Save. API: PUT /api/profiles/:userId with { full_name, bio, major, year_of_study, avatar_url, banner_url }.' });
        }
        // requests info
        if (/request|sent|receive|received/.test(last)) {
          const counts = await TutoringRequest.countDocuments();
          return res.json({ reply: `Requests are active. You can view and manage them at /requests. API: POST /api/tutoring-requests, GET /api/tutoring-requests/user/:userId, PATCH /api/tutoring-requests/:id. There are currently ${counts} requests in this demo.` });
        }
        // default helpful reply
        const counts = await Promise.all([
          User.countDocuments(), Profile.countDocuments(), Course.countDocuments()
        ]).catch(()=>[0,0,0]);
        const [users, profiles, courses] = counts;
        return res.json({ reply: `I can help you explore courses, peers, and endpoints. We have ${courses} courses, ${profiles} profiles, ${users} users. Ask: "Recommend courses in Design", "List endpoints", or "How do I update a profile?"` });
      }

      if (GEMINI_API_KEY) {
        const axios = require('axios');
        const prompt = `${apiSummary}`;
        const payload = { contents: [{ role: 'user', parts: [{ text: prompt }]}, ...messages.map(m=>({ role: m.role==='assistant'?'model':'user', parts:[{ text: String(m.content||'') }]}))] };
        const { data } = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${GEMINI_API_KEY}`,
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply.';
        return res.json({ reply });
      }

      // OpenAI fallback
      const axios = require('axios');
      const payload = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: apiSummary },
          ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user', content: String(m.content || '') }))
        ],
        temperature: 0.2,
      };
      const { data } = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
      });
      const reply = data?.choices?.[0]?.message?.content || '';
      return res.json({ reply });
    } catch (e) {
      console.error('AI chat error:', e?.response?.data || e?.message);
      res.status(500).json({ message: 'ai_error' });
    }
  });
  api.get('/tutoring-requests/user/:userId', auth, async (req,res)=>{
    if (req.user.sub !== req.params.userId) return res.status(403).json({ message: 'forbidden' });
    const list = await TutoringRequest.find({ $or: [{ from_user: req.params.userId }, { to_user: req.params.userId }] })
      .sort('-createdAt')
      .populate('subject','name')
      .populate('from_user','full_name')
      .populate('to_user','full_name')
      .lean();
    res.json(list.map(tr=>{
      const me = req.params.userId;
      const other = String(tr.from_user?._id||tr.from_user) === me ? tr.to_user : tr.from_user;
      return {
        id: tr._id.toString(),
        from_user_id: (tr.from_user?._id||tr.from_user).toString(),
        to_user_id: (tr.to_user?._id||tr.to_user).toString(),
        other_name: other?.full_name || 'Peer',
        subject_id: (tr.subject?._id||tr.subject).toString(),
        subject_name: tr.subject?.name || 'General',
        message: tr.message,
        status: tr.status,
        created_at: tr.createdAt,
        updated_at: tr.updatedAt,
      };
    }));
  });
  api.patch('/tutoring-requests/:id', auth, async (req,res)=>{
    const { status } = req.body || {};
    const tr = await TutoringRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!tr) return res.status(404).json({ message: 'not_found' });
    res.json({ id: tr._id.toString(), from_user_id: tr.from_user.toString(), to_user_id: tr.to_user.toString(), subject_id: tr.subject.toString(), message: tr.message, status: tr.status, created_at: tr.createdAt, updated_at: tr.updatedAt });
  });

  // Seed a few subjects if empty
  const count = await Subject.countDocuments();
  if (count === 0){
    await Subject.insertMany([
      { name: 'Mathematics', description: 'Algebra, calculus, geometry' },
      { name: 'Physics', description: 'Mechanics, electromagnetism' },
      { name: 'Chemistry', description: 'Organic, inorganic, physical' },
      { name: 'Computer Science', description: 'Programming, data structures' },
      { name: 'Biology', description: 'Genetics, cell biology' },
      { name: 'Design', description: 'UX/UI, typography, visual design' },
      { name: 'Business', description: 'Marketing, finance, strategy' },
    ]);
  }

  // Seed demo users if none
  const ucount = await User.countDocuments();
  if (ucount < 12){
    const demo = [
      { full_name: 'Alice Johnson', email: 'alice@example.com', major: 'Computer Science', year_of_study: '3rd year', avatar_url: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=600&auto=format&fit=crop', banner_url: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop', bio: 'Frontend enthusiast and React tutor.', teach: ['Computer Science', 'Design'], learn: ['Mathematics'] },
      { full_name: 'Brian Lee', email: 'brian@example.com', major: 'Physics', year_of_study: '2nd year', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop', banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop', bio: 'Loves explaining mechanics and calculus.', teach: ['Physics', 'Mathematics'], learn: ['Computer Science'] },
      { full_name: 'Chloe Kim', email: 'chloe@example.com', major: 'Business', year_of_study: '4th year', avatar_url: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=600&auto=format&fit=crop', banner_url: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?q=80&w=1200&auto=format&fit=crop', bio: 'Marketing analytics and Excel pro.', teach: ['Business'], learn: ['Design'] },
      { full_name: 'Diego Martinez', email: 'diego@example.com', major: 'Design', year_of_study: '1st year', avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=600&auto=format&fit=crop', banner_url: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=1200&auto=format&fit=crop', bio: 'UI/UX newbie learning fast.', teach: ['Design'], learn: ['Business', 'Computer Science'] },
    ];
    // Add a few extra variations
    while (demo.length < 12) {
      const i = demo.length + 1;
      demo.push({
        full_name: `Demo User ${i}`,
        email: `demo${i}@example.com`,
        major: ['Computer Science','Physics','Business','Design','Biology'][i%5],
        year_of_study: ['Freshman','Sophomore','Junior','Senior','Graduate'][i%5],
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
        banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
        bio: 'Demo instructor profile.',
        teach: ['Mathematics','Computer Science','Physics','Design','Business'].slice(0,(i%3)+1),
        learn: ['Biology','Design','Business'].slice(0,(i%2)+1),
      });
    }
    for (const d of demo){
      const exists = await User.findOne({ email: d.email });
      if (exists) continue;
      const user = await User.create({ email: d.email, password: 'password123', full_name: d.full_name });
      await Profile.create({ user: user._id, full_name: d.full_name, bio: d.bio, avatar_url: d.avatar_url, banner_url: d.banner_url, year_of_study: d.year_of_study, major: d.major });
      const teachSubjects = await Subject.find({ name: { $in: d.teach } });
      for (const s of teachSubjects){ await UserSubject.create({ user: user._id, subject: s._id, can_teach: true, can_learn: false, proficiency_level: 'advanced' }); }
      const learnSubjects = await Subject.find({ name: { $in: d.learn } });
      for (const s of learnSubjects){ await UserSubject.create({ user: user._id, subject: s._id, can_teach: false, can_learn: true, proficiency_level: 'beginner' }); }
    }
    // Seed some requests
    const allUsers = await User.find().limit(6);
    const anySubject = await Subject.findOne();
    if (allUsers.length >= 2 && anySubject){
      const [u1,u2,u3,u4] = allUsers;
      await TutoringRequest.create({ from_user: u1._id, to_user: u2._id, subject: anySubject._id, message: 'Can you help me this week?', status: 'pending' });
      await TutoringRequest.create({ from_user: u2._id, to_user: u1._id, subject: anySubject._id, message: 'Sure, let\'s plan.', status: 'accepted' });
      await TutoringRequest.create({ from_user: u3._id, to_user: u4._id, subject: anySubject._id, message: 'Looking for guidance', status: 'pending' });
    }
    console.log('Seeded demo users. Example login: alice@example.com / password123');
  }

  // Seed demo courses if none
  const ccount = await Course.countDocuments();
  if (ccount === 0){
    const categories = ['Development','Design','Science','Business'];
    const banners = {
      Development: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
      Design: 'https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2?q=80&w=1200&auto=format&fit=crop',
      Science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop',
      Business: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200&auto=format&fit=crop'
    };
    const someUsers = await User.find().limit(12);
    const someSubjects = await Subject.find();
    const pick = (arr)=> arr[Math.floor(Math.random()*arr.length)];
    const docs = Array.from({length: 16}).map((_,i)=>{
      const cat = categories[i%4];
      const u = pick(someUsers);
      const s = pick(someSubjects);
      return { title: `${cat} Course ${i+1}`, instructor: u._id, subject: s._id, category: cat, banner_url: banners[cat], rating: 4.5 + ((i%5)-2)*0.1 };
    });
    await Course.insertMany(docs);
  }

  app.listen(PORT, ()=> console.log(`API running on http://localhost:${PORT}`));
}

start().catch((e)=>{ console.error('Failed to start API:', e); process.exit(1); });
