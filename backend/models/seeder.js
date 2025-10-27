const { User, Profile, Subject, UserSubject, Course, TutoringRequest } = require('./index');

async function seedDatabase() {
  try {
    // Seed subjects if empty
    const subjectCount = await Subject.countDocuments();
    if (subjectCount === 0) {
      await Subject.insertMany([
        { name: 'Mathematics', description: 'Algebra, calculus, geometry' },
        { name: 'Physics', description: 'Mechanics, electromagnetism' },
        { name: 'Chemistry', description: 'Organic, inorganic, physical' },
        { name: 'Computer Science', description: 'Programming, data structures' },
        { name: 'Biology', description: 'Genetics, cell biology' },
        { name: 'Design', description: 'UX/UI, typography, visual design' },
        { name: 'Business', description: 'Marketing, finance, strategy' },
      ]);
      console.log('✅ Seeded subjects');
    }

    // Seed demo users if none exist
    const userCount = await User.countDocuments();
    if (userCount < 5) {
      const demoUsers = [
        { 
          full_name: 'Alice Johnson', 
          email: 'alice@example.com', 
          password: 'password123',
          profile: {
            major: 'Computer Science', 
            year_of_study: '3rd year', 
            avatar_url: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=600&auto=format&fit=crop', 
            banner_url: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop', 
            bio: 'Frontend enthusiast and React tutor.'
          },
          teach: ['Computer Science', 'Design'], 
          learn: ['Mathematics'] 
        },
        { 
          full_name: 'Brian Lee', 
          email: 'brian@example.com', 
          password: 'password123',
          profile: {
            major: 'Physics', 
            year_of_study: '2nd year', 
            avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop', 
            banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop', 
            bio: 'Loves explaining mechanics and calculus.'
          },
          teach: ['Physics', 'Mathematics'], 
          learn: ['Computer Science'] 
        },
        { 
          full_name: 'Chloe Kim', 
          email: 'chloe@example.com', 
          password: 'password123',
          profile: {
            major: 'Business', 
            year_of_study: '4th year', 
            avatar_url: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=600&auto=format&fit=crop', 
            banner_url: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?q=80&w=1200&auto=format&fit=crop', 
            bio: 'Marketing analytics and Excel pro.'
          },
          teach: ['Business'], 
          learn: ['Design'] 
        },
        { 
          full_name: 'Diego Martinez', 
          email: 'diego@example.com', 
          password: 'password123',
          profile: {
            major: 'Design', 
            year_of_study: '1st year', 
            avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=600&auto=format&fit=crop', 
            banner_url: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=1200&auto=format&fit=crop', 
            bio: 'UI/UX newbie learning fast.'
          },
          teach: ['Design'], 
          learn: ['Business', 'Computer Science'] 
        },
      ];

      for (const userData of demoUsers) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) continue;

        // Create user
        const user = await User.create({
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name
        });

        // Create profile
        await Profile.create({
          user: user._id,
          full_name: userData.full_name,
          ...userData.profile
        });

        // Add subjects the user can teach
        const teachSubjects = await Subject.find({ name: { $in: userData.teach } });
        for (const subject of teachSubjects) {
          await UserSubject.create({
            user: user._id,
            subject: subject._id,
            can_teach: true,
            can_learn: false,
            proficiency_level: 'advanced'
          });
        }

        // Add subjects the user wants to learn
        const learnSubjects = await Subject.find({ name: { $in: userData.learn } });
        for (const subject of learnSubjects) {
          await UserSubject.create({
            user: user._id,
            subject: subject._id,
            can_teach: false,
            can_learn: true,
            proficiency_level: 'beginner'
          });
        }
      }
      console.log('✅ Seeded demo users');
    }

    // Seed demo courses if none exist
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      const categories = ['Development', 'Design', 'Science', 'Business'];
      const banners = {
        Development: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop', // Laptop with code
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop', // Computer screen
          'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop', // Coding on laptop
          'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop', // Tech workspace
          'https://images.unsplash.com/photo-1619410283995-43d9134e7656?q=80&w=800&auto=format&fit=crop', // React/JS code
          'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop', // Python code
        ],
        Design: [
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop', // Design tools
          'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=800&auto=format&fit=crop', // UI/UX design
          'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop', // Design sketches
          'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?q=80&w=800&auto=format&fit=crop', // Adobe tools
          'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=800&auto=format&fit=crop', // Figma design
          'https://images.unsplash.com/photo-1626785774625-0b1c2c4eab67?q=80&w=800&auto=format&fit=crop', // Brand design
        ],
        Science: [
          'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=800&auto=format&fit=crop', // DNA structure
          'https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=800&auto=format&fit=crop', // Lab equipment
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop', // Brain/neuroscience
          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop', // Chemistry
          'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop', // Physics/space
          'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?q=80&w=800&auto=format&fit=crop', // Data visualization
        ],
        Business: [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop', // Business meeting
          'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=800&auto=format&fit=crop', // Charts/analytics
          'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop', // Finance/money
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop', // Strategy/planning
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop', // Startup/entrepreneurship
          'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop', // Digital marketing
        ]
      };

      const users = await User.find().limit(10);
      const subjects = await Subject.find();
      
      if (users.length > 0 && subjects.length > 0) {
        const courseTitles = {
          Development: [
            'Complete React.js Course', 'Node.js Backend Development', 'Python Programming Fundamentals', 
            'Full Stack Web Development', 'JavaScript ES6+ Mastery', 'MongoDB Database Design',
            'Next.js Production Ready Apps', 'TypeScript Complete Guide', 'Vue.js 3 Development'
          ],
          Design: [
            'UI/UX Design Fundamentals', 'Figma Design System', 'Adobe Photoshop Mastery', 
            'Brand Identity Design', 'Mobile App UI Design', 'Graphic Design Principles',
            'Adobe Illustrator Complete', 'Web Design with CSS', 'Design Thinking Workshop'
          ],
          Science: [
            'Data Science with Python', 'Machine Learning Fundamentals', 'Statistics for Research', 
            'Biology Laboratory Techniques', 'Chemistry Organic Reactions', 'Physics Problem Solving',
            'Research Methodology', 'Biostatistics Analysis', 'Scientific Writing'
          ],
          Business: [
            'Digital Marketing Strategy', 'Project Management Professional', 'Entrepreneurship Essentials', 
            'Financial Analysis & Planning', 'Business Analytics', 'Leadership Development',
            'Sales & Customer Relations', 'Market Research Methods', 'Startup Business Planning'
          ]
        };

        const coursePrices = {
          Development: [1299, 1599, 999, 1799, 1499, 899, 2199, 1399, 1699],
          Design: [1099, 1399, 1199, 1599, 999, 799, 1299, 899, 1199],
          Science: [1199, 1499, 899, 1299, 1099, 999, 1399, 1199, 1099],
          Business: [1399, 1699, 1199, 1599, 1299, 999, 1499, 1099, 1399]
        };

        const courseLevels = ['Beginner', 'Intermediate', 'Advanced'];
        const courseDurations = ['1 hour', '1.5 hours', '2 hours', '30 minutes', '45 minutes'];
        const courseDescriptions = {
          Development: [
            'Master modern web development with hands-on projects and real-world examples.',
            'Build scalable backend applications using industry best practices.',
            'Learn Python from scratch with practical coding exercises.',
            'Complete full-stack development course covering frontend and backend.',
            'Advanced JavaScript concepts and ES6+ features explained clearly.',
            'Database design and optimization techniques for modern applications.',
          ],
          Design: [
            'Learn the fundamentals of user experience and interface design.',
            'Master Figma for professional design workflows and collaboration.',
            'Professional photo editing and digital art creation techniques.',
            'Create memorable brand identities that connect with audiences.',
            'Design beautiful mobile app interfaces that users love.',
            'Essential principles of visual communication and design theory.',
          ],
          Science: [
            'Comprehensive data analysis and machine learning with Python.',
            'Understand core machine learning algorithms and their applications.',
            'Statistical methods for research and data interpretation.',
            'Practical laboratory skills and experimental techniques.',
            'Organic chemistry reactions and mechanisms explained simply.',
            'Problem-solving strategies for physics concepts and calculations.',
          ],
          Business: [
            'Digital marketing strategies that drive real business results.',
            'Professional project management methodologies and tools.',
            'Essential skills for starting and running a successful business.',
            'Financial planning and analysis for business decision making.',
            'Data-driven business insights and analytics techniques.',
            'Leadership skills for managing teams and driving growth.',
          ]
        };

        const courses = Array.from({ length: 24 }).map((_, i) => {
          const category = categories[i % 4];
          const user = users[Math.floor(Math.random() * users.length)];
          const subject = subjects[Math.floor(Math.random() * subjects.length)];
          const categoryBanners = banners[category];
          const categoryTitles = courseTitles[category];
          const categoryPrices = coursePrices[category];
          const categoryDescriptions = courseDescriptions[category];
          const titleIndex = i % categoryTitles.length;
          
          return {
            title: categoryTitles[titleIndex],
            instructor: user._id,
            subject: subject._id,
            category,
            banner_url: categoryBanners[i % categoryBanners.length], // Ensure unique images
            rating: 4.2 + Math.random() * 0.6, // Random rating between 4.2 and 4.8
            price: categoryPrices[titleIndex] || 999, // Price in rupees
            currency: 'INR',
            level: courseLevels[Math.floor(Math.random() * courseLevels.length)],
            duration: courseDurations[Math.floor(Math.random() * courseDurations.length)],
            description: categoryDescriptions[titleIndex % categoryDescriptions.length] || 'Learn with expert guidance and practical examples.',
            total_students: Math.floor(Math.random() * 500) + 50 // Random students between 50-550
          };
        });
        
        await Course.insertMany(courses);
        console.log('✅ Seeded demo courses');
      }
    }

    // Seed some tutoring requests
    const requestCount = await TutoringRequest.countDocuments();
    if (requestCount === 0) {
      const users = await User.find().limit(4);
      const subjects = await Subject.findOne();
      
      if (users.length >= 2 && subjects) {
        const [u1, u2, u3, u4] = users;
        await TutoringRequest.insertMany([
          { 
            from_user: u1._id, 
            to_user: u2._id, 
            subject: subjects._id, 
            message: 'Can you help me this week?', 
            status: 'pending' 
          },
          { 
            from_user: u2._id, 
            to_user: u1._id, 
            subject: subjects._id, 
            message: 'Sure, let\'s plan.', 
            status: 'accepted' 
          }
        ]);
        
        if (u3 && u4) {
          await TutoringRequest.create({
            from_user: u3._id, 
            to_user: u4._id, 
            subject: subjects._id, 
            message: 'Looking for guidance', 
            status: 'pending' 
          });
        }
        console.log('✅ Seeded demo tutoring requests');
      }
    }

  } catch (error) {
    console.error('❌ Seeder error:', error);
  }
}

module.exports = seedDatabase;